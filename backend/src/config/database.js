import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production'
  });

  logger.info('MongoDB connected');
}

