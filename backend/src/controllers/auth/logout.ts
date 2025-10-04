import config from '@/config/envValidation';
import logger from '@/lib/logger';
import { logoutService } from '@/services/auth';
import { successResponse } from '@/utils';
import type { Request, Response } from 'express';

export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  await logoutService(userId);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.COOKIE_MAX_AGE,
  });

  logger.info(`User with ID: ${userId} logged out successfully`);
  successResponse(res, null, 'Logged out successfully');
};

export default logoutController;
