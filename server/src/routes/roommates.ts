import { Router } from 'express';
import {
  getRoommateProfiles,
  getRoommateMatches,
  createOrUpdateProfile,
  getMyProfile,
} from '../controllers/roommateController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getRoommateProfiles);
router.get('/my-profile', authenticate, getMyProfile);
router.get('/matches', authenticate, getRoommateMatches);
router.post('/profile', authenticate, createOrUpdateProfile);
router.put('/profile', authenticate, createOrUpdateProfile);

export default router;
