import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Activity,
  Stethoscope,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';
import { useApp } from '@/components/AppContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ProviderInvitationItem {
  caseId: string;
  reportId: string;
  reportTitle: string;
  reportSeverity: string;
  reportStatus: string;
  caseType: string;
  roleInCase: 'PRIMARY' | 'SUPPORT';
  invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt: string;
  respondedAt: string | null;
}

interface DashboardData {
  stats: {
    totalCases: number;
    activeCases: number;
    pendingExams: number;
    todayAppointments: number;
  };
  recentCases: Array<{
    id: string;
    name: string;
    lastVisit: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    caseType: string;
    reportTitle: string;
  }>;
  upcomingAppointments: Array<{
    id: string;
    patient: string;
    time: string;
    type: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
}

type ProfessionalCase = {
  id: string;
  caseType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  report: {
    id: string;
    title: string;
    reporter?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null;
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<ProviderInvitationItem[]>([]);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const mapCasesToDashboardData = (
    cases: any[]
  ): DashboardData => {
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const recentCases = cases.slice(0, 6).map((item) => {
      const reporterName = item.reporter
        ? `${item.reporter.firstName || ''} ${item.reporter.lastName || ''}`.trim() || item.reporter.email
        : null;

      return {
        id: item.id,
        name: item.isAnonymous
          ? 'Anonymous Survivor'
          : reporterName || item.trackingNumber,
        lastVisit: new Date(item.assignedAt).toLocaleDateString(),
        status: item.status,
        priority: item.priority,
        caseType: item.caseType,
        reportTitle: item.description || 'No description',
      };
    });

    // Only show cases with status 'SCHEDULED' as appointments
    const scheduledCases = cases.filter((item) => item.status === 'SCHEDULED');
    const upcomingAppointments = scheduledCases
      .slice(0, 6)
      .map((item) => {
        const reporterName = item.reporter
          ? `${item.reporter.firstName || ''} ${item.reporter.lastName || ''}`.trim() || item.reporter.email
          : null;

        return {
          id: item.id,
          patient: item.isAnonymous
            ? 'Anonymous Survivor'
            : reporterName || item.trackingNumber,
          time: new Date(item.assignedAt).toLocaleString(),
          type: item.caseType.replace(/_/g, ' '),
          status: item.status,
          priority: item.priority,
        };
      });

    return {
      stats: {
        totalCases: cases.length,
        activeCases: cases.filter((item) => item.status === 'ASSIGNED' || item.status === 'IN_PROGRESS').length,
        pendingExams: scheduledCases.length,
        todayAppointments: scheduledCases.length,
      },
      recentCases,
      upcomingAppointments,
    };
  };

  useEffect(() => {
    const resolveCurrentUser = async () => {
      if (user?.id) {
        setCurrentUserId(user.id);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setCurrentUserId(response.data?.id || null);
      } catch {
        setCurrentUserId(null);
      }
    };

    resolveCurrentUser();
  }, [user?.id]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Use the correct medical cases endpoint
        const casesResponse = await api.get(`/medical-provider/cases`);
        console.log('[Dashboard] Cases API Response:', casesResponse.data);
        const caseItems = casesResponse.data || [];
        console.log('[Dashboard] Case items count:', caseItems.length);
        setData(mapCasesToDashboardData(caseItems));

        try {
          const invitationResponse = await api.get('/cases/invitations/me');
          console.log('Invitations API Response:', invitationResponse.data); // Debugging log
          setInvitations(invitationResponse.data || []);
        } catch (inviteError: any) {
          console.warn('Failed to load invitations', inviteError);
          setInvitations([]);
        }
      } catch (error: any) {
        console.error('Failed to load dashboard data', error);
        toast.error(error?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingInvitations = invitations.filter(
    (item) => item.invitationStatus === 'PENDING'
  );

  const pendingInvitationCount = pendingInvitations.length;

  const respondToInvitation = async (
    caseId: string,
    action: 'ACCEPT' | 'DECLINE'
  ) => {
    try {
      setIsResponding(caseId);
      await api.post(`/cases/${caseId}/invitations/respond`, { action });
      if (!currentUserId) return;
      const casesResponse = await api.get(
        `/cases/professional/${currentUserId}`
      );
      const invitationResponse = await api.get('/cases/invitations/me');
      const caseItems = (casesResponse.data?.data || []) as ProfessionalCase[];
      setData(mapCasesToDashboardData(caseItems));
      setInvitations(invitationResponse.data || []);
      toast.success(
        action === 'ACCEPT'
          ? 'Invitation accepted and case added to your medical queue.'
          : 'Invitation declined. Admin can route this case to another provider.'
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update invitation status');
    } finally {
      setIsResponding(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--role-medical)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--colors-body-text)]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center text-[var(--colors-body-text)]">Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  const { stats, recentCases, upcomingAppointments } = data;

  const handleAddCase = () => {
    navigate('/medical-provider/cases');
  };

  const handleNewExam = () => {
    navigate('/medical-provider/examinations');
  };

  const handleSchedule = () => {
    navigate('/medical-provider/appointments');
  };

  const handleAlerts = () => {
    navigate('/medical-provider/alerts');
  };

  const handleViewAllCases = () => {
    navigate('/medical-provider/cases');
  };

  const handleManageAppointments = () => {
    navigate('/medical-provider/appointments');
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-[var(--role-urgent)]/10 text-[var(--role-urgent)] border-[var(--role-urgent)]';
      case 'MEDIUM':
        return 'bg-[var(--role-stable)]/10 text-[var(--role-stable)] border-[var(--role-stable)]';
      case 'LOW':
        return 'bg-[var(--role-medical)]/10 text-[var(--role-medical)] border-[var(--role-medical)]';
      default:
        return 'bg-[var(--role-medical)]/5 text-[var(--role-medical)] border-[var(--role-medical)]';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-medical)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-urgent)]/10 to-[var(--role-stable)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Professional Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] p-3 shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] bg-clip-text text-4xl font-bold text-transparent">
                Medical Dashboard
              </h1>
              <p className="font-medium text-[var(--colors-body-text)]">
                Your medical practice command center
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics - Professional Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4"
        >
          <Card className="border-0 bg-gradient-to-r from-[var(--role-medical)] to-[var(--role-medical)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--role-urgent)] to-[var(--role-urgent)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.activeCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--role-stable)] to-[var(--role-stable)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Pending Exams</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingExams}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--colors-olive-5)] to-[var(--colors-olive-5)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Today's Appointments</p>
                  <p className="text-3xl font-bold text-white">{stats.todayAppointments}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
        {/* Recent Cases */}
        <Card className="border-0 bg-[var(--color-card)]/80 shadow-xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-[var(--border-border-secondary)] bg-gradient-to-r from-[var(--role-medical)]/10 to-transparent">
            <CardTitle className="text-xl font-semibold text-[var(--colors-heading-text)]">Recent Cases</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentCases.length === 0 && (
                <p className="text-[var(--colors-body-text)] text-sm">
                  No assigned reports yet.
                </p>
              )}
              {recentCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-border-secondary)] p-4 bg-[var(--color-card)] hover:bg-[var(--surface-surface-secondary)] transition-colors cursor-pointer"
                  onClick={() => navigate(`/medical-provider/cases/${caseItem.id}`)}
                >
                  <div>
                    <p className="font-medium text-[var(--colors-heading-text)]">{caseItem.name}</p>
                    <p className="text-[var(--colors-body-text)] text-sm">
                      Last visit: {caseItem.lastVisit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityBadgeStyle(
                        caseItem.priority
                      )}`}
                    >
                      {caseItem.priority}
                    </Badge>
                    <Badge variant="outline" className="border-[var(--border-border-secondary)] text-[var(--colors-body-text)]">
                      {caseItem.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)]"
              onClick={handleViewAllCases}
            >
              View All Cases
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-0 bg-[var(--color-card)]/80 shadow-xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-[var(--border-border-secondary)] bg-gradient-to-r from-[var(--role-stable)]/10 to-transparent">
            <CardTitle className="text-xl font-semibold text-[var(--colors-heading-text)]">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.length === 0 && (
                <p className="text-[var(--colors-body-text)] text-sm">
                  No upcoming assigned report actions.
                </p>
              )}
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-border-secondary)] p-4 bg-[var(--color-card)] hover:bg-[var(--surface-surface-secondary)] transition-colors"
                >
                  <div>
                    <p className="font-medium text-[var(--colors-heading-text)]">{appointment.patient}</p>
                    <p className="text-[var(--colors-body-text)] text-sm">
                      {appointment.type}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <Badge
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityBadgeStyle(
                          appointment.priority
                        )}`}
                      >
                        {appointment.priority}
                      </Badge>
                      <Badge variant="outline" className="border-[var(--border-border-secondary)] text-[var(--colors-body-text)]">
                        {appointment.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--colors-body-text)]">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)]"
              onClick={handleManageAppointments}
            >
              Manage Appointments
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mt-6 border-0 bg-[var(--color-card)]/80 shadow-xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-[var(--border-border-secondary)] bg-gradient-to-r from-[var(--role-medical)]/10 to-transparent">
            <CardTitle className="text-xl font-semibold text-[var(--colors-heading-text)]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Button
                className="bg-[var(--role-medical)] hover:bg-[var(--colors-olive-9)] text-white flex h-20 flex-col items-center gap-2 rounded-xl"
                onClick={handleAddCase}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">View Cases</span>
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)] flex h-20 flex-col items-center gap-2 rounded-xl"
                onClick={handleNewExam}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">New Exam</span>
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)] flex h-20 flex-col items-center gap-2 rounded-xl"
                onClick={handleSchedule}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Schedule</span>
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)] flex h-20 flex-col items-center gap-2 rounded-xl"
                onClick={handleAlerts}
              >
                <AlertTriangle className="h-6 w-6 text-[var(--role-urgent)]" />
                <span className="text-sm">Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
  );
};

export default Dashboard;
