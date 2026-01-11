import mongoose from 'mongoose';

/**
 * Notification Schema
 * Stores all notifications sent to users
 */
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking-confirmation', 'cancellation', 'schedule-change', 'journey-reminder', 'promotion', 'post-like', 'post-comment', 'review-response'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Localized content
  translations: {
    type: Map,
    of: {
      title: String,
      message: String
    },
    default: {}
  },
  channels: [{
    type: String,
    enum: ['email', 'push'],
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'retrying'],
    default: 'pending'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  emailError: {
    type: String,
    default: null
  },
  pushError: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // Related entity references
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedType: {
    type: String,
    enum: ['booking', 'post', 'review', 'journey'],
    default: null
  }
}, {
  timestamps: true
});

// Index for user notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });

export default mongoose.model('Notification', notificationSchema);

