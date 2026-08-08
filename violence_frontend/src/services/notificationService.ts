import { api } from './api/client';

export interface Notification {
  id: string;
  type: 'assignment' | 'status_change' | 'new_report' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  caseId?: string;
  reportId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

class NotificationService {
  /**
   * Get notifications for counselor
   */
  async getCounselorNotifications(hours: number = 48, limit: number = 50): Promise<NotificationResponse> {
    try {
      // Fetch pending cases (cases that need review/assignment)
      const pendingResponse = await api.get('/cases/counselor/pending?page=1&limit=50');
      const pendingCases = pendingResponse.data?.data || [];

      // Fetch unassigned reports (new cases)
      const unassignedResponse = await api.get('/cases/counselor/unassigned?page=1&limit=50');
      const unassignedReports = unassignedResponse.data?.data || [];

      // Fetch all cases to see recent assignments
      const allCasesResponse = await api.get('/cases?page=1&limit=50');
      const allCases = allCasesResponse.data?.data || [];

      // Transform data into notifications
      const notifications: Notification[] = [];

      // Add new unassigned report notifications
      unassignedReports.forEach((report: any) => {
        const createdAt = new Date(report.createdAt || report.report?.createdAt);
        const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursAgo <= hours) {
          notifications.push({
            id: `new-report-${report.id}`,
            type: 'new_report',
            title: 'New Report Submitted',
            message: `New ${report.report?.category || report.category || 'incident'} report requires review`,
            timestamp: createdAt.toISOString(),
            isRead: false,
            reportId: report.id,
            metadata: {
              category: report.report?.category || report.category,
              severity: report.report?.severity || report.severity,
              trackingNumber: report.report?.trackingNumber || report.trackingNumber,
            },
          });
        }
      });

      // Add case assignment notifications (recently assigned cases)
      allCases.forEach((caseItem: any) => {
        const updatedAt = new Date(caseItem.updatedAt);
        const hoursAgo = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
        
        // Only show recently assigned active cases
        if (hoursAgo <= hours && caseItem.status === 'ACTIVE' && caseItem.assignedTo) {
          notifications.push({
            id: `assignment-${caseItem.id}`,
            type: 'assignment',
            title: 'Case Assignment Update',
            message: `Case assigned to ${caseItem.assignedTo?.firstName || caseItem.assignedTo?.name || 'professional'}`,
            timestamp: updatedAt.toISOString(),
            isRead: false,
            caseId: caseItem.id,
            metadata: {
              assignedTo: caseItem.assignedTo?.firstName || caseItem.assignedTo?.name,
              caseType: caseItem.caseType,
            },
          });
        }
      });

      // Add pending case notifications (cases awaiting action)
      pendingCases.forEach((caseItem: any) => {
        const updatedAt = new Date(caseItem.updatedAt);
        const hoursAgo = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursAgo <= hours && caseItem.status === 'ON_HOLD') {
          notifications.push({
            id: `pending-${caseItem.id}`,
            type: 'status_change',
            title: 'Case Pending Review',
            message: `Case is pending review and requires attention`,
            timestamp: updatedAt.toISOString(),
            isRead: false,
            caseId: caseItem.id,
            metadata: {
              status: caseItem.status,
              caseType: caseItem.caseType,
            },
          });
        }
      });

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Limit to requested number
      const limitedNotifications = notifications.slice(0, limit);
      const unreadCount = limitedNotifications.filter(n => !n.isRead).length;

      return {
        notifications: limitedNotifications,
        unreadCount,
        total: notifications.length,
      };
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // Store in localStorage for now (can be moved to backend later)
    const readNotifications = this.getReadNotifications();
    readNotifications.add(notificationId);
    localStorage.setItem('sh_read_notifications', JSON.stringify([...readNotifications]));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(notificationIds: string[]): Promise<void> {
    const readNotifications = this.getReadNotifications();
    notificationIds.forEach(id => readNotifications.add(id));
    localStorage.setItem('sh_read_notifications', JSON.stringify([...readNotifications]));
  }

  /**
   * Get read notifications from localStorage
   */
  private getReadNotifications(): Set<string> {
    try {
      const stored = localStorage.getItem('sh_read_notifications');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse read notifications', error);
    }
    return new Set();
  }

  /**
   * Check if notification is read
   */
  isNotificationRead(notificationId: string): boolean {
    return this.getReadNotifications().has(notificationId);
  }

  /**
   * Get unread count for bell icon
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getCounselorNotifications(48, 50);
      const readNotifications = this.getReadNotifications();
      return response.notifications.filter(n => !readNotifications.has(n.id)).length;
    } catch (error) {
      console.error('Failed to get unread count', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
