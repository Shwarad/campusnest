import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtpLogin,
  verifyEmailOtp,
  getMe,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Tight rate limit for OTP endpoints (prevent brute-force / SMS cost abuse)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max:      5,
  message:  { message: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Email + Password ──────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.post('/google', googleAuth);

// ── Phone OTP ─────────────────────────────────────────────────────────────────
router.post('/phone/send-otp',   otpLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', otpLimiter, verifyPhoneOtp);

// ── Email OTP (passwordless) ──────────────────────────────────────────────────
router.post('/email/send-otp',   otpLimiter, sendEmailOtpLogin);
router.post('/email/verify-otp', otpLimiter, verifyEmailOtp);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get('/me',      authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
