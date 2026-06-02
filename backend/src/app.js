import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import metricsRoutes from './routes/metrics.js';

// Existing routes (kept for now; will be moved into src/routes during refactor)
import authRoutes from '../routes/auth.routes.js';
import userRoutes from '../routes/user.routes.js';
import postRoutes from '../routes/post.routes.js';
import notificationRoutes from '../routes/notification.routes.js';
import routePlanningRoutes from '../routes/routePlanning.routes.js';
import reviewRoutes from '../routes/review.routes.js';
import uploadRoutes from '../routes/upload.routes.js';
import adminRoutes from '../routes/admin.routes.js';

export function createApp() {
  const app = express();

  // Trust proxy is required behind Nginx/ELB for correct IPs & rate limiting
  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(requestLogger);

  app.use(helmet());
  app.use(compression());

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get('/', (req, res) => {
    res.send('🚍 Bus Travel Platform Backend is Live');
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Bus Travel Platform API is running' });
  });

  // Metrics for Grafana/Prometheus
  app.use(metricsRoutes);

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/route-planning', routePlanningRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

