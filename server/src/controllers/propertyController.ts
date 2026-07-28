import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculatePropertyRecommendation, calculateScamRisk } from '../utils/recommendation';
import { Prisma } from '@prisma/client';

const propertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  street: z.string().min(3),
  locality: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  lat: z.number(),
  lng: z.number(),
  propertyType: z.enum(['room', 'pg', 'hostel', 'flat', 'shared_room']),
  rent: z.number().min(100),
  deposit: z.number().min(0),
  totalRooms: z.number().min(1).optional(),
  availableBeds: z.number().min(0).optional(),
  furnishing: z.enum(['furnished', 'semi_furnished', 'unfurnished']),
  genderPreference: z.enum(['boys', 'girls', 'coed']),
  college: z.string().min(2),
  distanceFromCollege: z.number().min(0),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email(),
  availableFrom: z.string(),
  wifi: z.boolean().optional(),
  ac: z.boolean().optional(),
  attachedBathroom: z.boolean().optional(),
  parking: z.boolean().optional(),
  laundry: z.boolean().optional(),
  powerBackup: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  food: z.boolean().optional(),
  gym: z.boolean().optional(),
  tv: z.boolean().optional(),
  refrigerator: z.boolean().optional(),
  waterFilter: z.boolean().optional(),
  houseRules: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  nearbyFacilities: z.array(z.object({ name: z.string(), type: z.string(), distance: z.string() })).optional(),
});

// Helper: parse JSON array strings stored in SQLite
function parseArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

// Helper: shape a raw Prisma property into the API shape clients expect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapeProperty(p: any) {
  return {
    ...p,
    _id: p.id,
    houseRules: parseArr(p.houseRules),
    images: parseArr(p.images),
    scamRiskFlags: parseArr(p.scamRiskFlags),
    address: { street: p.street, locality: p.locality, city: p.city, state: p.state, pincode: p.pincode },
    coordinates: { lat: p.lat, lng: p.lng },
    amenities: {
      wifi: p.wifi, ac: p.ac, attachedBathroom: p.attachedBathroom, parking: p.parking,
      laundry: p.laundry, powerBackup: p.powerBackup, petFriendly: p.petFriendly,
      food: p.food, gym: p.gym, tv: p.tv, refrigerator: p.refrigerator, waterFilter: p.waterFilter,
    },
    nearbyFacilities: p.facilities,
  };
}

export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search, minRent, maxRent, propertyType, furnishing, genderPreference,
      wifi, ac, attachedBathroom, parking, laundry, food, powerBackup, petFriendly,
      verifiedOnly, college, maxDistance, sortBy, page = '1', limit = '12',
    } = req.query as Record<string, string>;

    const where: Prisma.PropertyWhereInput = { isActive: true };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { locality: { contains: search } },
        { city: { contains: search } },
        { college: { contains: search } },
      ];
    }
    if (minRent) where.rent = { ...where.rent as object, gte: Number(minRent) };
    if (maxRent) where.rent = { ...where.rent as object, lte: Number(maxRent) };
    if (propertyType) where.propertyType = propertyType as never;
    if (furnishing) where.furnishing = furnishing as never;
    if (genderPreference) where.genderPreference = genderPreference as never;
    if (wifi === 'true') where.wifi = true;
    if (ac === 'true') where.ac = true;
    if (attachedBathroom === 'true') where.attachedBathroom = true;
    if (parking === 'true') where.parking = true;
    if (laundry === 'true') where.laundry = true;
    if (food === 'true') where.food = true;
    if (powerBackup === 'true') where.powerBackup = true;
    if (petFriendly === 'true') where.petFriendly = true;
    if (verifiedOnly === 'true') where.verificationStatus = 'verified';
    if (college) where.college = { contains: college };
    if (maxDistance) where.distanceFromCollege = { lte: Number(maxDistance) };

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'rent_asc') orderBy = { rent: 'asc' };
    else if (sortBy === 'rent_desc') orderBy = { rent: 'desc' };
    else if (sortBy === 'rating') orderBy = { avgRating: 'desc' };
    else if (sortBy === 'distance') orderBy = { distanceFromCollege: 'asc' };
    else if (sortBy === 'popular') orderBy = { views: 'desc' };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [rawProperties, total] = await Promise.all([
      prisma.property.findMany({
        where, orderBy, skip, take: limitNum,
        include: { owner: { select: { id: true, name: true, email: true, isVerified: true, identityStatus: true, createdAt: true } }, facilities: true },
      }),
      prisma.property.count({ where }),
    ]);

    const userPrefs = {
      budget: maxRent ? Number(maxRent) : undefined,
      college: college,
      propertyType: propertyType,
    };

    const properties = rawProperties.map((p) => {
      const shaped = shapeProperty(p);
      if (Object.values(userPrefs).some(Boolean)) {
        const rec = calculatePropertyRecommendation(shaped as never, userPrefs);
        return { ...shaped, matchPercentage: rec.matchPercentage, matchReasons: rec.reasons };
      }
      return shaped;
    });

    res.json({ properties, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch properties.' });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const raw = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, isVerified: true, identityStatus: true, createdAt: true } },
        facilities: true,
        reviews: { include: { student: { select: { id: true, name: true, college: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!raw || !raw.isActive) { res.status(404).json({ message: 'Property not found.' }); return; }

    await prisma.property.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });

    let isSaved = false;
    if (req.user) {
      const saved = await prisma.savedProperty.findUnique({ where: { userId_propertyId: { userId: req.user.id, propertyId: req.params.id } } });
      isSaved = !!saved;
    }

    const { reviews, ...rest } = raw;
    res.json({ property: shapeProperty(rest as never), isSaved, reviews });
  } catch {
    res.status(500).json({ message: 'Failed to fetch property.' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const result = propertySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }
    const { nearbyFacilities, ...d } = result.data;

    const property = await prisma.property.create({
      data: {
        ...d,
        houseRules: JSON.stringify(d.houseRules ?? []),
        images: JSON.stringify(d.images ?? []),
        scamRiskFlags: JSON.stringify([]),
        availableFrom: new Date(d.availableFrom),
        ownerId: req.user.id,
        facilities: nearbyFacilities ? { create: nearbyFacilities } : undefined,
      },
      include: { facilities: true },
    });

    // Compute scam risk
    const avgRentResult = await prisma.property.aggregate({
      where: { locality: { equals: d.locality }, isActive: true },
      _avg: { rent: true },
    });
    const risk = calculateScamRisk(shapeProperty({ ...property, owner: req.user as never } as never) as never, avgRentResult._avg.rent ?? 0);
    await prisma.property.update({ where: { id: property.id }, data: { scamRiskScore: risk.score, scamRiskLevel: risk.level, scamRiskFlags: JSON.stringify(risk.flags) } });

    res.status(201).json({ message: 'Property created successfully', property: shapeProperty({ ...property, owner: req.user as never, facilities: property.facilities } as never) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create property.' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ message: 'Property not found.' }); return; }
    if (existing.ownerId !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized.' }); return;
    }
    const { nearbyFacilities, address, coordinates, amenities, ...rest } = req.body;
    const updated = await prisma.property.update({ where: { id: req.params.id }, data: rest, include: { facilities: true, owner: true } });
    res.json({ message: 'Property updated', property: shapeProperty(updated) });
  } catch {
    res.status(500).json({ message: 'Failed to update property.' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ message: 'Property not found.' }); return; }
    if (existing.ownerId !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized.' }); return;
    }
    await prisma.property.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Property removed.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete property.' });
  }
};

export const toggleFavourite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const key = { userId: req.user.id, propertyId: req.params.id };
    const existing = await prisma.savedProperty.findUnique({ where: { userId_propertyId: key } });
    if (existing) {
      await prisma.savedProperty.delete({ where: { userId_propertyId: key } });
      res.json({ message: 'Removed from favourites', isSaved: false });
    } else {
      await prisma.savedProperty.create({ data: key });
      res.json({ message: 'Saved to favourites', isSaved: true });
    }
  } catch {
    res.status(500).json({ message: 'Failed to update favourites.' });
  }
};

export const getSavedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user!.id },
      include: { property: { include: { owner: { select: { id: true, name: true, isVerified: true } }, facilities: true } } },
    });
    res.json({ properties: saved.map((s) => shapeProperty(s.property as never)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch saved properties.' });
  }
};

export const getRecommendedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { budget, college, propertyType } = req.query as Record<string, string>;
    const where: Prisma.PropertyWhereInput = { isActive: true, isAvailable: true };
    if (college) where.college = { contains: college };
    if (propertyType) where.propertyType = propertyType as never;

    const raw = await prisma.property.findMany({ where, take: 20, include: { owner: { select: { id: true, name: true, isVerified: true } }, facilities: true } });
    const prefs = { budget: budget ? Number(budget) : undefined, college, propertyType };

    const scored = raw
      .map((p) => { const shaped = shapeProperty(p as never); const rec = calculatePropertyRecommendation(shaped as never, prefs); return { ...shaped, matchPercentage: rec.matchPercentage, matchReasons: rec.reasons }; })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);

    res.json({ properties: scored });
  } catch {
    res.status(500).json({ message: 'Failed to fetch recommendations.' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const { ratings, comment } = req.body;
    if (!ratings || !comment) { res.status(400).json({ message: 'Ratings and comment are required.' }); return; }

    const overallRating = Object.values(ratings as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(ratings).length;

    const review = await prisma.review.create({
      data: {
        propertyId: req.params.id, studentId: req.user.id,
        roomQuality: ratings.roomQuality, locality: ratings.locality, water: ratings.water,
        electricity: ratings.electricity, internet: ratings.internet, ownerBehaviour: ratings.ownerBehaviour,
        safety: ratings.safety, valueForMoney: ratings.valueForMoney,
        overallRating: Math.round(overallRating * 10) / 10, comment,
      },
      include: { student: { select: { id: true, name: true, college: true } } },
    });

    const agg = await prisma.review.aggregate({ where: { propertyId: req.params.id }, _avg: { overallRating: true }, _count: true });
    await prisma.property.update({ where: { id: req.params.id }, data: { avgRating: Math.round((agg._avg.overallRating ?? 0) * 10) / 10, reviewCount: agg._count } });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') res.status(409).json({ message: 'You have already reviewed this property.' });
    else res.status(500).json({ message: 'Failed to submit review.' });
  }
};

export const getReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { propertyId: req.params.id },
      include: { student: { select: { id: true, name: true, college: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};
