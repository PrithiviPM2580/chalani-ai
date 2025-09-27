import logger from '@/lib/logger';
import type { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success'
): Response<SuccessResponse<T>> => {
  logger.info('Success Response: ', { message, data });
  return res.status(200).json({
    success: true,
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  errors: ApiErrorItem[] = []
): Response<ApiErrorResponse> => {
  logger.error('Error Response: ', { message, statusCode, errors });
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    errors,
  });
};
