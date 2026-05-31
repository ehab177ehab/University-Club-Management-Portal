import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clubs from './pages/Clubs'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import ClubDetail from './pages/ClubDetail'
import AdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SuperAdminClubs from './pages/superadmin/SuperAdminClubs'
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers'
import ClubAdminDashboard from './pages/clubadmin/ClubAdminDashboard'
import ClubAdminLayout from './pages/clubadmin/ClubAdminLayout'
import ClubAdminEvents from './pages/clubadmin/ClubAdminEvents'
import ClubAdminMembers from './pages/clubadmin/ClubAdminMembers'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/clubs" element={<SuperAdminClubs />} />
        <Route path="/admin/users" element={<SuperAdminUsers />} />
        <Route path="/club-admin" element={<ClubAdminDashboard />} />
        <Route path="/club-admin/events" element={<ClubAdminEvents />} />
        <Route path="/club-admin/members" element={<ClubAdminMembers />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App