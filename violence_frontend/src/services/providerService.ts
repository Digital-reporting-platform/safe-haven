import { api } from './api/client';

export enum ServiceProviderType {
  COUNSELOR = 'COUNSELOR',
  MEDICAL_PROFESSIONAL = 'MEDICAL_PROFESSIONAL',
  LEGAL_ADVISOR = 'LEGAL_ADVISOR',
  NGO = 'NGO',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  SHELTER = 'SHELTER',
  OTHER = 'OTHER',
}

export interface Provider {
  id: string;
  name: string;
  type: ServiceProviderType;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  isVerified: boolean;
  languages: string[];
  specializations: string[];
  availability: string;
  rating: number;
  source?: string;
}

export interface ProviderResponse {
  data: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const providerService = {
  getProviders: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    verified?: boolean;
    city?: string;
    search?: string;
  }): Promise<ProviderResponse> => {
    const response = await api.get('/professionals', { params });
    return response.data;
  },

  getProviderById: async (id: string): Promise<Provider> => {
    const response = await api.get(`/professionals/${id}`);
    return response.data;
  },

  createProvider: async (provider: Partial<Provider>): Promise<Provider> => {
    const response = await api.post('/professionals', provider);
    return response.data;
  },

  updateProvider: async (id: string, updates: Partial<Provider>): Promise<Provider> => {
    const response = await api.put(`/professionals/${id}`, updates);
    return response.data;
  },

  verifyProvider: async (id: string): Promise<Provider> => {
    const response = await api.post(`/professionals/${id}/verify`);
    return response.data;
  },

  addReview: async (id: string, rating: number, feedback?: string): Promise<any> => {
    const response = await api.post(`/professionals/${id}/review`, { rating, feedback });
    return response.data;
  },
};

