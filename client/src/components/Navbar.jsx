import { useAuth } from '../pages/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          Smart Trip Budget Estimator
        </Link>

        <div className="navbar-links">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          {user?.role === 'client' && (
            <>
              <Link to="/">Home</Link>
              <Link to="/trips">My Trips</Link>
              <button onClick={logout} className="btn btn-outline">Logout</button>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/cities">Cities</Link>
              <button onClick={logout} className="btn btn-outline">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar