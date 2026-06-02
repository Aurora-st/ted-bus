import express from 'express';
import { authenticate, requireVerified } from '../middleware/auth.middleware.js';
import { uploadSingleImageMiddleware, uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();

// Verified users only to reduce abuse surface
router.use(authenticate);
router.use(requireVerified);

router.post('/image', uploadSingleImageMiddleware, uploadImage);

export default router;

