import { validate } from '@/lib/validate';
import { envValidationSchema } from '@/validation';
import dotenv from 'dotenv';

dotenv.config();

const _7DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  CORS_WHITELIST: process.env.CORS_WHITELIST,
  DB_NAME: process.env.DB_NAME,
  APP_NAME: process.env.APP_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
  WHITELIST_ADMIN: process.env.WHITELIST_ADMIN,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  COOKIE_MAX_AGE: _7DAYS_IN_MILLISECONDS,
};

const config = validate(envValidationSchema, env);

export default config;
