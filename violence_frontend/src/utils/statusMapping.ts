// Shared status mapping utilities for consistent progress calculation across all components

export const STATUS_STEPS = [
  'Received',
  'Under Review', 
  'Assigned',
  'In Support',
  'Closed',
] as const;

export type StatusStep = typeof STATUS_STEPS[number];

export const mapReportStatusToStep = (status?: string, hasActiveConversation?: boolean): StatusStep => {
  // If there's an active conversation with a professional, show as "In Support"
  if (hasActiveConversation) {
    return 'In Support';
  }
  
  switch (status) {
    case 'PENDING_REVIEW':
      return 'Received';
    case 'UNDER_INVESTIGATION':
      return 'Under Review';
    case 'ASSIGNED_TO_PROFESSIONAL':
    case 'ASSIGNED':
      return 'Assigned';
    case 'IN_PROGRESS':
      return 'In Support';
    case 'RESOLVED':
    case 'CLOSED':
    case 'ARCHIVED':
      return 'Closed';
    case 'ACTIVE':
      return 'In Support'; // ACTIVE status means conversation is ongoing
    default:
      return 'Received'; // Default to first step for unknown statuses
  }
};

export const calculateProgressPercentage = (status?: string, hasActiveConversation?: boolean): number => {
  const currentStep = mapReportStatusToStep(status, hasActiveConversation);
  const stepIndex = STATUS_STEPS.indexOf(currentStep);
  return Math.round(((stepIndex + 1) / STATUS_STEPS.length) * 100);
};

export const getStatusBadgeConfig = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    PENDING_REVIEW: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
    UNDER_INVESTIGATION: { label: 'Under Investigation', className: 'bg-blue-100 text-blue-800' },
    ASSIGNED_TO_PROFESSIONAL: { label: 'Assigned', className: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
    RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
    CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
    ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-800' },
    ACTIVE: { label: 'Active', className: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  };
  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
};
