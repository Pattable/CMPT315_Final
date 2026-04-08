require('dotenv').config()
const mongoose = require('mongoose')

const City = require('./models/City')
const LodgingOption = require('./models/LodgingOption')

async function createCity(data) {
  let city = await City.findOne({ name: data.name })

  if (!city) {
    city = await City.create(data)
    console.log(`Created city: ${data.name}`)
  } else {
    console.log(`City exists: ${data.name}`)
  }

  return city
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const paris = await createCity({
    name: 'Paris',
    country: 'France',
    currency: 'EUR',
    location: { latitude: 48.8566, longitude: 2.3522 },
    airportCode: 'CDG',
    foodPerPersonPerDay: 50,
    transportPerPersonPerDay: 15,
    defaultPeoplePerRoom: 2,
    status: 'active'
  })

  const tokyo = await createCity({
    name: 'Tokyo',
    country: 'Japan',
    currency: 'JPY',
    location: { latitude: 35.6762, longitude: 139.6503 },
    airportCode: 'HND',
    foodPerPersonPerDay: 40,
    transportPerPersonPerDay: 10,
    defaultPeoplePerRoom: 2,
    status: 'active'
  })

  const newYork = await createCity({
    name: 'New York',
    country: 'USA',
    currency: 'USD',
    location: { latitude: 40.7128, longitude: -74.006 },
    airportCode: 'JFK',
    foodPerPersonPerDay: 60,
    transportPerPersonPerDay: 20,
    defaultPeoplePerRoom: 2,
    status: 'active'
  })

  const edmonton = await createCity({
    name: 'Edmonton',
    country: 'Canada',
    currency: 'CAD',
    location: { latitude: 53.5461, longitude: -113.4938 },
    airportCode: 'YEG',
    foodPerPersonPerDay: 45,
    transportPerPersonPerDay: 12,
    defaultPeoplePerRoom: 2,
    status: 'active'
  })

  console.log('Cities ready')

  const allCities = [paris, tokyo, newYork, edmonton]

  for (const city of allCities) {
    const types = ['budget', 'standard', 'luxury']

    for (const type of types) {
      const exists = await LodgingOption.findOne({
        cityId: city._id,
        accommodationType: type
      })

      if (!exists) {
        await LodgingOption.create({
          cityId: city._id,
          accommodationType: type,
          pricePerNight:
            type === 'budget' ? 80 :
            type === 'standard' ? 150 : 300
        })

        console.log(`Added ${type} lodging for ${city.name}`)
      }
    }
  }

  console.log('Lodging ready')
  console.log('DONE')

  process.exit()
}

seed()