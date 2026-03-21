import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { mockTrips } from '../data/mockData'
import TripCard from '../components/TripCard'

function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  //const from          = searchParams.get('from')
  //const to            = searchParams.get('to')
  //const travellers    = searchParams.get('travellers')
  //const startDate     = searchParams.get('start')
  //const endDate       = searchParams.get('end')
  //const accommodation = searchParams.get('accommodation')
  //const currency      = searchParams.get('currency')

  const trip = mockTrips[0] // for now just hardcoded a trip from the mockdata since API are not added yet

  const { breakdown } = trip
  const from          = trip.from
  const to            = trip.to
  const travellers    = trip.travellers
  const startDate     = trip.startDate
  const endDate       = trip.endDate
  const accommodation = trip.accommodation
  const currency      = trip.currency

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="page-wrapper">
      <div className="container results-page">

        <div className="card results-summary">
          <h2 className="results-route">{from} → {to}</h2>
          <div className="results-meta">
            <span>{formatDate(startDate)} – {formatDate(endDate)}</span>
            <span>{travellers} traveller{travellers > 1 ? 's' : ''}</span>
            <span>{accommodation}</span>
          </div>
        </div>

        <div className="card">
          <h3 className="results-section-title">Cost Breakdown</h3>
          <table className="breakdown-table">
            <tbody>
              <tr>
                <td>Flight Estimate</td>
                <td>${breakdown.flight.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Lodging Estimate</td>
                <td>${breakdown.lodging.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Food Estimate</td>
                <td>${breakdown.food.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Local Transport Estimate</td>
                <td>${breakdown.transport.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="results-meta-cards">
          <div className="card results-meta-card">
            <p className="results-meta-label">Exchange Rate Used</p>
            <p className="results-meta-value">
              1 {currency?.toUpperCase()} = {trip.exchangeRateUsed} USD
            </p>
          </div>
          <div className="card results-meta-card">
            <p className="results-meta-label">Weather Comfort Score</p>
            <p className="results-meta-value">{trip.weatherScore} / 100</p>
            <div className="weather-bar">
              <div
                className="weather-bar-fill"
                style={{ width: `${trip.weatherScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card results-total">
          <span>Total Estimated Budget</span>
          <span className="results-total-amount">
            ${trip.totalEstimatedCost.toLocaleString()} {currency?.toUpperCase()}
          </span>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary">Save Trip</button>
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/?${searchParams.toString()}`)}
          >
            Modify Search
          </button>
        </div>


        <p className="results-disclaimer">
          Estimates are based on stored cost profiles and API data.
        </p>
        <TripCard trip={trip}/>

      </div>
    </div>
  )
}

export default Results