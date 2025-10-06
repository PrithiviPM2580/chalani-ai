import { Router } from 'express';
import signUpController from '@/controllers/auth/sign-up';
import loginController from '@/controllers/auth/login';
import { asyncHandler } from '@/middleware/asyncHandler';
import {
  authValidationSchema,
  forgotPasswordValidationSchema,
  loginValidationSchema,
  resetPasswordValidation,
} from '@/validation/auth';
import { validateRequest } from '@/middleware/validateRequest';
import { limiters, rateLimiter } from '@/middleware/rateLimiter';
import logoutController from '@/controllers/auth/logout';
import forgotPasswordController from '@/controllers/auth/forgot-password';
import resetPasswordContoller from '@/controllers/auth/reset-password';
import authentication from '@/middleware/authentication';
import refreshTokenContoller from '@/controllers/auth/refreshToken';

const router = Router();

router.route('/sign-up').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest({ body: authValidationSchema }),
  asyncHandler(signUpController)
);

router.route('/login').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest({ body: loginValidationSchema }),
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

router.route('/forgot-password').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest({ body: forgotPasswordValidationSchema }),
  asyncHandler(forgotPasswordController)
);

router.route('/reset-password').post(
  rateLimiter(limiters.auth, req => req.ip as string),
  validateRequest(resetPasswordValidation),
  asyncHandler(resetPasswordContoller)
);

export default router;
