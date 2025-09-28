import config from '@/config/envValidation';
import logger from '@/lib/logger';

import app from '@/app';
import { connectToDatabase, disconnectFromDatabase } from './config/database';

const PORT = config.PORT || 30001;

(async () => {
  try {
    await connectToDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = async () => {
      logger.warn('⚠️ Server shutting down...');
      try {
        await disconnectFromDatabase();
      } catch (error) {
        logger.error('Error during DB shutdown', { error });
      } finally {
        server.close(() => {
          logger.info('✅ HTTP server closed');
          process.exit(0);
        });
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('❌ Error starting server', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
})();
