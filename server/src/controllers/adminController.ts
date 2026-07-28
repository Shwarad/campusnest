import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStudents, totalOwners, totalProperties, activeProperties,
      verifiedProperties, pendingVerifications, pendingReports, totalEnquiries, totalReviews] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'student', isActive: true } }),
        prisma.user.count({ where: { role: 'owner', isActive: true } }),
        prisma.property.count({ where: { isActive: true } }),
        prisma.property.count({ where: { isActive: true, isAvailable: true } }),
        prisma.property.count({ where: { verificationStatus: 'verified', isActive: true } }),
        prisma.property.count({ where: { verificationStatus: 'pending', isActive: true } }),
        prisma.report.count({ where: { status: 'pending' } }),
        prisma.enquiry.count(),
        prisma.review.count(),
      ]);

    const recentProperties = await prisma.property.findMany({
      where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 5,
      include: { owner: { select: { name: true } } },
    });
    const recentUsers = await prisma.user.findMany({
      where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({
      stats: { totalUsers, totalStudents, totalOwners, totalProperties, activeProperties, verifiedProperties, pendingVerifications, pendingReports, totalEnquiries, totalReviews },
      recentProperties, recentUsers,
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

export const getPendingVerifications = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { verificationStatus: 'pending', isActive: true },
      include: { owner: { select: { id: true, name: true, email: true, phone: true, identityStatus: true, createdAt: true } }, facilities: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ properties });
  } catch {
    res.status(500).json({ message: 'Failed to fetch verifications.' });
  }
};

export const verifyProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.update({ where: { id: req.params.id }, data: { verificationStatus: 'verified' } });
    res.json({ message: 'Property verified', property });
  } catch {
    res.status(500).json({ message: 'Failed to verify.' });
  }
};

export const rejectProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.update({ where: { id: req.params.id }, data: { verificationStatus: 'rejected' } });
    res.json({ message: 'Verification rejected', property });
  } catch {
    res.status(500).json({ message: 'Failed to reject.' });
  }
};

export const getReports = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        property: { select: { id: true, title: true, locality: true, isActive: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reports });
  } catch {
    res.status(500).json({ message: 'Failed to fetch reports.' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status: req.body.status, adminNotes: req.body.adminNotes },
    });
    res.json({ message: 'Report updated', report });
  } catch {
    res.status(500).json({ message: 'Failed to update report.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1' } = req.query as Record<string, string>;
    const where = role ? { role: role as never } : {};
    const pageNum = Math.max(1, parseInt(page));
    const limit = 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * limit, take: limit, select: { id: true, name: true, email: true, role: true, college: true, isActive: true, isVerified: true, identityStatus: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    const { password: _, ...safe } = updated;
    res.json({ message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, user: safe });
  } catch {
    res.status(500).json({ message: 'Failed to update user.' });
  }
};
