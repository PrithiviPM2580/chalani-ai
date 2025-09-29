import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileType?: string;
  fileUrl?: string;
  parsed: boolean;
}

const fileSchema = new Schema<IFile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileType: { type: String }, // pdf, image
    fileUrl: { type: String }, // S3 or local path
    parsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const File = mongoose.model<IFile>('File', fileSchema);

export default File;
