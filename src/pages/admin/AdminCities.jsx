import { useMemo, useState } from 'react'
import { mockCities } from '../../data/mockData'

function AdminCities() {
  const [cities, setCities] = useState(mockCities)
  const [selectedCityId, setSelectedCityId] = useState(mockCities[0]?.cityId || null)

  const selectedCity = useMemo(
    () => cities.find((city) => city.cityId === selectedCityId),
    [cities, selectedCityId]
  )

  const [formData, setFormData] = useState(
    selectedCity || {
      cityId: null,
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
    }
  )

  const handleSelectCity = (city) => {
    setSelectedCityId(city.cityId)
    setFormData(city)
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
      cityId: Date.now(),
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

  const handleSave = (e) => {
    e.preventDefault()

    const exists = cities.some((city) => city.cityId === formData.cityId)

    if (exists) {
      setCities((prev) =>
        prev.map((city) => (city.cityId === formData.cityId ? formData : city))
      )
    } else {
      setCities((prev) => [...prev, formData])
    }

    alert('City saved successfully')
    setSelectedCityId(formData.cityId)
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Manage Cities</h1>

        <div className="admin-cities-layout">
          <div className="card city-list-panel">
            <button className="btn btn-primary" onClick={handleAddNew}>
              Add New City
            </button>

            <ul className="city-list">
              {cities.map((city) => (
                <li key={city.cityId}>
                  <button
                    className={`city-list-button ${selectedCityId === city.cityId ? 'active' : ''}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    {city.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <form className="card city-form-panel" onSubmit={handleSave}>
            <h2>City Details</h2>

            <label>City Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />

            <label>Country</label>
            <input name="country" value={formData.country} onChange={handleChange} />

            <label>Currency</label>
            <input name="currency" value={formData.currency} onChange={handleChange} />

            <label>Airport Code</label>
            <input name="airportCode" value={formData.airportCode} onChange={handleChange} />

            <label>Latitude</label>
            <input name="latitude" value={formData.latitude} onChange={handleChange} />

            <label>Longitude</label>
            <input name="longitude" value={formData.longitude} onChange={handleChange} />

            <h2>Cost of Living</h2>

            <label>Food per Person per Day</label>
            <input
              name="foodPerPersonPerDay"
              value={formData.foodPerPersonPerDay}
              onChange={handleChange}
            />

            <label>Transport per Person per Day</label>
            <input
              name="transportPerPersonPerDay"
              value={formData.transportPerPersonPerDay}
              onChange={handleChange}
            />

            <h2>Lodging Details</h2>

            <label>Budget Cost</label>
            <input
              name="budget"
              value={formData.lodging.budget}
              onChange={handleLodgingChange}
            />

            <label>Standard Cost</label>
            <input
              name="standard"
              value={formData.lodging.standard}
              onChange={handleLodgingChange}
            />

            <label>Luxury Cost</label>
            <input
              name="luxury"
              value={formData.lodging.luxury}
              onChange={handleLodgingChange}
            />

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Active
            </label>

            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminCities