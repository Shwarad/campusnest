// Shared property type for the recommendation utility (no Prisma/Mongoose dependency)
export interface PropertyForRecommendation {
  id: string;
  title: string;
  description: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  propertyType: string;
  rent: number;
  deposit: number;
  totalRooms: number;
  availableBeds: number;
  furnishing: string;
  genderPreference: string;
  houseRules: string[];
  images: string[];
  college: string;
  distanceFromCollege: number;
  verificationStatus: string;
  isAvailable: boolean;
  isActive: boolean;
  views: number;
  avgRating: number;
  reviewCount: number;
  scamRiskScore: number;
  scamRiskLevel: string;
  scamRiskFlags: string[];
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
  amenities?: Record<string, boolean>;
  address?: { street: string; locality: string; city: string; state: string; pincode: string };
  coordinates?: { lat: number; lng: number };
  wifi?: boolean;
  ac?: boolean;
  attachedBathroom?: boolean;
  parking?: boolean;
  laundry?: boolean;
  powerBackup?: boolean;
  petFriendly?: boolean;
  food?: boolean;
  gym?: boolean;
  tv?: boolean;
  refrigerator?: boolean;
  waterFilter?: boolean;
}

// Shared roommate profile type for the compatibility utility
export interface RoommateProfileForCompatibility {
  id: string;
  userId: string;
  name: string;
  college: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocality: string;
  moveInDate: Date;
  roomType: string;
  genderPreference: string;
  sleepSchedule: string;
  studyHabits: string;
  cleanliness: string;
  smoking: boolean;
  drinking: boolean;
  foodPreference: string;
  noiseTolerance: string;
  visitors: string;
  pets: boolean;
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Legacy compat: allow budget object shape from tests
  budget?: { min: number; max: number };
}
