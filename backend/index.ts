import config from '@/config';
import logger from '@/lib/logger';
import express from 'express';
import type { Express } from 'express';

const app: Express = express();

app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});
