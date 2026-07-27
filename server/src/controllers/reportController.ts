import { Response } from 'express';
import { z } from 'zod';
import Report from '../models/Report';
import Property from '../models/Property';
import { AuthRequest } from '../middleware/auth';

const reportSchema = z.object({
  reason: z.enum([
    'fake_listing', 'advance_payment', 'wrong_info',
    'duplicate', 'scam', 'inappropriate', 'other',
  ]),
  description: z.string().min(10).max(1000),
});

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const result = reportSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }

    const existing = await Report.findOne({
      property: req.params.id,
      reportedBy: req.user._id,
    });
    if (existing) {
      res.status(409).json({ message: 'You have already reported this listing.' });
      return;
    }

    const report = await Report.create({
      property: req.params.id,
      reportedBy: req.user._id,
      reason: result.data.reason,
      description: result.data.description,
    });

    // Update scam risk if multiple reports
    const reportCount = await Report.countDocuments({ property: req.params.id, status: 'pending' });
    if (reportCount >= 3) {
      await Property.findByIdAndUpdate(req.params.id, {
        scamRiskLevel: 'high',
        $addToSet: { scamRiskFlags: 'Multiple user reports received' },
      });
    } else if (reportCount >= 1) {
      await Property.findByIdAndUpdate(req.params.id, {
        scamRiskLevel: 'review_recommended',
        $addToSet: { scamRiskFlags: 'User report received' },
      });
    }

    res.status(201).json({ message: 'Report submitted. Thank you for keeping CampusNest safe.', report });
  } catch {
    res.status(500).json({ message: 'Failed to submit report.' });
  }
};
