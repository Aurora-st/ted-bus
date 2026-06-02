import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import http from 'http';
import { initSockets } from './sockets/index.js';

async function main() {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);
  initSockets(httpServer);

  const server = httpServer.listen(env.port, () => {
    logger.info(`server_listening`, { port: env.port, env: env.nodeEnv });
  });

  const shutdown = async (signal) => {
    logger.info('server_shutdown_start', { signal });
    server.close(() => {
      logger.info('server_shutdown_http_closed', { signal });
    });
    try {
      // eslint-disable-next-line no-undef
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close(false);
      logger.info('server_shutdown_db_closed', { signal });
    } catch (err) {
      logger.error('server_shutdown_db_error', { err });
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error('server_boot_failed', { message: err.message, stack: err.stack });
  process.exit(1);
});

