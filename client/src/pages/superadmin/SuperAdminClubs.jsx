import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'

export default function SuperAdminClubs() {
  const [clubs, setClubs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [editingClub, setEditingClub] = useState(null)
  const [editClubForm, setEditClubForm] = useState({ name: '', description: '', image_url: '' })

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/clubs')
      const data = await res.json()
      setClubs(data)
    } catch {
      console.error('Failed to fetch clubs')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:3000/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, image_url: imageUrl })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMessage('Club created successfully!')
      setName('')
      setDescription('')
      setImageUrl('')
      setShowForm(false)
      fetchClubs()
    } catch {
      setError('Something went wrong')
    }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const handleDelete = async (clubId, clubName) => {
    if (!confirm(`Are you sure you want to delete "${clubName}"? This will also delete all its events.`)) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3000/api/clubs/${clubId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Club deleted')
      fetchClubs()
    } catch {
      setError('Failed to delete club')
    }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const handleEditClub = async (e, clubId) => {
  e.preventDefault()
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/clubs/${clubId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editClubForm)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setMessage('Club updated!')
    setEditingClub(null)
    fetchClubs()
  } catch { setError('Something went wrong') }
  setTimeout(() => { setMessage(''); setError('') }, 3000)
}

  return (
    <AdminLayout title="Manage Clubs">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{clubs.length} clubs total</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          {showForm ? 'Cancel' : '+ Create Club'}
        </button>
      </div>

      {message && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-400">{message}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">New Club</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Club Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Chess Club"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this club about?"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Image URL <span className="text-gray-500">(optional)</span></label>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg opacity-70" onError={e => e.target.style.display='none'} />
              )}
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition">
              Create Club
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {clubs.map(club => (
          <div key={club.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            {club.image_url && (
              <img src={club.image_url} alt={club.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-white">{club.name}</h3>
              <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{club.description}</p>
              <p className="text-gray-500 text-xs mt-1">👥 {club.member_count} members</p>
            </div>

            {editingClub === club.id && (
<div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mt-2 w-full">
    <h4 className="font-medium mb-4 text-white">Edit Club</h4>
    <form onSubmit={(e) => handleEditClub(e, club.id)} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Name</label>
        <input value={editClubForm.name} onChange={e => setEditClubForm({...editClubForm, name: e.target.value})} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Description</label>
        <textarea value={editClubForm.description} onChange={e => setEditClubForm({...editClubForm, description: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Image URL <span className="text-gray-500">(optional)</span></label>
        <input value={editClubForm.image_url} onChange={e => setEditClubForm({...editClubForm, image_url: e.target.value})} placeholder="https://i.imgur.com/..." className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        {editClubForm.image_url && (
          <img src={editClubForm.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg opacity-70" onError={e => e.target.style.display='none'} />
        )}
      </div>
      <div className="flex gap-3">
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition">Save Changes</button>
        <button type="button" onClick={() => setEditingClub(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl text-sm font-medium transition">Cancel</button>
      </div>
    </form>
  </div>
)}
<div className="flex items-center gap-2">
  <button
    onClick={() => window.open(`/clubs/${club.id}`, '_blank')}
    className="text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
  >
    View
  </button>
  <button
    onClick={() => {
      setEditingClub(editingClub === club.id ? null : club.id)
      setEditClubForm({ name: club.name, description: club.description || '', image_url: club.image_url || '' })
    }}
    className="text-sm px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition border border-blue-500/30"
  >
    {editingClub === club.id ? 'Cancel' : 'Edit'}
  </button>
  <button
    onClick={() => handleDelete(club.id, club.name)}
    className="text-sm px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition border border-red-500/30"
  >
    Delete
  </button>
</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}