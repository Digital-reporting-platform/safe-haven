import {
  Shield,
  Bell,
  Languages,
  Sun,
  Moon,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import '../styles/safehaven-navigation.css';
import { useEffect, useState } from 'react';
import { UserRole } from '@/types/user';
import { api } from '@/services/api/client';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { messagingService } from '@/services/messagingService';
import { patientService } from '@/services/patientService';

// --- Types ---
interface NavItem {
  label: string;
  path: string;
  page?: string;
}

interface CareNotification {
  id: string; // caseAssignment id
  reportId: string;
  caseType: string;
  reportCategory: string;
  reportDescription: string;
  timestamp: string;
}

const NotificationDropdown: React.FC<{
  isOpen: boolean;
  isDarkMode: boolean;
  canUseProfessionalNotifications: boolean;
  isNotificationLoading: boolean;
  updatingCaseId: string | null;
  notifications: CareNotification[];
  onRefresh: () => Promise<void>;
  onApprove: (item: CareNotification) => Promise<void>;
  onDecline: (item: CareNotification) => Promise<void>;
}> = ({
  isOpen,
  isDarkMode,
  canUseProfessionalNotifications,
  isNotificationLoading,
  updatingCaseId,
  notifications,
  onRefresh,
  onApprove,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-[calc(100%+8px)] right-0 z-[100] w-[24rem] rounded-xl border p-3 shadow-xl ${
        isDarkMode
          ? 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
          : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Notifications</span>
        {canUseProfessionalNotifications && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </div>

      {!canUseProfessionalNotifications && (
        <div className="text-sm text-[var(--color-text-muted)]">
          Notifications are available for professional accounts.
        </div>
      )}
      {canUseProfessionalNotifications && isNotificationLoading && (
        <div className="text-sm text-[var(--color-text-muted)]">
          Loading notifications...
        </div>
      )}
      {canUseProfessionalNotifications &&
        !isNotificationLoading &&
        notifications.length === 0 && (
          <div className="text-sm text-[var(--color-text-muted)]">
            No new professional assignments.
          </div>
        )}

      {canUseProfessionalNotifications && notifications.length > 0 && (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`w-full rounded-md border p-2 text-left ${
                isDarkMode
                  ? 'border-[var(--color-border)] bg-[var(--color-surface)]/70'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]/70'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  New ML Assignment
                </div>
                <Badge variant="outline">Secure</Badge>
              </div>
              <div className="text-xs font-medium text-[var(--color-text-secondary)]">
                Category: {item.reportCategory.replace(/_/g, ' ')}
              </div>
              <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {item.reportDescription.length > 120
                  ? `${item.reportDescription.slice(0, 120)}...`
                  : item.reportDescription}
              </div>
              <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Report ID: {item.reportId}
              </div>
              <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void onApprove(item)}
                  disabled={updatingCaseId === item.id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onDecline(item)}
                  disabled={updatingCaseId === item.id}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Navigation Configuration ---
const NAV_CONFIG = {
  public: {
    label: 'GUEST ACCESS',
    items: [
      { page: 'landing', label: 'home', path: '/' },
      { page: 'report-incident', label: 'report', path: '/report' },
      { page: 'missing-persons', label: 'missing', path: '/missing-persons' },
      { page: 'support-services', label: 'support', path: '/support-services' },
      // { page: 'forums', label: 'community', path: '/forums' },
    ],
  },
  [UserRole.SURVIVOR]: {
    label: 'SURVIVOR PORTAL',
    items: [
      { page: 'dashboard', label: 'overview', path: '/survivor/dashboard' },
      { page: 'my-cases', label: 'cases', path: '/survivor/my-cases' },
      { page: 'safety', label: 'safety', path: '/survivor/safety' },
      { page: 'resources', label: 'resources', path: '/resources' },
      // { page: 'forums', label: 'community', path: '/forums' },
    ],
  },
  [UserRole.COUNSELOR]: {
    label: 'COUNSELOR ACCESS',
    items: [
      {
        page: 'counselor-dashboard',
        label: 'dashboard',
        path: '/counselor/dashboard',
      },
      {
        page: 'counselor-cases',
        label: 'cases',
        path: '/counselor/cases',
      },
      {
        page: 'counselor-reports',
        label: 'reports',
        path: '/counselor/reports-overview',
      },
      {
        page: 'counselor-profile',
        label: 'profile',
        path: '/counselor/profile',
      },
    ],
  },
  [UserRole.MEDICAL_PROFESSIONAL]: {
    label: 'MEDICAL ACCESS',
    items: [
      {
        page: 'medical-provider-dashboard',
        label: 'overview',
        path: '/medical-provider/dashboard',
      },
      {
        page: 'medical-provider-cases',
        label: 'cases',
        path: '/medical-provider/cases',
      },
      {
        page: 'medical-provider-appointments',
        label: 'appointments',
        path: '/medical-provider/appointments',
      },
      {
        page: 'medical-provider-examinations',
        label: 'examinations',
        path: '/medical-provider/examinations',
      },
      {
        page: 'medical-provider-profile',
        label: 'profile',
        path: '/medical-provider/profile',
      },
    ],
  },
  [UserRole.LEGAL_ADVISOR]: {
    label: 'LEGAL ACCESS',
    items: [
      { page: 'legal-dashboard', label: 'overview', path: '/legal/dashboard' },
      { page: 'legal-cases', label: 'cases', path: '/legal/cases' },
      {
        page: 'legal-consultations',
        label: 'consultations',
        path: '/legal/consultations',
      },
      {
        page: 'legal-court-calendar',
        label: 'court',
        path: '/legal/court-calendar',
      },
      { page: 'legal-profile', label: 'profile', path: '/legal/profile' },
    ],
  },
  [UserRole.MODERATOR]: {
    label: 'MODERATOR ACCESS',
    items: [
      { page: 'dashboard', label: 'dashboard', path: '/moderator/dashboard' },
      {
        page: 'content-moderation',
        label: 'forum posts',
        path: '/moderator/content-moderation',
      },
      {
        page: 'reported-content',
        label: 'reports',
        path: '/moderator/forums/reported-content',
      },
      { page: 'profile', label: 'profile', path: '/moderator/profile' },
    ],
  },
  [UserRole.ADMIN]: {
    label: 'ADMIN ACCESS',
    items: [
      { page: 'dashboard', label: 'overview', path: '/admin' },
      { page: 'users', label: 'users', path: '/admin/user-management/users' },
      { page: 'cases', label: 'cases', path: '/admin/case-management' },
      { page: 'missing-persons', label: 'missing persons', path: '/admin/missing-persons' },
      { page: 'settings', label: 'settings', path: '/admin/system-settings' },
    ],
  },
};

// --- Navigation Header Component ---
const NavigationHeader: React.FC<{
  roleLabel: string;
  userName: string;
  navItems: NavItem[];
  isSurvivor?: boolean;
  user?: any;
}> = ({ roleLabel, userName, navItems, isSurvivor, user }) => {
  const { setUser, language, setLanguage } = useApp();
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<CareNotification[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownTimeout, setProfileDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  const canUseProfessionalNotifications = [
    UserRole.MEDICAL_PROFESSIONAL,
    UserRole.LEGAL_ADVISOR,
    UserRole.COUNSELOR,
  ].includes(user?.role as UserRole);

  const isCounselor = user?.role === UserRole.COUNSELOR;
  const showMessagesIcon = [
    UserRole.SURVIVOR,
    UserRole.COUNSELOR,
    UserRole.LEGAL_ADVISOR,
    UserRole.MEDICAL_PROFESSIONAL,
  ].includes(user?.role as UserRole);

  const notificationCount = notifications.length;

  // Check if we're on the notifications or messages page
  const isOnNotificationsPage = location.pathname.includes('/notifications');
  const isOnMessagesPage = location.pathname.includes('/messages');

  const loadNotifications = async () => {
    if (!canUseProfessionalNotifications || !user?.id) return;
    
    try {
      setIsNotificationLoading(true);
      
      // For counselors, use the notification service
      if (isCounselor) {
        const unreadCount = await notificationService.getUnreadCount();
        // Set a placeholder notification to show count
        setNotifications(
          Array.from({ length: unreadCount }, (_, i) => ({
            id: `counselor-notif-${i}`,
            reportId: '',
            caseType: '',
            reportCategory: '',
            reportDescription: '',
            timestamp: new Date().toISOString(),
          }))
        );
        return;
      }
      
      // For medical/legal professionals, use existing logic
      const response = await api.get(
        `/cases/professional/${user.id}?includePending=true`,
      );
      const cases = (response.data?.data || []) as Array<{
        id: string;
        updatedAt: string;
        caseType: string;
        invitationStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
        report: {
          id: string;
          reporterId: string | null;
          category: string;
          description: string;
        } | null;
      }>;

      const survivorLinkedCases = cases.filter(
        (item) =>
          item.report &&
          item.report.reporterId !== null &&
          item.invitationStatus === 'PENDING',
      );

      setNotifications(
        survivorLinkedCases.map((item) => ({
          id: item.id,
          reportId: item.report?.id || '',
          caseType: item.caseType,
          reportCategory: item.report?.category || 'OTHER',
          reportDescription: item.report?.description || '',
          timestamp: item.updatedAt,
        })),
      );
    } catch (error) {
      console.error('Failed to load professional notifications', error);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const loadUnreadMessages = async () => {
    if (!showMessagesIcon || !user?.id) {
      return;
    }
    
    try {
      let count = 0;
      
      if (user.role === UserRole.SURVIVOR) {
        // Use patientService for survivors
        const conversations = await patientService.getChatConversations();
        
        // For survivors, count conversations that have messages from someone other than the survivor
        // This is a simple heuristic - count conversations where the last message wasn't from the survivor
        count = conversations.filter(conv => {
          // If there's no last message, no unread
          if (!conv.lastMessage) return false;
          
          // If the last sender was not the survivor, it might be unread
          // We check if the last sender name doesn't match the survivor's first name
          return conv.lastSenderName !== user.firstName;
        }).length;
      } else if (
        user.role === UserRole.COUNSELOR ||
        user.role === UserRole.LEGAL_ADVISOR ||
        user.role === UserRole.MEDICAL_PROFESSIONAL
      ) {
        // Use messagingService for all professionals
        count = await messagingService.getUnreadCount(user.role, user.id);
      }
      
      setUnreadMessagesCount(count);
    } catch (error) {
      console.error('Failed to load unread messages count', error);
    }
  };

  useEffect(() => {
    let notificationTimer: ReturnType<typeof setInterval> | null = null;
    let messagesTimer: ReturnType<typeof setInterval> | null = null;
    
    loadNotifications();
    loadUnreadMessages();

    if (canUseProfessionalNotifications) {
      notificationTimer = setInterval(loadNotifications, 60000);
    }

    if (showMessagesIcon) {
      messagesTimer = setInterval(loadUnreadMessages, 60000);
    }

    // Refresh unread count when user returns to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUnreadMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (notificationTimer) clearInterval(notificationTimer);
      if (messagesTimer) clearInterval(messagesTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [canUseProfessionalNotifications, showMessagesIcon, user?.id]);


  const handleApproveCase = async (item: CareNotification) => {
    try {
      setUpdatingCaseId(item.id);
      await api.post(`/cases/${item.id}/invitations/respond`, {
        action: 'ACCEPT',
      });
      toast.success('Case accepted and added to your queue.');
      await loadNotifications();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to accept case');
    } finally {
      setUpdatingCaseId(null);
    }
  };

  const handleDeclineCase = async (item: CareNotification) => {
    try {
      setUpdatingCaseId(item.id);
      await api.post(`/cases/${item.id}/invitations/respond`, {
        action: 'DECLINE',
      });
      toast.success('Case declined. Admin can reassign it.');
      await loadNotifications();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to decline invitation');
    } finally {
      setUpdatingCaseId(null);
    }
  };

  const handleProfileMouseEnter = () => {
    if (profileDropdownTimeout) {
      clearTimeout(profileDropdownTimeout);
      setProfileDropdownTimeout(null);
    }
    setIsProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 150);
    setProfileDropdownTimeout(timeout);
  };

  const handleSignOut = async () => {
    // Clear user state FIRST to prevent PublicLayout redirecting to dashboard
    setUser(null);
    await authService.logoutAndRedirect(navigate);
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sh-header">
      <div className="flex items-center gap-12">
        <div className="sh-branding">
          <Shield className="h-6 w-6 text-[var(--color-primary)]" />
          <span className="sh-logo-text">SAFEHAVEN</span>
        </div>

        {/* Desktop nav — hidden on mobile */}
        <nav className="sh-nav sh-nav-desktop">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `sh-nav-link ${isActive ? 'active border-primary border-b-2' : ''}`
              }
            >
              {t(`navigation.${item.label}`)}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sh-meta overflow-visible">
        <div className="flex items-center gap-3">
          {/* Desktop-only icons & user */}
          <div className="sh-desktop-only flex items-center gap-1">
            {showMessagesIcon && (
              <div className="relative">
                <button
                  className={`sh-notification-bell ${isOnMessagesPage ? 'active' : ''}`}
                  title="Messages"
                  onClick={() => {
                    const role = user?.role;
                    if (role === UserRole.COUNSELOR) {
                      navigate('/counselor/messages');
                    } else if (role === UserRole.LEGAL_ADVISOR) {
                      navigate('/legal/messages');
                    } else if (role === UserRole.MEDICAL_PROFESSIONAL) {
                      navigate('/medical-provider/messages');
                    } else {
                      navigate('/survivor/messages');
                    }
                  }}
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="notification-dot notification-dot--count">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <div className="relative">
              <button
                className={`sh-notification-bell ${isOnNotificationsPage || isNotificationsOpen ? 'active' : ''}`}
                title="Notifications"
                onClick={() => {
                  if (isCounselor) {
                    navigate('/counselor/notifications');
                  } else {
                    setIsNotificationsOpen((prev) => !prev);
                  }
                }}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="notification-dot notification-dot--count">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              {!isCounselor && (
                <NotificationDropdown
                  isOpen={isNotificationsOpen}
                  isDarkMode={isDarkMode}
                  canUseProfessionalNotifications={canUseProfessionalNotifications}
                  isNotificationLoading={isNotificationLoading}
                  updatingCaseId={updatingCaseId}
                  notifications={notifications}
                  onRefresh={loadNotifications}
                  onApprove={handleApproveCase}
                  onDecline={handleDeclineCase}
                />
              )}
            </div>
          </div>

          <div className="sh-desktop-only flex items-center gap-2 border-x border-[var(--color-border)] px-3">
            {!user || user.role === UserRole.SURVIVOR ? (
              <button
                onClick={() => {
                  const newLang = i18n.language === 'en' ? 'am' : 'en';
                  i18n.changeLanguage(newLang);
                  localStorage.setItem('preferred_language', newLang);
                  // Keep AppContext in sync if needed
                  setLanguage(newLang === 'en' ? 'ENG' : 'AMH');
                }}
                className="sh-toggle-btn"
                title={t('language.changeLanguage')}
                aria-label={t('language.changeLanguage')}
              >
                <Languages className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-[10px] font-black">{i18n.language === 'en' ? 'ENG' : 'አማ'}</span>
              </button>
            ) : null}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sh-toggle-btn"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
              )}
            </button>
          </div>

          <div className="sh-desktop-only">
            {user ? (
              <>
                <div
                  className={`relative flex items-center gap-2.5 overflow-visible pl-1 cursor-pointer`}
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  <div className="sh-meta-group items-end">
                    {isSurvivor ? (
                      <span className="sh-meta-value text-[12px] font-medium text-[var(--role-survivor-primary)]">
                        {userName}
                      </span>
                    ) : (
                      <>
                        <span className="sh-meta-label">{roleLabel}</span>
                        <span className="sh-meta-value text-[10px]">{userName}</span>
                      </>
                    )}
                  </div>
                  <div className={`sh-avatar border-[var(--color-border)]/50 ${isSurvivor ? 'bg-[var(--role-survivor-primary)]/10' : 'bg-[var(--color-surface)]'}`}>
                    <span className={`text-[10px] font-black ${isSurvivor ? 'text-[var(--role-survivor-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div 
                    className={`absolute top-[calc(100%+8px)] right-0 z-[100] w-48 rounded-xl border p-2 shadow-xl ${
                      isDarkMode
                        ? 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)]'
                    }`}
                    onMouseEnter={() => {
                      if (profileDropdownTimeout) {
                        clearTimeout(profileDropdownTimeout);
                        setProfileDropdownTimeout(null);
                      }
                    }}
                    onMouseLeave={handleProfileMouseLeave}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        // Navigate to profile based on user role
                        if (user.role === UserRole.SURVIVOR) {
                          navigate('/survivor/profile');
                        } else if (user.role === UserRole.COUNSELOR) {
                          navigate('/counselor/profile');
                        } else if (user.role === UserRole.LEGAL_ADVISOR) {
                          navigate('/legal/profile');
                        } else if (user.role === UserRole.MEDICAL_PROFESSIONAL) {
                          navigate('/medical-provider/profile');
                        } else if (user.role === UserRole.MODERATOR) {
                          navigate('/moderator/profile');
                        } else if (user.role === UserRole.ADMIN) {
                          navigate('/admin/profile');
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface)] rounded-md transition-colors"
                    >
                      {t('navigation.profile')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        void handleSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-semibold text-white"
              >
                {t('common.login')}
              </button>
            )}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="sh-hamburger"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile backdrop overlay */}
      {isMobileMenuOpen && (
        <div
          className="sh-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div className={`sh-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Drawer header */}
        <div className="sh-mobile-drawer-header">
          <div className="sh-branding">
            <Shield className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="sh-logo-text" style={{ fontSize: '1.1rem' }}>SAFEHAVEN</span>
          </div>
          <button
            className="sh-hamburger"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Role badge */}
        <div className="sh-mobile-role-label">{roleLabel}</div>

        {/* Nav links */}
        <nav className="sh-mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `sh-mobile-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {t(`navigation.${item.label}`)}
            </NavLink>
          ))}
        </nav>

        <div className="sh-mobile-divider" />

        {/* Action icons row */}
        <div className="sh-mobile-actions">
          {showMessagesIcon && (
            <button
              className={`sh-notification-bell ${isOnMessagesPage ? 'active' : ''}`}
              title="Messages"
              onClick={() => {
                setIsMobileMenuOpen(false);
                const role = user?.role;
                if (role === UserRole.COUNSELOR) navigate('/counselor/messages');
                else if (role === UserRole.LEGAL_ADVISOR) navigate('/legal/messages');
                else if (role === UserRole.MEDICAL_PROFESSIONAL) navigate('/medical-provider/messages');
                else navigate('/survivor/messages');
              }}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessagesCount > 0 && (
                <span className="notification-dot notification-dot--count">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          <button
            className={`sh-notification-bell ${isOnNotificationsPage ? 'active' : ''}`}
            title="Notifications"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (isCounselor) navigate('/counselor/notifications');
              else setIsNotificationsOpen((prev) => !prev);
            }}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="notification-dot notification-dot--count">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {!user || user.role === UserRole.SURVIVOR ? (
            <button
              onClick={() => {
                const newLang = i18n.language === 'en' ? 'am' : 'en';
                i18n.changeLanguage(newLang);
                localStorage.setItem('preferred_language', newLang);
                setLanguage(newLang === 'en' ? 'ENG' : 'AMH');
              }}
              className="sh-toggle-btn"
              title={t('language.changeLanguage')}
              aria-label={t('language.changeLanguage')}
            >
              <Languages className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="text-[10px] font-black">{i18n.language === 'en' ? 'ENG' : 'አማ'}</span>
            </button>
          ) : null}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="sh-toggle-btn"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
            )}
          </button>
        </div>

        <div className="sh-mobile-divider" />

        {/* Mobile user section */}
        <div className="sh-mobile-user">
          {user ? (
            <>
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className={`sh-avatar border-[var(--color-border)]/50 ${isSurvivor ? 'bg-[var(--role-survivor-primary)]/10' : 'bg-[var(--color-surface)]'}`}>
                  <span className={`text-[10px] font-black ${isSurvivor ? 'text-[var(--role-survivor-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="sh-meta-label">{roleLabel}</div>
                  <div className="sh-meta-value" style={{ fontSize: '12px' }}>{userName}</div>
                </div>
              </div>
              
              {/* Mobile Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      // Navigate to profile based on user role
                      if (user.role === UserRole.SURVIVOR) {
                        navigate('/survivor/profile');
                      } else if (user.role === UserRole.COUNSELOR) {
                        navigate('/counselor/profile');
                      } else if (user.role === UserRole.LEGAL_ADVISOR) {
                        navigate('/legal/profile');
                      } else if (user.role === UserRole.MEDICAL_PROFESSIONAL) {
                        navigate('/medical-provider/profile');
                      } else if (user.role === UserRole.MODERATOR) {
                        navigate('/moderator/profile');
                      } else if (user.role === UserRole.ADMIN) {
                        navigate('/admin/profile');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface)] rounded-md transition-colors"
                  >
                    {t('navigation.profile')}
                  </button>
                  <button
                    onClick={() => { setIsProfileDropdownOpen(false); setIsMobileMenuOpen(false); void handleSignOut(); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => { setIsMobileMenuOpen(false); handleLogin(); }}
              className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-white"
            >
              {t('common.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export function Navigation({ children }: { children?: React.ReactNode }) {
  const { user } = useApp();
  const location = useLocation();

  const roleKey = user?.role || 'public';
  const config =
    NAV_CONFIG[roleKey as keyof typeof NAV_CONFIG] || NAV_CONFIG.public;
  const isSurvivor = user?.role === UserRole.SURVIVOR;

  // Always show navigation header

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <NavigationHeader
        roleLabel={config.label}
        // FIX: Access firstName instead of name
        userName={user?.firstName || 'Guest'}
        navItems={config.items}
        isSurvivor={isSurvivor}
        user={user}
      />
      <main className="relative z-0 w-full flex-1">{children}</main>
    </div>
  );
}
