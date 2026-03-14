// src/data/mockData.js

export const mockCities = [
  { cityId: 1, name: 'Edmonton', country: 'Canada', currency: 'CAD', airportCode: 'YEG', active: true },
  { cityId: 2, name: 'Paris', country: 'France', currency: 'EUR', airportCode: 'CDG', active: true },
  { cityId: 3, name: 'Tokyo', country: 'Japan', currency: 'JPY', airportCode: 'NRT', active: true },
]

export const mockTrips = [
  {
    tripId: 1,
    origin: 'Edmonton',
    destination: 'Paris',
    startDate: '2026-06-01',
    endDate: '2026-06-07',
    travelers: 2,
    accommodation: 'Standard',
    preferredCurrency: 'USD',
    weatherScore: 82,
    exchangeRateUsed: 1.08,
    totalEstimatedCost: 3240,
    breakdown: {
      flight: 1200,
      lodging: 840,
      food: 720,
      transport: 480,
    }
  },
  {
    tripId: 2,
    origin: 'Edmonton',
    destination: 'Tokyo',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    travelers: 1,
    accommodation: 'Budget',
    preferredCurrency: 'USD',
    weatherScore: 75,
    exchangeRateUsed: 0.0067,
    totalEstimatedCost: 2850,
    breakdown: {
      flight: 1500,
      lodging: 630,
      food: 450,
      transport: 270,
    }
  }
]

export const mockAdminStats = {
  totalSavedTrips: 24,
  activeCities: 8,
  mostSearchedDestination: 'Paris'
}