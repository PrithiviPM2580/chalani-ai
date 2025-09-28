import { Router } from 'express';

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

export default router;
