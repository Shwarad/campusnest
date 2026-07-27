import { Router } from 'express';
import {
  getDashboardStats,
  getPendingVerifications,
  verifyProperty,
  rejectProperty,
  getReports,
  updateReportStatus,
  getUsers,
  toggleUserStatus,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/verifications', getPendingVerifications);
router.put('/properties/:id/verify', verifyProperty);
router.put('/properties/:id/reject', rejectProperty);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);

export default router;
