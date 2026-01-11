import mongoose from 'mongoose';

/**
 * Review Report Schema
 * Stores reports on reviews (similar to Report but specific to reviews)
 */
const reviewReportSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'harassment', 'false-information', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Prevent duplicate reports
reviewReportSchema.index({ review: 1, reporter: 1 }, { unique: true });

export default mongoose.model('ReviewReport', reviewReportSchema);

