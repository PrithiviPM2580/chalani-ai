import { signUpService } from '@/services/auth';
import { APIError } from '@/utils/apiError';
import * as userDao from '@/dao/user';
import config from '@/config/envValidation';
import { AuthValidation } from '@/validation/auth';

// Mock the external dependencies
jest.mock('@/utils', () => ({
  generateMongooseId: jest.fn(() => 'mock-id'),
}));

jest.mock('@/lib/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
}));

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
