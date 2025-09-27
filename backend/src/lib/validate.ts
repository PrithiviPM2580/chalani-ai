import { z } from 'zod';
import { APIError } from '@/utils/apiError';

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new APIError('fail', 400, 'Validation Error', issues);
  }

  return result.data;
}
