import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'

export default function SuperAdminEvents() {
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewingRsvps, setViewingRsvps] = useState(null)
  const [rsvps, setRsvps] = useState([])

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch events') }
  }

  const handleDelete = async (eventId, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Event deleted')
      fetchEvents()
    } catch { setError('Something went wrong') }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/admin/events/${editingEvent}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, capacity: editForm.capacity ? parseInt(editForm.capacity) : null })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMessage('Event updated!')
      setEditingEvent(null)
      fetchEvents()
    } catch { setError('Something went wrong') }
    setTimeout(() => { setMessage(''); setError('') }, 3000)
  }

  const fetchRsvps = async (eventId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/api/admin/events/${eventId}/rsvps`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRsvps(Array.isArray(data) ? data : [])
      setViewingRsvps(eventId)
    } catch { console.error('Failed to fetch RSVPs') }
  }

  const isPast = (dateStr) => new Date(dateStr) < new Date()

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <AdminLayout title="All Events">
      <p className="text-gray-400 text-sm mb-6">{events.length} total events across all clubs</p>

      {message && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-400">{message}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

      <div className="flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No events yet.</p>
          </div>
        ) : events.map(event => (
          <div key={event.id} className="flex flex-col">
            <div className={`bg-gray-900 border rounded-2xl p-5 flex items-center justify-between ${isPast(event.date) ? 'border-gray-700 opacity-60' : 'border-gray-800'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`font-medium ${isPast(event.date) ? 'text-gray-400' : 'text-white'}`}>{event.title}</h3>
                  <span className="text-xs text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{event.club_name}</span>
                  {event.members_only && <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">Members only</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${isPast(event.date) ? 'bg-gray-500/10 border-gray-500/30 text-gray-500' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {isPast(event.date) ? 'past' : event.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 {formatDate(event.date)}</span>
                  <span>📍 {event.location}</span>
                  <span>👥 {event.rsvp_count} RSVPs {event.capacity ? `/ ${event.capacity}` : ''}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => viewingRsvps === event.id ? setViewingRsvps(null) : fetchRsvps(event.id)}
                  className="text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 transition"
                >
                  {viewingRsvps === event.id ? 'Hide' : `RSVPs (${event.rsvp_count})`}
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(editingEvent === event.id ? null : event.id)
                    setEditForm({ title: event.title, description: event.description, date: new Date(event.date).toISOString().slice(0, 16), location: event.location, capacity: event.capacity || '', members_only: event.members_only })
                  }}
                  className="text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 transition"
                >
                  {editingEvent === event.id ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingEvent === event.id && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mt-2">
                <h4 className="font-medium mb-4 text-white">Edit Event</h4>
                <form onSubmit={handleEdit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-300 mb-1">Title</label>
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-300 mb-1">Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Date & Time</label>
                    <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Location</label>
                    <input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Capacity</label>
                    <input type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" checked={editForm.members_only} onChange={e => setEditForm({...editForm, members_only: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                    <label className="text-sm text-gray-300">Members only</label>
                  </div>
                  <div className="col-span-2 flex gap-3">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition">Save Changes</button>
                    <button type="button" onClick={() => setEditingEvent(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl text-sm font-medium transition">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {viewingRsvps === event.id && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mt-2">
                <h4 className="font-medium mb-3 text-white">RSVPs — {event.title}</h4>
                {rsvps.length === 0 ? (
                  <p className="text-gray-500 text-sm">No RSVPs yet.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-xs text-gray-500 px-3 py-2">Name</th>
                          <th className="text-left text-xs text-gray-500 px-3 py-2">Email</th>
                          <th className="text-left text-xs text-gray-500 px-3 py-2">RSVPd at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rsvps.map(r => (
                          <tr key={r.id} className="border-b border-gray-700">
                            <td className="px-3 py-2 text-sm text-white">{r.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-400">{r.email}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}