import { api } from './api/client';
import { UserRole } from '@/types/user';

export interface CaseMessage {
  id: string;
  reportId: string;
  content: string;
  senderRole: UserRole;
  isSystemMessage: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  } | null;
}

export interface SendMessageRequest {
  content: string;
  senderRole?: UserRole;
  isSystemMessage?: boolean;
}

export interface SendAnonymousMessageRequest {
  content: string;
  trackingNumber: string;
}

export interface AnonymousThreadResponse {
  report: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    trackingNumber: string;
  };
  messages: CaseMessage[];
  assignedProfessionals: {
    id: string;
    name: string;
    type: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all messages for a specific case
 * Requires authentication
 */
export const getCaseMessages = async (caseId: string): Promise<CaseMessage[]> => {
  const response = await api.get<ApiResponse<CaseMessage[]>>(`/cases/${caseId}/messages`);
  return response.data.data;
};

/**
 * Send a message to a case
 * Requires authentication
 */
export const sendCaseMessage = async (
  caseId: string,
  content: string
): Promise<CaseMessage> => {
  const response = await api.post<ApiResponse<CaseMessage>>(`/cases/${caseId}/messages`, {
    content,
  });
  return response.data.data;
};

/**
 * Get messages by tracking number (anonymous access)
 * No authentication required
 */
export const getMessagesByTrackingNumber = async (
  trackingNumber: string
): Promise<AnonymousThreadResponse> => {
  const response = await api.get<ApiResponse<AnonymousThreadResponse>>(
    `/track/${trackingNumber}/messages`
  );
  return response.data.data;
};

/**
 * Send anonymous message using tracking number
 * No authentication required
 */
export const sendAnonymousMessage = async (
  trackingNumber: string,
  content: string
): Promise<CaseMessage> => {
  const response = await api.post<ApiResponse<CaseMessage>>(
    `/track/${trackingNumber}/messages`,
    { content, trackingNumber }
  );
  return response.data.data;
};

/**
 * Format message timestamp for display
 */
export const formatMessageTime = (timestamp: string | Date | null | undefined): string => {
  // Handle null/undefined timestamps
  if (!timestamp) {
    return 'Just now';
  }

  // Handle both string and Date object inputs
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Just now';
  }
  
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return minutes < 1 ? 'Just now' : `${minutes} min ago`;
  }

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (diffInHours < 48) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Get display name for message sender
 * @param trackingNumber - Optional tracking number for anonymous messages (from report context)
 */
export const getSenderDisplayName = (message: CaseMessage, trackingNumber?: string): string => {
  if (message.isSystemMessage) {
    return 'System';
  }

  if (!message.author) {
    return trackingNumber ? `Anonymous (${trackingNumber})` : 'Anonymous';
  }

  const firstName = message.author.firstName || '';
  const lastName = message.author.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Unknown User';
};

/**
 * Get role label for display
 * Handles system messages, anonymous messages, and regular messages
 */
export const getRoleLabel = (message: CaseMessage): string => {
  // System messages always show as "System"
  if (message.isSystemMessage) {
    return 'System';
  }

  // If no author, it's an anonymous message
  if (!message.author) {
    return 'Anonymous';
  }

  // Otherwise, show the role label
  const roleLabels: Record<UserRole, string> = {
    [UserRole.SURVIVOR]: 'Survivor',
    [UserRole.COUNSELOR]: 'Counselor',
    [UserRole.MEDICAL_PROFESSIONAL]: 'Medical Professional',
    [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.MODERATOR]: 'Moderator',
    [UserRole.SYSTEM]: 'System',
    [UserRole.GENERAL_CASE_MANAGER]: 'Case Manager',
  };
  return roleLabels[message.senderRole] || message.senderRole;
};

/**
 * Mark messages as read for a case (stores timestamp in localStorage)
 */
export const markMessagesAsRead = (caseId: string): void => {
  const key = `sh_messages_read_${caseId}`;
  localStorage.setItem(key, new Date().toISOString());
};

/**
 * Get the last read timestamp for a case
 */
export const getLastReadTimestamp = (caseId: string): string | null => {
  const key = `sh_messages_read_${caseId}`;
  return localStorage.getItem(key);
};

/**
 * Count unread messages from professionals for a survivor
 */
export const countUnreadMessagesFromProfessionals = (
  messages: CaseMessage[],
  caseId: string,
  userId: string
): number => {
  const lastRead = getLastReadTimestamp(caseId);
  const lastReadDate = lastRead ? new Date(lastRead) : new Date(0);

  return messages.filter((msg) => {
    // Only count messages from professionals (not from survivor themselves or system)
    const isFromProfessional =
      msg.senderRole === UserRole.LEGAL_ADVISOR ||
      msg.senderRole === UserRole.MEDICAL_PROFESSIONAL ||
      msg.senderRole === UserRole.COUNSELOR;

    if (!isFromProfessional) return false;

    // Don't count if it's from the current user
    if (msg.author?.id === userId) return false;

    // Count if message is newer than last read
    const messageDate = new Date(msg.createdAt);
    return messageDate > lastReadDate;
  }).length;
};

/**
 * Check if there are any unread professional messages
 */
export const hasUnreadProfessionalMessages = (
  messages: CaseMessage[],
  caseId: string,
  userId: string
): boolean => {
  return countUnreadMessagesFromProfessionals(messages, caseId, userId) > 0;
};
