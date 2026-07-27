import mongoose, { Document, Schema } from 'mongoose';

export interface IRoommateProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  college: string;
  budget: { min: number; max: number };
  preferredLocality: string;
  moveInDate: Date;
  roomType: 'single' | 'shared' | 'pg' | 'hostel' | 'flat';
  genderPreference: 'male' | 'female' | 'any';
  sleepSchedule: 'early_bird' | 'night_owl' | 'flexible';
  studyHabits: 'quiet' | 'with_music' | 'social' | 'flexible';
  cleanliness: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
  smoking: boolean;
  drinking: boolean;
  foodPreference: 'veg' | 'non_veg' | 'any';
  noiseTolerance: 'low' | 'medium' | 'high';
  visitors: 'never' | 'occasional' | 'frequent';
  pets: boolean;
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roommateProfileSchema = new Schema<IRoommateProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    college: { type: String, required: true },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    preferredLocality: { type: String, required: true },
    moveInDate: { type: Date, required: true },
    roomType: {
      type: String,
      enum: ['single', 'shared', 'pg', 'hostel', 'flat'],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any',
    },
    sleepSchedule: {
      type: String,
      enum: ['early_bird', 'night_owl', 'flexible'],
      required: true,
    },
    studyHabits: {
      type: String,
      enum: ['quiet', 'with_music', 'social', 'flexible'],
      required: true,
    },
    cleanliness: {
      type: String,
      enum: ['very_clean', 'clean', 'moderate', 'relaxed'],
      required: true,
    },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    foodPreference: {
      type: String,
      enum: ['veg', 'non_veg', 'any'],
      default: 'any',
    },
    noiseTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    visitors: {
      type: String,
      enum: ['never', 'occasional', 'frequent'],
      default: 'occasional',
    },
    pets: { type: Boolean, default: false },
    bio: { type: String, maxlength: 500, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRoommateProfile>('RoommateProfile', roommateProfileSchema);
