import winston from 'winston';
import config from '@/config/envValidation';

const { combine, timestamp, errors, printf, colorize } = winston.format;

// ANSI colors (manual control)
const colors = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`, // ✅ green
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  purple: (text: string) => `\x1b[35m${text}\x1b[0m`,
};

winston.addColors({
  error: 'red bold',
  warn: 'yellow bold',
  info: 'green bold',
});

const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production' && config.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      level: config.LOG_LEVEL,
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${colors.green(JSON.stringify(meta, null, 2))}` // ✅ force payload green
            : '';
          return `${timestamp} [${level}]: ${message} ${
            service ? `\n${colors.purple(`[APP: ${service}]`)}` : ''
          }${metaStr}`;
        })
      ),
    })
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true })), // clean for files
  defaultMeta: { service: 'chalani-ai' },
  transports,
  silent: config.NODE_ENV === 'test',
});

export default logger;
