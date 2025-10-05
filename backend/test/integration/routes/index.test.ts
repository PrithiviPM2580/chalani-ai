import express from 'express';
import request from 'supertest';
import router from '@/routes';
import type { Express } from 'express';
import { globalErrorHandler } from '@/middleware/globalErrorHandler';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(router);
  app.use(globalErrorHandler);
});

describe('Health Check', () => {
  it('Get/ should return API status', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'API is running',
        status: 'success',
        version: '1.0.0',
        docs: '/docs',
      })
    );
    expect(res.body.timestamp).toBeDefined();
  });
});
