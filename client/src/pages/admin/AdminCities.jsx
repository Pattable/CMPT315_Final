import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

const emptyForm = {
  name: '',
  country: '',
  currency: '',
  airportCode: '',
  latitude: '',
  longitude: '',
  active: true,
  foodPerPersonPerDay: '',
  transportPerPersonPerDay: '',
  lodging: { budget: '', standard: '', luxury: '' },
}

function AdminCities() {
  const [cities, setCities] = useState([])
  const [selectedCityId, setSelectedCityId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [lodgingStatus, setLodgingStatus] = useState({ budget: false, standard: false, luxury: false })

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

  const fetchLodging = async (cityId) => {
    try {
      const data = await apiFetch(`/api/admin/cities/${cityId}/lodging`)
      setFormData((prev) => ({ ...prev, lodging: data }))
      setLodgingStatus({
        budget: data.budget !== '',
        standard: data.standard !== '',
        luxury: data.luxury !== '',
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectCity = (city) => {
    setSelectedCityId(city._id)
    setFormData({
      name: city.name || '',
      country: city.country || '',
      currency: city.currency || '',
      airportCode: city.airportCode || '',
      latitude: city.location?.latitude ?? '',
      longitude: city.location?.longitude ?? '',
      active: city.status === 'active',
      foodPerPersonPerDay: city.foodPerPersonPerDay ?? '',
      transportPerPersonPerDay: city.transportPerPersonPerDay ?? '',
      lodging: { budget: '', standard: '', luxury: '' },
    })
    setLodgingStatus({ budget: false, standard: false, luxury: false })
    fetchLodging(city._id)
  }

  const handleAddNew = () => {
    setSelectedCityId(null)
    setFormData(emptyForm)
    setLodgingStatus({ budget: false, standard: false, luxury: false })
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
      lodging: { ...prev.lodging, [name]: value },
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) return alert('City name is required')
    if (!formData.country.trim()) return alert('Country is required')
    if (!formData.currency.trim()) return alert('Currency is required')
    if (!formData.airportCode.trim()) return alert('Airport code is required')
    if (formData.latitude === '' || formData.longitude === '') return alert('Latitude and longitude are required')
    if (formData.foodPerPersonPerDay === '' || formData.transportPerPersonPerDay === '') return alert('Cost fields are required')

    const { budget, standard, luxury } = formData.lodging
    if (budget === '' || standard === '' || luxury === '') {
      return alert('All three lodging prices (Budget, Standard, Luxury) are required')
    }

    const cityPayload = {
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
      status: formData.active ? 'active' : 'disabled',
    }

    try {
      const method = selectedCityId ? 'PUT' : 'POST'
      const url = selectedCityId ? `/api/admin/cities/${selectedCityId}` : '/api/admin/cities'

      const cityRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cityPayload),
      })

      const cityData = await cityRes.json()
      if (!cityRes.ok) throw new Error(cityData.error || 'Failed to save city')

      const savedCityId = selectedCityId || cityData._id

      const lodgingRes = await fetch(`/api/admin/cities/${savedCityId}/lodging`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ budget: Number(budget), standard: Number(standard), luxury: Number(luxury) }),
      })

      if (!lodgingRes.ok) throw new Error('Failed to save lodging options')

      alert(selectedCityId ? 'City updated' : 'City added')
      setSelectedCityId(null)
      setFormData(emptyForm)
      setLodgingStatus({ budget: false, standard: false, luxury: false })
      fetchCities()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save city')
    }
  }

  const handleDelete = async (cityId, cityName) => {
    if (!window.confirm(`Delete "${cityName}"?`)) return
    try {
      const res = await fetch(`/api/admin/cities/${cityId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error ${res.status}`)
      }
      if (selectedCityId === cityId) {
        setSelectedCityId(null)
        setFormData(emptyForm)
        setLodgingStatus({ budget: false, standard: false, luxury: false })
      }
      fetchCities()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete city')
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-page-header">
          <h1>Manage Cities</h1>
          <button className="btn btn-primary" onClick={handleAddNew}>+ Add New City</button>
        </div>

        <div className="admin-cities-layout">
          <div className="card admin-city-list">
            <h2>Cities</h2>
            {cities.length === 0 ? (
              <p className="muted">No cities yet.</p>
            ) : (
              <ul className="city-list">
                {cities.map((city) => (
                  <li key={city._id} className={`city-list-item ${selectedCityId === city._id ? 'selected' : ''}`}>
                    <button className="city-list-name" onClick={() => handleSelectCity(city)}>
                      <span>{city.name}</span>
                      <span className={`city-status ${city.status}`}>{city.status}</span>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(city._id, city.name)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card admin-city-form">
            <h2>{selectedCityId ? `Edit: ${formData.name}` : 'New City'}</h2>
            <form onSubmit={handleSave}>

              <div className="form-section-title">City Info</div>

              <div className="form-row">
                <div className="form-group">
                  <label>City Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Paris" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input name="country" value={formData.country} onChange={handleChange} placeholder="e.g. France" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency Code</label>
                  <input name="currency" value={formData.currency} onChange={handleChange} placeholder="e.g. EUR" />
                </div>
                <div className="form-group">
                  <label>Airport Code</label>
                  <input name="airportCode" value={formData.airportCode} onChange={handleChange} placeholder="e.g. CDG" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="e.g. 48.8566" />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="e.g. 2.3522" />
                </div>
              </div>

              <div className="form-section-title">Daily Costs (per person)</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Food / day ($)</label>
                  <input name="foodPerPersonPerDay" type="number" min="0" value={formData.foodPerPersonPerDay} onChange={handleChange} placeholder="e.g. 50" />
                </div>
                <div className="form-group">
                  <label>Transport / day ($)</label>
                  <input name="transportPerPersonPerDay" type="number" min="0" value={formData.transportPerPersonPerDay} onChange={handleChange} placeholder="e.g. 20" />
                </div>
              </div>

              <div className="form-section-title">
                Lodging Prices (per room / night)
                <div className="lodging-status-row">
                  {(['budget', 'standard', 'luxury']).map((t) => (
                    <span key={t} className={`lodging-badge ${lodgingStatus[t] ? 'set' : 'missing'}`}>
                      {t}: {lodgingStatus[t] ? 'set' : 'not set'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget ($)</label>
                  <input name="budget" type="number" min="0" value={formData.lodging.budget} onChange={handleLodgingChange} placeholder="e.g. 40" />
                </div>
                <div className="form-group">
                  <label>Standard ($)</label>
                  <input name="standard" type="number" min="0" value={formData.lodging.standard} onChange={handleLodgingChange} placeholder="e.g. 120" />
                </div>
                <div className="form-group">
                  <label>Luxury ($)</label>
                  <input name="luxury" type="number" min="0" value={formData.lodging.luxury} onChange={handleLodgingChange} placeholder="e.g. 300" />
                </div>
              </div>

              <div className="form-group form-checkbox">
                <label>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                  Active (visible to users)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {selectedCityId ? 'Update City' : 'Add City'}
                </button>
                {selectedCityId && (
                  <button type="button" className="btn btn-outline" onClick={handleAddNew}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCities
