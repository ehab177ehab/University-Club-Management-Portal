import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
            U
          </div>
          <span className="font-semibold text-white">University Club Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening on campus</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">My Clubs</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Upcoming Events</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">My RSVPs</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
        </div>

        {/* Events section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">No events yet. Check back soon!</p>
          </div>
        </div>
      </div>
    </div>
  )
}