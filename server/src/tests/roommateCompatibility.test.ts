import { describe, it, expect } from 'vitest';
import { calculateRoommateCompatibility } from '../utils/roommateCompatibility';
import { RoommateProfileForCompatibility } from '../types';

function makeProfile(overrides: Partial<RoommateProfileForCompatibility> = {}): RoommateProfileForCompatibility {
  return {
    id: 'test-id-' + Math.random(),
    userId: 'user-id-' + Math.random(),
    name: 'Test User',
    college: 'Gauhati University',
    budgetMin: 4000,
    budgetMax: 8000,
    preferredLocality: 'Jalukbari',
    moveInDate: new Date(),
    roomType: 'pg',
    genderPreference: 'any',
    sleepSchedule: 'flexible',
    studyHabits: 'flexible',
    cleanliness: 'clean',
    smoking: false,
    drinking: false,
    foodPreference: 'any',
    noiseTolerance: 'medium',
    visitors: 'occasional',
    pets: false,
    bio: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Roommate Compatibility Algorithm', () => {
  it('should return 100% for identical profiles', () => {
    const p1 = makeProfile();
    const p2 = makeProfile();
    const result = calculateRoommateCompatibility(p1, p2);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('should return lower score for incompatible sleep schedules', () => {
    const p1 = makeProfile({ sleepSchedule: 'early_bird' });
    const p2 = makeProfile({ sleepSchedule: 'night_owl' });
    const identical = makeProfile();
    const r1 = calculateRoommateCompatibility(p1, p2);
    const r2 = calculateRoommateCompatibility(identical, identical);
    expect(r1.score).toBeLessThan(r2.score);
  });

  it('should give partial budget overlap score', () => {
    const p1 = makeProfile({ budgetMin: 4000, budgetMax: 8000 });
    const p2 = makeProfile({ budgetMin: 7000, budgetMax: 12000 });
    const r = calculateRoommateCompatibility(p1, p2);
    expect(r.breakdown.budget).toBeGreaterThan(0);
    expect(r.breakdown.budget).toBeLessThan(20);
  });

  it('should return 0 budget score for non-overlapping budgets', () => {
    const p1 = makeProfile({ budgetMin: 2000, budgetMax: 3000 });
    const p2 = makeProfile({ budgetMin: 8000, budgetMax: 12000 });
    const r = calculateRoommateCompatibility(p1, p2);
    expect(r.breakdown.budget).toBe(0);
  });

  it('should also work with legacy budget object shape', () => {
    const p1 = makeProfile({ budget: { min: 4000, max: 8000 } } as never);
    const p2 = makeProfile({ budget: { min: 4000, max: 8000 } } as never);
    const r = calculateRoommateCompatibility(p1, p2);
    expect(r.breakdown.budget).toBeGreaterThan(0);
  });

  it('should identify strong matches correctly', () => {
    const p1 = makeProfile({ budgetMin: 4000, budgetMax: 8000, preferredLocality: 'Jalukbari', cleanliness: 'very_clean', sleepSchedule: 'early_bird' });
    const p2 = makeProfile({ budgetMin: 4000, budgetMax: 8000, preferredLocality: 'Jalukbari', cleanliness: 'very_clean', sleepSchedule: 'early_bird' });
    const r = calculateRoommateCompatibility(p1, p2);
    expect(r.strongMatches).toContain('budget');
    expect(r.strongMatches).toContain('location');
  });

  it('should penalise smoking/non-smoking mismatch', () => {
    const p1 = makeProfile({ smoking: true });
    const p2 = makeProfile({ smoking: false });
    const p3 = makeProfile({ smoking: false });
    const r1 = calculateRoommateCompatibility(p1, p2);
    const r2 = calculateRoommateCompatibility(p2, p3);
    expect(r1.breakdown.smokingDrinking).toBeLessThan(r2.breakdown.smokingDrinking);
  });

  it('should return score between 0 and 100', () => {
    const worst = makeProfile({ smoking: true, drinking: true, sleepSchedule: 'early_bird', cleanliness: 'very_clean', budgetMin: 1000, budgetMax: 2000 });
    const best = makeProfile({ smoking: false, drinking: false, sleepSchedule: 'night_owl', cleanliness: 'relaxed', budgetMin: 8000, budgetMax: 15000 });
    const r = calculateRoommateCompatibility(worst, best);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('should include an explanation string', () => {
    const p1 = makeProfile();
    const p2 = makeProfile();
    const r = calculateRoommateCompatibility(p1, p2);
    expect(r.explanation).toBeTruthy();
    expect(typeof r.explanation).toBe('string');
  });
});
