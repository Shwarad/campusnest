/**
 * roommateExplanation.service.ts
 *
 * Uses Granite to explain a pre-calculated roommate compatibility score.
 * The numerical scores are NOT recalculated here — they come from the
 * deterministic roommateCompatibility utility.
 */

import { generateText, extractJson } from './graniteClient';
import { roommateExplanationPrompt } from './promptTemplates';
import { RoommateExplanationSchema, RoommateExplanation } from './responseSchemas';
import { prisma } from '../config/database';
import { calculateRoommateCompatibility } from '../utils/roommateCompatibility';
import { MOCK_MODE, mockRoommateExplanation } from './mockMode';

export async function getRoommateExplanation(
  myUserId: string,
  targetRoommateId: string
): Promise<RoommateExplanation & { overallScore: number }> {
  // Fetch both profiles from DB (never trust client data)
  const [myProfile, targetProfile] = await Promise.all([
    prisma.roommateProfile.findUnique({ where: { userId: myUserId } }),
    prisma.roommateProfile.findUnique({ where: { id: targetRoommateId } }),
  ]);

  if (!myProfile)      throw new Error('Your roommate profile was not found. Please create one first.');
  if (!targetProfile)  throw new Error('Target roommate profile not found.');

  // Run the deterministic algorithm
  const compat = calculateRoommateCompatibility(
    myProfile as never,
    targetProfile as never
  );

  // Build a safe compatibility context for Granite (no questionnaire PII)
  const compatContext = {
    overallScore: compat.score,
    categories: {
      budget:          Math.round((compat.breakdown.budget          / 20) * 100),
      location:        Math.round((compat.breakdown.location        / 15) * 100),
      sleepSchedule:   Math.round((compat.breakdown.sleepSchedule   / 15) * 100),
      cleanliness:     Math.round((compat.breakdown.cleanliness     / 15) * 100),
      lifestyleHabits: Math.round((compat.breakdown.smokingDrinking / 15) * 100),
      studyNoise:      Math.round((compat.breakdown.studyNoise      / 10) * 100),
      foodPreference:  Math.round((compat.breakdown.food            /  5) * 100),
    },
    strongMatchCategories: compat.strongMatches,
  };

  if (MOCK_MODE) {
    const mock = mockRoommateExplanation(compatContext);
    return { ...mock, overallScore: compat.score };
  }

  let explanation: RoommateExplanation;

  try {
    const prompt  = roommateExplanationPrompt(JSON.stringify(compatContext, null, 2));
    const result  = await generateText(prompt, { maxNewTokens: 512, temperature: 0.3, jsonMode: true });
    const rawJson = extractJson(result.text);
    const parsed  = JSON.parse(rawJson);

    const validated = RoommateExplanationSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[roommateExplanation] Zod validation failed:', validated.error.flatten());
      explanation = buildFallbackExplanation(compatContext);
    } else {
      explanation = validated.data;
    }
  } catch (err) {
    console.error('[roommateExplanation] AI failed:', (err as Error).message);
    explanation = buildFallbackExplanation(compatContext);
  }

  return { ...explanation, overallScore: compat.score };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFallbackExplanation(ctx: any): RoommateExplanation {
  const strong: string[] = ctx.strongMatchCategories ?? [];
  return {
    summary: strong.length > 0
      ? `You appear to be a good match in ${strong.slice(0, 3).join(', ')}.`
      : 'You have some differences that are worth discussing before sharing a space.',
    strongMatches: strong,
    differences: [],
    discussionSuggestions: [
      'Discuss daily routines and quiet hours.',
      'Agree on cleanliness expectations before moving in.',
    ],
    disclaimer: 'Compatibility scores provide guidance and do not guarantee a successful living arrangement.',
  };
}
