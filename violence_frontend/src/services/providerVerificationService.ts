import { api } from './api/client';

export type ProviderType =
  | 'COUNSELOR'
  | 'MEDICAL_PROFESSIONAL'
  | 'LEGAL_ADVISOR'
  | 'NGO'
  | 'GOVERNMENT_AGENCY'
  | 'COMMUNITY_CENTER'
  | 'SHELTER'
  | 'HOTLINE';

export type ProviderRecord = {
  id: string;
  name: string;
  type: ProviderType;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  availability?: string | null;
  languages: string[];
  specializations: string[];
  isVerified: boolean;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
};

type ProvidersResponse = {
  data: ProviderRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ProviderStats = {
  byType: Array<{ type: string; _count: number }>;
  verified: number;
  total: number;
  unverified: number;
};

export const providerVerificationService = {
  async getProviderStats() {
    const response = await api.get<ProviderStats>('/professionals/stats');
    return response.data;
  },

  async getPendingProviders(params?: {
    search?: string;
    type?: ProviderType | 'all';
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<ProvidersResponse>('/professionals', {
      params: {
        verified: false,
        page: params?.page ?? 1,
        limit: params?.limit ?? 200,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.type && params.type !== 'all' ? { type: params.type } : {}),
      },
    });
    return response.data;
  },

  async getVerifiedProviders(params?: {
    search?: string;
    type?: ProviderType | 'all';
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<ProvidersResponse>('/professionals', {
      params: {
        verified: true,
        page: params?.page ?? 1,
        limit: params?.limit ?? 200,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.type && params.type !== 'all' ? { type: params.type } : {}),
      },
    });
    return response.data;
  },

  async verifyProvider(providerId: string) {
    const response = await api.post(`/professionals/${providerId}/verify`);
    return response.data;
  },

  async updateProvider(
    providerId: string,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      country?: string;
      description?: string;
      availability?: string;
      languages?: string[];
      specializations?: string[];
    },
  ) {
    const response = await api.put(`/professionals/${providerId}`, payload);
    return response.data;
  },
};

