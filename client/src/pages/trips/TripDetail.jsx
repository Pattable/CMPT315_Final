import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function TripDetail() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)

  useEffect(() => {
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

<<<<<<< HEAD:src/pages/trips/TripDetail.jsx
        <p><strong>From:</strong> {trip.originCityId?.name}</p>
        <p><strong>To:</strong> {trip.destinationCityId?.name}</p>
        <p><strong>Total:</strong> ${trip.totalEstimatedCost}</p>
=======
        <div className="card detail-section">
          <h2>Stored Breakdown Snapshot</h2>
          <p><strong>Flight:</strong> ${trip.breakdown.flight}</p>
          <p><strong>Lodging:</strong> ${trip.breakdown.lodging}</p>
          <p><strong>Food:</strong> ${trip.breakdown.food}</p>
          <p><strong>Transport:</strong> ${trip.breakdown.transport}</p>
          <p><strong>Exchange Rate Used:</strong> {trip.exchangeRateUsed}</p>
          <p><strong>Weather Score:</strong> {trip.weatherScore}</p>
          {trip.weatherBreakdown && (
            <p><strong>Weather Breakdown:</strong> Temp: +{trip.weatherBreakdown.temperatureComfort}, Precip: +{trip.weatherBreakdown.precipitationComfort}, Humidity: +{trip.weatherBreakdown.humidityComfort}, Wind: +{trip.weatherBreakdown.windComfort}, Weather: +{trip.weatherBreakdown.weatherCodeQuality}</p>
          )}
          <p><strong>Total:</strong> ${trip.totalEstimatedCost}</p>
        </div>
>>>>>>> main:client/src/pages/trips/TripDetail.jsx
      </div>
    </div>
  )
}

export default TripDetail