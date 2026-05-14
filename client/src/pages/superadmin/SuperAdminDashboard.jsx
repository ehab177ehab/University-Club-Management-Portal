import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'


export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ clubs: 0, users: 0, events: 0, rsvps: 0 })
  const navigate = useNavigate()
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    } catch {
      console.error('Failed to fetch stats')
    }
  }

  return (
    <AdminLayout title="Overview">
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clubs', value: stats.clubs, color: 'blue' },
          { label: 'Total Users', value: stats.users, color: 'green' },
          { label: 'Total Events', value: stats.events, color: 'purple' },
          { label: 'Total RSVPs', value: stats.rsvps, color: 'yellow' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/clubs')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition">+ Create Club</button>
          <button onClick={() => navigate('/admin/users')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition">Manage Users</button>
          <button onClick={() => navigate('/admin/events')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition">View All Events</button>
        </div>
      </div>
    </AdminLayout>
  )
}