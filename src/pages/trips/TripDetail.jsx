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

        <p><strong>From:</strong> {trip.originCityId?.name}</p>
        <p><strong>To:</strong> {trip.destinationCityId?.name}</p>
        <p><strong>Total:</strong> ${trip.totalEstimatedCost}</p>
      </div>
    </div>
  )
}

export default TripDetail