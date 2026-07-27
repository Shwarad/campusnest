import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  address: {
    street: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  propertyType: 'room' | 'pg' | 'hostel' | 'flat' | 'shared_room';
  rent: number;
  deposit: number;
  totalRooms: number;
  availableBeds: number;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  genderPreference: 'boys' | 'girls' | 'coed';
  amenities: {
    wifi: boolean;
    ac: boolean;
    attachedBathroom: boolean;
    parking: boolean;
    laundry: boolean;
    powerBackup: boolean;
    petFriendly: boolean;
    food: boolean;
    gym: boolean;
    tv: boolean;
    refrigerator: boolean;
    waterFilter: boolean;
  };
  houseRules: string[];
  availableFrom: Date;
  images: string[];
  owner: mongoose.Types.ObjectId;
  college: string;
  distanceFromCollege: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  isAvailable: boolean;
  isActive: boolean;
  views: number;
  avgRating: number;
  reviewCount: number;
  scamRiskScore: number;
  scamRiskLevel: 'low' | 'review_recommended' | 'high';
  scamRiskFlags: string[];
  nearbyFacilities: {
    name: string;
    type: string;
    distance: string;
  }[];
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    address: {
      street: { type: String, required: true },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    propertyType: {
      type: String,
      enum: ['room', 'pg', 'hostel', 'flat', 'shared_room'],
      required: true,
    },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, default: 1 },
    availableBeds: { type: Number, default: 1 },
    furnishing: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished'],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ['boys', 'girls', 'coed'],
      required: true,
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      attachedBathroom: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      food: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      refrigerator: { type: Boolean, default: false },
      waterFilter: { type: Boolean, default: false },
    },
    houseRules: [{ type: String }],
    availableFrom: { type: Date, required: true },
    images: [{ type: String }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    college: { type: String, required: true },
    distanceFromCollege: { type: Number, required: true },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    scamRiskScore: { type: Number, default: 0 },
    scamRiskLevel: {
      type: String,
      enum: ['low', 'review_recommended', 'high'],
      default: 'low',
    },
    scamRiskFlags: [{ type: String }],
    nearbyFacilities: [
      {
        name: { type: String },
        type: { type: String },
        distance: { type: String },
      },
    ],
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for common queries
propertySchema.index({ 'address.city': 1, rent: 1 });
propertySchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
propertySchema.index({ college: 1, distanceFromCollege: 1 });
propertySchema.index({ verificationStatus: 1, isActive: 1, isAvailable: 1 });
propertySchema.index({ title: 'text', description: 'text', 'address.locality': 'text' });

export default mongoose.model<IProperty>('Property', propertySchema);
