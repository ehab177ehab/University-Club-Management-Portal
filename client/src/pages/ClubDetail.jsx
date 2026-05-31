import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

export default function ClubDetail() {
  const { id } = useParams()
  const [club, setClub] = useState(null)
  const [events, setEvents] = useState([])
  const [joined, setJoined] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchClub()
    fetchClubEvents()
    fetchMyClubs()
  }, [id])

  const fetchClub = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/clubs/${id}`)
      const data = await res.json()
      setClub(data)
      setMemberCount(Number(data.member_count) || 0)
    } catch {
      console.error('Failed to fetch club')
    }
  }

  const fetchClubEvents = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/events?club_id=${id}`)
      const data = await res.json()
      setEvents(data)
    } catch {
      console.error('Failed to fetch club events')
    }
  }

  const fetchMyClubs = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/clubs/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setJoined(data.includes(id))
    } catch {
      console.error('Failed to fetch my clubs')
    }
  }

const handleJoinLeave = async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/clubs/${id}/${joined ? 'leave' : 'join'}`, {
      method: joined ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error); return }
    setJoined(!joined)
    setMessage(joined ? 'Left club' : 'Joined club!')
    fetchClub()
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

  if (!club) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">U</div>
          <span className="font-semibold text-white">University Club Portal</span>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm font-medium transition">Dashboard</button>
          <button onClick={() => navigate('/clubs')} className="text-white text-sm font-medium border-b-2 border-blue-500 pb-0.5">Clubs</button>
          <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-white text-sm font-medium transition">Events</button>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'club_admin' && (
  <button onClick={() => navigate('/club-admin')} className="text-purple-400 hover:text-purple-300 text-sm transition">
    Club Panel
  </button>
)}
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">{user?.role}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      {/* Banner image */}
      {club.image_url && (
        <div className="w-full h-56 overflow-hidden">
          <img src={club.image_url} alt={club.name} className="w-full h-full object-cover opacity-60" />
        </div>
      )}

      <div className="w-full px-8 py-8">
        <button onClick={() => navigate('/clubs')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition">
          ← Back to Clubs
        </button>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes('Joined') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : message.includes('Left') ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* 3 column layout */}
        <div className="grid grid-cols-4 gap-6">

          {/* LEFT — club image + join + stats */}
          <div className="col-span-1 flex flex-col gap-4">
            {club.image_url && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <img src={club.image_url} alt={club.name} className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-1">{club.name}</h2>
              <div className="flex flex-col gap-2 mt-3 text-sm text-gray-400">
                <span>👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                <span>📅 {events.length} upcoming {events.length === 1 ? 'event' : 'events'}</span>
              </div>
            </div>

            {(user?.role === 'student' || user?.role === 'club_admin') && (
  <button
    onClick={() => handleJoinLeave(club.id)}
                className={`w-full py-3 rounded-xl font-medium transition ${joined ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {joined ? 'Leave Club' : 'Join Club'}
              </button>
            )}
          </div>

          {/* MIDDLE — about + events */}
          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-gray-400 leading-relaxed">{club.description}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming events for this club.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {events.map(event => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-750 transition border border-gray-700 hover:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white text-sm">{event.title}</h4>
                            {event.members_only && (
                              <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/30">Members only</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>📅 {formatDate(event.date)}</span>
                            <span>📍 {event.location}</span>
                            {event.capacity && <span>👥 {event.capacity} spots</span>}
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs ml-2">View →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — announcements placeholder */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Announcements</h3>
              <div className="flex flex-col gap-3">
                <p className="text-gray-500 text-sm">No announcements yet. Check back soon!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}