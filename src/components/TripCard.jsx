import { Link } from 'react-router-dom'

function TripCard({ trip }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="trip-card card">
      <div className="trip-card-header">
        <h3 className="trip-card-route">
          {trip.from} → {trip.to}
        </h3>
        <span className="trip-card-cost">
          ${trip.totalEstimatedCost.toLocaleString()} {trip.currency.toUpperCase()}
        </span>
      </div>

      <div className="trip-card-details">
        <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
        <span>{trip.travellers} traveller{trip.travellers > 1 ? 's' : ''}</span>
        <span>{trip.accommodation}</span>
      </div>

      <div className="trip-card-footer">
        <span className="trip-card-score">
          Comfort Score: {trip.weatherScore} / 100
        </span>
        <Link to={`/trips/${trip.tripId}`} className="btn btn-outline">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default TripCard