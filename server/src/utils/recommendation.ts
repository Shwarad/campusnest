import { IProperty } from '../models/Property';

interface RecommendationResult {
  score: number;
  reasons: string[];
  matchPercentage: number;
}

interface UserPreferences {
  budget?: number;
  college?: string;
  amenities?: string[];
  propertyType?: string;
  furnishing?: string;
  genderPreference?: string;
}

export function calculatePropertyRecommendation(
  property: IProperty,
  preferences: UserPreferences
): RecommendationResult {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Budget match (30 points)
  if (preferences.budget) {
    if (property.rent <= preferences.budget) {
      const savingPct = Math.round(((preferences.budget - property.rent) / preferences.budget) * 100);
      score += 30;
      if (savingPct > 10) {
        reasons.push(`₹${property.rent.toLocaleString('en-IN')}/mo — ₹${(preferences.budget - property.rent).toLocaleString('en-IN')} under your budget`);
      } else {
        reasons.push(`Within your budget of ₹${preferences.budget.toLocaleString('en-IN')}`);
      }
    } else if (property.rent <= preferences.budget * 1.1) {
      score += 15;
      reasons.push('Slightly above budget but close');
    }
  } else {
    score += 15; // neutral
  }

  // Distance from college (20 points)
  if (property.distanceFromCollege <= 0.5) {
    score += 20;
    reasons.push(`Only ${property.distanceFromCollege} km from campus`);
  } else if (property.distanceFromCollege <= 1) {
    score += 17;
    reasons.push(`${property.distanceFromCollege} km from campus`);
  } else if (property.distanceFromCollege <= 2) {
    score += 12;
    reasons.push(`${property.distanceFromCollege} km from campus`);
  } else if (property.distanceFromCollege <= 5) {
    score += 6;
  }

  // Verification status (15 points)
  if (property.verificationStatus === 'verified') {
    score += 15;
    reasons.push('Verified property');
  } else if (property.verificationStatus === 'pending') {
    score += 5;
  }

  // Rating (15 points)
  if (property.avgRating >= 4.5) {
    score += 15;
    reasons.push(`Highly rated (${property.avgRating}★)`);
  } else if (property.avgRating >= 4.0) {
    score += 12;
    reasons.push(`Well rated (${property.avgRating}★)`);
  } else if (property.avgRating >= 3.5) {
    score += 8;
  } else if (property.avgRating > 0) {
    score += 4;
  } else {
    score += 5; // no reviews yet, neutral
  }

  // Amenities match (10 points)
  if (preferences.amenities && preferences.amenities.length > 0) {
    const amenityMap = property.amenities as unknown as Record<string, boolean>;
    const matched = preferences.amenities.filter((a) => amenityMap[a]);
    const amenityScore = (matched.length / preferences.amenities.length) * 10;
    score += Math.round(amenityScore);
    if (matched.length > 0) {
      const amenityNames = matched.slice(0, 3).map((a) => {
        const names: Record<string, string> = {
          wifi: 'Wi-Fi', ac: 'AC', attachedBathroom: 'Attached Bathroom',
          parking: 'Parking', laundry: 'Laundry', food: 'Food included',
        };
        return names[a] || a;
      });
      reasons.push(`Includes ${amenityNames.join(', ')}`);
    }
  } else {
    score += 5;
  }

  // Property type match (5 points)
  if (preferences.propertyType && property.propertyType === preferences.propertyType) {
    score += 5;
  } else {
    score += 2;
  }

  // Availability (5 points)
  if (property.isAvailable) {
    score += 5;
    reasons.push('Available now');
  }

  const matchPercentage = Math.min(100, Math.round(score));

  return { score, reasons: reasons.slice(0, 4), matchPercentage };
}

export function calculateScamRisk(property: IProperty, avgRentInArea: number): {
  score: number;
  level: 'low' | 'review_recommended' | 'high';
  flags: string[];
} {
  const flags: string[] = [];
  let riskScore = 0;

  // Rent significantly below market
  if (avgRentInArea > 0 && property.rent < avgRentInArea * 0.5) {
    flags.push('Rent is significantly below similar listings');
    riskScore += 30;
  } else if (avgRentInArea > 0 && property.rent < avgRentInArea * 0.7) {
    flags.push('Rent is below average for this area');
    riskScore += 15;
  }

  // Missing address
  if (!property.address.street || property.address.street.length < 5) {
    flags.push('Missing or incomplete property address');
    riskScore += 20;
  }

  // New owner account (within 7 days)
  // (handled at controller level via owner createdAt)

  // No images
  if (!property.images || property.images.length === 0) {
    flags.push('No property photos uploaded');
    riskScore += 15;
  }

  // Inconsistent deposit (deposit > 3x monthly rent is unusual)
  if (property.deposit > property.rent * 6) {
    flags.push('Unusually high security deposit');
    riskScore += 15;
  }

  // No contact email/phone
  if (!property.contactPhone || !property.contactEmail) {
    flags.push('Incomplete contact information');
    riskScore += 10;
  }

  // Unverified property
  if (property.verificationStatus === 'unverified') {
    riskScore += 5;
  }

  const level: 'low' | 'review_recommended' | 'high' =
    riskScore >= 40 ? 'high' : riskScore >= 20 ? 'review_recommended' : 'low';

  return { score: riskScore, level, flags };
}
