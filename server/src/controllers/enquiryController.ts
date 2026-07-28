import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const enquirySchema = z.object({
  propertyId: z.string(),
  studentName: z.string().min(2),
  contactNumber: z.string().min(10),
  preferredVisitDate: z.string(),
  moveInDate: z.string(),
  message: z.string().min(10).max(1000),
});

export const createEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const result = enquirySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }
    const { propertyId, studentName, contactNumber, preferredVisitDate, moveInDate, message } = result.data;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || !property.isActive) { res.status(404).json({ message: 'Property not found.' }); return; }

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId, studentId: req.user.id, ownerId: property.ownerId,
        studentName, contactNumber, message,
        preferredVisitDate: new Date(preferredVisitDate),
        moveInDate: new Date(moveInDate),
      },
    });
    res.status(201).json({ message: 'Enquiry sent successfully', enquiry });
  } catch {
    res.status(500).json({ message: 'Failed to send enquiry.' });
  }
};

export const getStudentEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { studentId: req.user!.id },
      include: { property: { select: { id: true, title: true, street: true, locality: true, images: true, rent: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ enquiries });
  } catch {
    res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
};

export const getOwnerEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { ownerId: req.user!.id },
      include: {
        property: { select: { id: true, title: true, street: true, locality: true, images: true } },
        student: { select: { id: true, name: true, email: true, phone: true, college: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ enquiries });
  } catch {
    res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
};

export const respondToEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) { res.status(404).json({ message: 'Enquiry not found.' }); return; }
    if (enquiry.ownerId !== req.user?.id) { res.status(403).json({ message: 'Not authorized.' }); return; }
    const updated = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: { ownerResponse: req.body.response, status: 'responded' },
    });
    res.json({ message: 'Response sent', enquiry: updated });
  } catch {
    res.status(500).json({ message: 'Failed to respond.' });
  }
};
