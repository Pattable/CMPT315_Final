import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeCities: 0,
    disabledCities: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await apiFetch('/api/admin/stats')
        setStats(statsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="loading-msg">Loading...</p>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-page-header">
          <h1>Admin Dashboard</h1>
          <Link to="/admin/cities" className="btn btn-primary">Manage Cities</Link>
        </div>

        <div className="stats-grid">
          <div className="card">
            <h3>Total Saved Trips</h3>
            <p>{stats.totalTrips}</p>
          </div>
          <div className="card">
            <h3>Registered Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="card">
            <h3>Active Cities</h3>
            <p>{stats.activeCities}</p>
          </div>
          <div className="card">
            <h3>Disabled Cities</h3>
            <p>{stats.disabledCities}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
