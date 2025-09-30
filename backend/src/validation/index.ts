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

export const signUpValidationSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .optional()
      .transform(val => val?.trim()),
    email: z
      .email('Invalid email address')
      .min(5, 'Email must be at least 5 characters')
      .max(100, 'Email must be less than 100 characters')
      .transform(val => val.trim().toLowerCase()),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional()
      .transform(val => val?.trim()),
    googleId: z.string().min(1).optional(),
    businessName: z
      .string()
      .max(100, 'Business name must be less than 100 characters')
      .optional()
      .transform(s => s?.trim()),

    address: z
      .string()
      .max(200, 'Address must be less than 200 characters')
      .optional()
      .transform(s => s?.trim()),

    phoneNumber: z
      .string()
      .max(15, 'Phone number must be less than 15 characters')
      .optional()
      .transform(s => s?.trim()),

    role: z
      .enum(['user', 'admin'])
      .optional()
      .default('user')
      .transform(r => (r === 'admin' ? 'user' : r)),
  })
  .superRefine((val, ctx) => {
    if (!val.password && !val.googleId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either password or googleId is required for signup',
        path: ['password'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Either password or googleId is required for signup',
        path: ['googleId'],
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpValidationSchema>;
