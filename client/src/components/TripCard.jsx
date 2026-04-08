import { Link } from 'react-router-dom'

function TripCard({ trip }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const originName = trip.originCityId?.name || trip.from || 'Unknown'
  const destName = trip.destinationCityId?.name || trip.to || 'Unknown'

  return (
    <div className="trip-card card">
      <div className="trip-card-header">
        <h3 className="trip-card-route">
          {originName} → {destName}
        </h3>
        <span className="trip-card-cost">
          ${trip.totalEstimatedCost?.toLocaleString?.() || 0} {trip.preferredCurrency?.toUpperCase()}
        </span>
      </div>

      <div className="trip-card-details">
        <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
        <span>{trip.travellers} traveller{trip.travellers > 1 ? 's' : ''}</span>
        <span>{trip.accommodationType}</span>
      </div>

      <div className="trip-card-footer">
        <div className="trip-card-score">
          {trip.weatherScore == null
            ? <span className="weather-unavailable">Weather comfort: Unavailable</span>
            : <span>Comfort Score: {trip.weatherScore} / 100</span>
          }
        </div>
        <Link to={`/trips/${trip._id}`} className="btn btn-outline">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default TripCard
