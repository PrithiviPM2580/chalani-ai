import type { Request, Response } from 'express';
import { successResponse } from '@/utils';
import { signUpService } from '@/services/auth';
import config from '@/config/envValidation';
import { AuthValidation } from '@/validation/auth';

export const signUpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user, accessToken, refreshToken } = await signUpService(
    req.body as AuthValidation
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.COOKIE_MAX_AGE,
  });

  successResponse(res, { user, accessToken }, 'User registered successfully');
};

export default signUpController;
