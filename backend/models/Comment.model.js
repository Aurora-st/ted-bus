import mongoose from 'mongoose';

/**
 * Comment Schema
 * Stores comments on posts
 */
const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: 1000
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update post comments count when comment is created/deleted
commentSchema.post('save', async function() {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.post, { $inc: { commentsCount: 1 } });
});

commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.post, { $inc: { commentsCount: -1 } });
  }
});

export default mongoose.model('Comment', commentSchema);

