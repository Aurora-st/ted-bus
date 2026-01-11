import mongoose from 'mongoose';

/**
 * Notification Preference Schema
 * Stores user preferences for notification channels
 */
const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Channel preferences
  emailEnabled: {
    type: Boolean,
    default: true
  },
  pushEnabled: {
    type: Boolean,
    default: true
  },
  // Type-specific preferences
  bookingConfirmation: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  cancellation: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  scheduleChange: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  journeyReminder: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  promotion: {
    email: { type: Boolean, default: false }, // Opt-in by default
    push: { type: Boolean, default: false }
  },
  social: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);

