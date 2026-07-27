import { IRoommateProfile } from '../models/RoommateProfile';

interface CompatibilityResult {
  score: number;
  breakdown: Record<string, number>;
  strongMatches: string[];
  explanation: string;
}

export function calculateRoommateCompatibility(
  profile1: IRoommateProfile,
  profile2: IRoommateProfile
): CompatibilityResult {
  const breakdown: Record<string, number> = {};

  // Budget compatibility (20%)
  const budgetOverlap = calculateBudgetOverlap(profile1.budget, profile2.budget);
  breakdown.budget = budgetOverlap * 20;

  // Location preference (15%)
  const locationMatch =
    profile1.preferredLocality.toLowerCase() === profile2.preferredLocality.toLowerCase() ? 1 : 0;
  breakdown.location = locationMatch * 15;

  // Sleep schedule (15%)
  const sleepMatch = calculatePreferenceMatch(profile1.sleepSchedule, profile2.sleepSchedule);
  breakdown.sleepSchedule = sleepMatch * 15;

  // Cleanliness (15%)
  const cleanlinessMatch = calculateCleanlinessMatch(profile1.cleanliness, profile2.cleanliness);
  breakdown.cleanliness = cleanlinessMatch * 15;

  // Smoking and drinking (15% total)
  const smokingMatch = profile1.smoking === profile2.smoking ? 1 : 0;
  const drinkingMatch = profile1.drinking === profile2.drinking ? 1 : 0;
  breakdown.smokingDrinking = ((smokingMatch + drinkingMatch) / 2) * 15;

  // Study and noise habits (10% total)
  const studyMatch = calculatePreferenceMatch(profile1.studyHabits, profile2.studyHabits);
  const noiseMatch = calculateNoiseMatch(profile1.noiseTolerance, profile2.noiseTolerance);
  breakdown.studyNoise = ((studyMatch + noiseMatch) / 2) * 10;

  // Food preference (5%)
  const foodMatch = calculateFoodMatch(profile1.foodPreference, profile2.foodPreference);
  breakdown.food = foodMatch * 5;

  // Visitors and pets (5% total)
  const visitorsMatch = calculatePreferenceMatch(profile1.visitors, profile2.visitors);
  const petsMatch = profile1.pets === profile2.pets ? 1 : 0.5;
  breakdown.visitorsPets = ((visitorsMatch + petsMatch) / 2) * 5;

  const totalScore = Math.round(
    Object.values(breakdown).reduce((a, b) => a + b, 0)
  );

  // Find strong matches (above 70% of max for that category)
  const strongMatches: string[] = [];
  if (breakdown.budget >= 14) strongMatches.push('budget');
  if (breakdown.location >= 12) strongMatches.push('location');
  if (breakdown.sleepSchedule >= 10) strongMatches.push('sleep schedule');
  if (breakdown.cleanliness >= 10) strongMatches.push('cleanliness');
  if (breakdown.smokingDrinking >= 10) strongMatches.push('lifestyle habits');
  if (breakdown.studyNoise >= 7) strongMatches.push('study habits');
  if (breakdown.food >= 3.5) strongMatches.push('food preference');

  const explanation =
    strongMatches.length > 0
      ? `Your strongest matches are ${strongMatches.slice(0, 3).join(', ')}.`
      : 'You have some differences that may require open communication.';

  return { score: totalScore, breakdown, strongMatches, explanation };
}

function calculateBudgetOverlap(
  b1: { min: number; max: number },
  b2: { min: number; max: number }
): number {
  const overlapMin = Math.max(b1.min, b2.min);
  const overlapMax = Math.min(b1.max, b2.max);
  if (overlapMin >= overlapMax) return 0;
  const overlapRange = overlapMax - overlapMin;
  const totalRange = Math.max(b1.max, b2.max) - Math.min(b1.min, b2.min);
  return totalRange > 0 ? overlapRange / totalRange : 0;
}

function calculatePreferenceMatch(pref1: string, pref2: string): number {
  if (pref1 === pref2) return 1;
  if (pref1 === 'flexible' || pref2 === 'flexible') return 0.7;
  return 0;
}

function calculateCleanlinessMatch(c1: string, c2: string): number {
  const scale: Record<string, number> = { very_clean: 4, clean: 3, moderate: 2, relaxed: 1 };
  const diff = Math.abs((scale[c1] || 2) - (scale[c2] || 2));
  if (diff === 0) return 1;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.3;
  return 0;
}

function calculateNoiseMatch(n1: string, n2: string): number {
  const scale: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const diff = Math.abs((scale[n1] || 2) - (scale[n2] || 2));
  if (diff === 0) return 1;
  if (diff === 1) return 0.6;
  return 0.2;
}

function calculateFoodMatch(f1: string, f2: string): number {
  if (f1 === f2) return 1;
  if (f1 === 'any' || f2 === 'any') return 0.8;
  return 0;
}
