/**
 * listingSummary.service.ts
 *
 * Generates an AI-powered "NestAI Property Brief" for a property listing.
 * Results are cached and invalidated on property update.
 */

import NodeCache from 'node-cache';
import { prisma } from '../config/database';
import { generateText, extractJson } from './graniteClient';
import { listingSummaryPrompt } from './promptTemplates';
import { ListingSummarySchema, ListingSummary } from './responseSchemas';
import { MOCK_MODE, mockListingSummary } from './mockMode';

// Cache summaries for 1 hour; individual entries are evicted on property update
const summaryCache = new NodeCache({ stdTTL: 3600 });

function getCacheKey(propertyId: string): string {
  return `listing_summary:${propertyId}`;
}

export function invalidateSummaryCache(propertyId: string): void {
  summaryCache.del(getCacheKey(propertyId));
}

function parseArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export async function getListingSummary(propertyId: string): Promise<ListingSummary> {
  const cacheKey = getCacheKey(propertyId);
  const cached = summaryCache.get<ListingSummary>(cacheKey);
  if (cached) return cached;

  const raw = await prisma.property.findUnique({
    where: { id: propertyId, isActive: true },
    include: { facilities: true },
  });

  if (!raw) throw new Error('Property not found.');

  if (MOCK_MODE) {
    const mock = mockListingSummary(raw);
    summaryCache.set(cacheKey, mock);
    return mock;
  }

  // Strip PII before sending to Granite
  const safeProperty = {
    id:                  raw.id,
    title:               raw.title,
    description:         raw.description,
    locality:            raw.locality,
    city:                raw.city,
    propertyType:        raw.propertyType,
    rent:                raw.rent,
    deposit:             raw.deposit,
    availableBeds:       raw.availableBeds,
    furnishing:          raw.furnishing,
    genderPreference:    raw.genderPreference,
    college:             raw.college,
    distanceFromCollege: raw.distanceFromCollege,
    verificationStatus:  raw.verificationStatus,
    avgRating:           raw.avgRating,
    reviewCount:         raw.reviewCount,
    scamRiskLevel:       raw.scamRiskLevel,
    isAvailable:         raw.isAvailable,
    availableFrom:       raw.availableFrom,
    amenities: {
      wifi: raw.wifi, ac: raw.ac, attachedBathroom: raw.attachedBathroom,
      parking: raw.parking, laundry: raw.laundry, powerBackup: raw.powerBackup,
      petFriendly: raw.petFriendly, food: raw.food, gym: raw.gym,
      tv: raw.tv, refrigerator: raw.refrigerator, waterFilter: raw.waterFilter,
    },
    houseRules:       parseArr(raw.houseRules),
    nearbyFacilities: raw.facilities.map((f) => ({ name: f.name, type: f.type, distance: f.distance })),
  };

  let summary: ListingSummary;

  try {
    const prompt  = listingSummaryPrompt(JSON.stringify(safeProperty, null, 2));
    const result  = await generateText(prompt, { maxNewTokens: 512, temperature: 0.3, jsonMode: true });
    const rawJson = extractJson(result.text);
    const parsed  = JSON.parse(rawJson);

    const validated = ListingSummarySchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[listingSummary] Zod validation failed:', validated.error.flatten());
      summary = buildFallbackSummary(safeProperty);
    } else {
      summary = validated.data;
    }
  } catch (err) {
    console.error('[listingSummary] AI failed:', (err as Error).message);
    summary = buildFallbackSummary(safeProperty);
  }

  summaryCache.set(cacheKey, summary);
  return summary;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFallbackSummary(p: any): ListingSummary {
  const amenityList: string[] = [];
  if (p.amenities.wifi)             amenityList.push('Wi-Fi');
  if (p.amenities.food)             amenityList.push('Food included');
  if (p.amenities.ac)               amenityList.push('Air conditioning');
  if (p.amenities.attachedBathroom) amenityList.push('Attached bathroom');
  if (p.amenities.parking)          amenityList.push('Parking');

  const missing: string[] = [];
  if (!p.amenities.wifi)  missing.push('Wi-Fi not listed');
  if (!p.amenities.food)  missing.push('Food not included');

  return {
    bestFor: `Students seeking ${p.propertyType} accommodation near ${p.college}.`,
    advantages: [
      `Located ${p.distanceFromCollege} km from ${p.college}`,
      `Rent: ₹${p.rent.toLocaleString('en-IN')}/month`,
      ...amenityList.slice(0, 3),
    ],
    limitations: missing,
    questionsForOwner: [
      'Are electricity charges included in the rent?',
      'Is there a fixed entry/exit time?',
      'What is the notice period for vacating?',
    ],
  };
}
