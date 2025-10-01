import { APIError } from '@/utils/apiError';
import { generateMongooseId } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config/envValidation';
import * as userDao from '@/dao/user';
import { AuthValidation } from '@/validation/auth';

export const signUpService = async (data: AuthValidation) => {
  const { email, username, password, role } = data;
  const roleToSave: 'user' | 'admin' = role ?? 'user';

  if (roleToSave === 'admin' && !config.WHITELIST_ADMIN.includes(email)) {
    throw new APIError(403, 'Email is not authorized to register as admin');
  }

  const existingUser = await userDao.findUserByEmailOrUsername(email, username);
  if (existingUser) {
    if (existingUser.email === email)
      throw new APIError(409, 'Email is already in use');
    if (username && existingUser.username === username)
      throw new APIError(409, 'Username is already in use');
  }

  const userId = generateMongooseId();
  const user = await userDao.createUser({
    _id: userId,
    username,
    email,
    password,
    role: roleToSave,
  });

  const refreshToken = generateRefreshToken({ userId });
  const accessToken = generateAccessToken({ userId });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      passwordResetToken: user.passwordResetToken,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};
