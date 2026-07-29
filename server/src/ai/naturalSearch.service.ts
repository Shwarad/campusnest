/**
 * naturalSearch.service.ts
 *
 * Converts a student's natural-language query into validated structured filters.
 * Falls back to a keyword-only search when AI is unavailable.
 */

import { generateText, extractJson } from './graniteClient';
import { naturalSearchPrompt } from './promptTemplates';
import {
  NaturalSearchFiltersSchema,
  NaturalSearchFilters,
} from './responseSchemas';
import { MOCK_MODE, mockNaturalSearch } from './mockMode';

export interface ParsedSearchResult {
  filters: Partial<NaturalSearchFilters>;
  interpretation: string;
  aiAssisted: boolean;
}

/** Valid amenity keys to prevent injection of unknown fields */
const VALID_AMENITIES = new Set([
  'wifi', 'ac', 'attachedBathroom', 'parking', 'laundry',
  'powerBackup', 'petFriendly', 'food', 'gym', 'tv', 'refrigerator', 'waterFilter',
]);

const VALID_PROPERTY_TYPES = new Set(['room', 'pg', 'hostel', 'flat', 'shared_room']);

/**
 * Sanitise AI-extracted filters — strip unknown amenities and property types.
 * This is a defence-in-depth measure against prompt injection.
 */
function sanitiseFilters(raw: Partial<NaturalSearchFilters>): Partial<NaturalSearchFilters> {
  return {
    ...raw,
    amenities:     (raw.amenities ?? []).filter((a) => VALID_AMENITIES.has(a)),
    propertyTypes: (raw.propertyTypes ?? []).filter((t) => VALID_PROPERTY_TYPES.has(t)),
    // Never allow passing raw values that could become unbounded
    maximumRent:       raw.maximumRent  != null ? Math.min(raw.maximumRent,  500_000) : null,
    minimumRent:       raw.minimumRent  != null ? Math.max(raw.minimumRent,  0)       : null,
    maximumDistanceKm: raw.maximumDistanceKm != null ? Math.min(raw.maximumDistanceKm, 50) : null,
  };
}

export async function parseNaturalSearchQuery(query: string): Promise<ParsedSearchResult> {
  const sanitisedQuery = query.slice(0, 500); // cap length to prevent abuse

  if (MOCK_MODE) {
    return mockNaturalSearch(sanitisedQuery);
  }

  try {
    const prompt = naturalSearchPrompt(sanitisedQuery);
    const result = await generateText(prompt, {
      maxNewTokens: 512,
      temperature:  0.1,
      jsonMode:     true,
    });

    const raw = extractJson(result.text);
    const parsed = JSON.parse(raw);

    // Validate with Zod
    const validated = NaturalSearchFiltersSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[naturalSearch] Zod validation failed:', validated.error.flatten());
      return buildFallback(sanitisedQuery);
    }

    const sanitised = sanitiseFilters(validated.data);

    // Build a human-readable interpretation
    const interpretation = buildInterpretation(sanitisedQuery, sanitised);

    return {
      filters: sanitised,
      interpretation,
      aiAssisted: true,
    };
  } catch (err) {
    console.error('[naturalSearch] AI extraction failed:', (err as Error).message);
    return buildFallback(sanitisedQuery);
  }
}

function buildFallback(query: string): ParsedSearchResult {
  return {
    filters: { keywords: [query], sortBy: 'relevance' },
    interpretation: `Showing results for: "${query}"`,
    aiAssisted: false,
  };
}

function buildInterpretation(query: string, filters: Partial<NaturalSearchFilters>): string {
  const parts: string[] = [];
  if (filters.genderPreference) parts.push(`${filters.genderPreference} accommodation`);
  if (filters.propertyTypes?.length) parts.push(filters.propertyTypes.join('/'));
  if (filters.maximumRent) parts.push(`under ₹${filters.maximumRent.toLocaleString('en-IN')}`);
  if (filters.college) parts.push(`near ${filters.college}`);
  if (filters.amenities?.length) parts.push(`with ${filters.amenities.join(', ')}`);
  if (filters.verifiedOnly) parts.push('(verified only)');
  return parts.length > 0 ? parts.join(' ').trim() : `Results for: "${query}"`;
}

/** Map AI-extracted filters to the property search query params */
export function filtersToQueryParams(filters: Partial<NaturalSearchFilters>): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.maximumRent)       params.maxRent      = String(filters.maximumRent);
  if (filters.minimumRent)       params.minRent       = String(filters.minimumRent);
  if (filters.college)           params.college       = filters.college;
  if (filters.locality)          params.search        = filters.locality;
  if (filters.maximumDistanceKm) params.maxDistance   = String(filters.maximumDistanceKm);
  if (filters.genderPreference)  params.genderPreference = filters.genderPreference;
  if (filters.furnishingStatus)  params.furnishing    = filters.furnishingStatus;
  if (filters.verifiedOnly)      params.verifiedOnly  = 'true';
  if (filters.propertyTypes?.[0]) params.propertyType = filters.propertyTypes[0];
  if (filters.sortBy && filters.sortBy !== 'relevance') params.sortBy = filters.sortBy;

  // Expand amenities into individual boolean params
  for (const amenity of filters.amenities ?? []) {
    params[amenity] = 'true';
  }

  return params;
}
