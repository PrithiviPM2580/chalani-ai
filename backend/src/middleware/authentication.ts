import type { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { TokenPayload, verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { APIError } from '@/utils/apiError';

const authentication = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    logger.error('No authorization header provided');
    throw new APIError(401, 'Unauthorized - AccessToken is missing');
  }
  const [scheme, accessToken] = authorization.split(' ');
  if (scheme !== 'Bearer') {
    logger.error('Invalid authorization scheme');
    throw new APIError(401, 'Unauthorized - Invalid authorization scheme');
  }
  try {
    const { userId } = verifyAccessToken(accessToken) as TokenPayload;
    req.userId = userId;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.error('AccessToken has expired');
      throw new APIError(401, 'Unauthorized - AccessToken has expired');
    }
    if (error instanceof JsonWebTokenError) {
      logger.error('Invalid AccessToken');
      throw new APIError(401, 'Unauthorized - Invalid AccessToken');
    }
    logger.error('Error occurred while verifying AccessToken');
    throw new APIError(500, 'Internal Server Error');
  }
};

export default authentication;
