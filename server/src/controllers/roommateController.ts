import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateRoommateCompatibility } from '../utils/roommateCompatibility';

const profileSchema = z.object({
  name: z.string().min(2),
  college: z.string().min(2),
  budgetMin: z.number(),
  budgetMax: z.number(),
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
    const { college, locality, budget, roomType } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { isActive: true };
    if (req.user) where.userId = { not: req.user.id };
    if (college) where.college = { contains: college, mode: 'insensitive' };
    if (locality) where.preferredLocality = { contains: locality, mode: 'insensitive' };
    if (budget) where.budgetMax = { gte: Number(budget) };
    if (roomType) where.roomType = roomType;

    const profiles = await prisma.roommateProfile.findMany({
      where: where as never,
      include: { user: { select: { id: true, name: true, email: true, college: true } } },
      take: 20,
    });
    res.json({ profiles });
  } catch {
    res.status(500).json({ message: 'Failed to fetch profiles.' });
  }
};

export const getRoommateMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const myProfile = await prisma.roommateProfile.findUnique({ where: { userId: req.user.id } });
    if (!myProfile) { res.status(404).json({ message: 'Complete your roommate profile first.' }); return; }

    const others = await prisma.roommateProfile.findMany({
      where: { userId: { not: req.user.id }, isActive: true },
      include: { user: { select: { id: true, name: true, email: true, college: true } } },
    });

    const matches = others.map((p) => ({
      profile: p,
      compatibility: calculateRoommateCompatibility(myProfile as never, p as never),
    })).sort((a, b) => b.compatibility.score - a.compatibility.score).slice(0, 12);

    res.json({ matches, myProfile });
  } catch {
    res.status(500).json({ message: 'Failed to calculate matches.' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.roommateProfile.findUnique({ where: { userId: req.user!.id } });
    res.json({ profile });
  } catch {
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

export const createOrUpdateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }
    const data = { ...result.data, moveInDate: new Date(result.data.moveInDate), userId: req.user.id, genderPreference: result.data.genderPreference ?? 'any' as const, bio: result.data.bio ?? '' };

    const existing = await prisma.roommateProfile.findUnique({ where: { userId: req.user.id } });
    const profile = existing
      ? await prisma.roommateProfile.update({ where: { userId: req.user.id }, data })
      : await prisma.roommateProfile.create({ data });

    res.status(existing ? 200 : 201).json({ message: existing ? 'Profile updated' : 'Profile created', profile });
  } catch {
    res.status(500).json({ message: 'Failed to save profile.' });
  }
};
