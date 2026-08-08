import { api } from './api/client';
import {
  ReportStatus,
  UpdateStatusDto,
  SurvivorProgressView,
  ProgressResponse,
  TimelineResponse,
  AllowedTransitionsResponse,
  BatchUpdateStatusDto,
} from '@/types/progress';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get survivor-friendly progress view for a report
 */
export const getSurvivorProgress = async (
  reportId: string,
): Promise<SurvivorProgressView> => {
  const response = await api.get(`${API_URL}/progress/survivor/${reportId}`);
  return response.data;
};

/**
 * Get status timeline for a report
 */
export const getStatusTimeline = async (
  reportId: string,
): Promise<TimelineResponse> => {
  const response = await api.get(`${API_URL}/progress/timeline/${reportId}`);
  return response.data;
};

/**
 * Update report status with role-based validation
 */
export const updateReportStatus = async (
  reportId: string,
  dto: UpdateStatusDto,
): Promise<ProgressResponse> => {
  const response = await api.post(
    `${API_URL}/progress/${reportId}/status`,
    dto,
  );
  return response.data;
};

/**
 * Get allowed next statuses for current user
 */
export const getAllowedTransitions = async (
  reportId: string,
): Promise<AllowedTransitionsResponse> => {
  const response = await api.get(
    `${API_URL}/progress/${reportId}/allowed-transitions`,
  );
  return response.data;
};

/**
 * Batch update report statuses (admin only)
 */
export const batchUpdateStatuses = async (
  dto: BatchUpdateStatusDto,
): Promise<{ successful: string[]; failed: Array<{ reportId: string; error: string }> }> => {
  const response = await api.post(`${API_URL}/progress/batch/status`, dto);
  return response.data;
};

/**
 * Get progress percentage for a report
 */
export const getProgressPercentage = async (
  reportId: string,
): Promise<{ reportId: string; percentage: number }> => {
  const response = await api.get(`${API_URL}/progress/${reportId}/percentage`);
  return response.data;
};

// Convenience methods for specific transitions

/**
 * Mark report as received (counselor/admin only)
 */
export const receiveReport = async (
  reportId: string,
  notes?: string,
): Promise<ProgressResponse> => {
  const response = await api.post(`${API_URL}/progress/${reportId}/receive`, {
    notes,
  });
  return response.data;
};

/**
 * Mark report as assigned (counselor/admin only)
 */
export const assignReport = async (
  reportId: string,
  notes?: string,
): Promise<ProgressResponse> => {
  const response = await api.post(`${API_URL}/progress/${reportId}/assign`, {
    notes,
  });
  return response.data;
};

/**
 * Start support for a report (medical/legal professionals)
 */
export const startSupport = async (
  reportId: string,
  notes?: string,
): Promise<ProgressResponse> => {
  const response = await api.post(
    `${API_URL}/progress/${reportId}/start-support`,
    { notes },
  );
  return response.data;
};

/**
 * Mark report as resolved (medical/legal professionals)
 */
export const resolveReport = async (
  reportId: string,
  notes?: string,
  feedback?: string,
): Promise<ProgressResponse> => {
  const response = await api.post(`${API_URL}/progress/${reportId}/resolve`, {
    notes,
    feedback,
  });
  return response.data;
};

/**
 * Close a report (admin/counselor only)
 */
export const closeReport = async (
  reportId: string,
  notes?: string,
): Promise<ProgressResponse> => {
  const response = await api.post(`${API_URL}/progress/${reportId}/close`, {
    notes,
  });
  return response.data;
};

/**
 * Reject a report (admin/counselor only)
 */
export const rejectReport = async (
  reportId: string,
  reason: string,
): Promise<ProgressResponse> => {
  const response = await api.post(`${API_URL}/progress/${reportId}/reject`, {
    reason,
  });
  return response.data;
};

export const progressService = {
  getSurvivorProgress,
  getStatusTimeline,
  updateReportStatus,
  getAllowedTransitions,
  batchUpdateStatuses,
  getProgressPercentage,
  receiveReport,
  assignReport,
  startSupport,
  resolveReport,
  closeReport,
  rejectReport,
};
