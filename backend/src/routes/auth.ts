import { Router } from 'express';
import signUpController from '@/controllers/auth/sign-up';
import { asyncHandler } from '@/middleware/asyncHandler';
import { authValidationSchema } from '@/validation/auth';
import { validateRequest } from '@/middleware/validateRequest';
import { limiters, rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.route('/sign-up').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest(authValidationSchema),
  asyncHandler(signUpController)
);

// router.route('/login').post();

export default router;
