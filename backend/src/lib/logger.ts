import winston from 'winston';
import config from '@/config';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

console.log(config.NODE_ENV);

const transports: winston.transport[] = [];

if (config.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
} else if (config.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      level: config.LOG_LEVEL,
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}(${metaStr})`;
        })
      ),
    })
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'chalani-ai' },
  transports,
  silent: config.NODE_ENV === 'test',
});

export default logger;
