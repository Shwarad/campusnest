import api from './api';
import { Enquiry } from '../types';

export const enquiryService = {
  async send(data: {
    propertyId: string;
    studentName: string;
    contactNumber: string;
    preferredVisitDate: string;
    moveInDate: string;
    message: string;
  }): Promise<Enquiry> {
    const res = await api.post('/enquiries', data);
    return res.data.enquiry;
  },

  async getStudentEnquiries(): Promise<Enquiry[]> {
    const res = await api.get('/enquiries/student');
    return res.data.enquiries;
  },

  async getOwnerEnquiries(): Promise<Enquiry[]> {
    const res = await api.get('/enquiries/owner');
    return res.data.enquiries;
  },

  async respond(enquiryId: string, response: string): Promise<void> {
    await api.put(`/enquiries/${enquiryId}/respond`, { response });
  },
};
