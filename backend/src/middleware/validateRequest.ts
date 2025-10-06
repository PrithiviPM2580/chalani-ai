import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { APIError } from '@/utils/apiError';

export const validateRequest =
  (schema: {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          const issues = result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          return next(new APIError(400, 'Validation Error (body)', issues));
        }
        req.body = result.data;
      }

      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          const issues = result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          return next(new APIError(400, 'Validation Error (query)', issues));
        }
        // ✅ merge instead of overwriting
        Object.assign(req.query, result.data);
      }

      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          const issues = result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          return next(new APIError(400, 'Validation Error (params)', issues));
        }
        // ✅ merge instead of overwriting
        Object.assign(req.params, result.data);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
