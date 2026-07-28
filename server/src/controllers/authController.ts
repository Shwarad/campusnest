import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/database';
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

const generateToken = (userId: string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  } as jwt.SignOptions);

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
    const { password: _, ...safeUser } = user;
    res.status(201).json({ message: 'Registration successful', token, user: { ...safeUser, _id: safeUser.id } });
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login successful', token, user: { ...safeUser, _id: safeUser.id } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { savedProperties: { include: { property: { select: { id: true, title: true, rent: true, locality: true, images: true } } } } },
    });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
    const { password: _, ...safeUser } = user;
    res.json({ user: { ...safeUser, _id: safeUser.id } });
  } catch {
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'phone', 'college', 'avatar'] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const user = await prisma.user.update({ where: { id: req.user!.id }, data });
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Profile updated', user: { ...safeUser, _id: safeUser.id } });
  } catch {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
