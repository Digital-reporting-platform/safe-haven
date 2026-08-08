import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, FileText, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationService, Notification } from '@/services/notificationService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getCounselorNotifications(48, 50);
      
      // Check which notifications are read
      const notificationsWithReadStatus = response.notifications.map(n => ({
        ...n,
        isRead: notificationService.isNotificationRead(n.id),
      }));
      
      setNotifications(notificationsWithReadStatus);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load notifications';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    toast.success('Notifications refreshed');
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const notificationIds = notifications.map(n => n.id);
    await notificationService.markAllAsRead(notificationIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Users className="h-5 w-5 text-emerald-600" />;
      case 'status_change':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'new_report':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[var(--role-counselor-bg)] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--role-counselor-text)]">
              Notifications
            </h1>
            <p className="mt-1 text-[var(--role-counselor-text)]/70">
              Stay updated on case assignments and status changes
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--role-counselor-primary)]"></div>
                <h3 className="mb-2 text-lg font-medium text-slate-600">
                  Loading notifications...
                </h3>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-medium text-slate-600">
                  No notifications
                </h3>
                <p className="text-slate-500">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : 'Notifications will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${
                  !notification.isRead
                    ? 'border-l-4 border-l-[var(--role-counselor-primary)] bg-[var(--role-counselor-primary)]/5'
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-slate-100 p-2">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <Badge className="ml-2 bg-blue-500 text-white">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{notification.message}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {notification.caseId && (
                          <Link to={`/counselor/cases/${notification.caseId}`}>
                            <Badge variant="outline" className="text-xs hover:bg-slate-100">
                              View Case
                            </Badge>
                          </Link>
                        )}
                        {notification.reportId && (
                          <Link to={`/counselor/cases/${notification.reportId}`}>
                            <Badge variant="outline" className="text-xs hover:bg-slate-100">
                              View Report
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
