import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialFormData = {
    currentLocation: '',
    destination: '',
    travellers: 1,
    startDate: '',
    endDate: '',
    accommodation: 'hotel',
    currency: 'cad'
  }

  const [formData, setFormData] = useState({
    currentLocation: searchParams.get('from') || initialFormData.currentLocation,
    destination: searchParams.get('to') || initialFormData.destination,
    travellers: searchParams.get('travellers') || initialFormData.travellers,
    startDate: searchParams.get('start') || initialFormData.startDate,
    endDate: searchParams.get('end') || initialFormData.endDate,
    accommodation: searchParams.get('accommodation') || initialFormData.accommodation,
    currency: searchParams.get('currency') || initialFormData.currency
  })

  const minEndDate = formData.startDate || new Date().toISOString().split('T')[0]

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = formData.startDate ? new Date(formData.startDate) : null
    const end = formData.endDate ? new Date(formData.endDate) : null

    if (!start) {
      newErrors.startDate = 'Start date is required'
    } else if (start < today) {
      newErrors.startDate = 'Start date cannot be in the past'
    }

    if (!end) {
      newErrors.endDate = 'End date is required'
    } else if (start && end < start) {
      newErrors.endDate = 'End date cannot be before start date'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === 'startDate' && updated.endDate && updated.endDate < value) {
        updated.endDate = value
      }

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

    const params = new URLSearchParams({
      from: formData.currentLocation,
      to: formData.destination,
      travellers: formData.travellers,
      start: formData.startDate,
      end: formData.endDate,
      accommodation: formData.accommodation,
      currency: formData.currency
    })

    navigate(`/results?${params.toString()}`)
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setErrors({})
    navigate('/')
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Home Page</h1>
        
        <form className="card search-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Plan your trip</legend>

            <label htmlFor="currentLocation">Origin City:</label>
            <input
              type="text"
              name="currentLocation"
              placeholder='Edmonton'
              value={formData.currentLocation}
              onChange={handleChange}
            />

            <label htmlFor="destination">Destination City:</label>
            <input
              type="text"
              name="destination" 
              placeholder='Paris'
              value={formData.destination}
              onChange={handleChange}
            />

            <label htmlFor="travellers">Travellers:</label>
            <input
              type="number"
              name="travellers"
              value={formData.travellers}
              onChange={handleChange}
              min="1"
            />
            {errors.travellers && <p className="error">{errors.travellers}</p>}

            <label htmlFor="startDate">Departure Date:</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.startDate && <p className="error">{errors.startDate}</p>}

            <label htmlFor="endDate">Return Date:</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={minEndDate}
            />
            {errors.endDate && <p className="error">{errors.endDate}</p>}

            <label htmlFor="accommodation">Accommodation:</label>
            <select
              name="accommodation"
              value={formData.accommodation}
              onChange={handleChange}
            >
              <option value="hotel">Hotel</option>
              <option value="hostel">Hostel</option>
              <option value="airbnb">Airbnb</option>
              <option value="camping">Camping</option>
            </select>

            <label htmlFor="currency">Preferred Currency:</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="cad">$ CAD</option>
              <option value="usd">$ USD</option>
              <option value="eur">€ EUR</option>
              <option value="gbp">£ GBP</option>
              <option value="jpy">¥ JPY</option>
            </select>

            <div className="form-buttons">
              <button type="submit">Calculate</button>
              <button onClick={handleReset}>Reset</button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}
export default Home