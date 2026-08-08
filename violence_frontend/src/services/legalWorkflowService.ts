import { api } from './api/client';

export type LegalCaseItem = {
  id: string;
  reportId: string;
  title: string;
  description: string;
  caseType: string;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string | null;
    name: string;
  };
  evidenceCount: number;
};

export type LegalProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firm: string;
  specialization: string;
  barLicenseNumber: string;
  bio: string;
};

export type ProviderInvitationItem = {
  caseId: string;
  reportId: string;
  reportTitle: string;
  reportSeverity: string;
  reportStatus: string;
  caseType: string;
  roleInCase: 'PRIMARY' | 'SUPPORT';
  invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt: string;
  respondedAt: string | null;
};

export const legalWorkflowService = {
  async getDashboard() {
    const response = await api.get<{
      stats: {
        activeCases: number;
        completedCases: number;
        urgentCases: number;
        combinedCases: number;
      };
      recentCases: Array<{
        id: string;
        reportId: string;
        title: string;
        caseType: string;
        priority: string;
        status: string;
        patientName: string;
        updatedAt: string;
      }>;
      upcomingEvents: Array<{
        id: string;
        title: string;
        date: string | null;
        type: string;
        patientId: string | null;
      }>;
    }>('/legal-provider/dashboard');
    return response.data;
  },

  async getCases() {
    const response = await api.get<LegalCaseItem[]>('/legal-provider/cases');
    return response.data;
  },

  async getConsultations() {
    const response = await api.get<
      Array<{
        id: string;
        caseId: string;
        topic: string;
        scheduledAt: string;
        mode: string;
        patientName: string;
      }>
    >('/legal-provider/consultations');
    return response.data;
  },

  async getCourtCalendar() {
    const response = await api.get<
      Array<{
        id: string;
        title: string;
        date: string;
        location: string;
        status: string;
        priority: string;
      }>
    >('/legal-provider/court-calendar');
    return response.data;
  },

  async getDocuments() {
    const response = await api.get<
      Array<{
        id: string;
        reportId: string;
        caseTitle: string;
        name: string;
        fileType: string;
        url: string;
        uploadedAt: string;
      }>
    >('/legal-provider/documents');
    return response.data;
  },

  async getEvidence() {
    const response = await api.get<
      Array<{
        id: string;
        reportId: string;
        caseTitle: string;
        name: string;
        fileType: string;
        url: string;
        uploadedAt: string;
      }>
    >('/legal-provider/evidence');
    return response.data;
  },

  async getMessaging() {
    const response = await api.get<
      Array<{
        caseId: string;
        reportId: string;
        patientId: string | null;
        patientName: string;
        lastMessage: string;
        lastMessageAt: string;
      }>
    >('/legal-provider/messaging');
    return response.data;
  },

  async getOutcomes() {
    const response = await api.get<{
      totalCases: number;
      completedCases: number;
      successRate: number;
      averageResolutionDays: number;
      recentOutcomes: Array<{
        id: string;
        reportId: string;
        title: string;
        completedAt: string;
        priority: string;
      }>;
    }>('/legal-provider/outcomes');
    return response.data;
  },

  async getResources() {
    const response = await api.get<
      Array<{
        id: string;
        title: string;
        category: string;
        type: string;
      }>
    >('/legal-provider/resources');
    return response.data;
  },

  async getProfile() {
    const response = await api.get<LegalProfilePayload>('/legal-provider/profile');
    return response.data;
  },

  async updateProfile(payload: Partial<LegalProfilePayload>) {
    const response = await api.put<LegalProfilePayload>('/legal-provider/profile', payload);
    return response.data;
  },

  async getMyInvitations() {
    const response = await api.get<ProviderInvitationItem[]>('/cases/invitations/me');
    return response.data;
  },

  async respondToInvitation(caseId: string, action: 'ACCEPT' | 'DECLINE') {
    const response = await api.post<{
      caseId: string;
      invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
      respondedAt: string | null;
    }>(`/cases/${caseId}/invitations/respond`, { action });
    return response.data;
  },
};
