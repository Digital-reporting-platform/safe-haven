import { api } from './api/client';

export interface MLClassification {
  category: string;
  severity: string;
  classificationScore: number;
  classificationLabel: string;
  suggestedCaseType: string;
  riskScore: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  classificationScore: number;
  classificationLabel: string;
  suggestedCaseType: string;
  riskScore: number;
  isAnonymous: boolean;
  trackingNumber?: string;
  classificationConfirmed?: boolean;
  createdAt: string;
  location?: string;
  reporter?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

export interface CaseAssignment {
  id: string;
  caseType: string;
  priority: string;
  status: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  report: Report;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  supportProviders?: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
  }>;
}

export interface PendingCasesResponse {
  data: CaseAssignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ClassificationUpdatePayload {
  category?: string;
  severity?: string;
  caseType?: string;
  notes?: string;
}

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  specialization?: string;
  isAvailable: boolean;
}

export const counselorService = {
  // Get all cases (for counselor overview)
  async getAllCases(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PendingCasesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/cases?${params.toString()}`);
    return response.data;
  },

  // Get pending cases for counselor review with ML classification
  async getPendingCases(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PendingCasesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/cases/counselor/pending?${params.toString()}`);
    return response.data;
  },

  // Get unassigned reports for counselor review and assignment
  async getUnassignedReports(
    page: number = 1,
    limit: number = 20,
  ): Promise<PendingCasesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/cases/counselor/unassigned?${params.toString()}`);
    return response.data;
  },

  // Confirm or override ML classification
  async updateClassification(
    reportId: string,
    payload: ClassificationUpdatePayload,
    confirmed: boolean = false,
  ): Promise<{ report: Report }> {
    // Use reports endpoint instead of cases since reports may not have case assignments yet
    const response = await api.put(`/reports/${reportId}`, {
      category: payload.category,
      severity: payload.severity,
      suggestedCaseType: payload.caseType,
      classificationNotes: payload.notes,
      classificationConfirmed: confirmed,
    });
    return { report: response.data };
  },

  // Auto-route case to appropriate professional (returns ML suggestions only, does NOT create assignment)
  async autoRouteCase(reportId: string): Promise<{
    reportId: string;
    suggestedCaseType: string;
    suggestedPriority: string;
    suggestedProfessionals: {
      primary: any;
      additional: any[];
    };
    availabilityWarning?: string;
  }> {
    const response = await api.post(`/cases/auto-route/${reportId}`);
    return response.data;
  },

  // Manually assign case to professional
  async assignCase(
    reportId: string,
    payload: {
      assignedToId: string;
      caseType: string;
      priority?: string;
      dueDate?: string;
      notes?: string;
    },
  ): Promise<CaseAssignment> {
    const response = await api.post(`/cases/assign/${reportId}`, payload);
    return response.data;
  },

  // Get available professionals
  async getProfessionals(caseType?: string): Promise<Professional[]> {
    // Map CaseType to ServiceProviderType
    const typeMap: Record<string, string> = {
      'MEDICAL_SUPPORT': 'MEDICAL_PROFESSIONAL',
      'LEGAL_ASSISTANCE': 'LEGAL_ADVISOR',
      'COMBINED_SUPPORT': '', // Fetch all for combined
      'COUNSELING': 'COUNSELOR',
    };

    // Convert CaseType to ServiceProviderType
    const providerType = caseType ? typeMap[caseType] : undefined;
    
    // For COMBINED_SUPPORT, don't filter by type (fetch all)
    const params = providerType ? `?type=${providerType}` : '';
    
    const response = await api.get(`/professionals${params}`);
    // Backend returns paginated response with { data, pagination }
    return response.data.data || [];
  },

  // Get case statistics
  async getCaseStats(): Promise<any> {
    const response = await api.get('/cases/stats');
    return response.data;
  },

  // Get counselor appointments (assigned cases as sessions)
  async getAppointments(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PendingCasesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/cases/counselor/appointments?${params.toString()}`);
    return response.data;
  },

  // Get case by ID
  async getCaseById(caseId: string): Promise<CaseAssignment> {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  },

  // Messaging / Case Comments
  async getCaseComments(caseId: string): Promise<any[]> {
    const response = await api.get(`/cases/${caseId}/comments`);
    return response.data;
  },

  async addCaseComment(caseId: string, content: string, isInternal: boolean = false): Promise<any> {
    const response = await api.post(`/cases/${caseId}/comments`, {
      content,
      isInternal,
    });
    return response.data;
  },

  async deleteCaseComment(commentId: string): Promise<any> {
    const response = await api.delete(`/cases/comments/${commentId}`);
    return response.data;
  },
};
