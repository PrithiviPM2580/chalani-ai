// Mock external dependencies first
jest.mock('@/utils', () => ({
  generateMongooseId: jest.fn(() => 'mock-id'),
}));

jest.mock('@/lib/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

import { loginService, logoutService, signUpService } from '@/services/auth';
import { APIError } from '@/utils/apiError';
import * as userDao from '@/dao/user';
import config from '@/config/envValidation';
import { AuthValidation, LoginValidation } from '@/validation/auth';
import { UserDocument } from '@/models/user';
import * as jwt from '@/lib/jwt';
import type { UpdateResult } from 'mongoose';
import mongoose from 'mongoose';

const mockUserId = new mongoose.Types.ObjectId();

describe('signUpService - Unit Tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if the email is already in use', async () => {
    jest
      .spyOn(userDao, 'isUserExistByEmailOrUsername')
      .mockResolvedValueOnce(true);

    const signUpData = {
      email: 'dup@test.com',
      username: 'newUser',
      password: 'password123',
    } as AuthValidation;

    await expect(signUpService(signUpData)).rejects.toThrow(APIError);
  });

  it('should throw an error if the username is already in use', async () => {
    jest
      .spyOn(userDao, 'isUserExistByEmailOrUsername')
      .mockResolvedValueOnce(true);

    const signUpData = {
      email: 'hero@test.com',
      username: 'dupUser',
      password: 'password123',
    } as AuthValidation;

    await expect(signUpService(signUpData)).rejects.toThrow(APIError);
  });

  it('should reject admin registration if email is not whitelisted', async () => {
    config.WHITELIST_ADMIN = ['allowed@admin.com'];

    jest
      .spyOn(userDao, 'findUserByEmailOrUsername')
      .mockResolvedValueOnce(null);

    const signUpData = {
      email: 'not-allowed@admin.com',
      username: 'newAdmin',
      password: 'password123',
      role: 'admin',
    } as AuthValidation;

    await expect(signUpService(signUpData)).rejects.toThrow(APIError);
  });
});

describe('loginService - Unit Tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if user does not exist', async () => {
    jest
      .spyOn(userDao, 'findUserByEmailOrUsername')
      .mockResolvedValueOnce(null);

    await expect(
      loginService({
        identifier: 'test@test.com',
        password: 'password123',
      } as LoginValidation)
    ).rejects.toThrow(APIError);
  });

  it('should throw an error if password does not match', async () => {
    const mockUser: Partial<UserDocument> = {
      _id: 'mock-id' as unknown as UserDocument['_id'],
      email: 'test@test.com',
      username: 'tester',
      role: 'user',
      passwordResetToken: undefined,
      matchPassword: jest.fn().mockResolvedValueOnce(false),
    };

    jest
      .spyOn(userDao, 'findUserByEmailOrUsername')
      .mockResolvedValueOnce(mockUser as UserDocument);

    await expect(
      loginService({
        identifier: 'test@test.com',
        password: 'wrongpassword',
      } as LoginValidation)
    ).rejects.toThrow(APIError);
  });

  it('should return user + tokens on successful login', async () => {
    const mockUser: Partial<UserDocument> = {
      _id: 'mock-id' as unknown as UserDocument['_id'],
      email: 'test@test.com',
      username: 'tester',
      role: 'user',
      passwordResetToken: undefined,
      matchPassword: jest.fn().mockResolvedValueOnce(true),
      save: jest.fn().mockResolvedValueOnce(true),
    };

    jest
      .spyOn(userDao, 'findUserByEmailOrUsername')
      .mockResolvedValueOnce(mockUser as UserDocument);

    // ✅ Force the jwt mocks to return values
    (jwt.generateAccessToken as jest.Mock).mockReturnValue('mock-access-token');
    (jwt.generateRefreshToken as jest.Mock).mockReturnValue(
      'mock-refresh-token'
    );

    const result = await loginService({
      identifier: 'test@test.com',
      password: 'password123',
    });

    expect(result).toEqual({
      user: {
        _id: 'mock-id',
        email: 'test@test.com',
        username: 'tester',
        role: 'user',
        passwordResetToken: undefined,
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });

    expect(mockUser.save).toHaveBeenCalled();
  });
});

describe('logoutService - Unit Tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw 400 if userId is not provided', async () => {
    await expect(logoutService()).rejects.toThrow(APIError);
  });

  it('should throw 500 if DAO update is not acknowledged', async () => {
    jest.spyOn(userDao, 'clearRefreshToken').mockResolvedValueOnce({
      acknowledged: false,
      modifiedCount: 0,
      matchedCount: 0,
    } as UpdateResult);

    await expect(logoutService(mockUserId)).rejects.toThrow(APIError);
  });

  it('should return true on successful logout', async () => {
    jest.spyOn(userDao, 'clearRefreshToken').mockResolvedValueOnce({
      acknowledged: true,
      modifiedCount: 1,
      matchedCount: 1,
    } as UpdateResult);

    const result = await logoutService(mockUserId);
    expect(result).toBe(true);
  });
});
