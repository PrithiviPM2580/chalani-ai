import express from 'express';
import request from 'supertest';
import router from '@/routes/index'; // main router (mounts /api/v1/auth)
import User from '@/models/user';
import { globalErrorHandler } from '@/middleware/globalErrorHandler';

let app: express.Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(router);
  app.use(globalErrorHandler);
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/v1/auth/sign-up - Sign-Up', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/sign-up').send({
      email: 'test@example.com',
      username: 'tester',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.username).toBe('tester');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined(); // refreshToken cookie
  });

  it('should reject duplicate email', async () => {
    // First registration
    await request(app).post('/api/v1/auth/sign-up').send({
      email: 'test@example.com',
      username: 'tester',
      password: 'password123',
    });

    // Duplicate attempt
    const res = await request(app).post('/api/v1/auth/sign-up').send({
      email: 'test@example.com',
      username: 'tester2',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Username or email already in use');
  });

  it('should reject duplicate username', async () => {
    // First registration
    await request(app).post('/api/v1/auth/sign-up').send({
      email: 'unique@example.com',
      username: 'tester',
      password: 'password123',
    });

    // Duplicate attempt
    const res = await request(app).post('/api/v1/auth/sign-up').send({
      email: 'another@example.com',
      username: 'tester', // same username
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Username or email already in use');
  });
});

describe('POST /api/v1/auth/login - Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/sign-up').send({
      email: 'test@test.com',
      username: 'tester',
      password: 'password123',
      role: 'user',
    });
  });

  it('should login an existing user successfully with email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('User logged in successfully');
    expect(res.body.data.user.email).toBe('test@test.com');
    expect(res.body.data.user.username).toBe('tester');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined(); // refreshToken cookie
  });

  it('should login an existing user successfully with username', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      username: 'tester',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('User logged in successfully');
    expect(res.body.data.user.email).toBe('test@test.com');
    expect(res.body.data.user.username).toBe('tester');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined(); // refreshToken cookie
  });

  it('should reject login with invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'wronguser@test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Invalid email or password');
  });
});
