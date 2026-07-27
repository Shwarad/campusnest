import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: [
        'fake_listing',
        'advance_payment',
        'wrong_info',
        'duplicate',
        'scam',
        'inappropriate',
        'other',
      ],
      required: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
    },
    adminNotes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', reportSchema);
