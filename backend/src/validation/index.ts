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
});

export type EnvConfig = z.infer<typeof envValidationSchema>;
