const mongoose = require('mongoose')
const { Schema } = mongoose

const costBreakdownSchema = new Schema(
  {
    flightCost: {
      type: Number,
      default: null,       // null if flight API failed
    },
    lodgingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    foodCost: {
      type: Number,
      required: true,
      min: 0,
    },
    transportCost: {
      type: Number,
      required: true,
      min: 0,
    },
    roomsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }           // embedded sub-doc, no separate _id needed
)

const tripEstimateSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originCityId: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    destinationCityId: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    travellers: {
      type: Number,
      required: true,
      min: 1,
    },
    accommodationType: {
      type: String,
      enum: ['budget', 'standard', 'luxury'],
      required: true,
    },
    preferredCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    exchangeRateUsed: {
      type: Number,
      required: true,
    },
    weatherScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    totalEstimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    isPartialResult: {
      type: Boolean,
      default: false,      // true when flight API failed
    },
    breakdown: {
      type: costBreakdownSchema,
      required: true,
    },
  },
  { timestamps: true }
)

// business rule: endDate must be after startDate
tripEstimateSchema.pre('validate', function () {
  if (this.endDate <= this.startDate) {
    throw new Error('endDate must be after startDate')
  }
})

module.exports = mongoose.model('TripEstimate', tripEstimateSchema)