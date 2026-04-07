import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'

function TripDetail() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip?')) return
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error()

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

  if (!trip) return <p className="loading-msg">Loading...</p>

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'

  const originName = trip.originCityId?.name || 'Unknown'
  const destName = trip.destinationCityId?.name || 'Unknown'

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="detail-nav">
          <Link to="/trips" className="btn btn-outline">← Back to Trips</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete Trip</button>
        </div>

        <h1 className="detail-title">{originName} → {destName}</h1>

        <div className="detail-grid">
          <div className="card detail-section">
            <h2>Trip Info</h2>
            <div className="detail-rows">
              <div className="detail-row"><span>Origin</span><strong>{originName}</strong></div>
              <div className="detail-row"><span>Destination</span><strong>{destName}</strong></div>
              <div className="detail-row"><span>Departure</span><strong>{formatDate(trip.startDate)}</strong></div>
              <div className="detail-row"><span>Return</span><strong>{formatDate(trip.endDate)}</strong></div>
              <div className="detail-row"><span>Travellers</span><strong>{trip.travellers}</strong></div>
              <div className="detail-row"><span>Accommodation</span><strong>{trip.accommodationType}</strong></div>
              <div className="detail-row"><span>Currency</span><strong>{trip.preferredCurrency}</strong></div>
            </div>
          </div>

          <div className="card detail-section">
            <h2>Cost Breakdown</h2>
            <div className="detail-rows">
              <div className="detail-row"><span>Flight</span><strong>${trip.breakdown?.flightCost?.toLocaleString() ?? 'N/A'}</strong></div>
              <div className="detail-row"><span>Lodging</span><strong>${trip.breakdown?.lodgingCost?.toLocaleString() ?? 'N/A'}</strong></div>
              <div className="detail-row"><span>Food</span><strong>${trip.breakdown?.foodCost?.toLocaleString() ?? 'N/A'}</strong></div>
              <div className="detail-row"><span>Transport</span><strong>${trip.breakdown?.transportCost?.toLocaleString() ?? 'N/A'}</strong></div>
              <div className="detail-row detail-total"><span>Total</span><strong>${trip.totalEstimatedCost?.toLocaleString() ?? 'N/A'} {trip.preferredCurrency}</strong></div>
            </div>
            <p className="detail-note">Exchange rate used: {trip.exchangeRateUsed}</p>
          </div>

          <div className="card detail-section">
            <h2>Weather Comfort</h2>
            {trip.weatherScore == null ? (
              <p className="weather-unavailable">Score unavailable — weather data could not be retrieved for these dates.</p>
            ) : (
              <div className="detail-rows">
                <div className="detail-row"><span>Overall Score</span><strong>{trip.weatherScore} / 100</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripDetail
