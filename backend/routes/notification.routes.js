import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  updatePreferences,
  getPreferences
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllRead);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

export default router;

