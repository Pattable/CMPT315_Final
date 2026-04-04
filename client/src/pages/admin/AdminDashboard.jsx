import { Link } from 'react-router-dom'
import { mockAdminStats, mockTrips } from '../../data/mockData'

function AdminDashboard() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="card">
            <h3>Total Saved Trips</h3>
            <p>{mockAdminStats.totalSavedTrips}</p>
          </div>

          <div className="card">
            <h3>Active Cities</h3>
            <p>{mockAdminStats.activeCities}</p>
          </div>

          <div className="card">
            <h3>Most Searched Destination</h3>
            <p>{mockAdminStats.mostSearchedDestination}</p>
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
              {mockTrips.map((trip) => (
                <tr key={trip.tripId}>
                  <td>{trip.tripId}</td>
                  <td>{trip.from}</td>
                  <td>{trip.to}</td>
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