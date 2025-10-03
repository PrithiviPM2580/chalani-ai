import type { Request, Response } from 'express';
import config from '@/config/envValidation';
import { successResponse } from '@/utils';
import { loginService } from '@/services/auth';
import { LoginValidation } from '@/validation/auth';

const loginController = async (req: Request, res: Response): Promise<void> => {
  const { user, accessToken, refreshToken } = await loginService(
    req.body as LoginValidation
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.COOKIE_MAX_AGE,
  });
  successResponse(res, { user, accessToken }, 'User logged in successfully');
};

export default loginController;
