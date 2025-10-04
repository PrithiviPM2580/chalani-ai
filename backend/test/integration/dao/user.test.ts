import {
  clearRefreshToken,
  createUser,
  findUserByEmailOrUsername,
  isEmailExist,
  isUserExistByEmailOrUsername,
} from '@/dao/user';
import User from '@/models/user';
import mongoose from 'mongoose';

afterEach(async () => {
  await User.deleteMany({});
});

describe('User DAO', () => {
  it('should create a user', async () => {
    const user = await createUser({
      email: 'dao@test.com',
      username: 'daouser',
      password: 'password123',
      role: 'user',
    });

    expect(user.email).toBe('dao@test.com');
    expect(user.username).toBe('daouser');
  });

  it('should find user by email or username through identifier', async () => {
    await createUser({
      email: 'findme@test.com',
      username: 'finduser',
      password: 'password123',
      role: 'user',
    });

    const userByEmail = await findUserByEmailOrUsername('findme@test.com');
    expect(userByEmail?.username).toBe('finduser');

    const userByUsername = await findUserByEmailOrUsername('finduser');
    expect(userByUsername?.email).toBe('findme@test.com');
  });

  it('should check if email is exist', async () => {
    await createUser({
      email: 'user@test.com',
      username: 'uniqueuser',
      password: 'password123',
      role: 'user',
    });

    const found = await isEmailExist('user@test.com');
    expect(found).toBe(true);
  });

  it('should return true if user exists by email', async () => {
    await createUser({
      email: 'user@test.com',
      username: 'uniqueuser',
      password: 'password123',
      role: 'user',
    });

    const exists = await isUserExistByEmailOrUsername('user@test.com');
    expect(exists).toBe(true);
  });

  it('should return true if user exists by username', async () => {
    await createUser({
      email: 'user@test.com',
      username: 'uniqueuser',
      password: 'password123',
      role: 'user',
    });

    const exists = await isUserExistByEmailOrUsername(
      'wrong@test.com',
      'uniqueuser'
    );
    expect(exists).toBe(true);
  });

  it('should return false if user or email does not exist', async () => {
    const exists = await isUserExistByEmailOrUsername(
      'user@test.com',
      'uniqueuser'
    );
    expect(exists).toBe(false);
  });

  it('should return false if only email is provided and not found', async () => {
    const exists = await isUserExistByEmailOrUsername('notfound@test.com');
    expect(exists).toBe(false);
  });

  it('should return true if both email and username exist for same user', async () => {
    await createUser({
      email: 'both@test.com',
      username: 'bothuser',
      password: 'password123',
      role: 'user',
    });

    const exists = await isUserExistByEmailOrUsername(
      'both@test.com',
      'bothuser'
    );
    expect(exists).toBe(true);
  });

  it('should clear refresh token for a user', async () => {
    const user = await createUser({
      email: 'clear@test.com',
      username: 'clearuser',
      password: 'password123',
      role: 'user',
    });

    // explicitly set refresh token after creating the user
    await User.findByIdAndUpdate(user._id, {
      refreshToken: 'some-refresh-token',
    });

    // retrieve user with refreshToken field included
    const preUser = await User.findById(user._id).select('+refreshToken');
    expect(preUser?.refreshToken).toBe('some-refresh-token');

    await clearRefreshToken(user._id);

    const updatedUser = await User.findById(user._id).select('+refreshToken');
    expect(updatedUser?.refreshToken).toBeNull();
  });

  it('should not modify if userId doenot exist', async () => {
    const fakedId = new mongoose.Types.ObjectId();
    const result = await clearRefreshToken(fakedId);

    expect(result.acknowledged).toBe(true);
    expect(result.modifiedCount).toBe(0);
    expect(result.matchedCount).toBe(0);
  });
});
