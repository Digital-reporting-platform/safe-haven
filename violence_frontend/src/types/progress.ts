/**
 * Report Progress Workflow Types
 * These types support the role-based status workflow
 */

// Report Status - 7 workflow states
export enum ReportStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  RECEIVED = 'RECEIVED',
  ASSIGNED = 'ASSIGNED',
  IN_SUPPORT = 'IN_SUPPORT',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

// User Role - 8 role types
export enum UserRole {
  GUEST = 'GUEST',
  SURVIVOR = 'SURVIVOR',
  COUNSELOR = 'COUNSELOR',
  MEDICAL_PROFESSIONAL = 'MEDICAL_PROFESSIONAL',
  LEGAL_ADVISOR = 'LEGAL_ADVISOR',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SYSTEM = 'SYSTEM',
}

// Survivor-friendly status labels
export const SURVIVOR_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.PENDING_REVIEW]: 'Submitted',
  [ReportStatus.RECEIVED]: 'Received',
  [ReportStatus.ASSIGNED]: 'Help is being arranged',
  [ReportStatus.IN_SUPPORT]: 'You are being supported',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.CLOSED]: 'Closed',
  [ReportStatus.REJECTED]: 'Closed',
};

// Survivor-friendly status messages
export const SURVIVOR_STATUS_MESSAGES: Record<ReportStatus, string> = {
  [ReportStatus.PENDING_REVIEW]: 'Your report has been successfully submitted.',
  [ReportStatus.RECEIVED]: 'Our team has received your report and is reviewing it.',
  [ReportStatus.ASSIGNED]: 'We are assigning the right professional to assist you.',
  [ReportStatus.IN_SUPPORT]: 'A professional is currently supporting your case.',
  [ReportStatus.RESOLVED]: 'Your case has been addressed.',
  [ReportStatus.CLOSED]: 'This case has been officially closed.',
  [ReportStatus.REJECTED]: 'This case has been reviewed and closed.',
};

// Progress percentage for each status
export const STATUS_PROGRESS_PERCENTAGE: Record<ReportStatus, number> = {
  [ReportStatus.PENDING_REVIEW]: 0,
  [ReportStatus.RECEIVED]: 20,
  [ReportStatus.ASSIGNED]: 40,
  [ReportStatus.IN_SUPPORT]: 60,
  [ReportStatus.RESOLVED]: 80,
  [ReportStatus.CLOSED]: 100,
  [ReportStatus.REJECTED]: 0,
};

// Status colors for UI
export const REPORT_STATUS_COLORS: Record<
  ReportStatus,
  { bg: string; text: string; border: string; progress: string }
> = {
  [ReportStatus.PENDING_REVIEW]: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    progress: 'bg-gray-400',
  },
  [ReportStatus.RECEIVED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    progress: 'bg-blue-400',
  },
  [ReportStatus.ASSIGNED]: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    progress: 'bg-indigo-400',
  },
  [ReportStatus.IN_SUPPORT]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    progress: 'bg-yellow-400',
  },
  [ReportStatus.RESOLVED]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    progress: 'bg-green-400',
  },
  [ReportStatus.CLOSED]: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    progress: 'bg-purple-400',
  },
  [ReportStatus.REJECTED]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    progress: 'bg-red-400',
  },
};

// Status history entry
export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: string;
  changedBy: string;
  changedByRole: UserRole;
  notes?: string;
}

// Survivor progress view (simplified)
export interface SurvivorProgressView {
  reportId: string;
  status: ReportStatus;
  label: string;
  message: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  category: string;
  canViewDetails: boolean;
}

// Full progress response
export interface ProgressResponse {
  reportId: string;
  status: ReportStatus;
  previousStatus?: ReportStatus;
  progressPercentage: number;
  caseAssignmentUpdated?: boolean;
  message?: string;
}

// Timeline response
export interface TimelineResponse {
  reportId: string;
  timeline: StatusHistoryEntry[];
}

// Allowed transitions response
export interface AllowedTransitionsResponse {
  currentStatus: ReportStatus;
  allowedTransitions: ReportStatus[];
}

// Update status DTO
export interface UpdateStatusDto {
  status: ReportStatus;
  notes?: string;
}

// Batch update DTO
export interface BatchUpdateStatusDto {
  reportIds: string[];
  status: ReportStatus;
}

// Helper functions
export const getSurvivorLabel = (status: ReportStatus): string => {
  return SURVIVOR_STATUS_LABELS[status];
};

export const getSurvivorMessage = (status: ReportStatus): string => {
  return SURVIVOR_STATUS_MESSAGES[status];
};

export const getProgressPercentage = (status: ReportStatus): number => {
  return STATUS_PROGRESS_PERCENTAGE[status];
};

export const getStatusColor = (status: ReportStatus) => {
  return REPORT_STATUS_COLORS[status];
};

export const isTerminalStatus = (status: ReportStatus): boolean => {
  return status === ReportStatus.CLOSED || status === ReportStatus.REJECTED;
};

export const isActiveStatus = (status: ReportStatus): boolean => {
  return !isTerminalStatus(status) && status !== ReportStatus.PENDING_REVIEW;
};
