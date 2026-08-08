import { api } from './api/client';

export interface WorkHistoryItem {
  company?: string;
  role?: string;
  period?: string;
}

export interface MedicalProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  hospital: string;
  bio: string;
  resumeUrl: string;
  certifications: string[];
  workHistory: WorkHistoryItem[];
}

export const medicalProfileService = {
  async getProfile() {
    try {
      const response = await api.get<MedicalProfilePayload>('/medical-provider/profile');
      return response.data;
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (statusCode !== 404) {
        throw error;
      }

      const fallback = await api.get<{
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      }>('/auth/profile');

      return {
        firstName: fallback.data?.firstName || '',
        lastName: fallback.data?.lastName || '',
        email: fallback.data?.email || '',
        phone: fallback.data?.phone || '',
        specialty: '',
        licenseNumber: '',
        hospital: '',
        bio: '',
        resumeUrl: '',
        certifications: [],
        workHistory: [],
      };
    }
  },

  async updateProfile(payload: Partial<MedicalProfilePayload>) {
    const response = await api.put<MedicalProfilePayload>('/medical-provider/profile', payload);
    return response.data;
  },

  async uploadResume(file: File) {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post<{ resumeUrl: string; profile: MedicalProfilePayload }>(
      '/medical-provider/profile/resume',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
