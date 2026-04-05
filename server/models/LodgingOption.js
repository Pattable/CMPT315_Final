const mongoose = require('mongoose')
const { Schema } = mongoose

const lodgingOptionSchema = new Schema(
  {
    cityId: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    accommodationType: {
      type: String,
      enum: ['budget', 'standard', 'luxury'],
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('LodgingOption', lodgingOptionSchema)