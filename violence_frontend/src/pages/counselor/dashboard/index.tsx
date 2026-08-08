import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  MessageSquare,
  Bell,
  User,
  Activity,
  HeadphonesIcon,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

interface DashboardStats {
  totalCases: number;
  pendingReview: number;
  assignedCases: number;
  resolvedCases: number;
}

function CounselorDashboardPage() {
  const isDark = false;
  const [userName, setUserName] = useState('Counselor');
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    pendingReview: 0,
    assignedCases: 0,
    resolvedCases: 0,
  });
  const [recentCases, setRecentCases] = useState<CaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('sh_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || user.email?.split('@')[0] || 'Counselor');
      } catch {
        setUserName('Counselor');
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const pendingResponse = await counselorService.getUnassignedReports(1, 50);
        const pendingCases = pendingResponse.data || [];
        const assignedResponse = await counselorService.getPendingCases(1, 50, 'ACTIVE');
        const assignedCases = assignedResponse.data || [];
        const resolvedResponse = await counselorService.getPendingCases(1, 50, 'COMPLETED');
        const resolvedCases = resolvedResponse.data || [];

        setStats({
          totalCases: pendingCases.length + assignedCases.length + resolvedCases.length,
          pendingReview: pendingCases.length,
          assignedCases: assignedCases.length,
          resolvedCases: resolvedCases.length,
        });

        const combined = [...pendingCases, ...assignedCases].slice(0, 5);
        setRecentCases(combined);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--role-counselor-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--role-counselor-primary)]"></div>
          <p className="text-[var(--role-counselor-text)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[var(--color-surface)]' : 'bg-[var(--role-counselor-bg)]'}`}>
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-counselor-primary)]/20 to-[var(--role-counselor-accent)]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-counselor-text)]/20 to-[var(--role-counselor-secondary)]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] p-3 shadow-lg">
              <HeadphonesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-primary)] bg-clip-text text-4xl font-bold text-transparent">
                Welcome back, {userName}
              </h1>
              <p className="font-medium text-[var(--role-counselor-text)]">
                Your counseling command center
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-4"
        >
          <Card className="border-0 bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-primary)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.assignedCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--role-counselor-accent)] to-[var(--role-counselor-accent)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Pending Review</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingReview}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-text)]/80 shadow-xl">
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

          <Card className="border-0 bg-gradient-to-r from-emerald-500 to-emerald-500/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Resolved</p>
                  <p className="text-3xl font-bold text-white">{stats.resolvedCases}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
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
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-[var(--role-counselor-text)]">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link to="/counselor/cases">
              <Card className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--role-counselor-primary)] to-[var(--role-counselor-primary)]/80 p-4 transition-transform duration-300 group-hover:scale-110">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--role-counselor-text)]">Case Manager</h3>
                  <p className="mt-1 text-xs text-[var(--role-counselor-text)]/60">View all cases</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/counselor/messages">
              <Card className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--role-counselor-accent)] to-[var(--role-counselor-accent)]/80 p-4 transition-transform duration-300 group-hover:scale-110">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--role-counselor-text)]">Messages</h3>
                  <p className="mt-1 text-xs text-[var(--role-counselor-text)]/60">Chat with clients</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/counselor/notifications">
              <Card className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-4 transition-transform duration-300 group-hover:scale-110">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--role-counselor-text)]">Alerts</h3>
                  <p className="mt-1 text-xs text-[var(--role-counselor-text)]/60">Notifications</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/counselor/profile">
              <Card className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-[var(--role-counselor-secondary)] to-[var(--role-counselor-secondary)]/80 p-4 transition-transform duration-300 group-hover:scale-110">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--role-counselor-text)]">Profile</h3>
                  <p className="mt-1 text-xs text-[var(--role-counselor-text)]/60">Manage account</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Recent Cases */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[var(--color-surface)] p-2">
                      <Activity className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-[var(--role-counselor-text)]">Recent Cases</CardTitle>
                      <p className="text-sm text-[var(--role-counselor-text)]/60">Priority cases requiring attention</p>
                    </div>
                  </div>
                  <Link to="/counselor/cases">
                    <Button variant="outline" size="sm" className="rounded-xl">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentCases.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
                      <p className="text-sm text-[var(--color-text-muted)]">No cases found</p>
                    </div>
                  ) : (
                    recentCases.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group flex cursor-pointer items-center justify-between rounded-xl bg-[var(--role-counselor-secondary)]/30 p-4 transition-colors hover:bg-[var(--role-counselor-secondary)]/50"
                      >
                        <Link to="/counselor/cases" className="flex flex-1 items-center gap-4">
                          <div className="rounded-lg bg-white p-2 shadow-sm">
                            <Users className="h-5 w-5 text-[var(--color-text-secondary)]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--role-counselor-text)] group-hover:text-[var(--role-counselor-primary)]">
                              {item.report?.reporter?.firstName || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-[var(--role-counselor-text)]/70">{item.report?.category || 'General Case'}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge className="bg-amber-100 text-amber-700 px-2 py-1 text-xs">{item.priority}</Badge>
                              <span className="text-xs text-[var(--role-counselor-text)]/50">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                        <Link to="/counselor/cases">
                          <ArrowRight className="h-5 w-5 text-[var(--role-counselor-text)]/40 transition-colors group-hover:text-[var(--role-counselor-text)]" />
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--role-counselor-accent)]/20 p-2">
                    <Star className="h-5 w-5 text-[var(--role-counselor-accent)]" />
                  </div>
                  <span className="text-[var(--role-counselor-text)]">Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--role-counselor-text)]/70">Total Cases</span>
                  <span className="font-bold text-[var(--role-counselor-text)]">{stats.totalCases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--role-counselor-text)]/70">Pending Review</span>
                  <span className="font-bold text-[var(--role-counselor-text)]">{stats.pendingReview}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--role-counselor-text)]/70">Assigned</span>
                  <span className="font-bold text-[var(--role-counselor-accent)]">{stats.assignedCases}</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-[var(--role-counselor-secondary)]/30">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--role-counselor-accent)] to-[var(--role-counselor-accent)]/80"
                    style={{ width: `${stats.totalCases > 0 ? (stats.resolvedCases / stats.totalCases) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CounselorDashboardPage;
