import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeCities: 0,
  })

  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await apiFetch('/api/admin/stats')
        setStats(statsData)

        const tripsData = await apiFetch('/api/trips')

        // take latest 5 trips
        setRecentTrips(tripsData.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="card">
            <h3>Total Saved Trips</h3>
            <p>{stats.totalTrips}</p>
          </div>

          <div className="card">
            <h3>Active Cities</h3>
            <p>{stats.activeCities}</p>
          </div>

          <div className="card">
            <h3>Most Searched Destination</h3>
            <p>Coming soon</p>
          </div>
        </div>

        <div className="card detail-section">
          <h2>Recent Trips</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip._id}>
                  <td>{trip._id}</td>
                  <td>{trip.originCityId}</td>
                  <td>{trip.destinationCityId}</td>
                  <td>${trip.totalEstimatedCost}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <br />

          <Link to="/admin/cities" className="btn btn-primary">
            Manage Cities
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard