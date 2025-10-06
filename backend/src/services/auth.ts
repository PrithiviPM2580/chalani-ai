import { APIError } from '@/utils/apiError';
import { generateMongooseId } from '@/utils';
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  ResetLinkPayload,
  TokenPayload,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from '@/lib/jwt';
import config from '@/config/envValidation';
import * as userDao from '@/dao/user';
import { AuthValidation, ForgotPasswordValidation } from '@/validation/auth';
import logger from '@/lib/logger';
import { Types } from 'mongoose';
import { getTransporter } from '@/lib/nodemailer';
import {
  nodemailerTemplateForForgotPassword,
  nodemailerTemplateForResetPassword,
} from '@/utils/nodemailerTemplate';

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

export const refreshAccessTokenService = async (refreshToken: string) => {
  const { userId } = verifyRefreshToken(refreshToken) as TokenPayload;

  const user = await userDao.findUserById(userId);
  if (!user || user.refreshToken !== refreshToken) {
    logger.warn(`Invalid refresh token for userId: ${userId}`);
    throw new APIError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken({ userId });

  return { accessToken, userId };
};

export const forgotPasswordService = async ({
  email,
}: ForgotPasswordValidation) => {
  const isUserExist = await userDao.isEmailExist(email);
  if (!isUserExist) {
    logger.warn(
      `Failed password reset attempt for non-existent user: ${email}`
    );
    throw new APIError(404, 'User with this email does not exist');
  }

  const passwordResetToken = generatePasswordResetToken({ email });

  const user = await userDao.findUsernameWithResetPassword(email);
  if (!user) {
    logger.error(`User not found after existence check: ${email}`);
    throw new APIError(404, 'User with this email does not exist');
  }

  const transporter = getTransporter();
  const mail = await transporter.sendMail(
    nodemailerTemplateForForgotPassword(
      email,
      user.username,
      passwordResetToken
    )
  );
  if (!mail.messageId) {
    logger.error(`Failed to send password reset email to: ${email}`);
    throw new APIError(500, 'Failed to send password reset email');
  }

  logger.info(`Password reset email sent to: ${email}`);
  user.passwordResetToken = passwordResetToken;
  await user.save();
  return email;
};

export const resetPasswordService = async (token: string, password: string) => {
  // 1. Verify token
  const { email } = verifyPasswordResetToken(token) as ResetLinkPayload;

  if (!email) {
    logger.error('Invalid token payload: email is missing');
    throw new APIError(400, 'Invalid token payload: email is missing');
  }

  // 2. Find user
  const user = await userDao.findUserByEmail(email);
  if (!user) {
    logger.error(`User not found with email: ${email}`);
    throw new APIError(404, 'User not found');
  }

  // 3. Validate token exists
  if (!user.passwordResetToken) {
    logger.error(`Password reset token not set for user with email: ${email}`);
    throw new APIError(400, 'Password reset token not set');
  }

  // 4. Update password
  await userDao.updateUserPassword(user, password);

  const transporter = getTransporter();
  await transporter.sendMail(
    nodemailerTemplateForResetPassword(email, user.username)
  );
};
