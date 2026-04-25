import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [rsvpd, setRsvpd] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchEvent()
    fetchRsvpStatus()
  }, [id])

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/events/${id}`)
      const data = await res.json()
      setEvent(data)
      fetchRsvpCount(data.id)
    } catch {
      console.error('Failed to fetch event')
    }
  }

  const fetchRsvpStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/rsvps/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRsvpd(data.includes(id))
    } catch {
      console.error('Failed to fetch RSVP status')
    }
  }

  const fetchRsvpCount = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/rsvps/count/${eventId}`)
      const data = await res.json()
      setRsvpCount(data.count)
    } catch {
      console.error('Failed to fetch RSVP count')
    }
  }

  const handleRSVP = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/rsvps/${id}`, {
        method: rsvpd ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error); return }
      setRsvpd(!rsvpd)
      setRsvpCount(prev => rsvpd ? prev - 1 : prev + 1)
      setMessage(rsvpd ? 'RSVP cancelled' : 'RSVP confirmed!')
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
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (!event) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

  const spotsLeft = event.capacity ? event.capacity - rsvpCount : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">U</div>
          <span className="font-semibold text-white">University Club Portal</span>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm font-medium transition">Dashboard</button>
          <button onClick={() => navigate('/clubs')} className="text-gray-400 hover:text-white text-sm font-medium transition">Clubs</button>
          <button onClick={() => navigate('/events')} className="text-white text-sm font-medium border-b-2 border-blue-500 pb-0.5">Events</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">{user?.role}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition">
          ← Back to Events
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                {event.members_only && (
                  <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30">Members only</span>
                )}
              </div>
              <p className="text-blue-400 text-sm">Hosted by {event.club_name}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border ${event.status === 'upcoming' ? 'bg-green-500/10 border-green-500/30 text-green-400' : event.status === 'ongoing' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-400'}`}>
              {event.status}
            </span>
          </div>

          <p className="text-gray-300 mb-8 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Date & Time</p>
              <p className="text-white text-sm font-medium">📅 {formatDate(event.date)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Location</p>
              <p className="text-white text-sm font-medium">📍 {event.location}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Attendees</p>
              <p className="text-white text-sm font-medium">👥 {rsvpCount} attending</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Capacity</p>
              <p className="text-white text-sm font-medium">
                {spotsLeft !== null ? `${spotsLeft} spots left` : 'Unlimited'}
              </p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes('confirmed') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : message.includes('cancelled') ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleRSVP}
            disabled={spotsLeft === 0 && !rsvpd}
            className={`w-full py-3 rounded-xl font-medium transition ${rsvpd ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : spotsLeft === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {rsvpd ? 'Cancel RSVP' : spotsLeft === 0 ? 'Event Full' : 'RSVP to this Event'}
          </button>
        </div>
      </div>
    </div>
  )
}