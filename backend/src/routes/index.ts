import { Router } from 'express';
import authRoute from '@/routes/auth';

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

router.use('/api/v1/auth', authRoute);

export default router;
