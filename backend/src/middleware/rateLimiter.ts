import { RateLimiterMemory, IRateLimiterOptions } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';
import logger from '@/lib/logger';
import { APIError } from '@/utils/apiError';

// Step 1: configure limiter options
const globalOptions: IRateLimiterOptions = {
  points: 100, // max 100 requests
  duration: 60, // per 60 seconds
  blockDuration: 300, // block for 300s if limit exceeded
};

// Step 2: create limiter
const globalLimiter = new RateLimiterMemory(globalOptions);

// Step 3: create middleware function
export const globalLimiterMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    await globalLimiter.consume(req.ip as string); // consume 1 point per request
    next(); // allow request to continue
  } catch {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    throw new APIError(429, 'Too Many Requests', [
      {
        message: 'You have exceeded the request limit. Please try again later.',
      },
    ]);
  }
};
