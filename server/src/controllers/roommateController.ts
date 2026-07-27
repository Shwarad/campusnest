import { Response } from 'express';
import { z } from 'zod';
import RoommateProfile from '../models/RoommateProfile';
import { AuthRequest } from '../middleware/auth';
import { calculateRoommateCompatibility } from '../utils/roommateCompatibility';

const profileSchema = z.object({
  name: z.string().min(2),
  college: z.string().min(2),
  budget: z.object({ min: z.number(), max: z.number() }),
  preferredLocality: z.string().min(2),
  moveInDate: z.string(),
  roomType: z.enum(['single', 'shared', 'pg', 'hostel', 'flat']),
  genderPreference: z.enum(['male', 'female', 'any']).optional(),
  sleepSchedule: z.enum(['early_bird', 'night_owl', 'flexible']),
  studyHabits: z.enum(['quiet', 'with_music', 'social', 'flexible']),
  cleanliness: z.enum(['very_clean', 'clean', 'moderate', 'relaxed']),
  smoking: z.boolean(),
  drinking: z.boolean(),
  foodPreference: z.enum(['veg', 'non_veg', 'any']),
  noiseTolerance: z.enum(['low', 'medium', 'high']),
  visitors: z.enum(['never', 'occasional', 'frequent']),
  pets: z.boolean(),
  bio: z.string().max(500).optional(),
});

export const getRoommateProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { college, locality, budget, roomType, genderPreference } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isActive: true };
    if (req.user) filter.user = { $ne: req.user._id };
    if (college) filter.college = { $regex: college, $options: 'i' };
    if (locality) filter.preferredLocality = { $regex: locality, $options: 'i' };
    if (budget) filter['budget.max'] = { $gte: Number(budget) };
    if (roomType) filter.roomType = roomType;
    if (genderPreference) filter.genderPreference = genderPreference;

    const profiles = await RoommateProfile.find(filter)
      .populate('user', 'name email avatar college')
      .limit(20);

    res.json({ profiles });
  } catch {
    res.status(500).json({ message: 'Failed to fetch roommate profiles.' });
  }
};

export const getRoommateMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!myProfile) {
      res.status(404).json({ message: 'Complete your roommate profile first.' });
      return;
    }

    const otherProfiles = await RoommateProfile.find({
      user: { $ne: req.user._id },
      isActive: true,
    }).populate('user', 'name email avatar college');

    const matches = otherProfiles.map((profile) => {
      const compatibility = calculateRoommateCompatibility(myProfile, profile);
      return {
        profile,
        compatibility,
      };
    });

    matches.sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.json({ matches: matches.slice(0, 12), myProfile });
  } catch {
    res.status(500).json({ message: 'Failed to calculate roommate matches.' });
  }
};

export const createOrUpdateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }

    const profileData = {
      ...result.data,
      user: req.user._id,
      moveInDate: new Date(result.data.moveInDate),
    };

    const existing = await RoommateProfile.findOne({ user: req.user._id });
    let profile;

    if (existing) {
      profile = await RoommateProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true, runValidators: true }
      );
      res.json({ message: 'Profile updated', profile });
    } else {
      profile = await RoommateProfile.create(profileData);
      res.status(201).json({ message: 'Profile created', profile });
    }
  } catch {
    res.status(500).json({ message: 'Failed to save profile.' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await RoommateProfile.findOne({ user: req.user?._id });
    res.json({ profile });
  } catch {
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};
