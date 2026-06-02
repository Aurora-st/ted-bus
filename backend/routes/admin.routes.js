import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { banUser, unbanUser, listReports, removePost, hideReview } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['admin', 'moderator']));

router.get('/reports', listReports);
router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);
router.delete('/posts/:postId', removePost);
router.post('/reviews/:reviewId/hide', hideReview);

export default router;

