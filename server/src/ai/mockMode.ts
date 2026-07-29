/**
 * mockMode.ts
 *
 * Offline mock mode for demonstration when IBM watsonx.ai credentials
 * or internet access are unavailable.
 *
 * Set AI_MOCK_MODE=true in .env to enable.
 */

export const MOCK_MODE =
  process.env.AI_MOCK_MODE === 'true' ||
  (!process.env.IBM_WATSONX_API_KEY && process.env.NODE_ENV !== 'test');

import type { PropertyComparisonResponse } from './responseSchemas';
import type { ListingSummary } from './responseSchemas';
import type { RoommateExplanation } from './responseSchemas';
import type { ReviewSummary } from './responseSchemas';
import type { ScamRiskExplanation } from './responseSchemas';
import type { ParsedSearchResult } from './naturalSearch.service';

// ── Natural language search mock ──────────────────────────────────────────────

export function mockNaturalSearch(query: string): ParsedSearchResult {
  const q = query.toLowerCase();
  const filters: ParsedSearchResult['filters'] = {
    sortBy: 'relevance',
    verifiedOnly: false,
    amenities: [],
    propertyTypes: [],
    keywords: [],
  };

  if (q.includes('7000') || q.includes('7,000'))  filters.maximumRent = 7000;
  if (q.includes('8000') || q.includes('8,000'))  filters.maximumRent = 8000;
  if (q.includes('5000') || q.includes('5,000'))  filters.maximumRent = 5000;
  if (q.includes('verified'))   filters.verifiedOnly = true;
  if (q.includes('cotton'))     filters.college = 'Cotton University';
  if (q.includes('gauhati'))    filters.college = 'Gauhati University';
  if (q.includes('assam engineering')) filters.college = 'Assam Engineering College';
  if (q.includes('wifi') || q.includes('wi-fi')) filters.amenities!.push('wifi');
  if (q.includes('food'))       filters.amenities!.push('food');
  if (q.includes('pg'))         filters.propertyTypes!.push('pg');
  if (q.includes('room'))       filters.propertyTypes!.push('room');
  if (q.includes('girls'))      filters.genderPreference = 'girls';
  if (q.includes('boys'))       filters.genderPreference = 'boys';
  if (q.includes('2 km') || q.includes('2km')) filters.maximumDistanceKm = 2;

  return {
    filters,
    interpretation: `Showing mock results for: "${query}"`,
    aiAssisted: true,
  };
}

// ── Property comparison mock ──────────────────────────────────────────────────

export function mockPropertyComparison(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comparison: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _preferences: any
): PropertyComparisonResponse {
  const best = comparison.reduce((a, b) =>
    (a.avgRating + (a.verificationStatus === 'verified' ? 1 : 0)) >=
    (b.avgRating + (b.verificationStatus === 'verified' ? 1 : 0)) ? a : b
  );

  return {
    recommendedPropertyId: best.id,
    summary:  `${best.title} is the strongest overall match based on the available data.`,
    reasons:  [
      `Located ${best.distanceFromCollege} km from the selected college`,
      `Monthly rent of ₹${best.rent.toLocaleString('en-IN')}`,
      best.verificationStatus === 'verified' ? 'Verified by CampusNest' : 'Currently unverified',
      best.food ? 'Meals included' : 'Self-catering arrangement',
    ],
    tradeoffs: comparison.map((p) => ({
      propertyId:  p.id,
      advantages:  [
        `Rent: ₹${p.rent.toLocaleString('en-IN')}/month`,
        p.avgRating > 0 ? `Rated ${p.avgRating}★` : 'No reviews yet',
      ],
      limitations: p.missingPreferredAmenities?.length
        ? [`Missing amenities: ${p.missingPreferredAmenities.join(', ')}`]
        : ['No major limitations identified'],
    })),
    disclaimer: 'This recommendation is based on the preferences and listing information available.',
  };
}

// ── Listing summary mock ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockListingSummary(property: any): ListingSummary {
  const amenities: string[] = [];
  if (property.wifi)             amenities.push('Wi-Fi included');
  if (property.food)             amenities.push('Meals provided');
  if (property.ac)               amenities.push('Air conditioning');
  if (property.attachedBathroom) amenities.push('Attached bathroom');
  if (property.parking)          amenities.push('Parking available');

  const missing: string[] = [];
  if (!property.wifi)  missing.push('Wi-Fi not listed — confirm with owner');
  if (!property.food)  missing.push('Food not included — plan for separate expenses');
  if (property.verificationStatus !== 'verified') missing.push('Property not yet verified by CampusNest');

  return {
    bestFor: `Students seeking affordable ${property.propertyType} accommodation ${property.distanceFromCollege} km from ${property.college}.`,
    advantages: [
      `₹${property.rent.toLocaleString('en-IN')}/month rent`,
      `${property.distanceFromCollege} km from ${property.college}`,
      ...amenities.slice(0, 3),
    ],
    limitations: missing,
    questionsForOwner: [
      'Are electricity and water charges included in the rent?',
      'Is there a fixed entry/exit time?',
      'What is the notice period before vacating?',
      'Is the security deposit fully refundable?',
    ],
  };
}

// ── Roommate explanation mock ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockRoommateExplanation(ctx: any): RoommateExplanation {
  const strong = ctx.strongMatchCategories ?? [];
  return {
    summary: strong.length >= 3
      ? `You appear highly compatible — strong matches in ${strong.slice(0, 3).join(', ')}.`
      : 'You have a moderate compatibility level with some shared preferences.',
    strongMatches: strong,
    differences: ctx.categories?.sleepSchedule < 60
      ? ['Sleep schedules differ — worth a conversation before deciding.']
      : [],
    discussionSuggestions: [
      'Discuss daily routines and preferred quiet hours.',
      'Agree on cleanliness standards before moving in.',
      'Clarify the visitors and guests policy.',
    ],
    disclaimer: 'Compatibility scores provide guidance and do not guarantee a successful living arrangement.',
  };
}

// ── Review summary mock ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockReviewSummary(reviews: any[]): ReviewSummary {
  const avg = reviews.reduce((s, r) => s + (r.overallRating ?? r.rating ?? 4), 0) / reviews.length;
  const sentiment = avg >= 4 ? 'mostly_positive' : avg >= 3 ? 'mixed' : 'mostly_negative';
  return {
    overallSentiment: sentiment,
    positiveThemes:   ['Good location', 'Helpful owner', 'Reliable water supply'],
    negativeThemes:   reviews.length > 5 ? ['Evening Wi-Fi speed', 'Occasional noise'] : [],
    summary:          `${reviews.length} students reviewed this property with an average rating of ${avg.toFixed(1)}★. Most highlighted the convenient location and owner responsiveness.`,
    reviewCount:      reviews.length,
  };
}

// ── Scam explanation mock ─────────────────────────────────────────────────────

export function mockScamExplanation(
  risk: { score: number; flags: string[] },
  status: 'low_risk' | 'review_recommended' | 'high_caution'
): ScamRiskExplanation {
  const flagText = risk.flags.length > 0
    ? `The following signals were detected: ${risk.flags.slice(0, 3).join('; ')}.`
    : 'No significant risk signals were detected.';

  return {
    status,
    explanation: flagText,
    recommendedActions: [
      'Visit the property before making any payment.',
      'Request a written rental agreement.',
      'Verify the owner\'s identity with a government-issued ID.',
      'Do not transfer money before an in-person or verified video tour.',
    ],
    disclaimer: 'This automated warning does not prove that the listing is fraudulent.',
  };
}

// ── Chat mock ─────────────────────────────────────────────────────────────────

export function mockChatResponse(message: string): {
  reply: string;
  propertyRefs: string[];
  suggestedActions: string[];
} {
  const m = message.toLowerCase();

  if (m.includes('question') && (m.includes('visit') || m.includes('rent'))) {
    return {
      reply: 'Before renting, ask the owner: (1) Are electricity and water charges included? (2) What is the notice period? (3) Is the deposit fully refundable? (4) Are there any restrictions on guests? (5) Who handles maintenance issues?',
      propertyRefs: [],
      suggestedActions: ['Book a property visit', 'Check the scam risk rating', 'Compare with other listings'],
    };
  }

  if (m.includes('save') || m.includes('saved') || m.includes('favourit')) {
    return {
      reply: 'Your saved properties are available in your Student Dashboard under "Saved Listings". You can compare up to 3 properties by selecting them and clicking "Compare with NestAI".',
      propertyRefs: [],
      suggestedActions: ['Go to saved listings', 'Compare properties'],
    };
  }

  if (m.includes('safe') || m.includes('scam') || m.includes('risk')) {
    return {
      reply: 'CampusNest automatically calculates a scam-risk score for every listing. Look for the risk badge on each property page. Always visit in person before paying, and request a written agreement.',
      propertyRefs: [],
      suggestedActions: ['Check risk ratings', 'Report a suspicious listing'],
    };
  }

  return {
    reply: 'I\'m NestAI, your CampusNest housing assistant. I can help you find accommodation, compare properties, understand roommate compatibility, and answer questions about renting safely. What would you like to know?',
    propertyRefs: [],
    suggestedActions: ['Search for properties', 'Compare my shortlist', 'Find a roommate'],
  };
}
