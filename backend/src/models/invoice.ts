import mongoose, { Schema, Model } from 'mongoose';
import { IInvoice } from '@/@types';

const itemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
});

const paymentSchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'bank', 'paypal', 'stripe'] },
  transactionId: { type: String },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    currency: { type: String, default: 'USD' },
    billFrom: {
      businessName: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    billTo: {
      clientName: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    items: [itemSchema],
    discount: { type: Number, default: 0 },
    notes: { type: String },
    paymentTerms: { type: String },
    status: {
      type: String,
      enum: ['draft', 'unpaid', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    subTotal: { type: Number, required: true },
    taxTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    payments: [paymentSchema],
    isRecurring: { type: Boolean, default: false },
    recurrence: {
      interval: { type: String, enum: ['weekly', 'monthly', 'yearly'] },
      nextInvoiceDate: { type: Date },
    },
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
