import { useEffect, useState } from 'react'
import ClubAdminLayout from './ClubAdminLayout'

export default function ClubAdminMembers() {
  const [members, setMembers] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/club-admin/my-club/members', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch members') }
  }

const handleRemove = async (userId, name) => {
  if (!confirm(`Remove ${name} from the club?`)) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/club-admin/my-club/members/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setMessage(`${name} removed from club`)
    fetchMembers()
  } catch { setError('Something went wrong') }
  setTimeout(() => { setMessage(''); setError('') }, 3000)
}

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ClubAdminLayout title="Members">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{members.length} total members</p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-64"
        />
      </div>

      {message && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-400">{message}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No members yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Name</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Email</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Joined</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 text-sm text-white font-medium">{member.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{member.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClubAdminLayout>
  )
}