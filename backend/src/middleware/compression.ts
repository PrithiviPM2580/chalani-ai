import compression from 'compression';
import type { Request, Response } from 'express';

const shouldCompress = (req: Request, res: Response): boolean => {
  const contentType = req.headers['content-type']?.toString() || '';

  if (
    contentType.startsWith('image/') ||
    contentType === 'application/pdf' ||
    contentType.startsWith('video/')
  ) {
    return false;
  }
  return compression.filter(req, res);
};

const compressionMiddleware = compression({
  threshold: 1024,
  filter: shouldCompress,
});

export default compressionMiddleware;
