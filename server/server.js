require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const bcrypt = require('bcrypt')
const cors = require('cors')
const User = require('./models/User')
const City = require('./models/City')
const LodgingOption = require('./models/LodgingOption')
const TripEstimate = require('./models/TripEstimate')

const app = express()
const PORT = process.env.PORT || 5001
const isProduction = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:5174',
    credentials: true
  })
)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction
    }
  })
)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err))

// ── Middleware ───────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Login required.' })
  }
  next()
}

function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(400).json({ error: 'Email already in use.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash })

  req.session.user = { id: user._id, email: user.email, role: user.role }
  res.status(201).json({ message: 'Account created.', user: req.session.user })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'User not found.' })
  }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  req.session.user = { id: user._id, email: user.email, role: user.role }
  res.json({ message: 'Login successful.', user: req.session.user })
})

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' })
    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out.' })
  })
})

app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not logged in.' })
  }
  res.json({ user: req.session.user })
})

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function mapAccommodationType(value) {
  const normalized = String(value || '').toLowerCase().trim()
  const mapping = {
    hotel: 'standard',
    airbnb: 'standard',
    hostel: 'budget',
    camping: 'budget',
    budget: 'budget',
    standard: 'standard',
    luxury: 'luxury',
  }
  return mapping[normalized] || null
}

async function getExchangeRate(fromCurrency, toCurrency) {
  try {
    const url = `https://v6.exchangerate-api.com/v6/` +
      `${process.env.CURRENCY_API_KEY}` +
      `/latest/${fromCurrency}`

    const response = await fetch(url);
    const data = await response.json();

    if (data.result !== 'success') {
      console.warn('Currency API error:', data['error-type']);
      return 1; // Default to 1 if API call fails
    }

    const rate = data.conversion_rates[toCurrency]

    if (!rate) {
      console.warn(`Exchange rate not found for ${toCurrency}, defaulting to 1.`);
      return 1; // Default to 1 if target currency not found
    }
    return rate;
  }
  catch (error) {
    console.error('Error fetching exchange rates:', error)
    return 1
  }
}

async function getWeatherScore(latitude, longitude, startDate, endDate) {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      console.warn('Invalid start or end date provided to getWeatherScore')
      return { score: null, breakdown: null }
    }

    const formattedStart = start.toISOString().split('T')[0]
    const formattedEnd = end.toISOString().split('T')[0]

    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&start_date=${formattedStart}&end_date=${formattedEnd}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max,relative_humidity_2m_mean&timezone=auto`

    const response = await fetch(url)
    const data = await response.json()
    const daily = data.daily

    if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
      console.warn('No daily forecast returned from weather API')
      return { score: null, breakdown: null }
    }

    const days = daily.time.map((_, index) => {
      const maxTemp = daily.temperature_2m_max?.[index]
      const minTemp = daily.temperature_2m_min?.[index]
      const precipitation = daily.precipitation_sum?.[index] ?? 0
      const humidity = daily.relative_humidity_2m_mean?.[index] ?? 50
      const windSpeed = daily.windspeed_10m_max?.[index] ?? 0
      const weatherCode = daily.weathercode?.[index]
      const meanTemp = maxTemp != null && minTemp != null ? (maxTemp + minTemp) / 2 : null
      return { meanTemp, precipitation, humidity, windSpeed, weatherCode }
    })

    let totalScore = 0
    let totalTempComfort = 0
    let totalPrecipitationComfort = 0
    let totalHumidityComfort = 0
    let totalWindComfort = 0
    let totalWeatherCodeQuality = 0
    let validDays = 0

    for (const day of days) {
      let score = 0
      let tempComfort = 0
      let precipitationComfort = 0
      let humidityComfort = 0
      let windComfort = 0
      let weatherCodeQuality = 0

      if (day.meanTemp !== null && day.meanTemp !== undefined) {
        const idealTemp = 22
        const tempDiff = Math.abs(day.meanTemp - idealTemp)
        if (tempDiff <= 5) {
          tempComfort = 30
        } else if (tempDiff <= 10) {
          tempComfort = 24
        } else if (tempDiff <= 15) {
          tempComfort = 16
        } else if (tempDiff <= 20) {
          tempComfort = 8
        }
        score += tempComfort
      }

      if (day.precipitation !== null && day.precipitation !== undefined) {
        if (day.precipitation < 5) {
          precipitationComfort = 20
        } else if (day.precipitation < 15) {
          precipitationComfort = 15
        } else if (day.precipitation < 30) {
          precipitationComfort = 10
        } else if (day.precipitation < 50) {
          precipitationComfort = 5
        }
        score += precipitationComfort
      }

      if (day.humidity !== null && day.humidity !== undefined) {
        if (day.humidity >= 40 && day.humidity <= 60) {
          humidityComfort = 15
        } else if (day.humidity >= 30 && day.humidity <= 70) {
          humidityComfort = 10
        }
        score += humidityComfort
      }

      if (day.windSpeed !== null && day.windSpeed !== undefined) {
        if (day.windSpeed < 8) {
          windComfort = 15
        } else if (day.windSpeed < 12) {
          windComfort = 10
        } else if (day.windSpeed < 18) {
          windComfort = 5
        }
        score += windComfort
      }

      if (day.weatherCode !== null && day.weatherCode !== undefined) {
        if (day.weatherCode === 0 || day.weatherCode === 1) {
          weatherCodeQuality = 20
        } else if (day.weatherCode === 2 || day.weatherCode === 3) {
          weatherCodeQuality = 15
        } else if ((day.weatherCode >= 45 && day.weatherCode <= 48) ||
          (day.weatherCode >= 51 && day.weatherCode <= 67) ||
          (day.weatherCode >= 80 && day.weatherCode <= 82)) {
          weatherCodeQuality = 5
        }
        score += weatherCodeQuality
      }

      totalScore += Math.min(100, Math.max(0, score))
      totalTempComfort += tempComfort
      totalPrecipitationComfort += precipitationComfort
      totalHumidityComfort += humidityComfort
      totalWindComfort += windComfort
      totalWeatherCodeQuality += weatherCodeQuality
      validDays += 1
    }

    if (validDays === 0) {
      return { score: null, breakdown: null }
    }

    const avgTempComfort = Math.round(totalTempComfort / validDays)
    const avgPrecipitationComfort = Math.round(totalPrecipitationComfort / validDays)
    const avgHumidityComfort = Math.round(totalHumidityComfort / validDays)
    const avgWindComfort = Math.round(totalWindComfort / validDays)
    const avgWeatherCodeQuality = Math.round(totalWeatherCodeQuality / validDays)
    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore / validDays)))

    return {
      score: finalScore,
      breakdown: {
        temperatureComfort: avgTempComfort,
        precipitationComfort: avgPrecipitationComfort,
        humidityComfort: avgHumidityComfort,
        windComfort: avgWindComfort,
        weatherCodeQuality: avgWeatherCodeQuality,
      },
    }
  } catch (error) {
    console.error('Error calculating weather score:', error)
    return { score: null, breakdown: null }
  }
}

async function buildEstimatePayload(body) {
  const {
    currentLocation,
    destination,
    travellers,
    startDate,
    endDate,
    accommodation,
    currency,
  } = body

  if (
    !currentLocation ||
    !destination ||
    !travellers ||
    !startDate ||
    !endDate ||
    !accommodation ||
    !currency
  ) {
    const error = new Error('Missing required trip search fields.')
    error.status = 400
    throw error
  }

  const travellerCount = Number(travellers)
  if (!Number.isInteger(travellerCount) || travellerCount < 1) {
    const error = new Error('Travellers must be a number of at least 1.')
    error.status = 400
    throw error
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const error = new Error('Invalid start or end date.')
    error.status = 400
    throw error
  }

  if (end < start) {
    const error = new Error('End date must be the same day or after the start date.')
    error.status = 400
    throw error
  }

  const originCity = await City.findOne({
    name: new RegExp(`^${escapeRegex(currentLocation.trim())}$`, 'i'),
    status: 'active',
  })
  const destinationCity = await City.findOne({
    name: new RegExp(`^${escapeRegex(destination.trim())}$`, 'i'),
    status: 'active',
  })

  if (!originCity) {
    const error = new Error('Origin city not found.')
    error.status = 404
    throw error
  } else if (!destinationCity) {
    const error = new Error('Destination city not found.')
    error.status = 404
    throw error
  }

  const accommodationType = mapAccommodationType(accommodation)
  if (!accommodationType) {
    const error = new Error('Unsupported accommodation type.')
    error.status = 400
    throw error
  }

  const lodgingOption = await LodgingOption.findOne({
    cityId: destinationCity._id,
    accommodationType,
  })

  if (!lodgingOption) {
    const error = new Error(`No lodging option found for ${destinationCity.name}.`)
    error.status = 404
    throw error
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const rawDays = Math.ceil((end - start) / msPerDay)
  const tripDays = Math.max(1, rawDays)
  const nights = tripDays

  const flight = Math.round(300 * travellerCount + 120 * tripDays)
  const roomsRequired = Math.max(1, Math.ceil(travellerCount / destinationCity.defaultPeoplePerRoom))
  const lodging = nights * roomsRequired * lodgingOption.pricePerNight
  const food = travellerCount * tripDays * destinationCity.foodPerPersonPerDay
  const transport = travellerCount * tripDays * destinationCity.transportPerPersonPerDay

  const destinationCurrency = destinationCity.currency.toUpperCase()
  const preferredCurrency = currency.toUpperCase()
  const exchangeRateUsed = await getExchangeRate(preferredCurrency, destinationCurrency)

  const convert = (value) => Math.round(value * exchangeRateUsed * 100) / 100

  const breakdown = {
    flightCost: flight,
    lodgingCost: lodging,
    foodCost: food,
    transportCost: transport,
    roomsRequired,
  }

  const localBreakdown = {
    flightCost: convert(flight),
    lodgingCost: convert(lodging),
    foodCost: convert(food),
    transportCost: convert(transport),
    roomsRequired,
  }

  const totalEstimatedCost =
    breakdown.flightCost +
    breakdown.lodgingCost +
    breakdown.foodCost +
    breakdown.transportCost

  const totalLocalEstimatedCost =
    localBreakdown.flightCost +
    localBreakdown.lodgingCost +
    localBreakdown.foodCost +
    localBreakdown.transportCost

  const weatherResult = await getWeatherScore(
    destinationCity.location.latitude,
    destinationCity.location.longitude,
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  )

  const estimatePayload = {
    originCityId: originCity._id,
    destinationCityId: destinationCity._id,
    startDate: start,
    endDate: end,
    travellers: travellerCount,
    accommodationType,
    preferredCurrency,
    exchangeRateUsed,
    weatherScore: weatherResult.score,
    weatherBreakdown: weatherResult.breakdown,
    totalEstimatedCost,
    isPartialResult: false,
    breakdown,
    localBreakdown,
    totalLocalEstimatedCost,
  }

  return { estimatePayload, originCity, destinationCity, destinationCurrency }
}

app.post('/api/estimates', async (req, res) => {
  try {
    const { estimatePayload, originCity, destinationCity, destinationCurrency } = await buildEstimatePayload(req.body)

    const { originCityId, destinationCityId, isPartialResult, ...publicPayload } = estimatePayload

    return res.json({
      tripId: null,
      saved: false,
      ...publicPayload,
      from: originCity.name,
      to: destinationCity.name,
      destCurrency: destinationCurrency,
    })
  } catch (error) {
    console.error('Estimate error:', error)
    return res.status(error.status || 500).json({ error: error.message || 'Unable to calculate estimate.' })
  }
})

app.post('/api/estimates/save', requireAuth, async (req, res) => {
  try {
    const { estimatePayload, originCity, destinationCity, destinationCurrency } = await buildEstimatePayload(req.body)

    const savedEstimate = await TripEstimate.create({
      userId: req.session.user.id,
      ...estimatePayload,
      from: originCity.name,
      to: destinationCity.name,
    })

    const { originCityId, destinationCityId, isPartialResult, ...publicPayload } = estimatePayload

    return res.json({
      message: 'Trip saved successfully.',
      tripId: savedEstimate._id,
      saved: true,
      ...publicPayload,
      from: originCity.name,
      to: destinationCity.name,
      destCurrency: destinationCurrency,
    })
  } catch (error) {
    console.error('Save estimate error:', error)
    return res.status(error.status || 500).json({ error: error.message || 'Unable to save trip estimate.' })
  }
})

app.get('/api/trips', requireAuth, async (req, res) => {
  try {
    const trips = await TripEstimate.find({ userId: req.session.user.id })
      .populate('originCityId', 'name')
      .populate('destinationCityId', 'name')
      .sort({ createdAt: -1 })

    res.json(trips)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
})

app.get('/api/trips/:tripId', requireAuth, async (req, res) => {
  try {
    const trip = await TripEstimate.findOne({
      _id: req.params.tripId,
      userId: req.session.user.id
    })
      .populate('originCityId', 'name')
      .populate('destinationCityId', 'name')

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    res.json(trip)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch trip' })
  }
})

app.delete('/api/trips/:tripId', requireAuth, async (req, res) => {
  try {
    const deleted = await TripEstimate.findOneAndDelete({
      _id: req.params.tripId,
      userId: req.session.user.id,
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    res.json({ message: 'Trip deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

app.post('/api/trips', requireAuth, async (req, res) => {
  try {
    const trip = await TripEstimate.create({
      userId: req.session.user.id,
      ...req.body,
    })

    res.status(201).json(trip)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save trip' })
  }
})


// ── Admin Routes ─────────────────────────────────────────────────────────

// stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalTrips = await TripEstimate.countDocuments()
    const activeCities = await City.countDocuments({ status: 'active' })
    const disabledCities = await City.countDocuments({ status: 'disabled' })
    const totalUsers = await User.countDocuments({ role: 'client' })

    res.json({ totalTrips, activeCities, disabledCities, totalUsers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// public: list of active city names for the search form
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await City.find({ status: 'active' }, 'name country').sort({ name: 1 })
    res.json(cities)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch cities' })
  }
})


// get all cities
app.get('/api/admin/cities', requireAdmin, async (req, res) => {
  try {
    const cities = await City.find()
    res.json(cities)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch cities' })
  }
})


// add a city
app.post('/api/admin/cities', requireAdmin, async (req, res) => {
  try {
    const newCity = await City.create(req.body)
    res.status(201).json(newCity)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create city' })
  }
})


// delete a city
app.delete('/api/admin/cities/:cityId', requireAdmin, async (req, res) => {
  try {
    const deleted = await City.findByIdAndDelete(req.params.cityId)
    if (!deleted) return res.status(404).json({ error: 'City not found' })
    res.json({ message: 'City deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete city' })
  }
})

// edit a city
app.put('/api/admin/cities/:cityId', requireAdmin, async (req, res) => {
  try {
    const { cityId } = req.params

    const updated = await City.findByIdAndUpdate(
      cityId,
      req.body,
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ error: 'City not found' })
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update city' })
  }
})


// get lodging options for a city
app.get('/api/admin/cities/:cityId/lodging', requireAdmin, async (req, res) => {
  try {
    const options = await LodgingOption.find({ cityId: req.params.cityId })
    const result = { budget: '', standard: '', luxury: '' }
    for (const opt of options) {
      result[opt.accommodationType] = opt.pricePerNight
    }
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch lodging options' })
  }
})

// upsert all 3 lodging options for a city
app.put('/api/admin/cities/:cityId/lodging', requireAdmin, async (req, res) => {
  try {
    const { cityId } = req.params
    const { budget, standard, luxury } = req.body

    const types = { budget, standard, luxury }
    const results = {}

    for (const [type, price] of Object.entries(types)) {
      if (price === '' || price === null || price === undefined) continue
      const updated = await LodgingOption.findOneAndUpdate(
        { cityId, accommodationType: type },
        { pricePerNight: Number(price) },
        { upsert: true, new: true }
      )
      results[type] = updated.pricePerNight
    }

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save lodging options' })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))