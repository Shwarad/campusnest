import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Property from '../models/Property';
import User from '../models/User';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import { calculatePropertyRecommendation, calculateScamRisk } from '../utils/recommendation';

const propertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  address: z.object({
    street: z.string().min(3),
    locality: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
  }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  propertyType: z.enum(['room', 'pg', 'hostel', 'flat', 'shared_room']),
  rent: z.number().min(100).max(500000),
  deposit: z.number().min(0),
  totalRooms: z.number().min(1).optional(),
  availableBeds: z.number().min(0).optional(),
  furnishing: z.enum(['furnished', 'semi-furnished', 'unfurnished']),
  genderPreference: z.enum(['boys', 'girls', 'coed']),
  amenities: z.object({
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
  }).optional(),
  houseRules: z.array(z.string()).optional(),
  availableFrom: z.string(),
  college: z.string().min(2),
  distanceFromCollege: z.number().min(0).max(50),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email(),
  nearbyFacilities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    distance: z.string(),
  })).optional(),
});

export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search, minRent, maxRent, propertyType, furnishing, genderPreference,
      wifi, ac, attachedBathroom, parking, laundry, food, powerBackup,
      petFriendly, verifiedOnly, sortBy, college, maxDistance,
      page = '1', limit = '12',
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.locality': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) (filter.rent as Record<string, number>).$gte = Number(minRent);
      if (maxRent) (filter.rent as Record<string, number>).$lte = Number(maxRent);
    }

    if (propertyType) filter.propertyType = propertyType;
    if (furnishing) filter.furnishing = furnishing;
    if (genderPreference) filter.genderPreference = genderPreference;
    if (wifi === 'true') filter['amenities.wifi'] = true;
    if (ac === 'true') filter['amenities.ac'] = true;
    if (attachedBathroom === 'true') filter['amenities.attachedBathroom'] = true;
    if (parking === 'true') filter['amenities.parking'] = true;
    if (laundry === 'true') filter['amenities.laundry'] = true;
    if (food === 'true') filter['amenities.food'] = true;
    if (powerBackup === 'true') filter['amenities.powerBackup'] = true;
    if (petFriendly === 'true') filter['amenities.petFriendly'] = true;
    if (verifiedOnly === 'true') filter.verificationStatus = 'verified';
    if (college) filter.college = { $regex: college, $options: 'i' };
    if (maxDistance) filter.distanceFromCollege = { $lte: Number(maxDistance) };

    let sortQuery: Record<string, unknown> = { createdAt: -1 };
    if (sortBy === 'rent_asc') sortQuery = { rent: 1 };
    else if (sortBy === 'rent_desc') sortQuery = { rent: -1 };
    else if (sortBy === 'rating') sortQuery = { avgRating: -1 };
    else if (sortBy === 'distance') sortQuery = { distanceFromCollege: 1 };
    else if (sortBy === 'popular') sortQuery = { views: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email isVerified identityStatus createdAt'),
      Property.countDocuments(filter),
    ]);

    // Add recommendation scores if user preferences available
    const userPrefs: Record<string, unknown> = {};
    if (req.user?.role === 'student') {
      if (maxRent) userPrefs.budget = Number(maxRent);
      if (college) userPrefs.college = college as string;
      if (propertyType) userPrefs.propertyType = propertyType as string;
      if (furnishing) userPrefs.furnishing = furnishing as string;
    }

    const enrichedProperties = properties.map((p) => {
      const obj = p.toObject();
      if (Object.keys(userPrefs).length > 0) {
        const rec = calculatePropertyRecommendation(p, userPrefs as Record<string, unknown> as Parameters<typeof calculatePropertyRecommendation>[1]);
        return { ...obj, matchPercentage: rec.matchPercentage, matchReasons: rec.reasons };
      }
      return obj;
    });

    res.json({
      properties: enrichedProperties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ message: 'Failed to fetch properties.' });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone isVerified identityStatus createdAt');

    if (!property || !property.isActive) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }

    // Increment view count
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if saved by current user
    let isSaved = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isSaved = user?.savedProperties.some((id) => id.toString() === req.params.id) || false;
    }

    // Get recent reviews
    const reviews = await Review.find({ property: req.params.id })
      .populate('student', 'name college')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ property, isSaved, reviews });
  } catch {
    res.status(500).json({ message: 'Failed to fetch property.' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const result = propertySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }

    const propertyData = {
      ...result.data,
      owner: req.user._id,
      images: req.body.images || [],
      availableFrom: new Date(result.data.availableFrom),
    };

    const property = await Property.create(propertyData);

    // Calculate and update scam risk
    const avgRent = await getAvgRentInArea(result.data.address.locality);
    const risk = calculateScamRisk(property, avgRent);
    await Property.findByIdAndUpdate(property._id, {
      scamRiskScore: risk.score,
      scamRiskLevel: risk.level,
      scamRiskFlags: risk.flags,
    });

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ message: 'Failed to create property.' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }

    const isOwner = property.owner.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to edit this property.' });
      return;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Property updated', property: updated });
  } catch {
    res.status(500).json({ message: 'Failed to update property.' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }

    const isOwner = property.owner.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this property.' });
      return;
    }

    await Property.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Property removed successfully.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete property.' });
  }
};

export const toggleFavourite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const propertyId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isSaved = user.savedProperties.some((id) => id.toString() === req.params.id);

    if (isSaved) {
      user.savedProperties = user.savedProperties.filter((id) => id.toString() !== req.params.id);
      await user.save();
      res.json({ message: 'Removed from favourites', isSaved: false });
    } else {
      user.savedProperties.push(propertyId);
      await user.save();
      res.json({ message: 'Added to favourites', isSaved: true });
    }
  } catch {
    res.status(500).json({ message: 'Failed to update favourites.' });
  }
};

export const getSavedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).populate({
      path: 'savedProperties',
      match: { isActive: true },
      populate: { path: 'owner', select: 'name isVerified' },
    });
    res.json({ properties: user?.savedProperties || [] });
  } catch {
    res.status(500).json({ message: 'Failed to fetch saved properties.' });
  }
};

export const getRecommendedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { budget, college, propertyType, amenities } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isActive: true, isAvailable: true };
    if (college) filter.college = { $regex: college, $options: 'i' };
    if (propertyType) filter.propertyType = propertyType;

    const properties = await Property.find(filter)
      .limit(20)
      .populate('owner', 'name isVerified');

    const prefs = {
      budget: budget ? Number(budget) : undefined,
      college,
      propertyType,
      amenities: amenities ? amenities.split(',') : [],
    };

    const scored = properties
      .map((p) => {
        const rec = calculatePropertyRecommendation(p, prefs);
        return { ...p.toObject(), matchPercentage: rec.matchPercentage, matchReasons: rec.reasons };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);

    res.json({ properties: scored });
  } catch {
    res.status(500).json({ message: 'Failed to fetch recommendations.' });
  }
};

async function getAvgRentInArea(locality: string): Promise<number> {
  const result = await Property.aggregate([
    { $match: { 'address.locality': { $regex: locality, $options: 'i' }, isActive: true } },
    { $group: { _id: null, avgRent: { $avg: '$rent' } } },
  ]);
  return result[0]?.avgRent || 0;
}

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { ratings, comment } = req.body;
    if (!ratings || !comment) {
      res.status(400).json({ message: 'Ratings and comment are required.' });
      return;
    }

    const existing = await Review.findOne({ property: req.params.id, student: req.user._id });
    if (existing) {
      res.status(409).json({ message: 'You have already reviewed this property.' });
      return;
    }

    const overallRating = Math.round(
      Object.values(ratings as Record<string, number>).reduce((a, b) => a + b, 0) /
        Object.keys(ratings).length
    );

    const review = await Review.create({
      property: req.params.id,
      student: req.user._id,
      ratings,
      overallRating,
      comment,
    });

    // Update property's average rating
    const allReviews = await Review.find({ property: req.params.id });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;

    await Property.findByIdAndUpdate(req.params.id, {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err: unknown) {
    const error = err as { code?: number };
    if (error.code === 11000) {
      res.status(409).json({ message: 'You have already reviewed this property.' });
    } else {
      res.status(500).json({ message: 'Failed to submit review.' });
    }
  }
};

export const getReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ property: req.params.id })
      .populate('student', 'name college avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};
