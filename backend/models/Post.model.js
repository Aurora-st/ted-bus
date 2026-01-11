import mongoose from 'mongoose';

/**
 * Post Schema
 * Stores community posts created by verified users
 */
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: 5000
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  category: {
    type: String,
    enum: ['routes', 'destinations', 'travel-tips'],
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null // Only set if post is related to a specific route
  },
  destination: {
    type: String,
    default: '' // Destination name if category is 'destinations'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  reportsCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false // Set to true by admin/moderator
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0 // Calculated based on likes + comments + recency
  }
}, {
  timestamps: true
});

// Index for trending posts
postSchema.index({ trendingScore: -1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1 });

export default mongoose.model('Post', postSchema);

