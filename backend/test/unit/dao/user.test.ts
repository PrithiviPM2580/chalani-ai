import { createUser, isUserExistByEmailOrUsername } from '@/dao/user';
import User from '@/models/user';

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

  it('should find user by email', async () => {
    await createUser({
      email: 'findme@test.com',
      username: 'finduser',
      password: 'password123',
      role: 'user',
    });

    const found = await isUserExistByEmailOrUsername('findme@test.com');
    expect(found).toBe(true);
  });

  it('should find user by username', async () => {
    await createUser({
      email: 'user@test.com',
      username: 'uniqueuser',
      password: 'password123',
      role: 'user',
    });

    const found = await isUserExistByEmailOrUsername(
      'other@test.com',
      'uniqueuser'
    );
    expect(found).toBe(true);
  });

  it('should return null if no user found', async () => {
    const found = await isUserExistByEmailOrUsername('notfound@test.com');
    expect(found).toBe(false);
  });

  it('should return null if no user found', async () => {
    const found = await isUserExistByEmailOrUsername('notfound@test.com');
    expect(found).toBe(false);
  });
});
