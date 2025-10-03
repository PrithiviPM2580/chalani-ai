import mongoose, { Schema, HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  username?: string;
  email: string;
  password?: string;
  googleId?: string;
  displayName?: string;
  businessName?: string;
  address?: string;
  phoneNumber?: string;
  refreshToken?: string;
  passwordResetToken?: string;
  role: 'user' | 'admin';

  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser>;

export type UserObject = IUser;

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      maxLength: [50, 'Username must be less than 50 characters'],
      minLength: [3, 'Username must be at least 3 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [100, 'Email must be less than 100 characters'],
      minLength: [5, 'Email must be at least 5 characters'],
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: [6, 'Password must be at least 6 characters'],
      trim: true,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: {
      type: String,
      maxLength: [100, 'Display name must be less than 100 characters'],
      trim: true,
    },
    businessName: {
      type: String,
      maxLength: [100, 'Business name must be less than 100 characters'],
      trim: true,
    },
    address: {
      type: String,
      maxLength: [200, 'Address must be less than 200 characters'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      maxLength: [15, 'Phone number must be less than 15 characters'],
      trim: true,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
