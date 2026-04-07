import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TripCard from '../components/TripCard'
import { useAuth } from './AuthContext'

function Results() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const travellers = Number(searchParams.get('travellers') || 1)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')
  const accommodation = searchParams.get('accommodation')
  const currency = searchParams.get('currency')

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!from || !to || !startDate || !endDate || !accommodation || !currency) {
        setError('Missing search parameters. Please return to the home page and try again.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/estimates', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentLocation: from,
            destination: to,
            travellers,
            startDate,
            endDate,
            accommodation,
            currency,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          setError(data?.error || 'Unable to load estimate. Please try again.')
          setTrip(null)
        } else {
          setTrip(data)
        }
      } catch (fetchError) {
        setError('Unable to contact the server. Please try again later.')
        setTrip(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEstimate()
  }, [from, to, startDate, endDate, accommodation, currency, travellers])

  const saveTrip = async () => {
    if (!user) {
      setSaveMessage('Please log in to save this trip.')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/estimates/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLocation: from,
          destination: to,
          travellers,
          startDate,
          endDate,
          accommodation,
          currency,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setSaveMessage(data.error || 'Unable to save trip. Please try again.')
      } else {
        setSaveMessage('Trip saved successfully!')
        setTrip((prev) => ({ ...prev, tripId: data.tripId }))
      }
    } catch (saveError) {
      setSaveMessage('Unable to save trip. Please try again later.')
    } finally {
      setIsSaving(false)
    }
  }

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

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container results-page">
          <div className="card results-summary">
            <h2>Loading your estimate...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container results-page">
          <div className="card results-summary">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return null
  }

  const preferredCurrency = trip.preferredCurrency?.toUpperCase()
  const destCurrency = trip.destCurrency?.toUpperCase()
  const showLocalCosts = destCurrency && preferredCurrency && destCurrency !== preferredCurrency
  const currencySymbol = (code) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).formatToParts(0).find(part => part.type === 'currency').value
    } catch (error) {
      console.error(`Error formatting currency symbol for ${code}:`, error)
      return code
    }
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
            <thead>
              <tr>
                <th>Item</th>
                <th>{preferredCurrency}</th>
                {showLocalCosts && <th>{destCurrency}</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Flight Estimate</td>
                <td>{currencySymbol(preferredCurrency)} {trip.breakdown.flightCost.toLocaleString()}</td>
                {showLocalCosts && <td>{currencySymbol(destCurrency)} {trip.localBreakdown.flightCost.toLocaleString()}</td>}
              </tr>
              <tr>
                <td>Lodging Estimate</td>
                <td>{currencySymbol(preferredCurrency)} {trip.breakdown.lodgingCost.toLocaleString()}</td>
                {showLocalCosts && <td>{currencySymbol(destCurrency)} {trip.localBreakdown.lodgingCost.toLocaleString()}</td>}
              </tr>
              <tr>
                <td>Food Estimate</td>
                <td>{currencySymbol(preferredCurrency)} {trip.breakdown.foodCost.toLocaleString()}</td>
                {showLocalCosts && <td>{currencySymbol(destCurrency)} {trip.localBreakdown.foodCost.toLocaleString()}</td>}
              </tr>
              <tr>
                <td>Local Transport Estimate</td>
                <td>{currencySymbol(preferredCurrency)} {trip.breakdown.transportCost.toLocaleString()}</td>
                {showLocalCosts && <td>{currencySymbol(destCurrency)} {trip.localBreakdown.transportCost.toLocaleString()}</td>}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="results-meta-cards">
          <div className="card results-meta-card">
            <p className="results-meta-label">Exchange Rate Used</p>
            <p className="results-meta-value">
              1 {preferredCurrency} = {trip.exchangeRateUsed} {destCurrency}
            </p>
          </div>
          <div className="card results-meta-card">
              <p className="results-meta-label">Weather Comfort Score</p>

              {trip.weatherScore == null ? (
                <p className="weather-unavailable">
                  Unavailable — weather data could not be retrieved for these dates.
                </p>
              ) : (
                <>
                  <p className="results-meta-value">{trip.weatherScore} / 100</p>

                  <div className="weather-bar">
                    <div
                      className="weather-bar-fill"
                      style={{ width: `${trip.weatherScore}%` }}
                    />
                  </div>

                  {trip.weatherBreakdown && (
                    <div className="weather-breakdown-details">
                      <p className="results-meta-label">Score Breakdown:</p>
                      <ul className="results-meta-label">
                        <li>Temperature Comfort: +{trip.weatherBreakdown.temperatureComfort}</li>
                        <li>Precipitation Levels: +{trip.weatherBreakdown.precipitationComfort}</li>
                        <li>Humidity Comfort: +{trip.weatherBreakdown.humidityComfort}</li>
                        <li>Wind Comfort: +{trip.weatherBreakdown.windComfort}</li>
                        <li>Weather Conditions: +{trip.weatherBreakdown.weatherCodeQuality}</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>  
        </div>

        <div className="card results-total">
          <span>Total Estimated Budget</span>
          <span className="results-total-amount">
            {currencySymbol(preferredCurrency)} {trip.totalEstimatedCost.toLocaleString()}
            {showLocalCosts && (
              <span className="results-total-local"> ({currencySymbol(destCurrency)} {trip.totalLocalEstimatedCost.toLocaleString()})</span>
            )}
          </span>
        </div>

        <div className="results-actions">
          {user?.role !== 'admin' && (
            <button
              className="btn btn-primary"
              onClick={saveTrip}
              disabled={isSaving}
            >
              {trip?.tripId ? 'Saved' : isSaving ? 'Saving...' : 'Save Trip'}
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/?${searchParams.toString()}`)}
          >
            Modify Search
          </button>
        </div>

        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}

        <p className="results-disclaimer">
          Estimates are based on stored cost profiles and API data.
        </p>
      </div>
    </div>
  )
}

export default Results