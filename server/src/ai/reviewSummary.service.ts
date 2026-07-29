/**
 * reviewSummary.service.ts
 *
 * Summarises published student reviews using Granite.
 * - Minimum 3 reviews required.
 * - Results are cached; cache is invalidated when a review changes.
 */

import NodeCache from 'node-cache';
import { prisma } from '../config/database';
import { generateText, extractJson } from './graniteClient';
import { reviewSummaryPrompt } from './promptTemplates';
import { ReviewSummarySchema, ReviewSummary } from './responseSchemas';
import { MOCK_MODE, mockReviewSummary } from './mockMode';

const reviewCache = new NodeCache({ stdTTL: 3600 });

const MIN_REVIEWS = 3;

export function getCacheKey(propertyId: string): string {
  return `review_summary:${propertyId}`;
}

export function invalidateReviewCache(propertyId: string): void {
  reviewCache.del(getCacheKey(propertyId));
}

export async function getReviewSummary(propertyId: string): Promise<ReviewSummary | null> {
  const cacheKey = getCacheKey(propertyId);
  const cached   = reviewCache.get<ReviewSummary>(cacheKey);
  if (cached) return cached;

  const reviews = await prisma.review.findMany({
    where:   { propertyId },
    orderBy: { createdAt: 'desc' },
    take:    50,
  });

  if (reviews.length < MIN_REVIEWS) return null;

  if (MOCK_MODE) {
    const mock = mockReviewSummary(reviews);
    reviewCache.set(cacheKey, mock);
    return mock;
  }

  // Strip PII before sending to Granite
  const safeReviews = reviews.map((r) => ({
    id:             r.id,
    overallRating:  r.overallRating,
    comment:        r.comment,
    ratings: {
      roomQuality:    r.roomQuality,
      locality:       r.locality,
      water:          r.water,
      electricity:    r.electricity,
      internet:       r.internet,
      ownerBehaviour: r.ownerBehaviour,
      safety:         r.safety,
      valueForMoney:  r.valueForMoney,
    },
    createdAt: r.createdAt,
  }));

  let summary: ReviewSummary;

  try {
    const prompt  = reviewSummaryPrompt(JSON.stringify(safeReviews, null, 2));
    const result  = await generateText(prompt, { maxNewTokens: 512, temperature: 0.2, jsonMode: true });
    const rawJson = extractJson(result.text);
    const parsed  = JSON.parse(rawJson);

    const validated = ReviewSummarySchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[reviewSummary] Zod validation failed:', validated.error.flatten());
      summary = buildFallbackSummary(safeReviews);
    } else {
      summary = validated.data;
    }
  } catch (err) {
    console.error('[reviewSummary] AI failed:', (err as Error).message);
    summary = buildFallbackSummary(safeReviews);
  }

  reviewCache.set(cacheKey, summary);
  return summary;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFallbackSummary(reviews: any[]): ReviewSummary {
  const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
  const sentiment = avg >= 4 ? 'mostly_positive' : avg >= 3 ? 'mixed' : 'mostly_negative';
  return {
    overallSentiment: sentiment,
    positiveThemes:   ['Based on student reviews'],
    negativeThemes:   [],
    summary:          `${reviews.length} students have reviewed this property with an average rating of ${avg.toFixed(1)}★.`,
    reviewCount:      reviews.length,
  };
}
