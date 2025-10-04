import express from 'express';
import request from 'supertest';
import router from '@/routes/index'; // main router (mounts /api/v1/auth)
import User from '@/models/user';
import { globalErrorHandler } from '@/middleware/globalErrorHandler';
import { createUser } from '@/dao/user';
import { CreateUser } from '@/dao/user';
import mongoose, { UpdateResult } from 'mongoose';
import { generateAccessToken } from '@/lib/jwt';

type UserPayload = CreateUser & { refreshToken?: string };

let app: express.Express;
let userId = new mongoose.Types.ObjectId();
let accessToken: string;

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

describe('DELETE /api/v1/auth/logout - Logout', () => {
  beforeEach(async () => {
    const user = await createUser({
      email: 'logout@test.com',
      username: 'logoutUser',
      password: 'password123',
      refreshToken: 'some-refresh-token',
      role: 'user',
    } as UserPayload);
    userId = user._id;
    accessToken = generateAccessToken({ userId });
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/api/v1/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Unauthorized - AccessToken is missing');
  });

  it('should return 200 and clear refresh token if valid token provided', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');

    // Check that cookie was cleared
    const cookies = res.headers['set-cookie'][0];
    expect(cookies).toMatch(/refreshToken=;/);

    // Verify in DB
    const updatedUser = await User.findById(userId).select('+refreshToken');
    expect(updatedUser?.refreshToken).toBeNull();
  });

  it('should return 500 if DB update fails', async () => {
    jest.spyOn(User, 'updateOne').mockResolvedValueOnce({
      acknowledged: false,
      matchedCount: 0,
      modifiedCount: 0,
    } as UpdateResult);

    const res = await request(app)
      .delete('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Failed to logout the user/i);
  });
});
