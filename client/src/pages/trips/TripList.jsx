import { useEffect, useState } from 'react'
import TripCard from '../../components/TripCard'
import { apiFetch } from '../../api'

function TripList() {
  const [trips, setTrips] = useState([])

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await apiFetch('/api/trips')
        setTrips(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTrips()
  }, [])

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>My Trips</h1>

        {trips.length === 0 ? (
          <p>No trips yet.</p>
        ) : (
          <div className="trip-list">
            {trips.map((trip) => (
              <TripCard key={trip.tripId || trip._id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TripList