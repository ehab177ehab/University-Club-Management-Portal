import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchClubs()
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Campus Clubs</h1>
           <p className="text-gray-400 mt-1">Browse and join clubs that interest you</p>
          </div>
         <input
           value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
           placeholder="Search clubs..."
           className="w-64 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
           />
         </div>

        {clubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500">{clubs.length === 0 ? 'No clubs yet. Check back soon!' : 'No clubs match your search.'}</p>
            </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase())).map(club => (
              <div
                key={club.id}
                onClick={() => navigate(`/clubs/${club.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition cursor-pointer"
              >
                {club.image_url && (
                  <img src={club.image_url} alt={club.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-white text-lg mb-1">{club.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{club.description}</p>
                  <p className="text-gray-500 text-xs">👥 {club.member_count} {club.member_count === '1' ? 'member' : 'members'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}