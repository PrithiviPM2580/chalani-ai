import jwt from 'jsonwebtoken';
import config from '@/config/envValidation';
import type { Types } from 'mongoose';
// import type { JwtPayload } from 'jsonwebtoken';

export type TokenPayload = { userId: Types.ObjectId };
export type ResetLinkPayload = { email: string };

export const generateAccessToken = (payload: TokenPayload) => {
  const token = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: '30m',
  });
  return token;
};
export const generateRefreshToken = (payload: TokenPayload) => {
  const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return token;
};
