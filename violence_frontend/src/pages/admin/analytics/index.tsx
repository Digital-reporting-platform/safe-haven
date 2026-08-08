import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart3,
  FileText,
  TrendingUp,
  Eye,
  Activity,
  Users,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import { api } from '@/services/api/client';

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

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/analytics/dashboard?days=30');
      setDashboard(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load analytics dashboard';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const analyticsStats = [
    {
      title: 'Total Reports',
      value: dashboard?.summary?.totalReports?.toLocaleString() ?? '-',
      icon: FileText,
      color: 'text-[#6B705C]',
      borderColor: 'border-l-[#6B705C]',
      bgColor: 'bg-[#F5F4F0]',
      iconBg: 'bg-[#E8E7E0]',
    },
    {
      title: 'Active Professionals',
      value: dashboard?.summary?.activeProfessionals?.toLocaleString() ?? '-',
      icon: Users,
      color: 'text-[#AD7D4A]',
      borderColor: 'border-l-[#DDA15E]',
      bgColor: 'bg-[#FEFAF5]',
      iconBg: 'bg-[#F7E8D1]',
    },
    {
      title: 'Critical Cases',
      value: dashboard?.summary?.criticalCases?.toLocaleString() ?? '-',
      icon: AlertTriangle,
      color: 'text-[#C15B3E]',
      borderColor: 'border-l-[#C15B3E]',
      bgColor: 'bg-[#FEF5F2]',
      iconBg: 'bg-[#F8D4C7]',
    },
    {
      title: 'Resolution Rate',
      value: dashboard?.summary?.resolutionRate
        ? `${Math.round(dashboard.summary.resolutionRate)}%`
        : '-',
      icon: Activity,
      color: 'text-[#5D624F]',
      borderColor: 'border-l-[#5D624F]',
      bgColor: 'bg-[#F5F4F0]',
      iconBg: 'bg-[#E8E7E0]',
    },
  ];

  const analyticsSections = [
    {
      title: 'Reports',
      description: 'Generate and download detailed reports for analysis and compliance',
      path: 'reports',
      icon: FileText,
      color: 'text-[#6B705C]',
      borderColor: 'border-l-[#6B705C]',
      bgColor: 'bg-[#F5F4F0]',
      features: ['Custom reports', 'Scheduled exports', 'Historical data'],
    },
    {
      title: 'Statistics',
      description: 'View comprehensive statistical data and visualizations',
      path: 'statistics',
      icon: BarChart3,
      color: 'text-[#AD7D4A]',
      borderColor: 'border-l-[#DDA15E]',
      bgColor: 'bg-[#FEFAF5]',
      features: ['Interactive charts', 'Trend analysis', 'Performance metrics'],
    },
    {
      title: 'Insights',
      description: 'Discover key insights and trends from platform data',
      path: 'insights',
      icon: Eye,
      color: 'text-[#C15B3E]',
      borderColor: 'border-l-[#C15B3E]',
      bgColor: 'bg-[#FEF5F2]',
      features: ['AI-powered insights', 'Automated alerts', 'Predictive analytics'],
    },
  ];

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B705C]"
               style={{ boxShadow: '0 10px 25px -5px rgba(107, 112, 92, 0.35)' }}>
            <PieChart className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">Analytics</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Comprehensive analytics and reporting tools for data-driven decision making
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadDashboard}
          disabled={isLoading}
          className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035]"
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Statistics */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Analytics Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {analyticsStats.map((stat, index) => (
            <Card key={index} className={`overflow-hidden border-l-4 ${stat.borderColor} shadow-sm`}>
              <CardContent className={`${stat.bgColor} pt-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">{stat.title}</p>
                    <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{stat.value}</h2>
                  </div>
                  <div className={`rounded-lg ${stat.iconBg} p-2.5`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Sections */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Analytics Sections</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {analyticsSections.map((section, index) => (
            <Card
              key={index}
              className={`overflow-hidden border-l-4 ${section.borderColor} shadow-sm transition-shadow hover:shadow-md cursor-pointer`}
              onClick={() => navigate(section.path)}
            >
              <CardContent className={`${section.bgColor} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/60 p-2">
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A4D42]">{section.title}</h3>
                      <p className="mt-1 text-xs text-[#6B705C] leading-relaxed">
                        {section.description}
                      </p>
                      <div className="mt-3">
                        <ul className="space-y-1">
                          {section.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-[#6B705C]">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#AD7D4A]"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-white/60 hover:text-[#6B705C]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Quick Actions</h2>
        <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
          <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
              <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                <TrendingUp className="h-4 w-4 text-[#6B705C]" />
              </div>
              Common Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button
                variant="outline"
                onClick={() => navigate('reports')}
                className="flex h-auto flex-col items-center gap-2 p-4 border-[#DAD8CE] bg-[#F5F4F0] hover:bg-[#E8E7E0] hover:text-[#4A4D42]"
              >
                <div className="rounded-full bg-[#E8E7E0] p-2">
                  <FileText className="h-5 w-5 text-[#6B705C]" />
                </div>
                <span className="text-sm font-medium text-[#4A4D42]">Generate Report</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('statistics')}
                className="flex h-auto flex-col items-center gap-2 p-4 border-[#DAD8CE] bg-[#F5F4F0] hover:bg-[#E8E7E0] hover:text-[#4A4D42]"
              >
                <div className="rounded-full bg-[#F7E8D1] p-2">
                  <BarChart3 className="h-5 w-5 text-[#AD7D4A]" />
                </div>
                <span className="text-sm font-medium text-[#4A4D42]">View Statistics</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('insights')}
                className="flex h-auto flex-col items-center gap-2 p-4 border-[#DAD8CE] bg-[#F5F4F0] hover:bg-[#E8E7E0] hover:text-[#4A4D42]"
              >
                <div className="rounded-full bg-[#F8D4C7] p-2">
                  <Eye className="h-5 w-5 text-[#C15B3E]" />
                </div>
                <span className="text-sm font-medium text-[#4A4D42]">Latest Insights</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
