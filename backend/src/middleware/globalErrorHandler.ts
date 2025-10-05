import type { Request, Response, NextFunction } from 'express';
import { APIError } from '@/utils/apiError';
import logger from '@/lib/logger';
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  void next;
  logger.error('GlobalErrorHandler triggered', { err });

  // ✅ Handle JWT errors first
  if (err instanceof TokenExpiredError) {
    err = new APIError(401, 'Refresh token expired. Please log in again.');
  } else if (err instanceof JsonWebTokenError) {
    err = new APIError(401, 'Invalid refresh token. Please log in again.');
  } else if (err instanceof NotBeforeError) {
    err = new APIError(401, 'Refresh token not active yet.');
  }

  // ✅ Handle your custom APIError
  if (err instanceof APIError) {
    logger.error(
      `API Error:
       message: ${err.message}
       statusCode: ${err.statusCode}
       errors: ${JSON.stringify(err.errors, null, 2)}`
    );

    return res.status(err.statusCode).json({
      ok: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }

  // ✅ Fallback for unexpected errors
  logger.error('Unexpected Error: ', {
    message: (err as Error).message,
    stack: (err as Error).stack,
  });

  return res.status(500).json({
    ok: false,
    status: 'error',
    message: 'Internal Server Error',
    errors: [],
  });
};
