import { useAuth } from './AuthContext'
import { useState } from 'react'
import { mockUsers } from '../data/mockData'

function Register() {
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login } = useAuth()
  
  const validate = () => {
    const newErrors = {}
  
    const email = formData.email
    const password = formData.password
  
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (email.trim().length === 0) {
      newErrors.email = 'Email must not be empty'
    }
  
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.trim().length === 0) {
      newErrors.password = 'Password must not be empty'
    }
  
    return newErrors
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
      
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
  
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const foundUser = mockUsers.find(
      user => user.email === 'alice@example.com'
    )
    
    if (foundUser) {
      login(foundUser)
    } else {
      validationErrors.email = 'User not found'
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