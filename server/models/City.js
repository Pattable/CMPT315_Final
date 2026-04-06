const mongoose = require('mongoose')
const { Schema } = mongoose

const citySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    airportCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    foodPerPersonPerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    transportPerPersonPerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultPeoplePerRoom: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('City', citySchema)