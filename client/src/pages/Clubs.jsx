import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [joinedClubs, setJoinedClubs] = useState(new Set())
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchClubs()
    fetchMyClubs()
  }, [navigate])

  const fetchClubs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/clubs')
      const data = await res.json()
      setClubs(data)
    } catch {
      console.error('Failed to fetch clubs')
    }
  }

  const fetchMyClubs = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/clubs/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setJoinedClubs(new Set(data))
    } catch {
      console.error('Failed to fetch my clubs')
    }
  }

  const handleJoinLeave = async (clubId) => {
    const token = localStorage.getItem('token')
    const isJoined = joinedClubs.has(clubId)

    try {
      const res = await fetch(`http://localhost:3000/api/clubs/${clubId}/${isJoined ? 'leave' : 'join'}`, {
        method: isJoined ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error); return }

      setJoinedClubs(prev => {
        const next = new Set(prev)
        isJoined ? next.delete(clubId) : next.add(clubId)
        return next
      })
      setMessage(isJoined ? 'Left club' : 'Joined club!')
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Campus Clubs</h1>
            <p className="text-gray-400 mt-1">Browse and join clubs that interest you</p>
          </div>
          {user?.role === 'super_admin' && (
            <button
              onClick={() => navigate('/admin/clubs/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Create Club
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes('Joined') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : message.includes('Left') ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        {clubs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">No clubs yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map(club => (
              <div key={club.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
                {club.image_url && (
                  <img src={club.image_url} alt={club.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-white text-lg mb-1">{club.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{club.description}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition"
                    >
                      View details →
                    </button>
                    {user?.role === 'student' && (
                      <button
                        onClick={() => handleJoinLeave(club.id)}
                        className={`text-sm px-4 py-1.5 rounded-lg transition ${joinedClubs.has(club.id) ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {joinedClubs.has(club.id) ? 'Leave' : 'Join'}
                      </button>
                    )}
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