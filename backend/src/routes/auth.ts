import { Router } from 'express';
import signUpController from '@/controllers/auth/sign-up';
import loginController from '@/controllers/auth/login';
import { asyncHandler } from '@/middleware/asyncHandler';
import { authValidationSchema, loginValidationSchema } from '@/validation/auth';
import { validateRequest } from '@/middleware/validateRequest';
import { limiters, rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.route('/sign-up').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest(authValidationSchema),
  asyncHandler(signUpController)
);

router.route('/login').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest(loginValidationSchema),
  asyncHandler(loginController)
);

export default router;
