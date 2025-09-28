import type { CorsOptions } from 'cors';
import logger from '@/lib/logger';
import config from '@/config';

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.CORS_WHITELIST.includes(origin)
    ) {
      return callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(
        new Error(
          `CORS policy does not allow access from the specified origin: ${origin}`
        )
      );
    }
  },
};

export default corsOptions;
