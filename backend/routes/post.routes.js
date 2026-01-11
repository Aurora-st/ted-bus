import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  likePost,
  unlikePost,
  createComment,
  getComments,
  reportPost,
  getTrendingPosts,
  deletePost
} from '../controllers/post.controller.js';
import { authenticate, requireVerified } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/:id', getPostById);
router.get('/:id/comments', getComments);

// Protected routes
router.use(authenticate);

router.post('/', requireVerified, createPost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/comment', createComment);
router.post('/:id/report', reportPost);
router.delete('/:id', deletePost);

export default router;

