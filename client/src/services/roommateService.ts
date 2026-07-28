import api from './api';
import { RoommateProfile, RoommateMatch } from '../types';

export const roommateService = {
  async getProfiles(filters?: Record<string, string>): Promise<RoommateProfile[]> {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/roommates?${params}`);
    return res.data.profiles;
  },

  async getMatches(): Promise<{ matches: RoommateMatch[]; myProfile: RoommateProfile }> {
    const res = await api.get('/roommates/matches');
    return res.data;
  },

  async getMyProfile(): Promise<RoommateProfile | null> {
    const res = await api.get('/roommates/my-profile');
    return res.data.profile;
  },

  async saveProfile(data: Partial<RoommateProfile>): Promise<RoommateProfile> {
    const res = await api.post('/roommates/profile', data);
    return res.data.profile;
  },

  async updateProfile(data: Partial<RoommateProfile>): Promise<RoommateProfile> {
    const res = await api.put('/roommates/profile', data);
    return res.data.profile;
  },
};
