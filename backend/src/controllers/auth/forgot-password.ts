import logger from '@/lib/logger';
import { forgotPasswordService } from '@/services/auth';
import { successResponse } from '@/utils';
import { ForgotPasswordValidation } from '@/validation/auth';
import type { Request, Response } from 'express';

export const forgotPasswordController = async (req: Request, res: Response) => {
  const email = await forgotPasswordService(
    req.body as ForgotPasswordValidation
  );

  logger.info(`Password reset link sent to ${email}`);

  successResponse(res, { message: `Password reset link sent to ${email}` });
};

export default forgotPasswordController;
