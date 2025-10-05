// Mock external dependencies first
jest.mock('@/utils', () => ({
  generateMongooseId: jest.fn(() => 'mock-id'),
}));

jest.mock('@/lib/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

import {
  googleService,
  loginService,
  logoutService,
  refreshAccessTokenService,
  signUpService,
} from '@/services/auth';
import { APIError } from '@/utils/apiError';
import * as userDao from '@/dao/user';
import config from '@/config/envValidation';
import { AuthValidation, LoginValidation } from '@/validation/auth';
import { UserDocument } from '@/models/user';
import * as jwtLib from '@/lib/jwt';
import type { UpdateResult } from 'mongoose';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

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
    (jwtLib.generateAccessToken as jest.Mock).mockReturnValue(
      'mock-access-token'
    );
    (jwtLib.generateRefreshToken as jest.Mock).mockReturnValue(
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

describe('googleService - Unit Tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return existing user if found by googleId', async () => {
    const mockUser = {
      googleId: 'google-id-123',
      email: 'google@test.com',
    } as Partial<UserDocument> as UserDocument;

    jest.spyOn(userDao, 'findUserByGoogleId').mockResolvedValueOnce(mockUser);

    const result = await googleService({
      googleId: 'google-id-123',
      email: 'google@test.com',
      displayName: 'Google User',
    });

    expect(userDao.findUserByGoogleId).toHaveBeenCalledWith('google-id-123');
    expect(result).toBe(mockUser);
  });

  it('should link googleId if user exists by email', async () => {
    const mockUser = {
      email: 'google@test.com',
      googleId: undefined,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(userDao, 'findUserByGoogleId').mockResolvedValueOnce(null);
    jest
      .spyOn(userDao, 'findOne')
      .mockResolvedValueOnce(mockUser as Partial<UserDocument> as UserDocument);

    const result = await googleService({
      googleId: 'google-id-123',
      email: 'google@test.com',
      displayName: 'Google User',
    });

    expect(userDao.findOne).toHaveBeenCalledWith('google@test.com');
    expect(mockUser.googleId).toBe('google-id-123');
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toBe(mockUser);
  });

  it('should create a new user if none exists', async () => {
    const mockNewUser = {
      googleId: 'google-id-123',
      email: 'new@test.com',
      displayName: 'New User',
      role: 'user',
    } as Partial<UserDocument> as UserDocument;

    jest.spyOn(userDao, 'findUserByGoogleId').mockResolvedValueOnce(null);
    jest.spyOn(userDao, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(userDao, 'createGoogleUser').mockResolvedValueOnce(mockNewUser);

    const result = await googleService({
      googleId: 'google-id-123',
      email: 'new@test.com',
      displayName: 'New User',
    });

    expect(userDao.createGoogleUser).toHaveBeenCalledWith({
      googleId: 'google-id-123',
      email: 'new@test.com',
      displayName: 'New User',
      role: 'user',
    });
    expect(result).toBe(mockNewUser);
  });
});

describe('Refresh Token - Unit Tests', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockRefreshToken = 'valid-refresh-token';
  const mockAccessToken = 'new-access-token';
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a new access token when refresh token is valid', async () => {
    (jwtLib.verifyRefreshToken as jest.Mock).mockReturnValueOnce({
      userId: mockUserId,
    } as JwtPayload);

    jest.spyOn(userDao, 'findUserById').mockResolvedValueOnce({
      _id: mockUserId,
      refreshToken: mockRefreshToken,
    } as Partial<UserDocument> as UserDocument);

    (jwtLib.generateAccessToken as jest.Mock).mockReturnValueOnce(
      mockAccessToken
    );

    const result = await refreshAccessTokenService(mockRefreshToken);
    expect(result).toEqual({
      accessToken: mockAccessToken,
      userId: mockUserId,
    });
  });

  it('should throw API Error if user not found', async () => {
    (jwtLib.verifyRefreshToken as jest.Mock).mockReturnValueOnce({
      userId: mockUserId,
    } as JwtPayload);

    jest.spyOn(userDao, 'findUserById').mockResolvedValueOnce(null);

    await expect(refreshAccessTokenService(mockRefreshToken)).rejects.toThrow(
      APIError
    );
  });

  it('should throw API Error if refresh token does not match', async () => {
    (jwtLib.verifyRefreshToken as jest.Mock).mockReturnValueOnce({
      userId: mockUserId,
    } as JwtPayload);

    jest.spyOn(userDao, 'findUserById').mockResolvedValueOnce({
      _id: mockUserId,
      refreshToken: 'different-token',
    } as Partial<UserDocument> as UserDocument);

    await expect(refreshAccessTokenService(mockRefreshToken)).rejects.toThrow(
      APIError
    );
  });
});
