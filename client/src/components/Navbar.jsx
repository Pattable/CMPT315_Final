import { useAuth } from '../pages/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()

  const displayName = user?.email ? user.email.split('@')[0] : null

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="navbar-logo">
          ✈︎ Smart Trip Budget Estimator
        </Link>
        <div className="navbar-center">
          {user && (
            <span className="navbar-user">
              {displayName}{user.role === 'admin' ? ' (Admin)' : ''}
            </span>
          )}
        </div>

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
