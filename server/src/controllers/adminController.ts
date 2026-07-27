import { Response } from 'express';
import Property from '../models/Property';
import User from '../models/User';
import Report from '../models/Report';
import Enquiry from '../models/Enquiry';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalOwners,
      totalProperties,
      activeProperties,
      verifiedProperties,
      pendingVerifications,
      pendingReports,
      totalEnquiries,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'owner', isActive: true }),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: true, isAvailable: true }),
      Property.countDocuments({ verificationStatus: 'verified', isActive: true }),
      Property.countDocuments({ verificationStatus: 'pending', isActive: true }),
      Report.countDocuments({ status: 'pending' }),
      Enquiry.countDocuments(),
      Review.countDocuments(),
    ]);

    // Recent activity
    const recentProperties = await Property.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name');

    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalOwners,
        totalProperties,
        activeProperties,
        verifiedProperties,
        pendingVerifications,
        pendingReports,
        totalEnquiries,
        totalReviews,
      },
      recentProperties,
      recentUsers,
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};

export const getPendingVerifications = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const properties = await Property.find({ verificationStatus: 'pending', isActive: true })
      .populate('owner', 'name email phone identityStatus createdAt')
      .sort({ createdAt: -1 });
    res.json({ properties });
  } catch {
    res.status(500).json({ message: 'Failed to fetch verifications.' });
  }
};

export const verifyProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    );
    if (!property) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }
    res.json({ message: 'Property verified successfully', property });
  } catch {
    res.status(500).json({ message: 'Failed to verify property.' });
  }
};

export const rejectProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', isActive: true },
      { new: true }
    );
    if (!property) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }
    res.json({ message: 'Property verification rejected', property });
  } catch {
    res.status(500).json({ message: 'Failed to reject property.' });
  }
};

export const getReports = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await Report.find()
      .populate('property', 'title address isActive')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch {
    res.status(500).json({ message: 'Failed to fetch reports.' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, adminNotes: req.body.adminNotes },
      { new: true }
    );
    res.json({ message: 'Report updated', report });
  } catch {
    res.status(500).json({ message: 'Failed to update report.' });
  }
};

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1' } = _req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    const pageNum = Math.max(1, parseInt(page));
    const limit = 20;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch {
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};
