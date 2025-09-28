import type { Response, Request } from 'express';
import compression from 'compression';

const shouldCompress = (req: Request, res: Response): boolean => {
  const existingEncoding = res.getHeader('Content-Encoding');
  if (existingEncoding) return false;

  const contentTypeRaw = res.getHeader('Content-Type');
  const contentType =
    typeof contentTypeRaw === 'string' ? contentTypeRaw.toLowerCase() : '';

  if (contentType) {
    if (
      contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType === 'application/pdf'
    ) {
      return false;
    }
  }
  return compression.filter(req, res);
};

const compressionMiddleware = compression({
  threshold: 1024,
  filter: shouldCompress,
});

export default compressionMiddleware;
