import { api } from './api/client';

export interface PatientListItem {
  id: string;
  name: string;
  age: number | null;
  gender: string;
  status: 'Active' | 'Follow-up' | 'Completed';
  lastVisit: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedByML?: boolean;
}

export interface PatientRecordData {
  patient: {
    id: string;
    name: string;
    age: number | null;
    gender: string;
    dob: string | null;
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    status: 'Active' | 'Follow-up' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    assignedByML?: boolean;
  };
  medicalHistory: Array<{
    date: string;
    type: string;
    description: string;
    provider: string;
    notes: string;
  }>;
  examinations: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
    results: string;
  }>;
  treatmentPlans: Array<{
    id: string;
    name: string;
    startDate: string;
    status: string;
    description: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    fileType: string;
    uploadedAt: string;
  }>;
}

export const patientService = {
  async assignMedicalNeeded(limit = 50) {
    const response = await api.post('/patients/assign-medical-needed', null, {
      params: { limit },
    });
    return response.data as { scanned: number; assigned: number; skipped: number };
  },

  async assignCareNeeded(limit = 100) {
    const response = await api.post('/patients/assign-care-needed', null, {
      params: { limit },
    });
    return response.data as { scanned: number; assigned: number; skipped: number };
  },

  async getMedicalNotifications(hours = 48, limit = 40) {
    const response = await api.get<
      Array<{
        id: string;
        type:
          | 'NEW_MEDICAL_ISSUE'
          | 'UPDATED_MEDICAL_ISSUE'
          | 'NEW_PERSON_ADDED'
          | 'NEW_LEGAL_ISSUE'
          | 'UPDATED_LEGAL_ISSUE';
        title: string;
        description: string;
        timestamp: string;
        reportId: string;
        patientId: string | null;
        patientName: string;
        caseType?: string;
      }>
    >('/patients/notifications/role', {
      params: { hours, limit },
    });
    return response.data;
  },

  async getPatients(
    search?: string,
    status?: string,
    _options?: { assignedToMedical?: boolean },
  ) {
    const params = {
      ...(search ? { search } : {}),
      ...(status && status !== 'All' ? { status } : {}),
    };

    const response = await api.get<PatientListItem[]>('/patients', { params });
    return response.data;
  },

  async getPatientRecord(patientId: string) {
    const response = await api.get<PatientRecordData>(`/patients/${patientId}/record`);
    return response.data;
  },

  async updatePatient(
    patientId: string,
    payload: { firstName?: string; lastName?: string; phone?: string; email?: string },
  ) {
    const response = await api.patch(`/patients/${patientId}`, payload);
    return response.data;
  },

  async addNote(patientId: string, content: string) {
    const response = await api.post(`/patients/${patientId}/notes`, { content });
    return response.data;
  },

  async getChatConversations() {
    const response = await api.get<
      Array<{
        reportId: string;
        patientId: string;
        patientName: string;
        assignedByML: boolean;
        caseType: string;
        assignedProviders?: Array<{
          id: string;
          name: string;
          type: string;
        }>;
        lastMessage: string;
        lastMessageAt: string;
        lastSenderName: string | null;
      }>
    >('/patients/chat/conversations');
    return response.data;
  },

  async getPatientChat(patientId: string, reportId?: string) {
    const response = await api.get<{
      reportId: string;
      patientId: string;
      patientName: string;
      assignedByML: boolean;
      caseType: string;
      assignedProviders?: Array<{
        id: string;
        name: string;
        type: string;
      }>;
      messages: Array<{
        id: string;
        content: string;
        createdAt: string;
        senderId: string;
        senderRole: string;
        senderName: string;
      }>;
    }>(`/patients/${patientId}/chat`, {
      params: reportId ? { reportId } : undefined,
    });
    return response.data;
  },

  async sendPatientChat(patientId: string, content: string, reportId?: string) {
    const response = await api.post(`/patients/${patientId}/chat`, {
      content,
      ...(reportId ? { reportId } : {}),
    });
    return response.data;
  },
};
