import { Response } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry';
import Property from '../models/Property';
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
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const result = enquirySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors });
      return;
    }

    const { propertyId, studentName, contactNumber, preferredVisitDate, moveInDate, message } = result.data;

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      res.status(404).json({ message: 'Property not found.' });
      return;
    }

    const enquiry = await Enquiry.create({
      property: propertyId,
      student: req.user._id,
      owner: property.owner,
      studentName,
      contactNumber,
      preferredVisitDate: new Date(preferredVisitDate),
      moveInDate: new Date(moveInDate),
      message,
    });

    res.status(201).json({ message: 'Enquiry sent successfully', enquiry });
  } catch {
    res.status(500).json({ message: 'Failed to send enquiry.' });
  }
};

export const getStudentEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiries = await Enquiry.find({ student: req.user?._id })
      .populate('property', 'title address images rent')
      .sort({ createdAt: -1 });
    res.json({ enquiries });
  } catch {
    res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
};

export const getOwnerEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiries = await Enquiry.find({ owner: req.user?._id })
      .populate('property', 'title address images')
      .populate('student', 'name email phone college')
      .sort({ createdAt: -1 });
    res.json({ enquiries });
  } catch {
    res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
};

export const respondToEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found.' });
      return;
    }
    if (enquiry.owner.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized.' });
      return;
    }
    enquiry.ownerResponse = req.body.response;
    enquiry.status = 'responded';
    await enquiry.save();
    res.json({ message: 'Response sent', enquiry });
  } catch {
    res.status(500).json({ message: 'Failed to respond to enquiry.' });
  }
};
