import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFavourite,
  getSavedProperties,
  getRecommendedProperties,
  createReview,
  getReviews,
} from '../controllers/propertyController';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public/optional auth
router.get('/', optionalAuth, getProperties);
router.get('/saved', authenticate, getSavedProperties);
router.get('/recommended', optionalAuth, getRecommendedProperties);
router.get('/:id', optionalAuth, getPropertyById);
router.get('/:id/reviews', getReviews);

// Authenticated
router.post('/', authenticate, requireRole('owner', 'admin'), createProperty);
router.put('/:id', authenticate, requireRole('owner', 'admin'), updateProperty);
router.delete('/:id', authenticate, requireRole('owner', 'admin'), deleteProperty);
router.post('/:id/favourite', authenticate, requireRole('student'), toggleFavourite);
router.delete('/:id/favourite', authenticate, requireRole('student'), toggleFavourite);
router.post('/:id/reviews', authenticate, requireRole('student'), createReview);

export default router;
