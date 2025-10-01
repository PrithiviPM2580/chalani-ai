import logger from '@/lib/logger';
import type { Response } from 'express';
import type { SuccessResponse } from '@/@types';
import mongoose from 'mongoose';

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

export const generateMongooseId = (): mongoose.Types.ObjectId =>
  new mongoose.Types.ObjectId();
