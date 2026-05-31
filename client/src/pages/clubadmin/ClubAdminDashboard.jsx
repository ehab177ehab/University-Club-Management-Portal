import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClubAdminLayout from './ClubAdminLayout'

export default function ClubAdminDashboard() {
  const [club, setClub] = useState(null)
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchClub()
    fetchEvents()
    fetchMembers()
  }, [])

  const fetchClub = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/club-admin/my-club', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setClub(data)
    } catch { console.error('Failed to fetch club') }
  }

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/club-admin/my-club/events', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch events') }
  }

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/club-admin/my-club/members', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch { console.error('Failed to fetch members') }
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming' && new Date(e.date) > new Date())

  return (
    <ClubAdminLayout title="Dashboard">
      {club && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
          {club.image_url && <img src={club.image_url} alt={club.name} className="w-16 h-16 rounded-xl object-cover" />}
          <div>
            <h2 className="text-xl font-bold">{club.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{club.description}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>👥 {club.member_count} members</span>
              <span>📅 {events.length} total events</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Total Members</p>
          <p className="text-3xl font-bold mt-1">{members.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Upcoming Events</p>
          <p className="text-3xl font-bold mt-1">{upcomingEvents.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Total Events</p>
          <p className="text-3xl font-bold mt-1">{events.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Events</h3>
            <button onClick={() => navigate('/club-admin/events')} className="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">No events yet.</p>
          ) : events.slice(0, 3).map(event => (
            <div key={event.id} className="py-3 border-b border-gray-800 last:border-0">
              <p className="text-sm font-medium text-white">{event.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.rsvp_count} RSVPs</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Members</h3>
            <button onClick={() => navigate('/club-admin/members')} className="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm">No members yet.</p>
          ) : members.slice(0, 3).map(member => (
            <div key={member.id} className="py-3 border-b border-gray-800 last:border-0">
              <p className="text-sm font-medium text-white">{member.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{member.email}</p>
            </div>
          ))}
        </div>
      </div>
    </ClubAdminLayout>
  )
}