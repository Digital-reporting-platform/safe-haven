import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Clock,
  Loader2,
} from 'lucide-react';
import { api } from '@/services/api/client';

type HighRiskData = {
  criticalCaseCount: number;
  reports: any[];
  recommendations: Array<{
    priority: string;
    action: string;
    targetGroup: string;
  }>;
};

type DashboardAnalytics = {
  summary: {
    totalReports: number;
    criticalCases: number;
    resolutionRate: number;
    flaggedReports: number;
    activeProfessionals: number;
    averageResponseTime: number;
  };
};

export function InsightsPage() {
  const [highRiskData, setHighRiskData] = useState<HighRiskData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [highRiskRes, dashboardRes] = await Promise.all([
        api.get('/analytics/high-risk'),
        api.get('/analytics/dashboard?days=30'),
      ]);
      setHighRiskData(highRiskRes.data);
      setDashboard(dashboardRes.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load insights data';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const insights = [
    {
      title: 'Critical Cases',
      value: highRiskData?.criticalCaseCount ?? 0,
      description: 'High-risk cases requiring immediate intervention',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Resolution Rate',
      value: `${Math.round(dashboard?.summary?.resolutionRate || 0)}%`,
      description: 'Cases resolved within the last 30 days',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Flagged Reports',
      value: dashboard?.summary?.flaggedReports ?? 0,
      description: 'Reports flagged for review or fraud detection',
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Avg Response Time',
      value: `${dashboard?.summary?.averageResponseTime ?? 0}d`,
      description: 'Average time to first response on cases',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground mt-2">
            Key insights and trends from platform data and intervention analytics.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{insight.title}</p>
                      <p className="text-2xl font-bold">{insight.value}</p>
                    </div>
                    <div className={`rounded-full p-2 ${insight.bgColor}`}>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {insight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Intervention Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highRiskData?.recommendations && highRiskData.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {highRiskData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                      <div className="flex-1">
                        <p className="font-medium">{rec.action}</p>
                        <p className="text-muted-foreground text-sm">
                          Target: {rec.targetGroup}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No intervention recommendations at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* High Risk Reports Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                High-Risk Cases Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Severity Cases</span>
                  <span className="text-sm font-medium">
                    {highRiskData?.reports?.filter((r) => r.severity === 'CRITICAL').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Risk Score (≥80)</span>
                  <span className="text-sm font-medium">
                    {highRiskData?.reports?.filter((r) => r.riskScore >= 80).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Flagged as Repetitive</span>
                  <span className="text-sm font-medium">
                    {highRiskData?.reports?.filter((r) => r.flaggedAsRepetitive).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Awaiting Assignment</span>
                  <span className="text-sm font-medium">
                    {highRiskData?.reports?.filter((r) => !r.caseAssignment).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
