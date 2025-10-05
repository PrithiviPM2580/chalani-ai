import { Router } from 'express';
import signUpController from '@/controllers/auth/sign-up';
import loginController from '@/controllers/auth/login';
import { asyncHandler } from '@/middleware/asyncHandler';
import { authValidationSchema, loginValidationSchema } from '@/validation/auth';
import { validateRequest } from '@/middleware/validateRequest';
import { limiters, rateLimiter } from '@/middleware/rateLimiter';
import logoutController from '@/controllers/auth/logout';
import authentication from '@/middleware/authentication';
import refreshTokenContoller from '@/controllers/auth/refreshToken';

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

router.route('/logout').delete(
  rateLimiter(limiters.auth, req => req.ip as string),
  authentication,
  asyncHandler(logoutController)
);

router.route('/refresh-token').get(
  rateLimiter(limiters.auth, req => req.ip as string),
  asyncHandler(refreshTokenContoller)
);

export default router;
