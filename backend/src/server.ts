import config from '@/config';
import logger from '@/lib/logger';

import app from '@/app';

const PORT = config.PORT || 30001;

app.listen(config.PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
