import config from '@/config/envValidation';
import { setRefreshToken } from '@/dao/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { successResponse } from '@/utils';
import { Request, Response } from 'express';

export const googleLogin = (_req: Request, res: Response) => {
  res.redirect('/');
};

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.redirect('/auth/google/failure');
  }

  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  await setRefreshToken(user._id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.COOKIE_MAX_AGE,
  });

  logger.info(`User logged in with Google: ${user.email}`);

  return successResponse(
    res,
    {
      user: { _id: user._id, email: user.email, username: user.username },
      accessToken,
    },
    'Logged in with Google'
  );
};
