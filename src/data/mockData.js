export const mockCities = [
  { cityId: 1, name: 'Edmonton', country: 'Canada', currency: 'CAD', airportCode: 'YEG', active: true },
  { cityId: 2, name: 'Paris', country: 'France', currency: 'EUR', airportCode: 'CDG', active: true },
  { cityId: 3, name: 'Tokyo', country: 'Japan', currency: 'JPY', airportCode: 'NRT', active: true },
  { cityId: 4, name: 'New York', country: 'USA', currency: 'USD', airportCode: 'JFK', active: true },
  { cityId: 5, name: 'London', country: 'UK', currency: 'GBP', airportCode: 'LHR', active: true },
  { cityId: 6, name: 'Calgary', country: 'Canada', currency: 'CAD', airportCode: 'YYC', active: true },
]

export const mockUsers = [
  { userId: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'client' },
  { userId: 2, name: 'Bob Smith',     email: 'bob@example.com',   role: 'client' },
  { userId: 3, name: 'Admin User',    email: 'admin@example.com', role: 'admin'  },
]

export const mockTrips = [
  {
    tripId: 1,
    userId: 1,
    from: 'Edmonton',
    to: 'Paris',
    startDate: '2026-06-01T09:00',
    endDate: '2026-06-07T09:00',
    nights: 6,
    travellers: 2,
    accommodation: 'hotel',
    currency: 'eur',
    exchangeRateUsed: 1.08,
    weatherScore: 82,
    totalEstimatedCost: 3240,
    breakdown: {
      flight: 1200,
      lodging: 840,
      food: 720,
      transport: 480,
    },
    createdAt: '2026-03-01',
  },
  {
    tripId: 2,
    userId: 1,
    from: 'Edmonton',
    to: 'Tokyo',
    startDate: '2026-09-10T09:00',
    endDate: '2026-09-20T09:00',
    nights: 10,
    travellers: 1,
    accommodation: 'hostel',
    currency: 'jpy',
    exchangeRateUsed: 0.0067,
    weatherScore: 75,
    totalEstimatedCost: 2850,
    breakdown: {
      flight: 1500,
      lodging: 630,
      food: 450,
      transport: 270,
    },
    createdAt: '2026-03-10',
  },
  {
    tripId: 3,
    userId: 2,
    from: 'Calgary',
    to: 'London',
    startDate: '2026-07-15T09:00',
    endDate: '2026-07-22T09:00',
    nights: 7,
    travellers: 2,
    accommodation: 'hotel',
    currency: 'gbp',
    exchangeRateUsed: 1.71,
    weatherScore: 65,
    totalEstimatedCost: 5800,
    breakdown: {
      flight: 2400,
      lodging: 1960,
      food: 840,
      transport: 600,
    },
    createdAt: '2026-03-15',
  },
]

export const mockAdminStats = {
  totalSavedTrips: 24,
  activeCities: 6,
  mostSearchedDestination: 'Paris',
}