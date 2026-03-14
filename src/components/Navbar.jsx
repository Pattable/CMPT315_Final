import { Link } from 'react-router-dom'

const mockUser = null
// const mockUser = { role: 'client' }
// const mockUser = { role: 'admin' }

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          Smart Trip Budget Estimator
        </Link>

        <div className="navbar-links">
          {!mockUser && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          {mockUser?.role === 'client' && (
            <>
              <Link to="/">Home</Link>
              <Link to="/trips">My Trips</Link>
              <button className="btn btn-outline">Logout</button>
            </>
          )}
          {mockUser?.role === 'admin' && (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/cities">Cities</Link>
              <button className="btn btn-outline">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar