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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))