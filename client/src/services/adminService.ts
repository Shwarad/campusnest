import api from './api';
import { AdminStats, Property, User, Report } from '../types';

export const adminService = {
  async getDashboard(): Promise<{
    stats: AdminStats;
    recentProperties: Property[];
    recentUsers: User[];
  }> {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getPendingVerifications(): Promise<Property[]> {
    const res = await api.get('/admin/verifications');
    return res.data.properties;
  },

  async verifyProperty(id: string): Promise<void> {
    await api.put(`/admin/properties/${id}/verify`);
  },

  async rejectProperty(id: string): Promise<void> {
    await api.put(`/admin/properties/${id}/reject`);
  },

  async getReports(): Promise<Report[]> {
    const res = await api.get('/admin/reports');
    return res.data.reports;
  },

  async updateReportStatus(id: string, status: string, adminNotes?: string): Promise<void> {
    await api.put(`/admin/reports/${id}`, { status, adminNotes });
  },

  async getUsers(params?: Record<string, string>): Promise<{ users: User[]; pagination: { total: number; totalPages: number; page: number } }> {
    const query = new URLSearchParams(params);
    const res = await api.get(`/admin/users?${query}`);
    return res.data;
  },

  async toggleUserStatus(id: string): Promise<void> {
    await api.put(`/admin/users/${id}/toggle`);
  },
};
