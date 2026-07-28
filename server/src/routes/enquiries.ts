import { Router } from 'express';
import {
  createEnquiry,
  getStudentEnquiries,
  getOwnerEnquiries,
  respondToEnquiry,
} from '../controllers/enquiryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole('student'), createEnquiry);
router.get('/student', authenticate, requireRole('student'), getStudentEnquiries);
router.get('/owner', authenticate, requireRole('owner'), getOwnerEnquiries);
router.put('/:id/respond', authenticate, requireRole('owner'), respondToEnquiry);

export default router;
