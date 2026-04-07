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
          ${trip.totalEstimatedCost?.toLocaleString?.() || 0} {trip.preferredCurrency?.toUpperCase()}
        </span>
      </div>

      <div className="trip-card-details">
        <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
        <span>{trip.travellers} traveller{trip.travellers > 1 ? 's' : ''}</span>
        <span>{trip.accommodation}</span>
      </div>

      <div className="trip-card-footer">
        <div className="trip-card-score">
          <span>Comfort Score: {trip.weatherScore} / 100</span>
          {trip.weatherBreakdown && (
            <div className="weather-breakdown">
              <small>
                Temp: +{trip.weatherBreakdown.temperatureComfort} |
                Precip: +{trip.weatherBreakdown.precipitationComfort} |
                Humidity: +{trip.weatherBreakdown.humidityComfort} |
                Wind: +{trip.weatherBreakdown.windComfort} |
                Weather: +{trip.weatherBreakdown.weatherCodeQuality}
              </small>
            </div>
          )}
        </div>
        <Link to={`/trips/${trip.tripId || trip._id}`} className="btn btn-outline">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default TripCard