import request from 'supertest';
import express from 'express';
import router from '@/routes';

const app = express();
app.use(express.json());
app.use(router);

describe('POST /api/v1/auth/sign-up', () => {
  it('should register a user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/sign-up').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should not allow duplicate email', async () => {
    await request(app).post('/api/v1/auth/sign-up').send({
      email: 'dup@example.com',
      username: 'user1',
      password: 'password123',
      role: 'user',
    });

    const res = await request(app).post('/api/v1/auth/sign-up').send({
      email: 'dup@example.com',
      username: 'user2',
      password: 'password123',
      role: 'user',
    });

    expect(res.status).toBe(400);
  });
});
