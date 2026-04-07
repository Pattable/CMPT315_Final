import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function TripDetail() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error()

      alert('Trip deleted')
      navigate('/trips')
    } catch (err) {
      console.error(err)
      alert('Failed to delete trip')
    }
  }

  useEffect(() => {
    if (!tripId || tripId === 'undefined') return

    const fetchTrip = async () => {
      try {
        const data = await apiFetch(`/api/trips/${tripId}`)
        setTrip(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTrip()
  }, [tripId])

  if (!trip) return <p>Loading...</p>

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/trips" className="btn btn-outline">Back</Link>

        <h1>Trip Detail</h1>

        <button onClick={handleDelete} className="btn btn-danger">
          Delete Trip
        </button>

        <div className="card detail-section">
          <h2>Stored Breakdown Snapshot</h2>

          <p><strong>Origin City ID:</strong> {trip.originCityId}</p>
          <p><strong>Destination City ID:</strong> {trip.destinationCityId}</p>

          <p>
            <strong>Total (Local):</strong> {trip.preferredCurrency} {trip.totalLocalEstimatedCost}
          </p>

          <p><strong>Lodging:</strong> ${trip.breakdown.lodgingCost}</p>
          <p><strong>Food:</strong> ${trip.breakdown.foodCost}</p>
          <p><strong>Transport:</strong> ${trip.breakdown.transportCost}</p>

          <p><strong>Exchange Rate Used:</strong> {trip.exchangeRateUsed}</p>
          <p><strong>Weather Score:</strong> {trip.weatherScore}</p>

          {trip.weatherBreakdown && (
            <p>
              <strong>Weather Breakdown:</strong>
              Temp: +{trip.weatherBreakdown.temperatureComfort},
              Precip: +{trip.weatherBreakdown.precipitationComfort},
              Humidity: +{trip.weatherBreakdown.humidityComfort},
              Wind: +{trip.weatherBreakdown.windComfort},
              Weather: +{trip.weatherBreakdown.weatherCodeQuality}
            </p>
          )}

          <p><strong>Total (Base):</strong> ${trip.totalEstimatedCost}</p>
        </div>
      </div>
    </div>
  )
}

export default TripDetail