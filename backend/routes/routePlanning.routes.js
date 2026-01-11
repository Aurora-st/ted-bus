import express from 'express';
import {
  planRoute,
  getRouteDetails,
  saveRoute,
  getSavedRoutes,
  deleteSavedRoute,
  compareRoutes
} from '../controllers/routePlanning.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/plan', planRoute);
router.post('/compare', compareRoutes);
router.get('/details/:routeId', getRouteDetails);

router.use(authenticate);

router.post('/save', saveRoute);
router.get('/saved', getSavedRoutes);
router.delete('/saved/:id', deleteSavedRoute);

export default router;

