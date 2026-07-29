/**
 * authController.ts
 *
 * Authentication methods:
 *   1. Email + Password  (register / login)
 *   2. Google OAuth      (via ID token verified server-side with google-auth-library)
 *   3. Phone + SMS OTP   (send OTP → verify OTP → JWT)
 *   4. Email + OTP       (passwordless — send OTP → verify OTP → JWT)
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateOtp, hashOtp, verifyOtp, otpExpiry, sendSmsOtp, sendEmailOtp } from '../utils/otp';

// ── Helpers ───────────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  } as jwt.SignOptions);

function safeUser(user: Record<string, unknown>) {
  const { password, otpHash, otpExpiry: exp, otpPurpose, ...rest } = user;
  void password; void otpHash; void exp; void otpPurpose;
  return { ...rest, _id: rest.id };
}

// ── 1. Email + Password Register ─────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  phone:    z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  role:     z.enum(['student', 'owner']),
  college:  z.string().optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }
    const { name, email, phone, password, role, college } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashed, role, college: role === 'student' ? college : undefined },
    });

    const token = generateToken(user.id);
    res.status(201).json({ message: 'Registration successful', token, user: safeUser(user as never) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ── 2. Email + Password Login ─────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid email or password format.' });
      return;
    }
    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    // Guard against Google-only accounts
    if (!user.password) {
      res.status(400).json({ message: 'This account uses Google sign-in. Please use "Continue with Google".' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id);
    res.json({ message: 'Login successful', token, user: safeUser(user as never) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ── 3. Google OAuth ───────────────────────────────────────────────────────────

const googleSchema = z.object({
  idToken: z.string().min(1),
  role:    z.enum(['student', 'owner']).optional().default('student'),
  college: z.string().optional(),
});

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = googleSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Google ID token is required.' });
      return;
    }
    const { idToken, role, college } = result.data;

    // Verify the ID token with Google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      res.status(401).json({ message: 'Invalid Google token. Please try again.' });
      return;
    }

    if (!payload?.sub || !payload.email) {
      res.status(401).json({ message: 'Could not extract user information from Google token.' });
      return;
    }

    const { sub: googleId, email, name = 'Google User', picture } = payload;

    // Find by googleId first, then fall back to email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Merge googleId if the account was created via email/password before
      if (!user.googleId) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      }
      if (!user.isActive) {
        res.status(403).json({ message: 'Account deactivated. Contact support.' });
        return;
      }
    } else {
      // New user — auto-register
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone: '',
          password: '',
          role,
          college: role === 'student' ? college : undefined,
          googleId,
          avatar: picture,
          isVerified: true, // Google-verified email
        },
      });
    }

    const token = generateToken(user.id);
    res.json({
      message:    user.createdAt.getTime() === user.updatedAt.getTime() ? 'Account created via Google' : 'Google sign-in successful',
      token,
      user:       safeUser(user as never),
      isNewUser:  !payload.email_verified,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed. Please try again.' });
  }
};

// ── 4. Phone OTP — send ───────────────────────────────────────────────────────

const sendPhoneOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const sendPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = sendPhoneOtpSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'A valid phone number is required.' });
      return;
    }
    const { phone } = result.data;
    const otp    = generateOtp();
    const hashed = await hashOtp(otp);
    const expiry = otpExpiry(10);

    // Upsert user so we can store the OTP even if they don't have an account yet
    const existing = await prisma.user.findFirst({ where: { phone } });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data:  { otpHash: hashed, otpExpiry: expiry, otpPurpose: 'phone_login' },
      });
    }
    // For unknown numbers, store OTP in a temporary record identified by phone
    // We'll create the user on verify if they are new.

    await sendSmsOtp(phone, otp);
    res.json({ message: `OTP sent to ${phone.slice(0, 4)}****${phone.slice(-3)}` });
  } catch (err) {
    console.error('sendPhoneOtp error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// ── 5. Phone OTP — verify ─────────────────────────────────────────────────────

const verifyPhoneOtpSchema = z.object({
  phone:   z.string().min(10).max(15),
  otp:     z.string().length(6),
  name:    z.string().min(2).optional(),
  role:    z.enum(['student', 'owner']).optional().default('student'),
  college: z.string().optional(),
});

export const verifyPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = verifyPhoneOtpSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Phone number and 6-digit OTP are required.' });
      return;
    }
    const { phone, otp, name, role, college } = result.data;

    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      // New user via phone — need name to register
      if (!name) {
        res.status(400).json({ message: 'Please provide your name to create a new account.', requiresName: true });
        return;
      }
      // For new phone users we store a temporary OTP in a placeholder user
      // Check if there's a pending OTP we sent
      res.status(404).json({ message: 'No OTP was sent to this number. Please request a new OTP first.', notFound: true });
      return;
    }

    if (!user.otpHash || !user.otpExpiry || user.otpPurpose !== 'phone_login') {
      res.status(400).json({ message: 'No OTP found for this number. Please request a new OTP.' });
      return;
    }
    if (new Date() > user.otpExpiry) {
      res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      return;
    }
    const isValid = await verifyOtp(otp, user.otpHash);
    if (!isValid) {
      res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
      return;
    }

    // Clear OTP fields and mark phone as verified
    user = await prisma.user.update({
      where: { id: user.id },
      data:  { otpHash: null, otpExpiry: null, otpPurpose: null, phoneVerified: true },
    });

    if (!user.isActive) {
      res.status(403).json({ message: 'Account deactivated. Contact support.' });
      return;
    }

    const token = generateToken(user.id);
    res.json({ message: 'Phone sign-in successful', token, user: safeUser(user as never) });
  } catch (err) {
    console.error('verifyPhoneOtp error:', err);
    res.status(500).json({ message: 'OTP verification failed. Please try again.' });
  }
};

// ── 6. Email OTP — send (passwordless) ───────────────────────────────────────

const sendEmailOtpSchema = z.object({ email: z.string().email() });

export const sendEmailOtpLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = sendEmailOtpSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'A valid email address is required.' });
      return;
    }
    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      // Don't reveal whether email exists; silently succeed
      res.json({ message: `If an account exists for ${email}, a sign-in code has been sent.` });
      return;
    }

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);
    const expiry = otpExpiry(10);

    await prisma.user.update({ where: { id: user.id }, data: { otpHash: hashed, otpExpiry: expiry, otpPurpose: 'email_otp_login' } });
    await sendEmailOtp(email, otp, user.name);

    res.json({ message: `If an account exists for ${email}, a sign-in code has been sent.` });
  } catch (err) {
    console.error('sendEmailOtp error:', err);
    res.status(500).json({ message: 'Failed to send email OTP. Please try again.' });
  }
};

// ── 7. Email OTP — verify ─────────────────────────────────────────────────────

const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6),
});

export const verifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = verifyEmailOtpSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Email and 6-digit code are required.' });
      return;
    }
    const { email, otp } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    const INVALID_MSG = 'Invalid or expired code. Please request a new one.';
    if (!user || !user.otpHash || !user.otpExpiry || user.otpPurpose !== 'email_otp_login') {
      res.status(400).json({ message: INVALID_MSG });
      return;
    }
    if (new Date() > user.otpExpiry) {
      res.status(400).json({ message: INVALID_MSG });
      return;
    }
    const isValid = await verifyOtp(otp, user.otpHash);
    if (!isValid) {
      res.status(400).json({ message: INVALID_MSG });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data:  { otpHash: null, otpExpiry: null, otpPurpose: null },
    });

    if (!updated.isActive) {
      res.status(403).json({ message: 'Account deactivated. Contact support.' });
      return;
    }

    const token = generateToken(updated.id);
    res.json({ message: 'Sign-in successful', token, user: safeUser(updated as never) });
  } catch (err) {
    console.error('verifyEmailOtp error:', err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ── 8. Get current user ───────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.user!.id },
      include: { savedProperties: { include: { property: { select: { id: true, title: true, rent: true, locality: true, images: true } } } } },
    });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
    res.json({ user: safeUser(user as never) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

// ── 9. Update profile ─────────────────────────────────────────────────────────

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'phone', 'college', 'avatar'] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const user = await prisma.user.update({ where: { id: req.user!.id }, data });
    res.json({ message: 'Profile updated', user: safeUser(user as never) });
  } catch {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
