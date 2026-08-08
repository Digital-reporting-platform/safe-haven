/**
 * Case Management Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

// ============================================
// ENUMS
// ============================================

// Case Type - 7 types of support cases
export enum CaseType {
  COUNSELING = 'COUNSELING',
  MEDICAL_SUPPORT = 'MEDICAL_SUPPORT',
  LEGAL_ASSISTANCE = 'LEGAL_ASSISTANCE',
  EMERGENCY_SUPPORT = 'EMERGENCY_SUPPORT',
  PREVENTION_EDUCATION = 'PREVENTION_EDUCATION',
  RESOURCE_REFERRAL = 'RESOURCE_REFERRAL',
  COMBINED_SUPPORT = 'COMBINED_SUPPORT',
}

// Case Priority - 4 priority levels
export enum CasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Assignment Status - 4 workflow states
export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Service Provider Type - 8 types of providers
export enum ServiceProviderType {
  COUNSELOR = 'COUNSELOR',
  MEDICAL_PROFESSIONAL = 'MEDICAL_PROFESSIONAL',
  LEGAL_ADVISOR = 'LEGAL_ADVISOR',
  NGO = 'NGO',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  COMMUNITY_CENTER = 'COMMUNITY_CENTER',
  SHELTER = 'SHELTER',
  HOTLINE = 'HOTLINE',
}

// Support Request Status
export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// LABELS & HELPERS
// ============================================

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  [CaseType.COUNSELING]: 'Counseling',
  [CaseType.MEDICAL_SUPPORT]: 'Medical Support',
  [CaseType.LEGAL_ASSISTANCE]: 'Legal Assistance',
  [CaseType.EMERGENCY_SUPPORT]: 'Emergency Support',
  [CaseType.PREVENTION_EDUCATION]: 'Prevention & Education',
  [CaseType.RESOURCE_REFERRAL]: 'Resource Referral',
  [CaseType.COMBINED_SUPPORT]: 'Combined Support',
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  [CasePriority.LOW]: 'Low',
  [CasePriority.MEDIUM]: 'Medium',
  [CasePriority.HIGH]: 'High',
  [CasePriority.CRITICAL]: 'Critical',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.ACTIVE]: 'Active',
  [AssignmentStatus.ON_HOLD]: 'On Hold',
  [AssignmentStatus.COMPLETED]: 'Completed',
  [AssignmentStatus.CANCELLED]: 'Cancelled',
};

export const SERVICE_PROVIDER_TYPE_LABELS: Record<ServiceProviderType, string> =
  {
    [ServiceProviderType.COUNSELOR]: 'Counselor',
    [ServiceProviderType.MEDICAL_PROFESSIONAL]: 'Medical Professional',
    [ServiceProviderType.LEGAL_ADVISOR]: 'Legal Advisor',
    [ServiceProviderType.NGO]: 'NGO',
    [ServiceProviderType.GOVERNMENT_AGENCY]: 'Government Agency',
    [ServiceProviderType.COMMUNITY_CENTER]: 'Community Center',
    [ServiceProviderType.SHELTER]: 'Shelter',
    [ServiceProviderType.HOTLINE]: 'Hotline',
  };

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'Pending',
  [RequestStatus.ACCEPTED]: 'Accepted',
  [RequestStatus.IN_PROGRESS]: 'In Progress',
  [RequestStatus.COMPLETED]: 'Completed',
  [RequestStatus.REJECTED]: 'Rejected',
  [RequestStatus.CANCELLED]: 'Cancelled',
};

// Priority Colors for UI
export const PRIORITY_COLORS: Record<
  CasePriority,
  { bg: string; text: string; border: string }
> = {
  [CasePriority.LOW]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  [CasePriority.MEDIUM]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [CasePriority.HIGH]: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  [CasePriority.CRITICAL]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

// Status Colors for UI
export const STATUS_COLORS: Record<
  AssignmentStatus,
  { bg: string; text: string; border: string }
> = {
  [AssignmentStatus.ACTIVE]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [AssignmentStatus.ON_HOLD]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [AssignmentStatus.COMPLETED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  [AssignmentStatus.CANCELLED]: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

// ============================================
// INTERFACES
// ============================================

import { User } from './user';
import { Report } from './incident';

// Case Assignment (complete model)
export interface CaseAssignment {
  id: string;
  reportId: string;
  assignedToId: string;
  assignedById?: string;
  caseType: CaseType;
  priority: CasePriority;
  dueDate?: string;
  notes?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // Relations (populated when needed)
  report?: Report;
  assignedTo?: User;
  supportProviders?: ServiceProvider[];
  feedbacks?: CaseFeedback[];
}

// DTO for creating a case assignment
export interface CreateCaseAssignmentDto {
  reportId: string;
  assignedToId: string;
  caseType: CaseType;
  priority?: CasePriority;
  dueDate?: string;
  notes?: string;
}

// DTO for updating a case assignment
export interface UpdateCaseAssignmentDto {
  status?: AssignmentStatus;
  priority?: CasePriority;
  dueDate?: string;
  notes?: string;
  completedAt?: string;
}

// Case Comment
export interface CaseComment {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  author?: User;
}

// DTO for creating a comment
export interface CreateCaseCommentDto {
  reportId: string;
  content: string;
  isPublic?: boolean;
}

// Service Provider
export interface ServiceProvider {
  id: string;
  name: string;
  type: ServiceProviderType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  website?: string;
  isVerified: boolean;
  rating?: number;
  availability?: string;
  languages: string[];
  specializations: string[];
  createdAt: string;
  updatedAt: string;

  // Relations
  reviews?: ServiceProviderReview[];
}

// Service Provider Review
export interface ServiceProviderReview {
  id: string;
  serviceProviderId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

// Support Request
export interface SupportRequest {
  id: string;
  userId: string;
  serviceProviderId: string;
  description: string;
  status: RequestStatus;
  requestedAt: string;
  respondedAt?: string;
  resolvedAt?: string;

  // Relations
  serviceProvider?: ServiceProvider;
}

// DTO for creating a support request
export interface CreateSupportRequestDto {
  serviceProviderId: string;
  description: string;
}

// Case Feedback
export interface CaseFeedback {
  id: string;
  caseAssignmentId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

// Case Statistics (for dashboards)
export interface CaseStatistics {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    counseling: number;
    medicalSupport: number;
    legalAssistance: number;
    emergencySupport: number;
    preventionEducation: number;
    resourceReferral: number;
    combinedSupport: number;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAllCaseTypes = (): CaseType[] => {
  return Object.values(CaseType);
};

export const getAllPriorities = (): CasePriority[] => {
  return Object.values(CasePriority);
};

export const getAllAssignmentStatuses = (): AssignmentStatus[] => {
  return Object.values(AssignmentStatus);
};

export const getAllServiceProviderTypes = (): ServiceProviderType[] => {
  return Object.values(ServiceProviderType);
};

export const getAllRequestStatuses = (): RequestStatus[] => {
  return Object.values(RequestStatus);
};

// Get priority level number (for sorting)
export const getPriorityLevel = (priority: CasePriority): number => {
  const levels = {
    [CasePriority.LOW]: 1,
    [CasePriority.MEDIUM]: 2,
    [CasePriority.HIGH]: 3,
    [CasePriority.CRITICAL]: 4,
  };
  return levels[priority];
};

// Check if case is overdue
export const isCaseOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Get days until due date
export const getDaysUntilDue = (dueDate?: string): number | null => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format case title
export const formatCaseTitle = (caseAssignment: CaseAssignment): string => {
  return `${CASE_TYPE_LABELS[caseAssignment.caseType]} - ${CASE_PRIORITY_LABELS[caseAssignment.priority]}`;
};
