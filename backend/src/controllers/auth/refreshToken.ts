import type { Request, Response } from 'express';
import logger from '@/lib/logger';
import { APIError } from '@/utils/apiError';
import { successResponse } from '@/utils';
import { refreshAccessTokenService } from '@/services/auth';

export const refreshTokenContoller = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    logger.warn('Refresh token not found in cookies');
    throw new APIError(401, 'Refresh token not found');
  }

  const { accessToken, userId } = await refreshAccessTokenService(refreshToken);

  logger.info(`Access token generated for userId: ${userId}`);

  successResponse(res, { accessToken }, 'Access token refreshed successfully');
};

export default refreshTokenContoller;
