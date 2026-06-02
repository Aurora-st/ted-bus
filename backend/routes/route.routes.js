import express from 'express';
import { listRoutes } from '../controllers/route.controller.js';

const router = express.Router();

// Public routes list for reviews + route planning UI
router.get('/', listRoutes);

export default router;

