import express from 'express';
import { 
  updateProfile, 
  getUserProfile, 
  updateLanguage, 
  updateTheme,
  getUserStats 
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateProfile);
router.put('/language', updateLanguage);
router.put('/theme', updateTheme);
router.get('/stats', getUserStats);

export default router;

