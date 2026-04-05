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
    origin: 'http://localhost:5173',
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

function getExchangeRate(fromCurrency, toCurrency) {
  const ratesInUsd = {
    USD: 1,
    CAD: 0.74,
    EUR: 1.08,
    GBP: 1.25,
    JPY: 0.007,
  }

  const fromRate = ratesInUsd[fromCurrency] ?? 1
  const toRate = ratesInUsd[toCurrency] ?? 1
  return toRate / fromRate
}

function getWeatherScore(latitude, longitude, month) {
  const monthScore = 100 - Math.abs(month - 6) * 8
  const latScore = 50 + (latitude / 180) * 50
  const score = Math.round((monthScore + latScore) / 2)
  return Math.min(100, Math.max(0, score))
}

app.post('/api/estimates', async (req, res) => {
  try {
    const {
      currentLocation,
      destination,
      travellers,
      startDate,
      endDate,
      accommodation,
      currency,
    } = req.body

    if (
      !currentLocation ||
      !destination ||
      !travellers ||
      !startDate ||
      !endDate ||
      !accommodation ||
      !currency
    ) {
      return res.status(400).json({ error: 'Missing required trip search fields.' })
    }

    const travelerCount = Number(travellers)
    if (!Number.isInteger(travelerCount) || travelerCount < 1) {
      return res.status(400).json({ error: 'Travellers must be a number of at least 1.' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date.' })
    }

    if (end < start) {
      return res.status(400).json({ error: 'End date must be the same day or after the start date.' })
    }

    const originCity = await City.findOne({
      name: new RegExp(`^${escapeRegex(currentLocation.trim())}$`, 'i'),
      status: 'active',
    })
    const destinationCity = await City.findOne({
      name: new RegExp(`^${escapeRegex(destination.trim())}$`, 'i'),
      status: 'active',
    })

    if (!originCity || !destinationCity) {
      return res.status(404).json({ error: 'Origin or destination city not found.' })
    }

    const accommodationType = mapAccommodationType(accommodation)
    if (!accommodationType) {
      return res.status(400).json({ error: 'Unsupported accommodation type.' })
    }

    const lodgingOption = await LodgingOption.findOne({
      cityId: destinationCity._id,
      accommodationType,
    })

    if (!lodgingOption) {
      return res.status(404).json({ error: `No lodging option found for ${destinationCity.name}.` })
    }

    const msPerDay = 1000 * 60 * 60 * 24
    const rawDays = Math.ceil((end - start) / msPerDay)
    const tripDays = Math.max(1, rawDays)
    const nights = tripDays
    const roomsRequired = Math.max(
      1,
      Math.ceil(travelerCount / destinationCity.defaultPeoplePerRoom)
    )

    const lodgingCost = nights * roomsRequired * lodgingOption.pricePerNight
    const foodCost = travelerCount * tripDays * destinationCity.foodPerPersonPerDay
    const transportCost =
      travelerCount * tripDays * destinationCity.transportPerPersonPerDay
    const flightCost = Math.round(300 * travelerCount + 120 * tripDays)

    const destinationCurrency = destinationCity.currency.toUpperCase()
    const preferredCurrency = String(currency || '').toUpperCase()
    const exchangeRateUsed = getExchangeRate(destinationCurrency, preferredCurrency)

    const convert = (value) => Math.round(value * exchangeRateUsed * 100) / 100

    const breakdown = {
      flight: convert(flightCost),
      lodging: convert(lodgingCost),
      food: convert(foodCost),
      transport: convert(transportCost),
      roomsRequired,
    }

    const totalEstimatedCost =
      breakdown.flight + breakdown.lodging + breakdown.food + breakdown.transport

    const weatherScore = getWeatherScore(
      destinationCity.location.latitude,
      destinationCity.location.longitude,
      start.getMonth() + 1
    )

    return res.json({
      from: originCity.name,
      to: destinationCity.name,
      travellers: travelerCount,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      accommodation: accommodationType,
      currency: preferredCurrency,
      breakdown,
      exchangeRateUsed,
      weatherScore,
      totalEstimatedCost,
    })
  } catch (error) {
    console.error('Estimate error:', error)
    return res.status(500).json({ error: 'Unable to calculate estimate.' })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))