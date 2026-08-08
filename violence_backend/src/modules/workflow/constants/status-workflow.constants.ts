import { ReportStatus, UserRole } from '@prisma/client';

/**
 * Valid status transitions in the report workflow.
 * Each entry maps a current status to an array of allowed next statuses.
 * 
 * Workflow: PENDING_REVIEW → RECEIVED → ASSIGNED → IN_SUPPORT → RESOLVED → CLOSED
 * REJECTED is only allowed from PENDING_REVIEW
 */
export const VALID_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.PENDING_REVIEW]: [ReportStatus.RECEIVED, ReportStatus.REJECTED],
  [ReportStatus.RECEIVED]: [ReportStatus.ASSIGNED],
  [ReportStatus.ASSIGNED]: [ReportStatus.IN_SUPPORT],
  [ReportStatus.IN_SUPPORT]: [ReportStatus.RESOLVED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED],
  [ReportStatus.CLOSED]: [], // Terminal state - no further transitions
  [ReportStatus.REJECTED]: [], // Terminal state - no further transitions
};

/**
 * Role-based permissions for status transitions.
 * Maps roles to the transitions they are allowed to perform.
 * 
 * SURVIVOR: Can only create reports (PENDING_REVIEW), cannot update status
 * ADMIN/COUNSELOR: Can manage early lifecycle and closure
 * MEDICAL_PROFESSIONAL/LEGAL_ADVISOR: Can manage active case progress
 * MODERATOR: No access to report status updates
 */
export const STATUS_TRANSITION_PERMISSIONS: Record<
  UserRole,
  Array<{ from: ReportStatus; to: ReportStatus }>
> = {
  [UserRole.GUEST]: [],
  
  [UserRole.SURVIVOR]: [],
  
  [UserRole.COUNSELOR]: [
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.RECEIVED },
    { from: ReportStatus.RECEIVED, to: ReportStatus.ASSIGNED },
    { from: ReportStatus.RESOLVED, to: ReportStatus.CLOSED },
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.REJECTED },
  ],
  
  [UserRole.ADMIN]: [
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.RECEIVED },
    { from: ReportStatus.RECEIVED, to: ReportStatus.ASSIGNED },
    { from: ReportStatus.RESOLVED, to: ReportStatus.CLOSED },
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.REJECTED },
  ],
  
  [UserRole.MEDICAL_PROFESSIONAL]: [
    { from: ReportStatus.ASSIGNED, to: ReportStatus.IN_SUPPORT },
    { from: ReportStatus.IN_SUPPORT, to: ReportStatus.RESOLVED },
  ],
  
  [UserRole.LEGAL_ADVISOR]: [
    { from: ReportStatus.ASSIGNED, to: ReportStatus.IN_SUPPORT },
    { from: ReportStatus.IN_SUPPORT, to: ReportStatus.RESOLVED },
  ],
  
  [UserRole.MODERATOR]: [],
  
  [UserRole.SYSTEM]: [
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.RECEIVED },
    { from: ReportStatus.RECEIVED, to: ReportStatus.ASSIGNED },
    { from: ReportStatus.ASSIGNED, to: ReportStatus.IN_SUPPORT },
    { from: ReportStatus.IN_SUPPORT, to: ReportStatus.RESOLVED },
    { from: ReportStatus.RESOLVED, to: ReportStatus.CLOSED },
    { from: ReportStatus.PENDING_REVIEW, to: ReportStatus.REJECTED },
  ],
};

/**
 * Progress percentages for internal tracking.
 * Maps each status to its completion percentage.
 */
export const STATUS_PROGRESS_PERCENTAGE: Record<ReportStatus, number> = {
  [ReportStatus.PENDING_REVIEW]: 0,
  [ReportStatus.RECEIVED]: 20,
  [ReportStatus.ASSIGNED]: 40,
  [ReportStatus.IN_SUPPORT]: 60,
  [ReportStatus.RESOLVED]: 80,
  [ReportStatus.CLOSED]: 100,
  [ReportStatus.REJECTED]: 0,
};

/**
 * Survivor-friendly status labels.
 * Maps technical status to user-friendly display text.
 */
export const SURVIVOR_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.PENDING_REVIEW]: 'Submitted',
  [ReportStatus.RECEIVED]: 'Received',
  [ReportStatus.ASSIGNED]: 'Help is being arranged',
  [ReportStatus.IN_SUPPORT]: 'You are being supported',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.CLOSED]: 'Closed',
  [ReportStatus.REJECTED]: 'Closed',
};

/**
 * Survivor-friendly status messages.
 * Provides detailed explanations for each status.
 */
export const SURVIVOR_STATUS_MESSAGES: Record<ReportStatus, string> = {
  [ReportStatus.PENDING_REVIEW]: 'Your report has been successfully submitted.',
  [ReportStatus.RECEIVED]: 'Our team has received your report and is reviewing it.',
  [ReportStatus.ASSIGNED]: 'We are assigning the right professional to assist you.',
  [ReportStatus.IN_SUPPORT]: 'A professional is currently supporting your case.',
  [ReportStatus.RESOLVED]: 'Your case has been addressed.',
  [ReportStatus.CLOSED]: 'This case has been officially closed.',
  [ReportStatus.REJECTED]: 'This case has been reviewed and closed.',
};

/**
 * Fields to exclude when returning report data to survivors.
 * These contain sensitive/internal information.
 */
export const SENSITIVE_REPORT_FIELDS: string[] = [
  'ipAddress',
  'ipHash',
  'deviceFingerprint',
  'riskScore',
  'classificationScore',
  'classificationLabel',
  'suggestedCaseType',
  'suggestedPriority',
  'flaggedAsRepetitive',
  'isDuplicate',
  'detectedCountry',
  'detectedRegion',
  'detectedCity',
  'locationMismatchWarning',
  'locationMismatchConfirmed',
  'auditLogs',
  'statusHistory',
];

/**
 * Check if a status transition is valid in the workflow.
 */
export function isValidStatusTransition(
  currentStatus: ReportStatus,
  newStatus: ReportStatus,
): boolean {
  if (currentStatus === newStatus) return true; // No change is always valid
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * Check if a role has permission for a specific status transition.
 */
export function hasTransitionPermission(
  role: UserRole,
  fromStatus: ReportStatus,
  toStatus: ReportStatus,
): boolean {
  if (fromStatus === toStatus) return true; // No change is always allowed
  
  const permissions = STATUS_TRANSITION_PERMISSIONS[role] || [];
  return permissions.some(
    (p) => p.from === fromStatus && p.to === toStatus
  );
}

/**
 * Get the next valid statuses from the current status.
 */
export function getNextValidStatuses(currentStatus: ReportStatus): ReportStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Get all statuses a role can transition from a given status.
 */
export function getAllowedTransitionsForRole(
  role: UserRole,
  currentStatus: ReportStatus,
): ReportStatus[] {
  const permissions = STATUS_TRANSITION_PERMISSIONS[role] || [];
  return permissions
    .filter((p) => p.from === currentStatus)
    .map((p) => p.to);
}
