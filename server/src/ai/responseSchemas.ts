/**
 * responseSchemas.ts
 *
 * Zod schemas for every structured Granite response.
 * All AI output must pass validation before being returned to the client.
 */

import { z } from 'zod';

// ── Natural language search ───────────────────────────────────────────────────

export const NaturalSearchFiltersSchema = z.object({
  city:               z.string().nullable().optional(),
  college:            z.string().nullable().optional(),
  locality:           z.string().nullable().optional(),
  minimumRent:        z.number().nullable().optional(),
  maximumRent:        z.number().nullable().optional(),
  maximumDistanceKm:  z.number().nullable().optional(),
  propertyTypes:      z.array(z.string()).optional().default([]),
  genderPreference:   z.enum(['boys', 'girls', 'coed']).nullable().optional(),
  occupancy:          z.enum(['single', 'shared']).nullable().optional(),
  furnishingStatus:   z.enum(['furnished', 'semi_furnished', 'unfurnished']).nullable().optional(),
  amenities:          z.array(z.string()).optional().default([]),
  moveInDate:         z.string().nullable().optional(),
  verifiedOnly:       z.boolean().optional().default(false),
  keywords:           z.array(z.string()).optional().default([]),
  sortBy:             z.enum(['relevance', 'rent_asc', 'rent_desc', 'distance', 'rating']).optional().default('relevance'),
});

export type NaturalSearchFilters = z.infer<typeof NaturalSearchFiltersSchema>;

export const NaturalSearchResponseSchema = z.object({
  filters:        NaturalSearchFiltersSchema,
  interpretation: z.string(),
});

export type NaturalSearchResponse = z.infer<typeof NaturalSearchResponseSchema>;

// ── Property comparison ───────────────────────────────────────────────────────

export const TradeoffSchema = z.object({
  propertyId:  z.string(),
  advantages:  z.array(z.string()),
  limitations: z.array(z.string()),
});

export const PropertyComparisonResponseSchema = z.object({
  recommendedPropertyId: z.string(),
  summary:               z.string(),
  reasons:               z.array(z.string()),
  tradeoffs:             z.array(TradeoffSchema),
  disclaimer:            z.string(),
});

export type PropertyComparisonResponse = z.infer<typeof PropertyComparisonResponseSchema>;

// ── Listing summary ───────────────────────────────────────────────────────────

export const ListingSummarySchema = z.object({
  bestFor:           z.string(),
  advantages:        z.array(z.string()),
  limitations:       z.array(z.string()),
  questionsForOwner: z.array(z.string()),
});

export type ListingSummary = z.infer<typeof ListingSummarySchema>;

// ── Roommate explanation ──────────────────────────────────────────────────────

export const RoommateExplanationSchema = z.object({
  summary:               z.string(),
  strongMatches:         z.array(z.string()),
  differences:           z.array(z.string()),
  discussionSuggestions: z.array(z.string()),
  disclaimer:            z.string(),
});

export type RoommateExplanation = z.infer<typeof RoommateExplanationSchema>;

// ── Review summary ────────────────────────────────────────────────────────────

export const ReviewSummarySchema = z.object({
  overallSentiment: z.enum(['positive', 'mostly_positive', 'mixed', 'mostly_negative', 'negative']),
  positiveThemes:   z.array(z.string()),
  negativeThemes:   z.array(z.string()),
  summary:          z.string(),
  reviewCount:      z.number(),
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

// ── Scam risk explanation ─────────────────────────────────────────────────────

export const ScamRiskExplanationSchema = z.object({
  status:             z.enum(['low_risk', 'review_recommended', 'high_caution']),
  explanation:        z.string(),
  recommendedActions: z.array(z.string()),
  disclaimer:         z.string(),
});

export type ScamRiskExplanation = z.infer<typeof ScamRiskExplanationSchema>;

// ── Chat ──────────────────────────────────────────────────────────────────────

export const ChatResponseSchema = z.object({
  reply:             z.string().min(1),
  propertyRefs:      z.array(z.string()).optional().default([]),
  suggestedActions:  z.array(z.string()).optional().default([]),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
