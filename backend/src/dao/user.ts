import User, { IUser } from '@/models/user';
import { HydratedDocument, Types } from 'mongoose';

export type CreateUser = Pick<
  IUser,
  'username' | 'email' | 'password' | 'role'
> & { _id?: Types.ObjectId };

export const findUserByEmailOrUsername = async (
  email: string,
  username?: string
): Promise<IUser | null> => {
  return await User.findOne({
    $or: [{ email }, ...(username ? [{ username }] : [])],
  }).lean<IUser>();
};

export const createUser = async (
  userData: CreateUser
): Promise<HydratedDocument<IUser>> => {
  return await User.create(userData);
};
