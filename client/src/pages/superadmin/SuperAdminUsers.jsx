import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([])
  const [clubs, setClubs] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchClubs()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch users') }
  }

  const fetchClubs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/clubs')
      const data = await res.json()
      setClubs(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch clubs') }
  }

  const handlePromote = async (userId, clubId) => {
    if (!clubId) { setError('Please select a club first'); return }
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/promote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ club_id: clubId })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMessage('User promoted to club admin!')
      fetchUsers()
    } catch { setError('Something went wrong') }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const handleDemote = async (userId) => {
    if (!confirm('Remove club admin role from this user?')) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/demote`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMessage('User demoted to student')
      fetchUsers()
    } catch { setError('Something went wrong') }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('User deleted')
      fetchUsers()
    } catch { setError('Something went wrong') }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const filtered = users.filter(u =>
  (u.name.toLowerCase().includes(search.toLowerCase()) ||
   u.email.toLowerCase().includes(search.toLowerCase())) &&
   (roleFilter === 'all' || u.role === roleFilter)
  )

  const roleColor = (role) => {
    if (role === 'super_admin') return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
    if (role === 'club_admin') return 'bg-purple-600/20 text-purple-400 border-purple-500/30'
    return 'bg-blue-600/20 text-blue-400 border-blue-500/30'
  }

  return (
    <AdminLayout title="Manage Users">
       <div className="mb-6 flex gap-3">
        <input
          value={search}
           onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 max-w-md bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
             />
          <select
           value={roleFilter}
        onChange={e => setRoleFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          >
         <option value="all">All roles</option>
         <option value="student">Students</option>
         <option value="club_admin">Club Admins</option>
         <option value="super_admin">Super Admins</option>
        </select>
      </div>

      {message && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-400">{message}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Name</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Email</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Role</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Joined</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <UserRow
                key={user.id}
                user={user}
                clubs={clubs}
                roleColor={roleColor}
                onPromote={handlePromote}
                onDemote={handleDemote}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

function UserRow({ user, clubs, roleColor, onPromote, onDemote, onDelete }) {
  const [selectedClub, setSelectedClub] = useState('')

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
      <td className="px-5 py-3 text-sm text-white font-medium">{user.name}</td>
      <td className="px-5 py-3 text-sm text-gray-400">{user.email}</td>
      <td className="px-5 py-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor(user.role)}`}>{user.role}</span>
         {user.role === 'club_admin' && user.club_name && (
        <p className="text-xs text-gray-500 mt-1">{user.club_name}</p>
          )}
      </td>
      <td className="px-5 py-3 text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-5 py-3">
        {user.role === 'super_admin' ? (
          <span className="text-xs text-gray-600">Protected</span>
        ) : user.role === 'student' ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedClub}
              onChange={e => setSelectedClub(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select club...</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
            <button
              onClick={() => onPromote(user.id, selectedClub)}
              className="text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30 transition"
            >
              Make Admin
            </button>
            <button
              onClick={() => onDelete(user.id, user.name)}
              className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDemote(user.id)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              Remove Admin
            </button>
            <button
              onClick={() => onDelete(user.id, user.name)}
              className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}