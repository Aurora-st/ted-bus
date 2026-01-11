import mongoose from 'mongoose';

/**
 * Review Schema
 * Stores route reviews by verified users after journey completion
 */
const reviewSchema = new mongoose.Schema({
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
  journey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journey',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    minlength: [50, 'Review must be at least 50 characters'],
    maxlength: 2000
  },
  // Edit tracking
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  canEdit: {
    type: Boolean,
    default: true // Locked after 24 hours
  },
  lockedAt: {
    type: Date,
    default: null
  },
  // Moderation
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReviewReport'
  }],
  reportsCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false // Auto-hide after multiple reports
  },
  // Social features
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvotesCount: {
    type: Number,
    default: 0
  },
  isTrustedReviewer: {
    type: Boolean,
    default: false // Highlighted if upvotes exceed threshold
  }
}, {
  timestamps: true
});

// Index for route reviews
reviewSchema.index({ route: 1, createdAt: -1 });
reviewSchema.index({ user: 1, route: 1 }, { unique: true }); // One review per user per route
reviewSchema.index({ isHidden: 1 });

export default mongoose.model('Review', reviewSchema);

