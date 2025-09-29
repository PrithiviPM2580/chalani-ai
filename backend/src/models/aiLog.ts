import mongoose, { Schema, Document } from 'mongoose';

export interface IAILog extends Document {
  userId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  fileId?: mongoose.Types.ObjectId;
  action: string;
  details: mongoose.Schema.Types.Mixed;
}

const aiLogSchema = new Schema<IAILog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    action: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AiLog = mongoose.model<IAILog>('AiLog', aiLogSchema);

export default AiLog;
