import { z } from 'zod';

export const authValidationSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .optional()
      .transform(val => val?.trim()),

    displayName: z
      .string()
      .max(100, 'Display name must be less than 100 characters')
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

    refreshToken: z.string().nullable().optional().default(null), // generated later
    passwordResetToken: z.string().nullable().optional().default(null), // generated later

    role: z.enum(['user', 'admin']).optional(),
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

export type AuthValidation = z.infer<typeof authValidationSchema>;

export const loginValidationSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().min(3).max(50).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(data => data.email || data.username, {
    message: 'Either email or username is required',
    path: ['identifier'],
  })
  .transform(data => ({
    identifier: data.email ?? data.username,
    password: data.password,
  }));

export type LoginValidation = z.infer<typeof loginValidationSchema>;

export const forgotPasswordValidationSchema = z.object({
  email: z.string('Email is required'),
});

export type ForgotPasswordValidation = z.infer<
  typeof forgotPasswordValidationSchema
>;

export const resetPasswordValidation = {
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  query: z.object({
    token: z.string().nonempty('Token is required'),
  }),
};

export type ResetPasswordValidationBody = z.infer<
  typeof resetPasswordValidation.body
>;
export type ResetPasswordValidationQuery = z.infer<
  typeof resetPasswordValidation.query
>;
