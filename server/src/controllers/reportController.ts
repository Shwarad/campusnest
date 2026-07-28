import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const reportSchema = z.object({
  reason: z.enum(['fake_listing', 'advance_payment', 'wrong_info', 'duplicate', 'scam', 'inappropriate', 'other']),
  description: z.string().min(10).max(1000),
});

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const result = reportSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) { res.status(404).json({ message: 'Property not found.' }); return; }

    const report = await prisma.report.create({
      data: { propertyId: req.params.id, reportedById: req.user.id, reason: result.data.reason, description: result.data.description },
    });

    const reportCount = await prisma.report.count({ where: { propertyId: req.params.id, status: 'pending' } });
    if (reportCount >= 3) {
      const prop = await prisma.property.findUnique({ where: { id: req.params.id }, select: { scamRiskFlags: true } });
      const existingFlags: string[] = (() => { try { return JSON.parse(prop?.scamRiskFlags ?? '[]'); } catch { return []; } })();
      const newFlags = [...new Set([...existingFlags, 'Multiple user reports received'])];
      await prisma.property.update({ where: { id: req.params.id }, data: { scamRiskLevel: 'high', scamRiskFlags: JSON.stringify(newFlags) } });
    } else if (reportCount >= 1) {
      const prop = await prisma.property.findUnique({ where: { id: req.params.id }, select: { scamRiskFlags: true } });
      const existingFlags: string[] = (() => { try { return JSON.parse(prop?.scamRiskFlags ?? '[]'); } catch { return []; } })();
      const newFlags = [...new Set([...existingFlags, 'User report received'])];
      await prisma.property.update({ where: { id: req.params.id }, data: { scamRiskLevel: 'review_recommended', scamRiskFlags: JSON.stringify(newFlags) } });
    }

    res.status(201).json({ message: 'Report submitted. Thank you for keeping CampusNest safe.', report });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') res.status(409).json({ message: 'You have already reported this listing.' });
    else res.status(500).json({ message: 'Failed to submit report.' });
  }
};
