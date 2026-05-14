import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AdminLayout({ children, title }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'super_admin') { navigate('/dashboard'); return }
    setUser(parsed)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { label: 'Overview', path: '/admin' },
    { label: 'Clubs', path: '/admin/clubs' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Events', path: '/admin/events' },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">U</div>
            <div>
              <p className="font-semibold text-white text-sm">Club Portal</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${location.pathname === item.path ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-3">
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">super_admin</span>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-56 flex-1 p-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}