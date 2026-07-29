/**
 * aiService.ts
 *
 * Client-side service for all AI API endpoints.
 * Never calls IBM watsonx.ai directly — all requests go through the backend.
 */

import api from './api';

export interface AISearchFilters {
  city?: string | null;
  college?: string | null;
  locality?: string | null;
  minimumRent?: number | null;
  maximumRent?: number | null;
  maximumDistanceKm?: number | null;
  propertyTypes?: string[];
  genderPreference?: 'boys' | 'girls' | 'coed' | null;
  occupancy?: 'single' | 'shared' | null;
  furnishingStatus?: string | null;
  amenities?: string[];
  moveInDate?: string | null;
  verifiedOnly?: boolean;
  keywords?: string[];
  sortBy?: string;
}

export interface ParseSearchResponse {
  filters:        AISearchFilters;
  interpretation: string;
  queryParams:    Record<string, string>;
  aiAssisted:     boolean;
}

export interface ComparisonPreferences {
  college?:            string;
  maximumRent?:        number;
  importantAmenities?: string[];
  priority?:           'distance' | 'rent' | 'rating' | 'amenities' | 'verification';
}

export interface TradeoffItem {
  propertyId:  string;
  advantages:  string[];
  limitations: string[];
}

export interface AIComparisonResult {
  recommendedPropertyId: string;
  summary:               string;
  reasons:               string[];
  tradeoffs:             TradeoffItem[];
  disclaimer:            string;
}

export interface PropertyMetrics {
  id:                        string;
  title:                     string;
  rent:                      number;
  deposit:                   number;
  distanceFromCollege:       number;
  estimatedMonthlyExpense:   number;
  pricePerOccupant:          number;
  amenitiesCount:            number;
  missingPreferredAmenities: string[];
  avgRating:                 number;
  scamRiskLevel:             string;
  verificationStatus:        string;
  furnishing:                string;
  food:                      boolean;
}

export interface ComparePropertiesResponse {
  comparison:    PropertyMetrics[];
  aiExplanation: AIComparisonResult;
}

export interface ListingSummary {
  bestFor:           string;
  advantages:        string[];
  limitations:       string[];
  questionsForOwner: string[];
}

export interface RoommateExplanation {
  overallScore:          number;
  summary:               string;
  strongMatches:         string[];
  differences:           string[];
  discussionSuggestions: string[];
  disclaimer:            string;
}

export interface ReviewSummary {
  overallSentiment: string;
  positiveThemes:   string[];
  negativeThemes:   string[];
  summary:          string;
  reviewCount:      number;
}

export interface ScamRiskExplanation {
  status:             'low_risk' | 'review_recommended' | 'high_caution';
  explanation:        string;
  recommendedActions: string[];
  disclaimer:         string;
}

export interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply:             string;
  propertyRefs:      string[];
  suggestedActions:  string[];
  conversationId:    string;
}

export interface AIStatus {
  enabled:  boolean;
  mockMode: boolean;
  modelId:  string;
}

export const aiService = {
  async getStatus(): Promise<AIStatus> {
    const res = await api.get('/ai/status');
    return res.data;
  },

  async parseSearch(query: string): Promise<ParseSearchResponse> {
    const res = await api.post('/ai/search/parse', { query });
    return res.data;
  },

  async compareProperties(
    propertyIds: string[],
    preferences?: ComparisonPreferences
  ): Promise<ComparePropertiesResponse> {
    const res = await api.post('/ai/properties/compare', { propertyIds, preferences });
    return res.data;
  },

  async getListingSummary(propertyId: string): Promise<{ summary: ListingSummary; disclaimer: string }> {
    const res = await api.get(`/ai/properties/${propertyId}/summary`);
    return res.data;
  },

  async getReviewSummary(propertyId: string): Promise<{ summary: ReviewSummary | null; message?: string }> {
    const res = await api.get(`/ai/properties/${propertyId}/reviews/summary`);
    return res.data;
  },

  async getRiskExplanation(propertyId: string): Promise<{ explanation: ScamRiskExplanation }> {
    const res = await api.get(`/ai/properties/${propertyId}/risk-explanation`);
    return res.data;
  },

  async getRoommateExplanation(roommateId: string): Promise<{ explanation: RoommateExplanation }> {
    const res = await api.get(`/ai/roommates/${roommateId}/explanation`);
    return res.data;
  },

  async chat(
    message: string,
    conversationId?: string,
    selectedPropertyIds?: string[]
  ): Promise<ChatResponse> {
    const res = await api.post('/ai/chat', {
      message,
      conversationId,
      context: { selectedPropertyIds },
    });
    return res.data;
  },
};
