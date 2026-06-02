import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;

  logger.error('request_error', {
    status,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
    stack: err.stack
  });

  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && {
      details: {
        message: err.message,
        stack: err.stack
      }
    })
  });
}

