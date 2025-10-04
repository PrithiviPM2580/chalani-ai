import logger from '@/lib/logger';
import { APIError } from '@/utils/apiError';
import type { Request, Response, NextFunction } from 'express';
import {
  RateLimiterMemory,
  IRateLimiterOptions,
  RateLimiterRes,
} from 'rate-limiter-flexible';

const globalOptions: IRateLimiterOptions = { points: 200, duration: 60 };
const apiOptions: IRateLimiterOptions = { points: 100, duration: 60 };
const authOptions: IRateLimiterOptions = { points: 50, duration: 60 };
const adminOptions: IRateLimiterOptions = { points: 500, duration: 60 };

export const limiters = {
  global: new RateLimiterMemory(globalOptions),
  api: new RateLimiterMemory(apiOptions),
  auth: new RateLimiterMemory(authOptions),
  admin: new RateLimiterMemory(adminOptions),
};

export function rateLimiter(
  limiter: RateLimiterMemory,
  keyFn: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rateRes: RateLimiterRes = await limiter.consume(keyFn(req));

      res.setHeader('X-RateLimit-Limit', limiter.points.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        rateRes.remainingPoints.toString()
      );
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + rateRes.msBeforeNext).toISOString()
      );

      next();
    } catch (err: unknown) {
      if (err instanceof RateLimiterRes) {
        // now TypeScript knows it's RateLimiterRes
        res.setHeader(
          'Retry-After',
          Math.ceil(err.msBeforeNext / 1000).toString()
        );
        res.setHeader('X-RateLimit-Limit', limiter.points.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(Date.now() + err.msBeforeNext).toISOString()
        );

        throw new APIError(429, 'Too many requests. Please try again later.');
      }
      logger.error('Rate Limiter Error: ', err);
      next(err);
    }
  };
}
