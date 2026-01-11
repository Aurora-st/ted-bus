import mongoose from 'mongoose';

/**
 * Like Schema
 * Stores likes on posts (can be extended for comments)
 */
const likeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate likes
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);

