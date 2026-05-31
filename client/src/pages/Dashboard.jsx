import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [rsvpdEvents, setRsvpdEvents] = useState([])
  const [joinedClubs, setJoinedClubs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchRsvpdEvents()
    fetchMyClubs()
    fetchNotifications()
    setSelectedDate(new Date())
  }, [navigate])

  const fetchRsvpdEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/rsvps/my/events', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRsvpdEvents(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch RSVPd events') }
  }

  const fetchMyClubs = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/clubs/my/details', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setJoinedClubs(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch clubs') }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/notifications/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch notifications') }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startOffset = (firstDay + 6) % 7
    return { daysInMonth, startOffset }
  }

  const getEventsOnDay = (day) => {
    return rsvpdEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
    })
  }

  const getSelectedDayEvents = () => {
    if (!selectedDate) return []
    return rsvpdEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
    })
  }

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const { daysInMonth, startOffset } = getDaysInMonth(currentMonth)
  const today = new Date()
  const selectedDayEvents = getSelectedDayEvents()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">U</div>
          <span className="font-semibold text-white">University Club Portal</span>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => navigate('/dashboard')} className="text-white text-sm font-medium border-b-2 border-blue-500 pb-0.5">Dashboard</button>
          <button onClick={() => navigate('/clubs')} className="text-gray-400 hover:text-white text-sm font-medium transition">Clubs</button>
          <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-white text-sm font-medium transition">Events</button>
        </div>
        <div className="flex items-center gap-4">
          {user.role === 'club_admin' && (
          <button onClick={() => navigate('/club-admin')} className="text-purple-400 hover:text-purple-300 text-sm transition">
            Club Panel
            </button>
          )}
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">{user.role}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="w-full px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-400 mt-1">Here's your campus activity</p>
        </div>

        <div className="grid grid-cols-4 gap-6">

          {/* LEFT — My Clubs + Selected Day */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">My Clubs</h3>
                <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">{joinedClubs.length}</span>
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {joinedClubs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No clubs yet. <button onClick={() => navigate('/clubs')} className="text-blue-400 hover:text-blue-300">Browse →</button></p>
                ) : joinedClubs.map(club => (
                  <div key={club.id} onClick={() => navigate(`/clubs/${club.id}`)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-sm text-white truncate">{club.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-1">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-gray-500 text-sm mt-2">No events on this day</p>
              ) : selectedDayEvents.map(event => (
                <div key={event.id} className="mt-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
                  <p className="text-sm font-medium text-white">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>
                  <p className="text-xs text-gray-400">🕐 {formatTime(event.date)}</p>
                  <button onClick={() => navigate(`/events/${event.id}`)} className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition">
                    Event details →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE — RSVPd Events + Calendar */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">My RSVPd Events</h3>
                <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">{rsvpdEvents.length}</span>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {rsvpdEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No RSVPs yet. <button onClick={() => navigate('/events')} className="text-blue-400 hover:text-blue-300">Browse events →</button></p>
                ) : rsvpdEvents.map(event => (
                  <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-750 cursor-pointer transition border border-gray-700 hover:border-gray-600">
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.date)} · {event.location} · {event.club_name}</p>
                    </div>
                    <span className="text-gray-500 text-xs ml-3">→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-gray-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-gray-800">←</button>
                <h3 className="font-semibold text-white">{monthName}</h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-gray-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-gray-800">→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                  <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = getEventsOnDay(day)
                  const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()
                  const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear()
                  const hasEvent = dayEvents.length > 0

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                      className={`min-h-12 p-1 rounded-lg cursor-pointer transition flex flex-col ${isSelected ? 'bg-blue-600/30 border border-blue-500' : isToday ? 'border border-blue-500/50' : hasEvent ? 'bg-gray-800 hover:bg-gray-750' : 'hover:bg-gray-800'}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>{day}</span>
                      {dayEvents.slice(0, 2).map(event => (
                        <span key={event.id} className="text-xs bg-blue-600 text-white rounded px-1 mt-0.5 truncate block">{event.title}</span>
                      ))}
                      {dayEvents.length > 2 && <span className="text-xs text-gray-400 mt-0.5">+{dayEvents.length - 2}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Activity */}
          <div className="col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Activity</h3>

              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Updates</p>
              <div className="max-h-36 overflow-y-auto flex flex-col gap-2 mb-4">
                {notifications.filter(n => n.type === 'event_update').length === 0 ? (
                  <div className="p-3 bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-500">No updates yet</p>
                  </div>
                ) : notifications.filter(n => n.type === 'event_update').slice(0, 3).map(n => (
                  <div key={n.id} className="p-3 bg-yellow-500/10 border-l-2 border-yellow-500 rounded-r-xl">
                    <p className="text-sm text-yellow-300">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.created_at)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 my-3"></div>

              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Recent</p>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                {notifications.filter(n => n.type !== 'event_update').length === 0 ? (
                  <p className="text-gray-500 text-sm">No activity yet.</p>
                ) : notifications.filter(n => n.type !== 'event_update').slice(0, 5).map(n => (
                  <div key={n.id} className="p-3 bg-gray-800 border-l-2 border-blue-500 rounded-r-xl">
                    <p className="text-sm text-white">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.created_at)}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}