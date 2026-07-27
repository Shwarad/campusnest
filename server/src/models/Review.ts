import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  ratings: {
    roomQuality: number;
    locality: number;
    water: number;
    electricity: number;
    internet: number;
    ownerBehaviour: number;
    safety: number;
    valueForMoney: number;
  };
  overallRating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      roomQuality: { type: Number, required: true, min: 1, max: 5 },
      locality: { type: Number, required: true, min: 1, max: 5 },
      water: { type: Number, required: true, min: 1, max: 5 },
      electricity: { type: Number, required: true, min: 1, max: 5 },
      internet: { type: Number, required: true, min: 1, max: 5 },
      ownerBehaviour: { type: Number, required: true, min: 1, max: 5 },
      safety: { type: Number, required: true, min: 1, max: 5 },
      valueForMoney: { type: Number, required: true, min: 1, max: 5 },
    },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per student per property
reviewSchema.index({ property: 1, student: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
