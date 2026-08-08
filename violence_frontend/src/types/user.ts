/**
 * User & Auth Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  SURVIVOR = 'SURVIVOR',
  COUNSELOR = 'COUNSELOR',
  MEDICAL_PROFESSIONAL = 'MEDICAL_PROFESSIONAL',
  LEGAL_ADVISOR = 'LEGAL_ADVISOR',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SYSTEM = 'SYSTEM',
  GENERAL_CASE_MANAGER = 'general_case_manager',
}

export enum UserStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// ============================================
// INTERFACES
// ============================================

// User (complete model)
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  language: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Relations (optional/loaded when needed)
  reports?: any[]; // Report[]
  caseAssignments?: any[]; // CaseAssignment[]
  forumPosts?: any[]; // ForumPost[]
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SURVIVOR]: 'Survivor',
  [UserRole.COUNSELOR]: 'Counselor',
  [UserRole.MEDICAL_PROFESSIONAL]: 'Medical Professional',
  [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.MODERATOR]: 'Moderator',
  [UserRole.SYSTEM]: 'System',
  [UserRole.GENERAL_CASE_MANAGER]: 'General Case Manager',
};
