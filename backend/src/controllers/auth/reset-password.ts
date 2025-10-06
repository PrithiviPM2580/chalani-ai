import logger from '@/lib/logger';
import type { Request, Response } from 'express';
import { resetPasswordService } from '@/services/auth';
import { successResponse } from '@/utils';

type RequestQuery = { token: string };
type RequestBody = { password: string };
export const resetPasswordContoller = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.query as RequestQuery;
  const { password } = req.body as RequestBody;
  const result = await resetPasswordService(token, password);

  logger.info(`Password reset successful for token: ${token}`);
  successResponse(res, { message: 'Password reset successful', data: result });
};

export default resetPasswordContoller;
