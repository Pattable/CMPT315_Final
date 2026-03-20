import { useNavigate, useSearchParams } from 'react-router-dom'

function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const travellers = searchParams.get('travellers')
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')
  const accommodation = searchParams.get('accommodation')
  const currency = searchParams.get('currency')

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Results Page</h1>
          <p>From: {from}</p>
          <p>To: {to}</p>
          <p>Travellers: {travellers}</p>
          <p>Start: {formatDate(startDate)}</p>
          <p>End: {formatDate(endDate)}</p>
          <p>Accommodation: {accommodation}</p>
          <p>Currency: {currency}</p>
      </div>
      <button
        onClick={ () => { navigate(`/?${searchParams.toString()}`) } }>Back</button>
    </div>
  )
}
export default Results