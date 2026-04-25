import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Events() {
  const [events, setEvents] = useState([])
  const [rsvpdEvents, setRsvpdEvents] = useState(new Set())
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchEvents()
    fetchMyRsvps()
  }, [navigate])

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/events')
      const data = await res.json()
      setEvents(data)
    } catch {
      console.error('Failed to fetch events')
    }
  }

  const fetchMyRsvps = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/rsvps/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRsvpdEvents(new Set(data))
    } catch {
      console.error('Failed to fetch RSVPs')
    }
  }

  const handleRSVP = async (eventId) => {
    const token = localStorage.getItem('token')
    const isRsvpd = rsvpdEvents.has(eventId)
    try {
      const res = await fetch(`http://localhost:3000/api/rsvps/${eventId}`, {
        method: isRsvpd ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error); return }
      setRsvpdEvents(prev => {
        const next = new Set(prev)
        isRsvpd ? next.delete(eventId) : next.add(eventId)
        return next
      })
      setMessage(isRsvpd ? 'RSVP cancelled' : 'RSVP confirmed!')
    } catch {
      setMessage('Something went wrong')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">U</div>
    <span className="font-semibold text-white">University Club Portal</span>
  </div>
  <div className="flex items-center gap-10">
    <button onClick={() => navigate('/dashboard')} className={`text-sm font-medium pb-0.5 transition ${location.pathname === '/dashboard' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
    <button onClick={() => navigate('/clubs')} className={`text-sm font-medium pb-0.5 transition ${location.pathname === '/clubs' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Clubs</button>
    <button onClick={() => navigate('/events')} className={`text-sm font-medium pb-0.5 transition ${location.pathname === '/events' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Events</button>
  </div>
  <div className="flex items-center gap-4">
    <span className="text-gray-400 text-sm">{user?.email}</span>
    <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">{user?.role}</span>
    <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">Logout</button>
  </div>
</nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">All Events</h1>
          <p className="text-gray-400 mt-1">Browse all upcoming campus events</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes('confirmed') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : message.includes('cancelled') ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">No events yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-start justify-between hover:border-gray-700 transition cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    {event.members_only && (
                      <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/30">Members only</span>
                    )}
                    {rsvpdEvents.has(event.id) && (
                      <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">Attending</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>📍 {event.location}</span>
                    <span>🏛 {event.club_name}</span>
                    {event.capacity && <span>👥 {event.capacity} spots</span>}
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}