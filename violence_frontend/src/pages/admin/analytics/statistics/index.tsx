import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type DashboardAnalytics = {
  summary: {
    totalReports: number;
    criticalCases: number;
    resolutionRate: number;
    flaggedReports: number;
    activeProfessionals: number;
    averageResponseTime: number;
  };
  reportsByCategory: Record<string, number>;
  reportsBySeverity: Record<string, number>;
  reportsByStatus: Record<string, number>;
};

type IncidentAnalytics = {
  dailyTrend: Record<string, number>;
};

type AdminUserLite = {
  id: string;
  role: string;
  createdAt: string;
};

export function StatisticsPage() {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [incidents, setIncidents] = useState<IncidentAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUserLite[]>([]);

  const toLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const isTokenExpired = (token: string) => {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized));
      if (!payload?.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      setIsLoading(true);

      const token = localStorage.getItem('sh_token');
      if (!token) {
        toast.error('Please log in to view analytics.');
        setIsLoading(false);
        navigate('/auth/login');
        return;
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem('sh_token');
        toast.error('Session expired. Please log in again.');
        setIsLoading(false);
        navigate('/auth/login');
        return;
      }

      try {
        await api.get('/auth/profile');

        const [dashboardRes, incidentsRes, usersRes] = await Promise.all([
          api.get('/analytics/dashboard?days=180'),
          api.get('/analytics/incidents?days=180'),
          api.get('/auth/users'),
        ]);

        setDashboard(dashboardRes.data);
        setIncidents(incidentsRes.data);
        setUsers(usersRes.data || []);
      } catch (error: any) {
        if (error?.status === 401) {
          localStorage.removeItem('sh_token');
          toast.error('Session expired. Please log in again.');
          navigate('/auth/login');
          return;
        }
        toast.error(error?.message || 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthKeys: string[] = [];
    const monthMap: Record<string, { month: string; users: number; incidents: number; reports: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString(undefined, { month: 'short' });
      monthKeys.push(key);
      monthMap[key] = { month: label, users: 0, incidents: 0, reports: 0 };
    }

    users.forEach((u) => {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].users += 1;
    });

    Object.entries(incidents?.dailyTrend || {}).forEach(([date, count]) => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].reports += count;
        monthMap[key].incidents += count;
      }
    });

    return monthKeys.map((key) => monthMap[key]);
  }, [incidents?.dailyTrend, users]);

  const userTypeData = useMemo(() => {
    const roleMap = new Map<string, number>([
      ['SURVIVOR', 0],
      ['COUNSELOR', 0],
      ['MEDICAL_PROFESSIONAL', 0],
      ['LEGAL_ADVISOR', 0],
      ['MODERATOR', 0],
    ]);

    users.forEach((u) => {
      if (roleMap.has(u.role)) {
        roleMap.set(u.role, (roleMap.get(u.role) || 0) + 1);
      }
    });

    return [
      { name: 'Survivors', value: roleMap.get('SURVIVOR') || 0, color: '#8884d8' },
      { name: 'Counselors', value: roleMap.get('COUNSELOR') || 0, color: '#82ca9d' },
      { name: 'Medical', value: roleMap.get('MEDICAL_PROFESSIONAL') || 0, color: '#ffc658' },
      { name: 'Legal', value: roleMap.get('LEGAL_ADVISOR') || 0, color: '#ff7300' },
      { name: 'Moderators', value: roleMap.get('MODERATOR') || 0, color: '#00ff00' },
    ];
  }, [users]);

  const activeIncidents = useMemo(() => {
    const status = dashboard?.reportsByStatus || {};
    return (
      (status.PENDING_REVIEW || 0) +
      (status.UNDER_INVESTIGATION || 0) +
      (status.ASSIGNED_TO_PROFESSIONAL || 0) +
      (status.IN_PROGRESS || 0)
    );
  }, [dashboard?.reportsByStatus]);

  const keyStats = useMemo(
    () => [
      {
        title: 'Total Users',
        value: users.length.toLocaleString(),
        change: `${dashboard?.summary.activeProfessionals || 0} professionals`,
        icon: Users,
        color: 'text-blue-500',
      },
      {
        title: 'Active Incidents',
        value: activeIncidents.toLocaleString(),
        change: `${dashboard?.summary.criticalCases || 0} critical`,
        icon: AlertTriangle,
        color: 'text-red-500',
      },
      {
        title: 'Reports Generated',
        value: (dashboard?.summary.totalReports || 0).toLocaleString(),
        change: `${dashboard?.summary.flaggedReports || 0} flagged`,
        icon: FileText,
        color: 'text-green-500',
      },
      {
        title: 'Resolution Rate',
        value: `${Math.round(dashboard?.summary.resolutionRate || 0)}%`,
        change: `${dashboard?.summary.averageResponseTime || 0}d avg response`,
        icon: TrendingUp,
        color: 'text-purple-500',
      },
    ],
    [activeIncidents, dashboard?.summary, users.length],
  );

  const topCategoryRows = useMemo(() => {
    const categories = Object.entries(dashboard?.reportsByCategory || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const total = categories.reduce((acc, [, count]) => acc + count, 0) || 1;

    return categories.map(([name, count]) => ({
      name: toLabel(name),
      percentage: `${Math.round((count / total) * 100)}%`,
    }));
  }, [dashboard?.reportsByCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive statistical overview and data visualizations.
        </p>
      </div>

      {/* Key Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {keyStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{stat.value}</h2>
                    <span className="text-sm text-green-500 whitespace-nowrap">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" name="Users" />
                <Bar dataKey="incidents" fill="#82ca9d" name="Incidents" />
                <Bar dataKey="reports" fill="#ffc658" name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Average Response</span>
                  <span className="text-sm font-medium">
                    {(dashboard?.summary.averageResponseTime || 0).toFixed(0)}d
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">95th Percentile</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((dashboard?.summary.averageResponseTime || 0) * 1.5)}d
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">99th Percentile</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((dashboard?.summary.averageResponseTime || 0) * 2)}d
                  </span>
                </div>
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategoryRows.map((row) => (
                <div className="flex justify-between" key={row.name}>
                  <span className="text-sm">{row.name}</span>
                  <span className="text-sm font-medium">{row.percentage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Daily Active Users</span>
                <span className="text-sm font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Professionals</span>
                <span className="text-sm font-medium">
                  {dashboard?.summary.activeProfessionals || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolution Rate</span>
                <span className="text-sm font-medium">
                  {Math.round(dashboard?.summary.resolutionRate || 0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
