import User, { IUser } from '@/models/user';
import { Types } from 'mongoose';

export type CreateUser = Pick<
  IUser,
  'username' | 'email' | 'password' | 'role'
> & {
  _id?: Types.ObjectId;
};

export const findUserByEmailOrUsername = async (
  email: string,
  username?: string
) => {
  return User.findOne({
    $or: [{ email }, ...(username ? [{ username }] : [])],
  })
    .lean()
    .exec();
};

export const createUser = async (userData: CreateUser) => {
  return User.create(userData);
};
