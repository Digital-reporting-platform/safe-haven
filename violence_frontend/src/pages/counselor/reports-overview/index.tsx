import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  HeadphonesIcon,
  ArrowRight,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalCases: number;
  pendingReview: number;
  assigned: number;
  resolved: number;
  avgResolutionTime: number;
  casesByCategory: Record<string, number>;
  casesBySeverity: Record<string, number>;
  monthlyTrend: Array<{ date: string; count: number }>;
  resolutionRate: number;
}

function ReportsOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCases: 0,
    pendingReview: 0,
    assigned: 0,
    resolved: 0,
    avgResolutionTime: 0,
    casesByCategory: {},
    casesBySeverity: {},
    monthlyTrend: [],
    resolutionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch case management analytics
      const caseResponse = await api.get(`/analytics/cases?days=${days}`);
      const caseData = caseResponse.data;

      // Fetch incident analytics for additional data
      const incidentResponse = await api.get(`/analytics/incidents?days=${days}`);
      const incidentData = incidentResponse.data;

      // Process cases by status
      const casesByStatus = caseData.casesByStatus || {};
      const pendingReview = casesByStatus['ON_HOLD'] || 0;
      const assigned = (casesByStatus['ACTIVE'] || 0);
      const resolved = (casesByStatus['COMPLETED'] || 0);

      // Process cases by type (category)
      const casesByType = caseData.casesByType || {};
      const casesByCategory: Record<string, number> = {};
      Object.entries(casesByType).forEach(([type, count]) => {
        const formattedType = type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        casesByCategory[formattedType] = count as number;
      });

      // Process cases by priority (severity)
      const casesByPriority = caseData.casesByPriority || {};
      const casesBySeverity: Record<string, number> = {};
      Object.entries(casesByPriority).forEach(([priority, count]) => {
        casesBySeverity[priority] = count as number;
      });

      // Process daily trend from incident data
      const dailyTrend = incidentData.dailyTrend || {};
      const monthlyTrend = Object.entries(dailyTrend)
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setAnalytics({
        totalCases: caseData.summary?.totalCases || 0,
        pendingReview,
        assigned,
        resolved,
        avgResolutionTime: caseData.summary?.averageTimeToComplete || 0,
        casesByCategory,
        casesBySeverity,
        monthlyTrend,
        resolutionRate: caseData.summary?.completionRate || 0,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch analytics';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
      console.error('Failed to fetch analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--role-counselor-bg)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-counselor-primary)]/20 to-[var(--role-counselor-accent)]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-counselor-text)]/20 to-[var(--role-counselor-secondary)]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] p-3 shadow-lg">
                <HeadphonesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-primary)] bg-clip-text text-4xl font-bold text-transparent">
                  Reports Overview
                </h1>
                <p className="font-medium text-[var(--role-counselor-text)]">
                  Analytics and insights on case management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={days === 7 ? 'default' : 'outline'}
                size="sm"
                className={days === 7 ? 'bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] border-0' : ''}
                onClick={() => setDays(7)}
              >
                7 Days
              </Button>
              <Button
                variant={days === 30 ? 'default' : 'outline'}
                size="sm"
                className={days === 30 ? 'bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] border-0' : ''}
                onClick={() => setDays(30)}
              >
                30 Days
              </Button>
              <Button
                variant={days === 90 ? 'default' : 'outline'}
                size="sm"
                className={days === 90 ? 'bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] border-0' : ''}
                onClick={() => setDays(90)}
              >
                90 Days
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-4"
        >
          <Card className="border-0 bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-text)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Cases</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : analytics.totalCases}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : analytics.pendingReview}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-primary)]/80 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Assigned</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : analytics.assigned}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : analytics.resolved}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Cases by Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-primary)]/20 p-2">
                    <BarChart3 className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                  </div>
                  Cases by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analytics.casesByCategory).map(([category, count], idx) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-[var(--role-counselor-text)]">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 rounded-full bg-[var(--role-counselor-secondary)]/30">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)]"
                              style={{
                                width: `${(count / analytics.totalCases) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-right text-sm font-semibold text-[var(--role-counselor-text)]">
                            {count}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Cases by Severity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-accent)]/20 p-2">
                    <AlertTriangle className="h-5 w-5 text-[var(--role-counselor-accent)]" />
                  </div>
                  Cases by Severity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analytics.casesBySeverity).map(([severity, count], idx) => {
                      const colors: Record<string, string> = {
                        CRITICAL: 'bg-red-500',
                        HIGH: 'bg-orange-500',
                        MEDIUM: 'bg-yellow-500',
                        LOW: 'bg-blue-500',
                      };
                      return (
                        <motion.div
                          key={severity}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between"
                        >
                          <Badge
                            className={`${colors[severity]} text-white border-0`}
                          >
                            {severity}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-32 rounded-full bg-[var(--role-counselor-secondary)]/30">
                              <div
                                className={`h-2 rounded-full ${colors[severity]}`}
                                style={{
                                  width: `${(count / analytics.totalCases) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="w-8 text-right text-sm font-semibold text-[var(--role-counselor-text)]">
                              {count}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-accent)]/20 p-2">
                    <TrendingUp className="h-5 w-5 text-[var(--role-counselor-accent)]" />
                  </div>
                  Daily Case Trend (Last {days} Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading...</div>
                ) : analytics.monthlyTrend.length === 0 ? (
                  <div className="py-8 text-center text-[var(--role-counselor-text)]/60">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8 text-[var(--role-counselor-text)]/40" />
                    No trend data available
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-2">
                    {analytics.monthlyTrend.slice(-30).map((item, idx) => {
                      const maxCount = Math.max(...analytics.monthlyTrend.map((t) => t.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                      const date = new Date(item.date);
                      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      
                      return (
                        <motion.div
                          key={item.date}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] transition-all hover:from-[var(--role-counselor-primary)]/80 hover:to-[var(--role-counselor-accent)]/80"
                            style={{ height: `${height}px`, minHeight: item.count > 0 ? '10px' : '0' }}
                            title={`${label}: ${item.count} cases`}
                          ></div>
                          {analytics.monthlyTrend.length <= 15 && (
                            <>
                              <span className="mt-2 text-[10px] font-medium text-[var(--role-counselor-text)]">
                                {label}
                              </span>
                              <span className="text-[10px] text-[var(--role-counselor-text)]/60">{item.count}</span>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-primary)]/20 p-2">
                    <Calendar className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                  </div>
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold text-[var(--role-counselor-primary)]">
                      {isLoading ? '...' : `${analytics.avgResolutionTime} days`}
                    </p>
                    <p className="mt-1 text-sm text-[var(--role-counselor-text)]/70">Avg Resolution Time</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold text-emerald-500">
                      {isLoading ? '...' : `${Math.round(analytics.resolutionRate)}%`}
                    </p>
                    <p className="mt-1 text-sm text-[var(--role-counselor-text)]/70">Completion Rate</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold text-[var(--role-counselor-accent)]">
                      {isLoading
                        ? '...'
                        : analytics.totalCases > 0
                          ? `${Math.round((analytics.pendingReview / analytics.totalCases) * 100)}%`
                          : '0%'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--role-counselor-text)]/70">Pending Review</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReportsOverviewPage;
