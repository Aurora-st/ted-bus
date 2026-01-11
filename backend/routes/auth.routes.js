import express from 'express';
import { register, login, verifyEmail, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;

