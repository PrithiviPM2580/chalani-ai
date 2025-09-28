import { validate } from '@/lib/validate';
import { envValidationSchema } from '@/validation';
import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  CORS_WHITELIST: process.env.CORS_WHITELIST,
  DB_NAME: process.env.DB_NAME,
  APP_NAME: process.env.APP_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
};

const config = validate(envValidationSchema, env);

export default config;
