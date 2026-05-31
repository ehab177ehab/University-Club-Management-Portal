import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ClubAdminLayout({ children, title }) {
  const [user, setUser] = useState(null)
  const [club, setClub] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'club_admin') { navigate('/dashboard'); return }
    setUser(parsed)
    fetchMyClub(parsed.id)
  }, [navigate])

  const fetchMyClub = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/club-admin/my-club', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setClub(data)
    } catch {
      console.error('Failed to fetch club')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/club-admin' },
    { label: 'Events', path: '/club-admin/events' },
    { label: 'Members', path: '/club-admin/members' },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">C</div>
            <div>
              <p className="font-semibold text-white text-sm truncate">{club?.name || 'Club Portal'}</p>
              <p className="text-xs text-gray-400">Club Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${location.pathname === item.path ? 'bg-purple-600 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

<div className="p-4 border-t border-gray-800">
  <button
    onClick={() => navigate('/dashboard')}
    className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition mb-2"
  >
    👤 Student View
  </button>
  <div className="mb-3">
    <p className="text-xs text-gray-400 truncate">{user.email}</p>
    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">club_admin</span>
  </div>
  <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
    Logout
  </button>
</div>
      </div>

      <div className="ml-56 flex-1 p-8">
        {title && <div className="mb-8"><h1 className="text-2xl font-bold">{title}</h1></div>}
        {children}
      </div>
    </div>
  )
}