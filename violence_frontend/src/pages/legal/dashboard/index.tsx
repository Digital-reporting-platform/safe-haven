import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  AlertCircle,
  Gavel,
  BookOpen,
  Users,
  Clock,
  MessageSquare,
  FolderOpen,
  CheckCircle,
  Shield,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/components/AppContext';
import { api } from '@/services/api/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  legalWorkflowService,
  type ProviderInvitationItem,
} from '@/services/legalWorkflowService';

type ProfessionalCase = {
  id: string;
  caseType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string | null;
  updatedAt: string;
  report?: {
    id: string;
    title: string;
    reporter?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

const isSurvivorLinkedCase = (item: ProfessionalCase) => {
  if (!item.report) return true;
  const reporter = item.report?.reporter;
  return Boolean(reporter && (reporter.email || reporter.firstName || reporter.lastName));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<ProviderInvitationItem[]>([]);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [userName, setUserName] = useState('Legal Advisor');
  const [data, setData] = useState<{
    stats: {
      activeCases: number;
      completedCases: number;
      urgentCases: number;
      combinedCases: number;
    };
    recentCases: Array<{
      id: string;
      title: string;
      caseType: string;
      priority: string;
      status: string;
      patientName: string;
      updatedAt: string;
    }>;
    upcomingEvents: Array<{
      id: string;
      title: string;
      date: string | null;
      type: string;
      patientId: string | null;
    }>;
  } | null>(null);

  // Get logged-in user name
  useEffect(() => {
    const userStr = localStorage.getItem('sh_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const name = user.firstName || user.email?.split('@')[0] || 'Legal Advisor';
        setUserName(name);
      } catch {
        setUserName('Legal Advisor');
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/cases/professional/${user.id}`);
        const rawData = response.data?.data ?? response.data ?? [];
        const caseItems = (rawData as ProfessionalCase[]).filter(
          isSurvivorLinkedCase,
        );

        const dashboardData = {
          stats: {
            activeCases: caseItems.filter((x) => x.status === 'ACTIVE').length,
            completedCases: caseItems.filter((x) => x.status === 'COMPLETED').length,
            urgentCases: caseItems.filter((x) => ['HIGH', 'CRITICAL'].includes(x.priority))
              .length,
            combinedCases: caseItems.filter((x) => x.caseType === 'COMBINED_SUPPORT').length,
          },
          recentCases: caseItems.slice(0, 8).map((x) => ({
            id: x.id,
            title: x.report?.title || 'Untitled Case',
            caseType: x.caseType,
            priority: x.priority,
            status: x.status,
            patientName:
              `${x.report?.reporter?.firstName || ''} ${x.report?.reporter?.lastName || ''}`.trim() ||
              x.report?.reporter?.email ||
              'Unknown survivor',
            updatedAt: x.updatedAt,
          })),
          upcomingEvents: caseItems
            .filter((x) => x.dueDate)
            .slice(0, 8)
            .map((x) => ({
              id: x.id,
              title: x.report?.title || 'Untitled Case',
              date: x.dueDate || null,
              type: x.caseType,
              patientId: x.report?.id || null,
            })),
        };

        setData(dashboardData);
        try {
          const invitationData = await legalWorkflowService.getMyInvitations();
          setInvitations(invitationData);
        } catch (inviteError: any) {
          console.warn('Failed to load legal invitations', inviteError);
          setInvitations([]);
        }
      } catch (err: any) {
        console.error('Failed to load legal dashboard', err);
        setError(err?.message || 'Failed to load legal dashboard');
        toast.error(err?.message || 'Failed to load legal dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.invitationStatus === 'PENDING'),
    [invitations],
  );

  const handleInvitationResponse = async (
    caseId: string,
    action: 'ACCEPT' | 'DECLINE',
  ) => {
    try {
      setIsResponding(caseId);
      await legalWorkflowService.respondToInvitation(caseId, action);
      const updatedInvitations = await legalWorkflowService.getMyInvitations();
      setInvitations(updatedInvitations);
      if (!user?.id) return;
      const response = await api.get(`/cases/professional/${user.id}`);
      const rawData = response.data?.data ?? response.data ?? [];
      const caseItems = (rawData as ProfessionalCase[]).filter(
        isSurvivorLinkedCase,
      );
      const updatedDashboard = {
        stats: {
          activeCases: caseItems.filter((x) => x.status === 'ACTIVE').length,
          completedCases: caseItems.filter((x) => x.status === 'COMPLETED').length,
          urgentCases: caseItems.filter((x) => ['HIGH', 'CRITICAL'].includes(x.priority))
            .length,
          combinedCases: caseItems.filter((x) => x.caseType === 'COMBINED_SUPPORT').length,
        },
        recentCases: caseItems.slice(0, 8).map((x) => ({
          id: x.id,
          title: x.report?.title || 'Untitled Case',
          caseType: x.caseType,
          priority: x.priority,
          status: x.status,
          patientName:
            `${x.report?.reporter?.firstName || ''} ${x.report?.reporter?.lastName || ''}`.trim() ||
            x.report?.reporter?.email ||
            'Unknown survivor',
          updatedAt: x.updatedAt,
        })),
        upcomingEvents: caseItems
          .filter((x) => x.dueDate)
          .slice(0, 8)
          .map((x) => ({
            id: x.id,
            title: x.report?.title || 'Untitled Case',
            date: x.dueDate || null,
            type: x.caseType,
            patientId: x.report?.id || null,
          })),
      };
      setData(updatedDashboard);
      toast.success(
        action === 'ACCEPT'
          ? 'Invitation accepted. Case is now in your queue.'
          : 'Invitation declined. Admin can reassign this case.',
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update invitation');
    } finally {
      setIsResponding(null);
    }
  };

  const stats = useMemo(
    () =>
      data?.stats || {
        activeCases: 0,
        completedCases: 0,
        urgentCases: 0,
        combinedCases: 0,
      },
    [data],
  );

  const getPriorityBadgeStyle = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--role-legal-bg)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--colors-heading-text)]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-[var(--colors-primary-cta)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--colors-heading-text)] mb-2">Failed to Load Dashboard</h2>
            <p className="text-[var(--colors-body-text)] mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[var(--role-legal-bg)] hover:bg-[var(--colors-olive-9)]"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--role-legal-bg)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--colors-heading-text)]">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-legal-bg)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--colors-primary-cta)]/10 to-[var(--colors-accent-highlight)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Professional Header - Centered like Counselor */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-legal-bg)] to-[var(--colors-primary-cta)] p-3 shadow-lg">
              <Gavel className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-legal-bg)] to-[var(--colors-primary-cta)] bg-clip-text text-4xl font-bold text-transparent">
                Welcome back, {userName}
              </h1>
              <p className="font-medium text-[var(--colors-body-text)]">
                Your legal command center
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
          <Card className="border-0 bg-gradient-to-r from-[var(--role-legal-bg)] to-[var(--role-legal-bg)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.activeCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--colors-primary-cta)] to-[var(--colors-primary-cta)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Urgent Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.urgentCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--colors-olive-5)] to-[var(--colors-olive-5)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.completedCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--colors-accent-highlight)] to-[var(--colors-accent-highlight)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Combined</p>
                  <p className="text-3xl font-bold text-white">{stats.combinedCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-[var(--colors-heading-text)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link to="/legal/cases">
              <Card className="group border-0 bg-[var(--color-card)]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--role-legal-bg)] to-[var(--colors-olive-6)] p-4 transition-transform duration-300 group-hover:scale-110">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--colors-heading-text)]">Cases</h3>
                  <p className="mt-1 text-xs text-[var(--colors-body-text)]">
                    {stats.activeCases} active
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/legal/consultations">
              <Card className="group border-0 bg-[var(--color-card)]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--colors-olive-5)] to-[var(--colors-olive-6)] p-4 transition-transform duration-300 group-hover:scale-110">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--colors-heading-text)]">Consultations</h3>
                  <p className="mt-1 text-xs text-[var(--colors-body-text)]">
                    View appointments
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/legal/court-calendar">
              <Card className="group border-0 bg-[var(--color-card)]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--colors-primary-cta)] to-[var(--colors-terracotta-6)] p-4 transition-transform duration-300 group-hover:scale-110">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--colors-heading-text)]">Calendar</h3>
                  <p className="mt-1 text-xs text-[var(--colors-body-text)]">
                    Court dates
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/legal/documents">
              <Card className="group border-0 bg-[var(--color-card)]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--colors-accent-highlight)] to-[var(--colors-golden-6)] p-4 transition-transform duration-300 group-hover:scale-110">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--colors-heading-text)]">Documents</h3>
                  <p className="mt-1 text-xs text-[var(--colors-body-text)]">
                    Evidence & files
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-0 bg-[var(--color-card)]/80 shadow-xl backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-[var(--border-border-secondary)] bg-gradient-to-r from-[var(--colors-primary-cta)]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--colors-primary-cta)]/20 p-2">
                    <Shield className="h-5 w-5 text-[var(--colors-primary-cta)]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[var(--colors-heading-text)]">
                    Pending Invitations ({pendingInvitations.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {pendingInvitations.map((invite, idx) => (
                    <motion.div
                      key={invite.caseId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col gap-3 rounded-xl border border-[var(--border-border-secondary)] p-4 bg-[var(--color-card)] md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[var(--surface-surface-secondary)] p-2">
                          <Gavel className="h-5 w-5 text-[var(--colors-body-text)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--colors-heading-text)]">{invite.reportTitle}</p>
                          <p className="text-sm text-[var(--colors-body-text)]">
                            {invite.caseType} | Severity: {invite.reportSeverity}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleInvitationResponse(invite.caseId, 'ACCEPT')}
                          disabled={isResponding === invite.caseId}
                          className="bg-[var(--role-legal-bg)] hover:bg-[var(--colors-olive-9)]"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvitationResponse(invite.caseId, 'DECLINE')}
                          disabled={isResponding === invite.caseId}
                          className="border-[var(--border-border-secondary)] text-[var(--colors-heading-text)] hover:bg-[var(--surface-surface-secondary)]"
                        >
                          Decline
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Cases */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm h-full">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <BookOpen className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-[#414435]">
                        Recent Legal Cases
                      </CardTitle>
                      <p className="text-sm text-[#6B705C]">
                        ML-assigned legal cases requiring attention
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/legal/cases')}
                    className="rounded-xl"
                  >
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!isLoading && (data?.recentCases || []).length === 0 ? (
                  <div className="py-8 text-center text-[#6B705C]">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No assigned legal cases yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data?.recentCases || []).map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group rounded-xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/80 border border-slate-100"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#414435] truncate group-hover:text-[#6B705C] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-[#6B705C] mt-1">{item.patientName}</p>
                            <p className="text-xs text-[#6B705C]/70 mt-1">
                              {item.caseType} • {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`${getPriorityBadgeStyle(item.priority)} px-2 py-1 text-xs`}>
                              {item.priority || 'N/A'}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
                              {item.status?.replace(/_/g, ' ') || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm h-full">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-100 p-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-[#414435]">
                        Upcoming Deadlines
                      </CardTitle>
                      <p className="text-sm text-[#6B705C]">
                        Court dates and case deadlines
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/legal/court-calendar')}
                    className="rounded-xl"
                  >
                    Calendar
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!isLoading && (data?.upcomingEvents || []).length === 0 ? (
                  <div className="py-8 text-center text-[#6B705C]">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No upcoming legal deadlines.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data?.upcomingEvents || []).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 rounded-xl bg-amber-50/50 p-4 border border-amber-100"
                      >
                        <div className="rounded-lg bg-amber-100 p-2 shrink-0">
                          <Calendar className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#414435] truncate">{event.title}</h4>
                          <p className="text-sm text-[#6B705C] mt-1">
                            {event.date ? new Date(event.date).toLocaleString() : 'Date not set'}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">{event.type}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
