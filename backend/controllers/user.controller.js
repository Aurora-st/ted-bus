import User from '../models/User.model.js';

/**
 * Get user profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('postsCount');
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user language preference
 */
export const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true }
    ).select('-password');

    res.json({ message: 'Language updated successfully', language: user.language });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user theme preference
 */
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Theme must be light or dark' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { theme },
      { new: true }
    ).select('-password');

    res.json({ message: 'Theme updated successfully', theme: user.theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const Post = (await import('../models/Post.model.js')).default;
    const Comment = (await import('../models/Comment.model.js')).default;
    const Like = (await import('../models/Like.model.js')).default;

    const [postsCount, commentsCount, likesReceived] = await Promise.all([
      Post.countDocuments({ author: req.user._id, isDeleted: false }),
      Comment.countDocuments({ author: req.user._id, isDeleted: false }),
      Post.aggregate([
        { $match: { author: req.user._id, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } }
      ])
    ]);

    res.json({
      postsCount: postsCount || 0,
      commentsCount: commentsCount || 0,
      likesReceived: likesReceived[0]?.total || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

