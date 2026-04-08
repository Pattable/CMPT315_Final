import { AuthProvider, useAuth } from './pages/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Results from './pages/Results'
import Login from './pages/Login'
import Register from './pages/Register'
import TripList from './pages/trips/TripList'
import TripDetail from './pages/trips/TripDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCities from './pages/admin/AdminCities'

function ClientOnly({ children }) {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<ClientOnly><Home /></ClientOnly>} />
            <Route path="/results" element={<ClientOnly><Results /></ClientOnly>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cities" element={<AdminCities />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
