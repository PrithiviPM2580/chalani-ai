import type { Request, Response, NextFunction } from 'express';
import { APIError } from '@/utils/apiError';
import logger from '@/lib/logger';
// import config from '@/config/envValidation';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  void next;
  if (err instanceof APIError) {
    logger.error(
      `API Error:
   message: ${err.message}
   statusCode: ${err.statusCode}
   errors: ${JSON.stringify(err.errors, null, 2)}`
    );

    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }

  logger.error('Unexpected Error: ', {
    message: (err as Error).message,
    stack: (err as Error).stack,
  });

  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Internal Server Error',
    errors: [],
  });
};
