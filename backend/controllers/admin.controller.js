import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Report from '../models/Report.model.js';
import Review from '../models/Review.model.js';

export const banUser = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true, bannedAt: new Date(), banReason: reason || 'Policy violation' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User banned', user });
  } catch (e) {
    res.status(500).json({ message: 'Server error banning user' });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, bannedAt: null, banReason: null },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unbanned', user });
  } catch (e) {
    res.status(500).json({ message: 'Server error unbanning user' });
  }
};

export const listReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Report.countDocuments(query);
    res.json({ reports, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    res.status(500).json({ message: 'Server error listing reports' });
  }
};

export const removePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, { isDeleted: true }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post removed', post });
  } catch (e) {
    res.status(500).json({ message: 'Server error removing post' });
  }
};

export const hideReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { isHidden: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review hidden', review });
  } catch (e) {
    res.status(500).json({ message: 'Server error hiding review' });
  }
};

