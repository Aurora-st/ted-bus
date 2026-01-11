import mongoose from 'mongoose';

/**
 * Report Schema
 * Stores reports on posts and reviews for moderation
 */
const reportSchema = new mongoose.Schema({
  reportedItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  itemType: {
    type: String,
    enum: ['Post', 'Review'],
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
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
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);

