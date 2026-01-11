import mongoose from 'mongoose';

/**
 * Saved Route Schema
 * Stores user's favorite routes from route planning tool
 */
const savedRouteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: 100
  },
  startLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  destination: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  waypoints: [{
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  distance: {
    type: Number, // in kilometers
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  trafficInfo: {
    currentDuration: Number,
    trafficLevel: {
      type: String,
      enum: ['light', 'moderate', 'heavy', 'severe'],
      default: 'light'
    }
  },
  routePolyline: {
    type: String // Encoded polyline from Google Maps
  },
  isFavorite: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

savedRouteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('SavedRoute', savedRouteSchema);

