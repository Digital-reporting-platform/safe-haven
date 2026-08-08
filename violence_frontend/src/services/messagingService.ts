import { api } from './api/client';

export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface Conversation {
  caseId: string;
  reportId?: string;
  trackingNumber?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

class MessagingService {
  private readonly READ_MESSAGES_KEY = 'sh_read_messages';

  /**
   * Get all conversations for the current user (counselor)
   */
  async getCounselorConversations(): Promise<Conversation[]> {
    try {
      // Fetch all cases (counselors can see all cases)
      const casesResponse = await api.get('/cases?page=1&limit=100');
      const cases = casesResponse.data?.data || [];

      const conversations: Conversation[] = [];

      // For each case, fetch the latest comments/messages
      for (const caseItem of cases) {
        try {
          const commentsResponse = await api.get(`/cases/${caseItem.id}/comments`);
          const comments = commentsResponse.data?.data || commentsResponse.data || [];

          if (comments.length > 0) {
            // Sort by date to get the latest message
            const sortedComments = comments.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const lastMessage = sortedComments[0];
            const unreadCount = this.getUnreadCountForCase(caseItem.id, comments);

            conversations.push({
              caseId: caseItem.id,
              reportId: caseItem.reportId,
              trackingNumber: caseItem.report?.trackingNumber,
              lastMessage: {
                id: lastMessage.id,
                caseId: caseItem.id,
                senderId: lastMessage.user?.id || lastMessage.authorId || lastMessage.senderId,
                content: lastMessage.content,
                isInternal: lastMessage.isInternal || false,
                createdAt: lastMessage.timestamp || lastMessage.createdAt,
                sender: lastMessage.user || lastMessage.author || lastMessage.sender,
              },
              unreadCount,
              updatedAt: lastMessage.timestamp || lastMessage.createdAt,
            });
          }
        } catch (error) {
          // Skip cases with no comments or errors
          console.debug(`No comments for case ${caseItem.id}`);
        }
      }

      // Sort conversations by last message time
      conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return conversations;
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      return [];
    }
  }

  /**
   * Get unread message count for a specific case
   */
  private getUnreadCountForCase(caseId: string, messages: any[]): number {
    const readMessages = this.getReadMessages();
    const caseReadMessages = readMessages[caseId] || new Set();

    return messages.filter((msg) => !caseReadMessages.has(msg.id)).length;
  }

  /**
   * Get conversations for medical and legal professionals (their assigned cases only)
   */
  async getProfessionalConversations(userId?: string): Promise<Conversation[]> {
    try {
      // Fetch only cases assigned to this professional
      const casesResponse = await api.get(`/cases/professional/${userId}?includePending=false`);
      const cases = casesResponse.data?.data || [];

      const conversations: Conversation[] = [];

      // For each assigned case, fetch the latest comments/messages
      for (const caseItem of cases) {
        try {
          const commentsResponse = await api.get(`/cases/${caseItem.id}/comments`);
          const comments = commentsResponse.data?.data || commentsResponse.data || [];

          if (comments.length > 0) {
            // Sort by date to get the latest message
            const sortedComments = comments.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const lastMessage = sortedComments[0];
            const unreadCount = this.getUnreadCountForCase(caseItem.id, comments);

            conversations.push({
              caseId: caseItem.id,
              reportId: caseItem.reportId,
              trackingNumber: caseItem.report?.trackingNumber,
              lastMessage: {
                id: lastMessage.id,
                caseId: caseItem.id,
                senderId: lastMessage.user?.id || lastMessage.authorId || lastMessage.senderId,
                content: lastMessage.content,
                isInternal: lastMessage.isInternal || false,
                createdAt: lastMessage.timestamp || lastMessage.createdAt,
                sender: lastMessage.user || lastMessage.author || lastMessage.sender,
              },
              unreadCount,
              updatedAt: lastMessage.timestamp || lastMessage.createdAt,
            });
          }
        } catch (error) {
          // Skip cases with no comments or errors
          console.debug(`No comments for case ${caseItem.id}`);
        }
      }

      // Sort conversations by last message time
      conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return conversations;
    } catch (error: any) {
      console.error('Failed to fetch professional conversations', error);
      
      // If it's a 403 error (access denied), handle gracefully
      if (error?.response?.status === 403) {
        console.log('Access denied to conversations - user may not have proper provider profile');
        return []; // Return empty conversations instead of throwing error
      }
      
      return [];
    }
  }

  /**
   * Get total unread message count across all conversations
   */
  async getUnreadCount(userRole?: string, userId?: string): Promise<number> {
    try {
      let conversations: Conversation[] = [];
      
      if (userRole === 'COUNSELOR') {
        conversations = await this.getCounselorConversations();
      } else if (userRole === 'MEDICAL_PROFESSIONAL' || userRole === 'LEGAL_ADVISOR') {
        conversations = await this.getProfessionalConversations(userId);
      }
      
      return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    } catch (error: any) {
      console.error('Failed to get unread count', error);
      
      // If it's a 403 error (access denied), handle gracefully
      if (error?.response?.status === 403) {
        console.log('Access denied to unread count - user may not have proper provider profile');
        return 0; // Return 0 instead of throwing error
      }
      
      return 0;
    }
  }

  /**
   * Mark messages in a case as read
   */
  markCaseAsRead(caseId: string, messageIds: string[]): void {
    const readMessages = this.getReadMessages();
    if (!readMessages[caseId]) {
      readMessages[caseId] = new Set();
    }

    messageIds.forEach((id) => readMessages[caseId].add(id));
    this.saveReadMessages(readMessages);
  }

  /**
   * Get read messages from localStorage
   */
  private getReadMessages(): Record<string, Set<string>> {
    try {
      const stored = localStorage.getItem(this.READ_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert arrays back to Sets
        const result: Record<string, Set<string>> = {};
        Object.keys(parsed).forEach((caseId) => {
          result[caseId] = new Set(parsed[caseId]);
        });
        return result;
      }
    } catch (error) {
      console.error('Failed to parse read messages', error);
    }
    return {};
  }

  /**
   * Save read messages to localStorage
   */
  private saveReadMessages(readMessages: Record<string, Set<string>>): void {
    try {
      // Convert Sets to arrays for JSON serialization
      const toStore: Record<string, string[]> = {};
      Object.keys(readMessages).forEach((caseId) => {
        toStore[caseId] = Array.from(readMessages[caseId]);
      });
      localStorage.setItem(this.READ_MESSAGES_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save read messages', error);
    }
  }

  /**
   * Get messages for a specific case
   */
  async getCaseMessages(caseId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/cases/${caseId}/comments`);
      const comments = response.data?.data || response.data || [];

      return comments.map((comment: any) => ({
        id: comment.id,
        caseId,
        senderId: comment.user?.id || comment.authorId || comment.senderId,
        content: comment.content,
        isInternal: comment.isInternal || false,
        createdAt: comment.timestamp || comment.createdAt,
        sender: comment.user || comment.author || comment.sender,
      }));
    } catch (error) {
      console.error('Failed to fetch case messages', error);
      return [];
    }
  }

  /**
   * Send a message to a case
   */
  async sendMessage(
    caseId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<Message | null> {
    try {
      const response = await api.post(`/cases/${caseId}/comments`, {
        content,
        isInternal,
      });

      const comment = response.data?.data || response.data;
      return {
        id: comment.id,
        caseId,
        senderId: comment.user?.id || comment.authorId || comment.senderId,
        content: comment.content,
        isInternal: comment.isInternal || false,
        createdAt: comment.timestamp || comment.createdAt,
        sender: comment.user || comment.author || comment.sender,
      };
    } catch (error) {
      console.error('Failed to send message', error);
      return null;
    }
  }
}

export const messagingService = new MessagingService();
