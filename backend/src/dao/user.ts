import { GoogleData } from '@/@types';
import User, { IUser, UserDocument } from '@/models/user';
import { HydratedDocument, Types } from 'mongoose';

export type CreateUser = Pick<
  IUser,
  'username' | 'email' | 'password' | 'role'
> & { _id?: Types.ObjectId };

export const createUser = async (
  userData: CreateUser
): Promise<HydratedDocument<IUser>> => {
  return await User.create(userData);
};
export const findUserByEmailOrUsername = async (
  identifier?: string
): Promise<UserDocument | null> => {
  return await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+password');
};

export const isEmailExist = async (email?: string): Promise<boolean> => {
  const exist = await User.exists({ email });
  return exist !== null;
};

export const isUserExistByEmailOrUsername = async (
  email: string,
  username?: string
): Promise<boolean> => {
  const exist = await User.exists({
    $or: [{ email }, ...(username ? [{ username }] : [])],
  });
  return exist !== null;
};

export const findUserByEmail = async (
  email: string
): Promise<UserDocument | null> => {
  return await User.findOne({ email }).select('+password').lean<UserDocument>();
};

export const findOne = async (email: string): Promise<UserDocument | null> => {
  return await User.findOne({ email });
};

export const clearRefreshToken = async (userId?: Types.ObjectId) => {
  return await User.updateOne(
    { _id: userId },
    { $set: { refreshToken: null } }
  );
};

export const createGoogleUser = async (
  googleData: GoogleData
): Promise<HydratedDocument<IUser>> => {
  return await User.create(googleData);
};

export const findUserByGoogleId = async (
  googleId?: string
): Promise<UserDocument | null> => {
  return await User.findOne({ googleId }).select('+password');
};

export const setRefreshToken = async (
  userId: Types.ObjectId | string,
  token: string
): Promise<UserDocument | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: token } },
    { new: true }
  ).select('+refreshToken');
};

export const findUserById = async (
  userId?: Types.ObjectId | string
): Promise<UserDocument | null> => {
  return await User.findById(userId);
};
