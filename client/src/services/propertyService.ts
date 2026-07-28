import api from './api';
import { Property, PropertyFilters, Review, Pagination } from '../types';

export const propertyService = {
  async getAll(filters: PropertyFilters = {}): Promise<{ properties: Property[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) params.set(k, String(v));
    });
    const res = await api.get(`/properties?${params}`);
    return res.data;
  },

  async getById(id: string): Promise<{ property: Property; isSaved: boolean; reviews: Review[] }> {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  async create(data: Partial<Property>): Promise<Property> {
    const res = await api.post('/properties', data);
    return res.data.property;
  },

  async update(id: string, data: Partial<Property>): Promise<Property> {
    const res = await api.put(`/properties/${id}`, data);
    return res.data.property;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async toggleFavourite(id: string): Promise<{ isSaved: boolean }> {
    const res = await api.post(`/properties/${id}/favourite`);
    return res.data;
  },

  async getSaved(): Promise<Property[]> {
    const res = await api.get('/properties/saved');
    return res.data.properties;
  },

  async getRecommended(prefs: Partial<PropertyFilters>): Promise<Property[]> {
    const params = new URLSearchParams();
    Object.entries(prefs).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    const res = await api.get(`/properties/recommended?${params}`);
    return res.data.properties;
  },

  async submitReview(propertyId: string, data: { ratings: Record<string, number>; comment: string }): Promise<Review> {
    const res = await api.post(`/properties/${propertyId}/reviews`, data);
    return res.data.review;
  },

  async getReviews(propertyId: string): Promise<Review[]> {
    const res = await api.get(`/properties/${propertyId}/reviews`);
    return res.data.reviews;
  },

  async report(propertyId: string, data: { reason: string; description: string }): Promise<void> {
    await api.post(`/properties/${propertyId}/report`, data);
  },
};
