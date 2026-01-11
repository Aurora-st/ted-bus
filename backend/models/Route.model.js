import mongoose from 'mongoose';

/**
 * Route Schema
 * Stores bus routes available in the system
 */
const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  startLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  endLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  stops: [{
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    order: Number
  }],
  distance: {
    type: Number, // in kilometers
    required: true
  },
  averageDuration: {
    type: Number, // in minutes
    required: true
  },
  // Rating statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    '5': { type: Number, default: 0 },
    '4': { type: Number, default: 0 },
    '3': { type: Number, default: 0 },
    '2': { type: Number, default: 0 },
    '1': { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Route', routeSchema);

