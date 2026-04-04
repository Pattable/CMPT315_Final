import { Link, useParams } from 'react-router-dom'
import { mockTrips } from '../../data/mockData'

function TripDetail() {
  const { tripId } = useParams()
  const trip = mockTrips.find((item) => String(item.tripId) === tripId)

  if (!trip) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <h1>Trip Not Found</h1>
          <Link to="/trips" className="btn btn-primary">Back to Trips</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/trips" className="btn btn-outline">Back to Trips</Link>

        <div className="card detail-section">
          <h1>Trip Detail</h1>
          <p><strong>Origin:</strong> {trip.from}</p>
          <p><strong>Destination:</strong> {trip.to}</p>
          <p><strong>Dates:</strong> {trip.startDate} to {trip.endDate}</p>
          <p><strong>Travellers:</strong> {trip.travellers}</p>
          <p><strong>Accommodation:</strong> {trip.accommodation}</p>
          <p><strong>Currency:</strong> {trip.currency.toUpperCase()}</p>
        </div>

        <div className="card detail-section">
          <h2>Stored Breakdown Snapshot</h2>
          <p><strong>Flight:</strong> ${trip.breakdown.flight}</p>
          <p><strong>Lodging:</strong> ${trip.breakdown.lodging}</p>
          <p><strong>Food:</strong> ${trip.breakdown.food}</p>
          <p><strong>Transport:</strong> ${trip.breakdown.transport}</p>
          <p><strong>Exchange Rate Used:</strong> {trip.exchangeRateUsed}</p>
          <p><strong>Weather Score:</strong> {trip.weatherScore}</p>
          <p><strong>Total:</strong> ${trip.totalEstimatedCost}</p>
        </div>
      </div>
    </div>
  )
}

export default TripDetail