import mongoose, { Document, Schema } from 'mongoose';

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  studentName: string;
  contactNumber: string;
  preferredVisitDate: Date;
  moveInDate: Date;
  message: string;
  status: 'pending' | 'seen' | 'responded' | 'closed';
  ownerResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    preferredVisitDate: { type: Date, required: true },
    moveInDate: { type: Date, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'seen', 'responded', 'closed'],
      default: 'pending',
    },
    ownerResponse: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>('Enquiry', enquirySchema);
