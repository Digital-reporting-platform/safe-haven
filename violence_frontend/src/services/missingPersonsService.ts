import { api } from './api/client';
import { MissingPerson, MissingPersonStatus } from '@/types/forum';

export interface CreateMissingPersonDto {
  firstName: string;
  lastName: string;
  age?: number;
  description?: string;
  photoUrl?: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  status?: MissingPersonStatus;
}

export interface UpdateMissingPersonDto {
  firstName?: string;
  lastName?: string;
  age?: number;
  description?: string;
  photoUrl?: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  status?: MissingPersonStatus;
  resolvedAt?: string;
}

const API_PATH = '/missing-persons';

export const missingPersonsService = {
  // Get all missing persons with optional filtering
  async getAll(status?: MissingPersonStatus, search?: string): Promise<MissingPerson[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`${API_PATH}${query}`);
      
      // Ensure we always return an array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('API returned non-array data:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch missing persons:', error);
      return [];
    }
  },

  // Get a single missing person by ID
  async getById(id: string): Promise<MissingPerson> {
    const response = await api.get(`${API_PATH}/${id}`);
    return response.data;
  },

  // Create a new missing person report (requires authentication)
  async create(data: CreateMissingPersonDto): Promise<MissingPerson> {
    const response = await api.post(API_PATH, data);
    return response.data;
  },

  // Update a missing person report (requires authentication)
  async update(id: string, data: UpdateMissingPersonDto): Promise<MissingPerson> {
    const response = await api.put(`${API_PATH}/${id}`, data);
    return response.data;
  },

  // Delete a missing person report (requires authentication)
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${API_PATH}/${id}`);
    return response.data;
  },

  // Mark a missing person as found (requires authentication)
  async markAsFound(id: string): Promise<MissingPerson> {
    const response = await api.patch(`${API_PATH}/${id}/found`);
    return response.data;
  },

  // ==================== ADMIN ENDPOINTS ====================

  // Get all pending reports for admin review (requires admin/counselor role)
  async getPending(): Promise<MissingPerson[]> {
    const response = await api.get(`${API_PATH}/admin/pending`);
    return response.data;
  },

  // Get all reports with optional status filter (requires admin role)
  async getAllAdmin(status?: MissingPersonStatus): Promise<MissingPerson[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`${API_PATH}/admin/all${query}`);
    return response.data;
  },

  // Approve a pending report (requires admin/counselor role)
  async approve(id: string): Promise<MissingPerson> {
    const response = await api.patch(`${API_PATH}/${id}/approve`);
    return response.data;
  },

  // Reject/close a report (requires admin role)
  async reject(id: string): Promise<MissingPerson> {
    const response = await api.patch(`${API_PATH}/${id}/reject`);
    return response.data;
  },

  // Get statistics (requires admin role)
  async getStats(): Promise<{ total: number; byStatus: { pending: number; active: number; found: number; closed: number } }> {
    const response = await api.get(`${API_PATH}/admin/stats`);
    return response.data;
  },

  // ==================== SIGHTINGS ====================

  // Create a sighting report (public)
  async createSighting(missingPersonId: string, data: {
    location: string;
    sightingDate: string;
    description?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  }): Promise<any> {
    const response = await api.post(`${API_PATH}/${missingPersonId}/sightings`, data);
    return response.data;
  },

  // Get sightings for a missing person (public)
  async getSightingsForPerson(missingPersonId: string): Promise<any[]> {
    const response = await api.get(`${API_PATH}/${missingPersonId}/sightings`);
    return response.data;
  },

  // Get all sightings (admin only)
  async getSightings(verified?: boolean): Promise<any[]> {
    const params = verified !== undefined ? `?verified=${verified}` : '';
    const response = await api.get(`${API_PATH}/admin/sightings${params}`);
    return response.data;
  },

  // Verify a sighting (admin only)
  async verifySighting(sightingId: string): Promise<any> {
    const response = await api.patch(`${API_PATH}/sightings/${sightingId}/verify`);
    return response.data;
  },
};
