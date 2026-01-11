import Review from '../models/Review.model.js';
import ReviewReport from '../models/ReviewReport.model.js';
import Journey from '../models/Journey.model.js';
import Route from '../models/Route.model.js';

/**
 * Create a review (only verified users, only after journey completion)
 */
export const createReview = async (req, res) => {
  try {
    const { routeId, journeyId, rating, content } = req.body;

    if (!routeId || !journeyId || !rating || !content) {
      return res.status(400).json({ 
        message: 'Route ID, journey ID, rating, and content are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (content.length < 50) {
      return res.status(400).json({ 
        message: 'Review content must be at least 50 characters' 
      });
    }

    // Check if journey exists and is completed
    const journey = await Journey.findOne({
      _id: journeyId,
      user: req.user._id,
      route: routeId,
      status: 'completed'
    });

    if (!journey) {
      return res.status(400).json({ 
        message: 'Journey not found or not completed. Only completed journeys can be reviewed.' 
      });
    }

    // Check if already reviewed
    if (journey.hasReviewed) {
      return res.status(400).json({ 
        message: 'This journey has already been reviewed' 
      });
    }

    // Check if user already reviewed this route
    const existingReview = await Review.findOne({
      user: req.user._id,
      route: routeId
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this route' 
      });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      route: routeId,
      journey: journeyId,
      rating,
      content: content.trim()
    });

    // Set edit lock after 24 hours
    setTimeout(async () => {
      const reviewToLock = await Review.findById(review._id);
      if (reviewToLock && reviewToLock.canEdit) {
        reviewToLock.canEdit = false;
        reviewToLock.lockedAt = new Date();
        await reviewToLock.save();
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    await review.save();

    // Update journey
    journey.hasReviewed = true;
    journey.reviewId = review._id;
    await journey.save();

    // Update route statistics
    await updateRouteStats(routeId);

    await review.populate('user', 'name profilePicture');
    await review.populate('route', 'name routeNumber');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
};

/**
 * Update review (within 24 hours)
 */
export const updateReview = async (req, res) => {
  try {
    const { content, rating } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    if (!review.canEdit) {
      return res.status(403).json({ 
        message: 'Review cannot be edited after 24 hours' 
      });
    }

    // Save edit history
    review.editHistory.push({
      content: review.content,
      editedAt: new Date()
    });

    if (content) {
      if (content.length < 50) {
        return res.status(400).json({ 
          message: 'Review content must be at least 50 characters' 
        });
      }
      review.content = content.trim();
    }

    if (rating && rating >= 1 && rating <= 5) {
      review.rating = rating;
    }

    review.edited = true;
    await review.save();

    // Update route stats if rating changed
    if (rating) {
      await updateRouteStats(review.route);
    }

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error updating review' });
  }
};

/**
 * Delete review
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update journey
    await Journey.findByIdAndUpdate(review.journey, {
      hasReviewed: false,
      reviewId: null
    });

    // Update route stats
    await updateRouteStats(review.route);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get reviews for a route
 */
export const getRouteReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const query = { 
      route: req.params.routeId, 
      isHidden: false 
    };

    const sortOptions = {
      recent: { createdAt: -1 },
      helpful: { upvotesCount: -1, createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 }
    };

    const reviews = await Review.find(query)
      .populate('user', 'name profilePicture')
      .sort(sortOptions[sort] || sortOptions.recent)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Upvote a review
 */
export const upvoteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already upvoted
    if (review.upvotes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    review.upvotes.push(req.user._id);
    review.upvotesCount += 1;

    // Mark as trusted reviewer if upvotes exceed threshold (e.g., 10)
    if (review.upvotesCount >= 10) {
      review.isTrustedReviewer = true;
    }

    await review.save();

    res.json({ 
      message: 'Review upvoted successfully', 
      upvotesCount: review.upvotesCount 
    });
  } catch (error) {
    console.error('Upvote review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report a review
 */
export const reportReview = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const reviewId = req.params.id;

    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already reported
    const existingReport = await ReviewReport.findOne({
      review: reviewId,
      reporter: req.user._id
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this review' });
    }

    const report = new ReviewReport({
      review: reviewId,
      reporter: req.user._id,
      reason,
      description: description || ''
    });

    await report.save();

    // Update review reports count
    review.reports.push(report._id);
    review.reportsCount += 1;

    // Auto-hide if reports exceed threshold (e.g., 3 reports)
    if (review.reportsCount >= 3) {
      review.isHidden = true;
    }

    await review.save();

    res.status(201).json({
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get review statistics for a route
 */
export const getReviewStats = async (req, res) => {
  try {
    const route = await Route.findById(req.params.routeId);

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({
      averageRating: route.averageRating,
      totalReviews: route.totalReviews,
      ratingDistribution: route.ratingDistribution
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Helper function to update route statistics
 */
const updateRouteStats = async (routeId) => {
  try {
    const reviews = await Review.find({ 
      route: routeId, 
      isHidden: false 
    });

    if (reviews.length === 0) {
      await Route.findByIdAndUpdate(routeId, {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    reviews.forEach(review => {
      distribution[review.rating.toString()]++;
    });

    await Route.findByIdAndUpdate(routeId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Update route stats error:', error);
  }
};

