import { APIError } from '@/utils/apiError';
import { generateMongooseId } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config/envValidation';
import * as userDao from '@/dao/user';
import { AuthValidation } from '@/validation/auth';

type LoginValidation = {
  identifier?: string;
  password: string;
};

export const signUpService = async (data: AuthValidation) => {
  const { email, username, password, role } = data;
  const roleToSave: 'user' | 'admin' = role ?? 'user';

  if (roleToSave === 'admin' && !config.WHITELIST_ADMIN.includes(email)) {
    throw new APIError(403, 'Email is not authorized to register as admin');
  }

  const isUsernameAndEmailExist = await userDao.isUserExistByEmailOrUsername(
    email,
    username
  );
  if (isUsernameAndEmailExist) {
    throw new APIError(409, 'Username or email already in use');
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

export const loginService = async (data: LoginValidation) => {
  const { identifier, password } = data;

  const user = await userDao.findUserByEmailOrUsername(identifier);
  if (!user) {
    throw new APIError(401, 'Invalid email or password');
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new APIError(401, 'Invalid email or password');
  }
  const userId = user._id;

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
