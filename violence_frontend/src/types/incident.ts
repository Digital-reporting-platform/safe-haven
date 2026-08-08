/**
 * Incident Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

// Incident Category - 13 types of violence/abuse
export enum IncidentCategory {
  PHYSICAL_VIOLENCE = 'PHYSICAL_VIOLENCE',
  SEXUAL_ASSAULT = 'SEXUAL_ASSAULT',
  EMOTIONAL_ABUSE = 'EMOTIONAL_ABUSE',
  PSYCHOLOGICAL_ABUSE = 'PSYCHOLOGICAL_ABUSE',
  NEGLECT = 'NEGLECT',
  CYBERBULLYING = 'CYBERBULLYING',
  HARASSMENT = 'HARASSMENT',
  DISCRIMINATION = 'DISCRIMINATION',
  WORKPLACE_ABUSE = 'WORKPLACE_ABUSE',
  DOMESTIC_VIOLENCE = 'DOMESTIC_VIOLENCE',
  CHILD_ABUSE = 'CHILD_ABUSE',
  ELDER_ABUSE = 'ELDER_ABUSE',
  OTHER = 'OTHER',
}

// Severity Level
export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Report Status
export enum ReportStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  ASSIGNED_TO_PROFESSIONAL = 'ASSIGNED_TO_PROFESSIONAL',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

// Helper function to get user-friendly labels
export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  [IncidentCategory.PHYSICAL_VIOLENCE]: 'Physical Violence',
  [IncidentCategory.SEXUAL_ASSAULT]: 'Sexual Assault',
  [IncidentCategory.EMOTIONAL_ABUSE]: 'Emotional Abuse',
  [IncidentCategory.PSYCHOLOGICAL_ABUSE]: 'Psychological Abuse',
  [IncidentCategory.NEGLECT]: 'Neglect',
  [IncidentCategory.CYBERBULLYING]: 'Cyberbullying',
  [IncidentCategory.HARASSMENT]: 'Harassment',
  [IncidentCategory.DISCRIMINATION]: 'Discrimination',
  [IncidentCategory.WORKPLACE_ABUSE]: 'Workplace Abuse',
  [IncidentCategory.DOMESTIC_VIOLENCE]: 'Domestic Violence',
  [IncidentCategory.CHILD_ABUSE]: 'Child Abuse',
  [IncidentCategory.ELDER_ABUSE]: 'Elder Abuse',
  [IncidentCategory.OTHER]: 'Other',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  [SeverityLevel.LOW]: 'Low',
  [SeverityLevel.MEDIUM]: 'Medium',
  [SeverityLevel.HIGH]: 'High',
  [SeverityLevel.CRITICAL]: 'Critical',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.PENDING_REVIEW]: 'Pending Review',
  [ReportStatus.UNDER_INVESTIGATION]: 'Under Investigation',
  [ReportStatus.ASSIGNED_TO_PROFESSIONAL]: 'Assigned to Professional',
  [ReportStatus.IN_PROGRESS]: 'In Progress',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.CLOSED]: 'Closed',
  [ReportStatus.REJECTED]: 'Rejected',
  [ReportStatus.ARCHIVED]: 'Archived',
};

// Helper to get all categories as array (useful for dropdowns)
export const getAllIncidentCategories = (): IncidentCategory[] => {
  return Object.values(IncidentCategory);
};

export const getAllSeverityLevels = (): SeverityLevel[] => {
  return Object.values(SeverityLevel);
};

export const getAllReportStatuses = (): ReportStatus[] => {
  return Object.values(ReportStatus);
};

// Interface for creating a new report (matches backend CreateReportDto)
export interface CreateReportDto {
  title: string; // min 5, max 200 chars
  description: string; // min 20, max 5000 chars
  category?: IncidentCategory;
  isAnonymous?: boolean; // default: true
  language?: string; // 'en' or 'am'
  location?: string;
  deviceFingerprint?: string;
}

// Interface for a complete report (matches backend Report model)
export interface Report {
  id: string;
  reporterId?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  isAnonymous: boolean;
  language: string;

  // ML Classification fields
  classificationScore?: number;
  classificationLabel?: string;
  suggestedCaseType?: string;
  suggestedPriority?: string;

  // Location & IP
  location?: string;
  ipAddress?: string;
  ipHash?: string;
  deviceFingerprint?: string;

  // Fraud Detection
  riskScore: number;
  flaggedAsRepetitive: boolean;
  isDuplicate: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  // Relations (optional, populated when needed)
  evidences?: Evidence[];
  caseAssignment?: any; // Will define CaseAssignment type separately
}

// Interface for evidence files
export interface Evidence {
  id: string;
  reportId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description?: string;
  createdAt: string;
}

// Interface for updating a report
export interface UpdateReportDto {
  status?: ReportStatus;
  notes?: string;
}
