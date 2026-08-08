import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Users,
  BarChart3,
  Clock,
  Bell,
  MessageSquare,
  Shield,
  Menu,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './AppContext';
import { UserRole } from '@/types/user';
import { authService } from '@/services/authService';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

interface CommandBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activePage?: string;
}

export const CommandBar = ({
  isDark,
  onToggleTheme,
  activePage,
}: CommandBarProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: 'critical' | 'high' | 'system' | 'message';
      title: string;
      message: string;
      time: string;
      caseId: string;
      reportId: string;
    }>
  >([]);
  const navigate = useNavigate();
  const { user } = useApp();
  const seenAssignmentsRef = useRef<Set<string>>(new Set());

  const isProfessional = useMemo(
    () =>
      user?.role === UserRole.COUNSELOR ||
      user?.role === UserRole.MEDICAL_PROFESSIONAL ||
      user?.role === UserRole.LEGAL_ADVISOR,
    [user?.role],
  );

  useEffect(() => {
    if (!user?.id || !isProfessional) {
      setNotifications([]);
      return;
    }

    let isMounted = true;

    const fetchAssignedCases = async () => {
      try {
        const response = await api.get(`/cases/professional/${user.id}`);
        const cases = (response.data?.data || []) as Array<{
          id: string;
          caseType: string;
          createdAt: string;
          updatedAt: string;
          report: { id: string; status: string } | null;
        }>;

        const assignedCases = cases.filter(
          (item) => item.report?.status === 'ASSIGNED_TO_PROFESSIONAL',
        );

        if (!isMounted) return;

        const mapped = assignedCases.map((item) => ({
          id: item.id,
          type: 'high' as const,
          title: 'New ML Assignment',
          message: `Case Type: ${item.caseType.replace(/_/g, ' ')} | Report ID: ${item.report?.id}`,
          time: new Date(item.updatedAt || item.createdAt).toLocaleString(),
          caseId: item.id,
          reportId: item.report?.id || '',
        }));

        setNotifications(mapped);

        for (const assigned of assignedCases) {
          if (seenAssignmentsRef.current.has(assigned.id)) continue;

          seenAssignmentsRef.current.add(assigned.id);
          const caseTypeLabel = assigned.caseType.replace(/_/g, ' ');
          toast.info(
            `Action Required: A new ${caseTypeLabel} case has been routed to you by the ML system.`,
            {
              id: `ml-assignment-${assigned.id}`,
              action: {
                label: 'Action',
                onClick: () =>
                  navigate(
                    `/counselor/cases/case-details?caseId=${assigned.id}&reportId=${assigned.report?.id || ''}`,
                  ),
              },
            },
          );
        }
      } catch (error) {
        // Keep command bar resilient; dashboard handles detailed errors separately.
      }
    };

    fetchAssignedCases();
    const pollInterval = window.setInterval(fetchAssignedCases, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(pollInterval);
    };
  }, [isProfessional, navigate, user?.id]);

  const getActiveClass = (page: string) => {
    return activePage === page
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
      : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`;
  };

  return (
    <>
      <header
        className={`relative z-50 flex h-[60px] items-center justify-between border-b px-6 backdrop-blur-xl ${
          isDark
            ? 'border-slate-700/50 bg-slate-900/95'
            : 'border-slate-200/50 bg-white/95'
        }`}
      >
        {/* Left: Menu + Primary Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`mr-2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {user?.role === UserRole.COUNSELOR ||
          user?.role === UserRole.MEDICAL_PROFESSIONAL ||
          user?.role === UserRole.LEGAL_ADVISOR ? (
            <>
              <Link to="/counselor-dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={getActiveClass('dashboard')}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Operational Hub
                </Button>
              </Link>

              <Link to="/counselor/cases">
                <Button
                  variant="ghost"
                  size="sm"
                  className={getActiveClass('cases')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Case Queue
                </Button>
              </Link>

              <Link to="/counselor/audit">
                <Button
                  variant="ghost"
                  size="sm"
                  className={getActiveClass('audit')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Audit Logs
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                to={
                  user?.role === 'general_case_manager'
                    ? '/general-case-manager'
                    : '/counselor-dashboard'
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={getActiveClass('dashboard')}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Link to="/general-case-manager">
                <Button
                  variant="ghost"
                  size="sm"
                  className={getActiveClass('general-case-manager')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Case Management
                </Button>
              </Link>
            </>
          )}

          <Link to="/reports">
            <Button
              variant="ghost"
              size="sm"
              className={getActiveClass('reports')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </div>

        {/* Right: Schedule, Alerts, Profile, Safe Exit */}
        <div className="flex items-center gap-2">
          <Link to="/schedule">
            <Button
              variant="ghost"
              size="sm"
              className={getActiveClass('schedule')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </Link>

          {/* Messages Icon */}
          <Link to="/counselor/messages">
            <Button
              variant="ghost"
              size="sm"
              className={`relative ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <MessageSquare className="h-4 w-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </Link>

          {/* Notifications Bell Icon - Links to Notifications Page */}
          <Link to="/counselor/notifications">
            <Button
              variant="ghost"
              size="sm"
              className={`relative ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className={
              isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-800'
            }
          >
            {isDark ? '☀️' : '🌙'}
          </Button>

          <div className="ml-2 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-xs text-white">
                GM
              </AvatarFallback>
            </Avatar>
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          </div>

          <Button
            size="sm"
            className="ml-2 bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            <Shield className="mr-2 h-4 w-4" />
            Safe Exit
          </Button>
        </div>
      </header>

      {/* Menu Slide-out */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-[60px] left-0 z-50 h-[calc(100vh-60px)] w-64 border-r shadow-2xl backdrop-blur-xl ${
                isDark
                  ? 'border-slate-700/50 bg-slate-900/95'
                  : 'border-slate-200/50 bg-white/95'
              }`}
            >
              <div className="p-4">
                <h3
                  className={`mb-4 text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  Settings & Tools
                </h3>

                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <HelpCircle className="mr-3 h-4 w-4" />
                    Help Center
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700 ${isDark ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' : ''}`}
                    onClick={async () => {
                      setShowMenu(false);
                      await authService.logoutAndRedirect(navigate);
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log Out
                  </Button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
