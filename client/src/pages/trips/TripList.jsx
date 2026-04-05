import TripCard from '../../components/TripCard'
import { mockTrips } from '../../data/mockData'

function TripList() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>My Trips</h1>
        <div className="trip-list">
          {mockTrips.map((trip) => (
            <TripCard key={trip.tripId} trip={trip} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TripList