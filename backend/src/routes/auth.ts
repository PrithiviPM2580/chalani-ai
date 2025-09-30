import { Router } from 'express';
import signUpController from '@/controllers/auth/sign-up';
import { asyncHandler } from '@/middleware/asyncHandler';
import { signUpValidationSchema } from '@/validation';
import { validateRequest } from '@/middleware/validateRequest';
import { limiters, rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.route('/sign-up').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest(signUpValidationSchema),
  asyncHandler(signUpController)
);

export default router;
