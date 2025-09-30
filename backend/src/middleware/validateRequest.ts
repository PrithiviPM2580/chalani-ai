import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { APIError } from '@/utils/apiError';

export const validateRequest =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new APIError(400, 'Validation Error', issues));
    }
    req.body = result.data;
    next();
  };
