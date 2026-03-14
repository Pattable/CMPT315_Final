import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/:tripId" element={<TripDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cities" element={<AdminCities />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App