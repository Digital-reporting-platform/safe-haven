import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  MessageCircle,
  Loader2,
  Shield,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

type DashboardAnalytics = {
  summary: {
    totalReports: number;
    criticalCases: number;
    resolutionRate: number;
    flaggedReports: number;
    activeProfessionals: number;
    averageResponseTime: number;
  };
  reportsByStatus: Record<string, number>;
};

type IncidentAnalytics = {
  dailyTrend: Record<string, number>;
};

type CaseAnalytics = {
  summary?: {
    totalCases?: number;
    completedCases?: number;
    completionRate?: number;
  };
};

type AdminUser = {
  id: string;
  createdAt: string;
};

export function AdminPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [incidents, setIncidents] = useState<IncidentAnalytics | null>(null);
  const [caseAnalytics, setCaseAnalytics] = useState<CaseAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboardRes, incidentsRes, casesRes, usersRes] = await Promise.all([
          api.get('/analytics/dashboard?days=210'),
          api.get('/analytics/incidents?days=210'),
          api.get('/analytics/cases?days=210'),
          api.get('/auth/users'),
        ]);

        setDashboard(dashboardRes.data);
        setIncidents(incidentsRes.data);
        setCaseAnalytics(casesRes.data);
        setUsers(usersRes.data || []);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const reportStats = useMemo(() => {
    const now = new Date();
    const monthKeys: string[] = [];
    const monthMap: Record<string, { month: string; reports: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
      monthMap[key] = {
        month: d.toLocaleString(undefined, { month: 'short' }),
        reports: 0,
      };
    }

    Object.entries(incidents?.dailyTrend || {}).forEach(([date, count]) => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].reports += count;
    });

    return monthKeys.map((key) => monthMap[key]);
  }, [incidents?.dailyTrend]);

  const userGrowth = useMemo(() => {
    const now = new Date();
    const monthKeys: string[] = [];
    const monthMap: Record<string, { month: string; users: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
      monthMap[key] = {
        month: d.toLocaleString(undefined, { month: 'short' }),
        users: 0,
      };
    }

    users.forEach((user) => {
      const d = new Date(user.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].users += 1;
    });

    return monthKeys.map((key) => monthMap[key]);
  }, [users]);

  const totalCases = caseAnalytics?.summary?.totalCases || 0;
  const resolvedCases = caseAnalytics?.summary?.completedCases || 0;
  const pendingReviews =
    (dashboard?.reportsByStatus?.PENDING_REVIEW || 0) +
    (dashboard?.reportsByStatus?.UNDER_INVESTIGATION || 0);
  const resolutionRate = dashboard?.summary?.resolutionRate || 0;

  if (isLoading) {
    return (
      <div className="admin-theme-bg min-h-screen">
        <div className="container mx-auto flex items-center justify-center px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B705C]"
               style={{ boxShadow: '0 10px 25px -5px rgba(107, 112, 92, 0.35)' }}>
            <Shield className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">Admin Dashboard</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Manage cases, moderate content, and monitor platform analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#F5F4F0] text-[#5D624F]">
            System Active
          </Badge>
          <Badge variant="secondary" className="bg-[#FEFAF5] text-[#AD7D4A]">
            All Services Operational
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">System Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-l-4 border-l-[#6B705C] shadow-sm">
            <CardContent className="bg-[#F5F4F0] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">Total Cases</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{totalCases}</h2>
                  <p className="mt-1 text-xs font-medium text-[#5D624F]">
                    {dashboard?.summary?.totalReports || 0} reports tracked
                  </p>
                </div>
                <div className="rounded-lg bg-[#E8E7E0] p-2.5">
                  <FileText className="h-6 w-6 text-[#6B705C]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#DDA15E] shadow-sm">
            <CardContent className="bg-[#FEFAF5] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#AD7D4A]">Active Users</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{users.length}</h2>
                  <p className="mt-1 text-xs font-medium text-[#C58F54]">
                    {dashboard?.summary?.activeProfessionals || 0} professionals
                  </p>
                </div>
                <div className="rounded-lg bg-[#F7E8D1] p-2.5">
                  <Users className="h-6 w-6 text-[#AD7D4A]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#C15B3E] shadow-sm">
            <CardContent className="bg-[#FEF5F2] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#A54B34]">Pending Reviews</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#C15B3E]">{pendingReviews}</h2>
                  <p className="mt-1 text-xs font-medium text-[#A54B34]">
                    Requires attention
                  </p>
                </div>
                <div className="rounded-lg bg-[#F8D4C7] p-2.5">
                  <Clock className="h-6 w-6 text-[#C15B3E]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#5D624F] shadow-sm">
            <CardContent className="bg-[#F5F4F0] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">Resolved Cases</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{resolvedCases}</h2>
                  <p className="mt-1 text-xs font-medium text-[#5D624F]">
                    {Math.round(resolutionRate)}% resolution rate
                  </p>
                </div>
                <div className="rounded-lg bg-[#E8E7E0] p-2.5">
                  <CheckCircle className="h-6 w-6 text-[#5D624F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Analytics Overview</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                  <BarChart3 className="h-4 w-4 text-[#6B705C]" />
                </div>
                Monthly Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reportStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E0" />
                  <XAxis dataKey="month" stroke="#6B705C" fontSize={12} />
                  <YAxis stroke="#6B705C" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#6B705C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7E8D1] p-1.5">
                  <TrendingUp className="h-4 w-4 text-[#AD7D4A]" />
                </div>
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E0" />
                  <XAxis dataKey="month" stroke="#6B705C" fontSize={12} />
                  <YAxis stroke="#6B705C" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#DDA15E"
                    strokeWidth={2}
                    dot={{ fill: '#DDA15E', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Quick Access</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border-l-4 border-l-[#6B705C] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#F5F4F0] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#E8E7E0] p-2">
                    <Users className="h-5 w-5 text-[#6B705C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">User Management</h3>
                    <p className="mt-1 text-xs text-[#6B705C]">
                      Manage accounts, roles, and permissions
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('user-management')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#E8E7E0] hover:text-[#6B705C]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#C15B3E] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#FEF5F2] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#F8D4C7] p-2">
                    <AlertTriangle className="h-5 w-5 text-[#C15B3E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">Incident Oversight</h3>
                    <p className="mt-1 text-xs text-[#A54B34]">
                      Monitor and respond to incidents
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('incident-oversight')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#F8D4C7] hover:text-[#C15B3E]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#5D624F] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#F5F4F0] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#E8E7E0] p-2">
                    <FileText className="h-5 w-5 text-[#5D624F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">Case Management</h3>
                    <p className="mt-1 text-xs text-[#6B705C]">
                      Handle assignments and workflows
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('case-management')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#E8E7E0] hover:text-[#5D624F]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#DDA15E] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#FEFAF5] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#F7E8D1] p-2">
                    <CheckCircle className="h-5 w-5 text-[#AD7D4A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">Provider Verification</h3>
                    <p className="mt-1 text-xs text-[#AD7D4A]">
                      Verify service providers
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('provider-verification')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#F7E8D1] hover:text-[#AD7D4A]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#414435] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#F5F4F0] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#E8E7E0] p-2">
                    <TrendingUp className="h-5 w-5 text-[#414435]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">Analytics</h3>
                    <p className="mt-1 text-xs text-[#6B705C]">
                      Reports, statistics, insights
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('analytics')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#E8E7E0] hover:text-[#414435]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-[#CCC9BC] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="bg-[#FDFDF5] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#F5F4F0] p-2">
                    <MessageCircle className="h-5 w-5 text-[#6B705C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A4D42]">System Settings</h3>
                    <p className="mt-1 text-xs text-[#6B705C]">
                      Configure preferences
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('system-settings')}
                  className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-[#F5F4F0] hover:text-[#6B705C]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
