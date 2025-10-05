import { Router } from 'express';
import authRoute from '@/routes/auth';
import passport from 'passport';
import { googleCallback } from '@/controllers/auth/google';

const router = Router();

router.route('/').get((_req, res) => {
  res.status(200).json({
    message: 'API is running',
    status: 'success',
    version: '1.0.0',
    docs: '/docs',
    timestamp: new Date().toISOString(),
  });
});

router
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback').get(
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/google/failure',
  }),
  googleCallback
);

router.use('/api/v1/auth', authRoute);

export default router;
