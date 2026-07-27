import { describe, it, expect, vi } from 'vitest';
import { calculatePropertyRecommendation, calculateScamRisk } from '../utils/recommendation';
import { IProperty } from '../models/Property';
import mongoose from 'mongoose';

function makeProperty(overrides: Partial<IProperty> = {}): IProperty {
  return {
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Property',
    description: 'A nice test property near college',
    address: { street: '123 Test St', locality: 'Jalukbari', city: 'Guwahati', state: 'Assam', pincode: '781014' },
    coordinates: { lat: 26.1445, lng: 91.6897 },
    propertyType: 'pg',
    rent: 6000,
    deposit: 12000,
    totalRooms: 3,
    availableBeds: 2,
    furnishing: 'furnished',
    genderPreference: 'coed',
    amenities: { wifi: true, ac: false, attachedBathroom: true, parking: false, laundry: false, powerBackup: true, petFriendly: false, food: true, gym: false, tv: false, refrigerator: false, waterFilter: true },
    houseRules: ['No smoking'],
    availableFrom: new Date(),
    images: ['https://example.com/img.jpg'],
    owner: new mongoose.Types.ObjectId(),
    college: 'Gauhati University',
    distanceFromCollege: 0.5,
    verificationStatus: 'verified',
    isAvailable: true,
    isActive: true,
    views: 100,
    avgRating: 4.5,
    reviewCount: 10,
    scamRiskScore: 5,
    scamRiskLevel: 'low',
    scamRiskFlags: [],
    nearbyFacilities: [],
    contactPhone: '9876543210',
    contactEmail: 'owner@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as IProperty;
}

describe('Property Recommendation Scoring', () => {
  it('should give high match for perfect preferences', () => {
    const p = makeProperty();
    const prefs = { budget: 7000, college: 'Gauhati University', amenities: ['wifi', 'food'], propertyType: 'pg' };
    const result = calculatePropertyRecommendation(p, prefs);
    expect(result.matchPercentage).toBeGreaterThanOrEqual(70);
  });

  it('should give lower match when over budget', () => {
    const p = makeProperty({ rent: 15000 });
    const prefs = { budget: 8000 };
    const result = calculatePropertyRecommendation(p, prefs);
    const r2 = calculatePropertyRecommendation(makeProperty({ rent: 5000 }), prefs);
    expect(result.matchPercentage).toBeLessThan(r2.matchPercentage);
  });

  it('should give higher match for closer properties', () => {
    const pClose = makeProperty({ distanceFromCollege: 0.3 });
    const pFar = makeProperty({ distanceFromCollege: 8 });
    const prefs = { budget: 10000 };
    const rClose = calculatePropertyRecommendation(pClose, prefs);
    const rFar = calculatePropertyRecommendation(pFar, prefs);
    expect(rClose.matchPercentage).toBeGreaterThan(rFar.matchPercentage);
  });

  it('should boost verified properties', () => {
    const pVerified = makeProperty({ verificationStatus: 'verified' });
    const pUnverified = makeProperty({ verificationStatus: 'unverified' });
    const prefs = { budget: 10000 };
    const rV = calculatePropertyRecommendation(pVerified, prefs);
    const rU = calculatePropertyRecommendation(pUnverified, prefs);
    expect(rV.matchPercentage).toBeGreaterThan(rU.matchPercentage);
  });

  it('should return reasons array', () => {
    const p = makeProperty();
    const result = calculatePropertyRecommendation(p, { budget: 8000 });
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});

describe('Scam Risk Detection', () => {
  it('should flag missing photos as risk', () => {
    const p = makeProperty({ images: [] });
    const result = calculateScamRisk(p, 6000);
    expect(result.flags.some((f) => f.toLowerCase().includes('photo'))).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should flag significantly below-market rent', () => {
    const p = makeProperty({ rent: 1000 });
    const result = calculateScamRisk(p, 6000);
    expect(result.flags.some((f) => f.toLowerCase().includes('rent'))).toBe(true);
    expect(result.level).not.toBe('low');
  });

  it('should return low risk for a complete verified listing', () => {
    const p = makeProperty({ images: ['img1.jpg', 'img2.jpg'], verificationStatus: 'verified', contactPhone: '9876543210', contactEmail: 'owner@test.com' });
    const result = calculateScamRisk(p, 6000);
    expect(result.level).toBe('low');
  });

  it('should return high risk for multiple red flags', () => {
    const p = makeProperty({ images: [], rent: 500, contactPhone: '', contactEmail: '' });
    const result = calculateScamRisk(p, 6000);
    expect(result.level).toBe('high');
    expect(result.flags.length).toBeGreaterThan(1);
  });
});
