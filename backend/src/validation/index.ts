import { z } from 'zod';

export const envValidationSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_WHITELIST: z
    .string()
    .default('http://localhost:5173')
    .transform(val => val.split(',').map(origin => origin.trim())),

  DB_NAME: z.string().min(1),
  APP_NAME: z.string().min(1),
  DATABASE_URL: z.string().refine(
    val => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid database connection string' }
  ),
  WHITELIST_ADMIN: z
    .string()
    .default('')
    .transform(val =>
      val
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
    ),
  JWT_ACCESS_SECRET: z.string().min(20, 'Access token secret is too short'),
  JWT_REFRESH_SECRET: z.string().min(20, 'Refresh token secret is too short'),
  COOKIE_MAX_AGE: z
    .number()
    .min(0)
    .default(7 * 24 * 60 * 60 * 1000),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_CALLBACK_URL: z.string().min(1, 'GOOGLE_CALLBACK_URL is required'),
});

export type EnvConfig = z.infer<typeof envValidationSchema>;
