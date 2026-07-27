import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  role: z.enum(['student', 'owner']),
  college: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }

    const { name, email, phone, password, role, college } = result.data;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      college: role === 'student' ? college : undefined,
    });

    const token = generateToken(user._id.toString());
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid email or password format.' });
      return;
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        isVerified: user.isVerified,
        savedProperties: user.savedProperties,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).populate('savedProperties', 'title rent address images');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'phone', 'college', 'avatar'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true });
    res.json({ message: 'Profile updated', user });
  } catch {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
