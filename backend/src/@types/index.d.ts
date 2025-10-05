import { IUser, UserDocument } from '@/models/user';
import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
      user?: UserDocument;
    }
  }
}

export type SuccessResponse<T> = {
  success: true;
  status: 'success';
  message: string;
  data: T;
};

export interface IItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
  discount?: number;
}

export interface IPayment {
  amount: number;
  date: Date;
  method: 'cash' | 'bank' | 'paypal' | 'stripe';
  transactionId?: string;
}

export interface IRecurrence {
  interval?: 'weekly' | 'monthly' | 'yearly';
  nextInvoiceDate?: Date;
}

export interface IInvoice extends Document {
  user: Types.ObjectId; // Reference to User
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  currency: string;
  billFrom: {
    businessName: string;
    address: string;
    email: string;
    phoneNumber: string;
  };
  billTo: {
    clientName: string;
    address: string;
    email: string;
    phoneNumber: string;
  };
  items: IItem[];
  discount?: number;
  notes?: string;
  paymentTerms?: string;
  status: 'draft' | 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  subTotal: number;
  taxTotal: number;
  total: number;
  balanceDue: number;
  payments: IPayment[];
  isRecurring: boolean;
  recurrence?: IRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

export type GoogleData = Pick<
  IUser,
  'googleId',
  'email',
  'displayName',
  'role'
>;
