// ──────────────────────────────────────────────────────────
// Core Types for CampusNest
// ──────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  college?: string;
  isVerified: boolean;
  identityStatus: 'unverified' | 'pending' | 'verified';
  avatar?: string;
  savedProperties: string[];
  createdAt: string;
}

export interface Address {
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Amenities {
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
}

export interface NearbyFacility {
  name: string;
  type: string;
  distance: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  address: Address;
  coordinates: { lat: number; lng: number };
  propertyType: 'room' | 'pg' | 'hostel' | 'flat' | 'shared_room';
  rent: number;
  deposit: number;
  totalRooms: number;
  availableBeds: number;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  genderPreference: 'boys' | 'girls' | 'coed';
  amenities: Amenities;
  houseRules: string[];
  availableFrom: string;
  images: string[];
  owner: User | string;
  college: string;
  distanceFromCollege: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  isAvailable: boolean;
  views: number;
  avgRating: number;
  reviewCount: number;
  scamRiskScore: number;
  scamRiskLevel: 'low' | 'review_recommended' | 'high';
  scamRiskFlags: string[];
  nearbyFacilities: NearbyFacility[];
  contactPhone: string;
  contactEmail: string;
  matchPercentage?: number;
  matchReasons?: string[];
  createdAt: string;
}

export interface Review {
  _id: string;
  property: string;
  student: User | string;
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
  createdAt: string;
}

export interface RoommateProfile {
  _id: string;
  user: User | string;
  name: string;
  college: string;
  budget: { min: number; max: number };
  preferredLocality: string;
  moveInDate: string;
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
}

export interface CompatibilityResult {
  score: number;
  breakdown: Record<string, number>;
  strongMatches: string[];
  explanation: string;
}

export interface RoommateMatch {
  profile: RoommateProfile;
  compatibility: CompatibilityResult;
}

export interface Enquiry {
  _id: string;
  property: Property | string;
  student: User | string;
  owner: string;
  studentName: string;
  contactNumber: string;
  preferredVisitDate: string;
  moveInDate: string;
  message: string;
  status: 'pending' | 'seen' | 'responded' | 'closed';
  ownerResponse?: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  property: Property | string;
  reportedBy: User | string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  adminNotes?: string;
  createdAt: string;
}

export interface PropertyFilters {
  search?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: string;
  furnishing?: string;
  genderPreference?: string;
  wifi?: boolean;
  ac?: boolean;
  attachedBathroom?: boolean;
  parking?: boolean;
  laundry?: boolean;
  food?: boolean;
  powerBackup?: boolean;
  petFriendly?: boolean;
  verifiedOnly?: boolean;
  college?: string;
  maxDistance?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalOwners: number;
  totalProperties: number;
  activeProperties: number;
  verifiedProperties: number;
  pendingVerifications: number;
  pendingReports: number;
  totalEnquiries: number;
  totalReviews: number;
}
