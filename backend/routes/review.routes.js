import express from 'express';
import {
  createReview,
  getRouteReviews,
  updateReview,
  deleteReview,
  upvoteReview,
  reportReview,
  getReviewStats
} from '../controllers/review.controller.js';
import { authenticate, requireVerified } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/route/:routeId', getRouteReviews);
router.get('/route/:routeId/stats', getReviewStats);

// Protected routes
router.use(authenticate);
router.use(requireVerified);

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/upvote', upvoteReview);
router.post('/:id/report', reportReview);

export default router;

