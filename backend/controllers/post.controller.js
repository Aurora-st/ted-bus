import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Like from '../models/Like.model.js';
import Report from '../models/Report.model.js';
import User from '../models/User.model.js';

/**
 * Create a new post (only verified users)
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, category, routeId, destination, images } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
    }

    if (!['routes', 'destinations', 'travel-tips'].includes(category)) {
      return res.status(400).json({ 
        message: 'Invalid category. Must be: routes, destinations, or travel-tips' 
      });
    }

    const post = new Post({
      author: req.user._id,
      title,
      content,
      category,
      routeId: routeId || null,
      destination: destination || '',
      images: images || []
    });

    await post.save();

    // Update user posts count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    // Populate author info
    await post.populate('author', 'name profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

/**
 * Get posts with filters
 */
export const getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, sort = 'newest' } = req.query;
    
    const query = { isDeleted: false, isHidden: false };
    if (category) {
      query.category = category;
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      trending: { trendingScore: -1, createdAt: -1 },
      popular: { likesCount: -1, createdAt: -1 }
    };

    const posts = await Post.find(query)
      .populate('author', 'name profilePicture')
      .sort(sortOptions[sort] || sortOptions.newest)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

/**
 * Get trending posts
 */
export const getTrendingPosts = async (req, res) => {
  try {
    // Calculate trending score: (likes * 2 + comments) / hours since creation
    const posts = await Post.find({ isDeleted: false, isHidden: false })
      .populate('author', 'name profilePicture')
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(10);

    // Update trending scores
    const now = Date.now();
    for (const post of posts) {
      const hoursSinceCreation = (now - post.createdAt) / (1000 * 60 * 60);
      const score = hoursSinceCreation > 0 
        ? (post.likesCount * 2 + post.commentsCount) / hoursSinceCreation
        : post.likesCount * 2 + post.commentsCount;
      
      post.trendingScore = score;
      await post.save();
    }

    res.json(posts);
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Server error fetching trending posts' });
  }
};

/**
 * Get post by ID
 */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture bio')
      .populate('likes', 'name');

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
};

/**
 * Like a post
 */
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Check if already liked
    const existingLike = await Like.findOne({ post: postId, user: userId });
    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // Create like
    await Like.create({ post: postId, user: userId });

    // Update post
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
      },
      { new: true }
    );

    // Update author's likes received
    await User.findByIdAndUpdate(post.author, { $inc: { likesReceived: 1 } });

    res.json({ message: 'Post liked successfully', likesCount: post.likesCount });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error liking post' });
  }
};

/**
 * Unlike a post
 */
export const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Remove like
    await Like.findOneAndDelete({ post: postId, user: userId });

    // Update post
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        $pull: { likes: userId },
        $inc: { likesCount: -1 }
      },
      { new: true }
    );

    res.json({ message: 'Post unliked successfully', likesCount: post.likesCount });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Server error unliking post' });
  }
};

/**
 * Create comment on post
 */
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content: content.trim()
    });

    await comment.save();
    await comment.populate('author', 'name profilePicture');

    // Update user comments count
    await User.findByIdAndUpdate(req.user._id, { $inc: { commentsCount: 1 } });

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

/**
 * Get comments for a post
 */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
      isDeleted: false
    })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

/**
 * Report a post
 */
export const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const postId = req.params.id;

    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already reported by this user
    const existingReport = await Report.findOne({
      reportedItem: postId,
      reporter: req.user._id,
      itemType: 'Post'
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    const report = new Report({
      reportedItem: postId,
      itemType: 'Post',
      reporter: req.user._id,
      reason,
      description: description || ''
    });

    await report.save();

    // Update post reports count
    await Post.findByIdAndUpdate(postId, { 
      $addToSet: { reports: report._id },
      $inc: { reportsCount: 1 }
    });

    // Auto-hide if reports exceed threshold (e.g., 5 reports)
    const reportsCount = await Report.countDocuments({
      reportedItem: postId,
      itemType: 'Post',
      status: 'pending'
    });

    if (reportsCount >= 5) {
      await Post.findByIdAndUpdate(postId, { isHidden: true });
    }

    res.status(201).json({
      message: 'Post reported successfully. It will be reviewed by moderators.'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error reporting post' });
  }
};

/**
 * Delete own post
 */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

