import { useAuth } from './AuthContext'
import { useState } from 'react'

function Register() {
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login } = useAuth()

  const validate = () => {
    const newErrors = {}
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = 'Email is required'
    }
    if (!formData.password || formData.password.trim().length === 0) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        credentials: 'include',          // sends the session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })

      const data = await res.json()

      if (res.ok) {
        login(data.user)                 // logs them in right after registering
      } else {
        setErrors({ email: data.error }) // shows "Email already in use" etc
      }
    } catch (err) {
      setErrors({ email: 'Server error, please try again.' })
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Register Page</h1>

        <form className="card search-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Register email & password</legend>

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="example@domain.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}

            <div className="form-buttons">
              <button type="submit">Register</button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}

export default Register