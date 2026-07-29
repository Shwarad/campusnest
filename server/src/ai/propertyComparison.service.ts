/**
 * propertyComparison.service.ts
 *
 * Deterministic property comparison calculations + Granite explanation.
 *
 * Architecture:
 *   1. Fetch all property data server-side (never trust client-provided values).
 *   2. Calculate every numerical metric in backend code.
 *   3. Strip sensitive fields (phone, email, internal admin notes).
 *   4. Pass only the sanitised comparison object to Granite.
 *   5. Ask Granite for a concise, neutral explanation only.
 *   6. Validate response with Zod.
 */

import { prisma } from '../config/database';
import { generateText, extractJson } from './graniteClient';
import { propertyComparisonPrompt } from './promptTemplates';
import { PropertyComparisonResponseSchema, PropertyComparisonResponse } from './responseSchemas';
import { MOCK_MODE, mockPropertyComparison } from './mockMode';

export interface ComparisonPreferences {
  college?: string;
  maximumRent?: number;
  importantAmenities?: string[];
  priority?: 'distance' | 'rent' | 'rating' | 'amenities' | 'verification';
}

interface PropertyMetrics {
  id: string;
  title: string;
  propertyType: string;
  rent: number;
  deposit: number;
  distanceFromCollege: number;
  estimatedMonthlyExpense: number;
  pricePerOccupant: number;
  amenitiesCount: number;
  missingPreferredAmenities: string[];
  avgRating: number;
  scamRiskLevel: string;
  verificationStatus: string;
  furnishing: string;
  food: boolean;
  availableFrom: string;
  isAvailable: boolean;
  locality: string;
  college: string;
}

// ── Sensitive field removal ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripSensitiveFields(p: any): Omit<typeof p, 'contactPhone' | 'contactEmail' | 'ownerId' | 'owner'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contactPhone, contactEmail, ownerId, owner, password, ...safe } = p;
  return safe;
}

function parseArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

// ── Deterministic calculations ─────────────────────────────────────────────────

function calculateMetrics(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any,
  preferences: ComparisonPreferences
): PropertyMetrics {
  const amenities = {
    wifi:             property.wifi,
    ac:               property.ac,
    attachedBathroom: property.attachedBathroom,
    parking:          property.parking,
    laundry:          property.laundry,
    powerBackup:      property.powerBackup,
    petFriendly:      property.petFriendly,
    food:             property.food,
    gym:              property.gym,
    tv:               property.tv,
    refrigerator:     property.refrigerator,
    waterFilter:      property.waterFilter,
  };

  const amenitiesCount = Object.values(amenities).filter(Boolean).length;
  const missingPreferredAmenities = (preferences.importantAmenities ?? []).filter(
    (a) => !(amenities as Record<string, boolean>)[a]
  );

  // Estimated monthly expense = rent + (deposit / 12) + food surcharge
  const foodSurcharge = property.food ? 0 : 2000; // rough estimate when food not included
  const estimatedMonthlyExpense = Math.round(property.rent + property.deposit / 12 + foodSurcharge);

  const totalBeds = Math.max(1, property.availableBeds || 1);
  const pricePerOccupant = Math.round(property.rent / totalBeds);

  return {
    id:                        property.id,
    title:                     property.title,
    propertyType:              property.propertyType,
    rent:                      property.rent,
    deposit:                   property.deposit,
    distanceFromCollege:       property.distanceFromCollege,
    estimatedMonthlyExpense,
    pricePerOccupant,
    amenitiesCount,
    missingPreferredAmenities,
    avgRating:                 property.avgRating,
    scamRiskLevel:             property.scamRiskLevel,
    verificationStatus:        property.verificationStatus,
    furnishing:                property.furnishing,
    food:                      property.food,
    availableFrom:             property.availableFrom,
    isAvailable:               property.isAvailable,
    locality:                  property.locality,
    college:                   property.college,
  };
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function compareProperties(
  propertyIds: string[],
  preferences: ComparisonPreferences
): Promise<{ comparison: PropertyMetrics[]; aiExplanation: PropertyComparisonResponse }> {
  if (propertyIds.length < 2 || propertyIds.length > 3) {
    throw new Error('Please select 2 or 3 properties to compare.');
  }

  // Fetch from DB — never trust client-provided property data
  const rawProperties = await prisma.property.findMany({
    where: { id: { in: propertyIds }, isActive: true },
    include: { facilities: true },
  });

  if (rawProperties.length !== propertyIds.length) {
    throw new Error('One or more properties could not be found.');
  }

  const comparison: PropertyMetrics[] = rawProperties.map((p) =>
    calculateMetrics(p, preferences)
  );

  if (MOCK_MODE) {
    const aiExplanation = mockPropertyComparison(comparison, preferences);
    return { comparison, aiExplanation };
  }

  // Build safe context for Granite (no PII)
  const safeContext = {
    properties: comparison,
    preferences,
  };

  let aiExplanation: PropertyComparisonResponse;

  try {
    const prompt = propertyComparisonPrompt(
      JSON.stringify(safeContext, null, 2),
      JSON.stringify(preferences, null, 2)
    );

    const result = await generateText(prompt, { maxNewTokens: 768, temperature: 0.2, jsonMode: true });
    const raw    = extractJson(result.text);
    const parsed = JSON.parse(raw);

    const validated = PropertyComparisonResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[propertyComparison] Zod validation failed, attempting repair:', validated.error.flatten());
      aiExplanation = buildFallbackComparison(comparison);
    } else {
      aiExplanation = validated.data;
    }
  } catch (err) {
    console.error('[propertyComparison] AI failed:', (err as Error).message);
    aiExplanation = buildFallbackComparison(comparison);
  }

  return { comparison, aiExplanation };
}

function buildFallbackComparison(comparison: PropertyMetrics[]): PropertyComparisonResponse {
  // Deterministic best pick: lowest rent among verified/highest-rated
  const ranked = [...comparison].sort((a, b) => {
    const aScore = (a.verificationStatus === 'verified' ? 20 : 0) + a.avgRating * 5 - a.rent / 1000;
    const bScore = (b.verificationStatus === 'verified' ? 20 : 0) + b.avgRating * 5 - b.rent / 1000;
    return bScore - aScore;
  });

  const best = ranked[0];

  return {
    recommendedPropertyId: best.id,
    summary: `${best.title} appears to be the strongest overall option based on available data.`,
    reasons: [
      `Monthly rent: ₹${best.rent.toLocaleString('en-IN')}`,
      `Distance from college: ${best.distanceFromCollege} km`,
      best.verificationStatus === 'verified' ? 'Verified property' : 'Not yet verified',
    ],
    tradeoffs: comparison.map((p) => ({
      propertyId:  p.id,
      advantages:  [`Rent: ₹${p.rent.toLocaleString('en-IN')}`, `Rating: ${p.avgRating}★`],
      limitations: p.missingPreferredAmenities.length
        ? [`Missing: ${p.missingPreferredAmenities.join(', ')}`]
        : ['No significant limitations identified'],
    })),
    disclaimer: 'This recommendation is based on the preferences and listing information available.',
  };
}
