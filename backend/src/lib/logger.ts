import winston from 'winston';
import config from '@/config/envValidation';

const { combine, timestamp, errors, printf, colorize } = winston.format;

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
        printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n[Meta: ${JSON.stringify(meta)}]`
            : '';
          return `${timestamp} [${level}]: ${message}\n[Meta: { service:"${service}" }]${metaStr}`;
        })
      ),
    })
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true })), // keep JSON/file logs clean
  defaultMeta: { service: 'chalani-ai' },
  transports,
  silent: config.NODE_ENV === 'test',
});

export default logger;
