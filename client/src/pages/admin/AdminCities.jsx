import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function AdminCities() {
  const [cities, setCities] = useState([])
  const [selectedCityId, setSelectedCityId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    currency: '',
    airportCode: '',
    latitude: '',
    longitude: '',
    active: true,
    foodPerPersonPerDay: '',
    transportPerPersonPerDay: '',
    lodging: {
      budget: '',
      standard: '',
      luxury: '',
    },
  })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const data = await apiFetch('/api/admin/cities')
      setCities(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectCity = (city) => {
    setSelectedCityId(city._id)
    setFormData({
      ...city,
      lodging: city.lodging || {
        budget: '',
        standard: '',
        luxury: '',
      },
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLodgingChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      lodging: {
        ...prev.lodging,
        [name]: value,
      },
    }))
  }

  const handleAddNew = () => {
    setSelectedCityId(null)
    setFormData({
      name: '',
      country: '',
      currency: '',
      airportCode: '',
      latitude: '',
      longitude: '',
      active: true,
      foodPerPersonPerDay: '',
      transportPerPersonPerDay: '',
      lodging: {
        budget: '',
        standard: '',
        luxury: '',
      },
    })
  }

  const handleSave = async (e) => {

    if (!formData.name.trim()) return alert('City name is required')
    if (!formData.country.trim()) return alert('Country is required')
    if (!formData.currency.trim()) return alert('Currency is required')
    if (!formData.airportCode.trim()) return alert('Airport code is required')

    if (!formData.latitude || !formData.longitude) {
      return alert('Latitude and longitude are required')
    }

    if (!formData.foodPerPersonPerDay || !formData.transportPerPersonPerDay) {
      return alert('Cost fields are required')
    }

    e.preventDefault()

    try {
      const payload = {
        name: formData.name.trim(),
        country: formData.country.trim(),
        currency: formData.currency.trim(),
        airportCode: formData.airportCode.trim(),

        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },

        foodPerPersonPerDay: Number(formData.foodPerPersonPerDay),
        transportPerPersonPerDay: Number(formData.transportPerPersonPerDay),

        status: formData.active ? 'active' : 'disabled'
      }

      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save city')
      }

      alert('City saved successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to save city')
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Manage Cities</h1>

        <button onClick={handleAddNew}>Add New City</button>

        <ul>
          {cities.map((city) => (
            <li key={city._id}>
              <button onClick={() => handleSelectCity(city)}>
                {city.name}
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSave}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="City" required />
          <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" required />
          <input name="currency" value={formData.currency} onChange={handleChange} placeholder="Currency" required />
          <input name="airportCode" value={formData.airportCode} onChange={handleChange} placeholder="Airport Code" required />

          <input name="latitude" type="number" value={formData.latitude} onChange={handleChange} placeholder="Latitude" required />
          <input name="longitude" type="number" value={formData.longitude} onChange={handleChange} placeholder="Longitude" required />

          <input name="foodPerPersonPerDay" type="number" value={formData.foodPerPersonPerDay} onChange={handleChange} placeholder="Food per day" required />
          <input name="transportPerPersonPerDay" type="number" value={formData.transportPerPersonPerDay} onChange={handleChange} placeholder="Transport per day" required />

          <label>
            Active
            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
          </label>

          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  )
}

export default AdminCities