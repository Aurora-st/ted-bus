import mongoose from 'mongoose';

/**
 * Journey Schema
 * Stores completed bus journeys for review eligibility
 */
const journeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  bookingId: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  hasReviewed: {
    type: Boolean,
    default: false
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null
  }
}, {
  timestamps: true
});

journeySchema.index({ user: 1, route: 1, scheduledDate: 1 });
journeySchema.index({ status: 1 });

export default mongoose.model('Journey', journeySchema);

