import { APIError } from '@/utils/apiError';
import { generateMongooseId } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config/envValidation';
import * as userDao from '@/dao/user';
import { AuthValidation } from '@/validation/auth';
import logger from '@/lib/logger';
import { Types } from 'mongoose';

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
    logger.warn(
      `Attempt to register with existing username or email: ${username}, ${email}`
    );
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

  logger.info(`New user registered: ${username} (${email})`);

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
    logger.warn(
      `Failed login attempt for identifier: ${identifier} due to non-existent user`
    );
    throw new APIError(401, 'Invalid email or password');
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    logger.warn(
      `Failed login attempt for identifier: ${identifier} due to incorrect password`
    );
    throw new APIError(401, 'Invalid email or password');
  }
  const userId = user._id;

  const refreshToken = generateRefreshToken({ userId });
  const accessToken = generateAccessToken({ userId });

  user.refreshToken = refreshToken;
  await user.save();

  logger.info(`User logged in: ${user.username} (${user.email})`);

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

export const logoutService = async (
  userId?: Types.ObjectId
): Promise<boolean> => {
  if (!userId) {
    logger.error(`UserId is requird for logout`);
    throw new APIError(400, 'UserId is requird for logout');
  }

  const result = await userDao.clearRefreshToken(userId);
  if (!result.acknowledged) {
    logger.error(`Failed to logout this user ${userId}`);
    throw new APIError(500, 'Failed to logout the user');
  }
  return true;
};

export const googleService = async ({
  googleId,
  email,
  displayName,
}: {
  googleId?: string;
  email?: string;
  displayName?: string;
}) => {
  let user = await userDao.findUserByGoogleId(googleId);
  if (user) return user;

  if (email) {
    user = await userDao.findOne(email);
    if (user) {
      user.googleId = googleId;
      await user.save();
      return user;
    }
  }
  const newUser = await userDao.createGoogleUser({
    googleId,
    email,
    displayName,
    role: 'user',
  });
  return newUser;
};
