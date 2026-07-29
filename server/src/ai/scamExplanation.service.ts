/**
 * scamExplanation.service.ts
 *
 * Explains the rule-based scam risk signals for a listing.
 * The scam risk SCORE and LEVEL are calculated deterministically
 * by calculateScamRisk() in utils/recommendation.ts.
 * Granite only explains the signals — it does NOT assign risk levels.
 */

import NodeCache from 'node-cache';
import { prisma } from '../config/database';
import { calculateScamRisk } from '../utils/recommendation';
import { generateText, extractJson } from './graniteClient';
import { scamRiskExplanationPrompt } from './promptTemplates';
import { ScamRiskExplanationSchema, ScamRiskExplanation } from './responseSchemas';
import { MOCK_MODE, mockScamExplanation } from './mockMode';

const riskCache = new NodeCache({ stdTTL: 1800 }); // 30 min

function parseArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export async function getScamRiskExplanation(propertyId: string): Promise<ScamRiskExplanation> {
  const cacheKey = `scam_risk:${propertyId}`;
  const cached   = riskCache.get<ScamRiskExplanation>(cacheKey);
  if (cached) return cached;

  const raw = await prisma.property.findUnique({
    where: { id: propertyId, isActive: true },
    include: { owner: { select: { id: true, isVerified: true, createdAt: true } } },
  });

  if (!raw) throw new Error('Property not found.');

  // Calculate average rent in the area
  const agg = await prisma.property.aggregate({
    where: { locality: raw.locality, isActive: true },
    _avg:  { rent: true },
  });

  const shapedProperty = {
    id:                 raw.id,
    street:             raw.street,
    locality:           raw.locality,
    rent:               raw.rent,
    deposit:            raw.deposit,
    images:             parseArr(raw.images),
    contactPhone:       raw.contactPhone,
    contactEmail:       raw.contactEmail,
    verificationStatus: raw.verificationStatus,
    address:            { street: raw.street, locality: raw.locality },
  };

  const risk = calculateScamRisk(shapedProperty as never, agg._avg.rent ?? 0);

  // Owner age signal
  const ownerCreatedAt = raw.owner?.createdAt;
  const ownerAgeDays   = ownerCreatedAt
    ? Math.floor((Date.now() - new Date(ownerCreatedAt).getTime()) / 86_400_000)
    : null;

  if (ownerAgeDays !== null && ownerAgeDays < 30) {
    risk.flags.push('Owner account created less than 30 days ago');
    risk.score += 10;
  }

  // Cap level recalculation after adding new flags
  const finalLevel: 'low' | 'review_recommended' | 'high' =
    risk.score >= 40 ? 'high' : risk.score >= 20 ? 'review_recommended' : 'low';

  // Map level to Granite status
  const statusMap: Record<string, 'low_risk' | 'review_recommended' | 'high_caution'> = {
    low:                 'low_risk',
    review_recommended:  'review_recommended',
    high:                'high_caution',
  };

  if (risk.flags.length === 0) {
    const explanation: ScamRiskExplanation = {
      status:             'low_risk',
      explanation:        'No significant risk signals were detected for this listing.',
      recommendedActions: [
        'Visit the property before making any payment.',
        'Request a written receipt for any advance.',
        'Confirm the owner\'s identity with a government-issued ID.',
      ],
      disclaimer: 'This automated warning does not prove that the listing is fraudulent.',
    };
    riskCache.set(cacheKey, explanation);
    return explanation;
  }

  if (MOCK_MODE) {
    const mock = mockScamExplanation(risk, statusMap[finalLevel]);
    riskCache.set(cacheKey, mock);
    return mock;
  }

  const riskData = {
    scamRiskScore:  risk.score,
    scamRiskLevel:  finalLevel,
    detectedSignals: risk.flags,
    verificationStatus: raw.verificationStatus,
  };

  let explanation: ScamRiskExplanation;

  try {
    const prompt  = scamRiskExplanationPrompt(JSON.stringify(riskData, null, 2));
    const result  = await generateText(prompt, { maxNewTokens: 512, temperature: 0.2, jsonMode: true });
    const rawJson = extractJson(result.text);
    const parsed  = JSON.parse(rawJson);

    const validated = ScamRiskExplanationSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[scamExplanation] Zod validation failed:', validated.error.flatten());
      explanation = buildFallbackExplanation(risk.flags, statusMap[finalLevel]);
    } else {
      explanation = validated.data;
    }
  } catch (err) {
    console.error('[scamExplanation] AI failed:', (err as Error).message);
    explanation = buildFallbackExplanation(risk.flags, statusMap[finalLevel]);
  }

  riskCache.set(cacheKey, explanation);
  return explanation;
}

function buildFallbackExplanation(
  flags: string[],
  status: 'low_risk' | 'review_recommended' | 'high_caution'
): ScamRiskExplanation {
  return {
    status,
    explanation: `This listing has ${flags.length} risk signal(s): ${flags.slice(0, 3).join('; ')}.`,
    recommendedActions: [
      'Visit the property in person before making any payment.',
      'Request a written agreement and receipt.',
      'Verify the owner\'s identity with a government-issued ID.',
      'Do not pay before completing a physical or verified video tour.',
    ],
    disclaimer: 'This automated warning does not prove that the listing is fraudulent.',
  };
}
