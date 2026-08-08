import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

type GeneratedReport = {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedDate: string;
  status: 'Completed' | 'Processing' | 'Failed';
  data?: any;
};

export function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get('/analytics/report/history?limit=30');
        const history = response.data || [];
        const mapped: GeneratedReport[] = history.map((item: any) => ({
          id: item.id,
          name: 'Compliance Report',
          type: 'Compliance',
          dateRange: 'History',
          generatedDate: item.generatedAt || new Date().toISOString(),
          status: 'Completed',
          data: item,
        }));
        setReports(mapped);
      } catch {
        // History is optional; generation still works even if history fetch fails.
      }
    };

    loadHistory();
  }, []);

  const dateRangeLabelMap: Record<string, string> = {
    'last-week': 'Last Week',
    'last-month': 'Last Month',
    'last-quarter': 'Last Quarter',
    'last-year': 'Last Year',
    custom: 'Custom Range',
  };

  const reportTypeLabelMap: Record<string, string> = {
    'user-activity': 'User Activity',
    incidents: 'Incidents',
    performance: 'System Performance',
    security: 'Security Audit',
    compliance: 'Compliance',
  };

  const daysForRange = (range: string) => {
    switch (range) {
      case 'last-week':
        return 7;
      case 'last-month':
        return 30;
      case 'last-quarter':
        return 90;
      case 'last-year':
        return 365;
      default:
        return 30;
    }
  };

  const buildReportData = async (type: string, days: number) => {
    switch (type) {
      case 'user-activity': {
        const usersRes = await api.get('/auth/users');
        const users = usersRes.data || [];
        const byRole = users.reduce((acc: Record<string, number>, user: any) => {
          const role = user.role || 'UNKNOWN';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});
        return {
          generatedAt: new Date().toISOString(),
          periodDays: days,
          totalUsers: users.length,
          usersByRole: byRole,
          latestUsers: users.slice(0, 20),
        };
      }
      case 'incidents': {
        const [incidentsRes, dashboardRes] = await Promise.all([
          api.get(`/analytics/incidents?days=${days}`),
          api.get(`/analytics/dashboard?days=${days}`),
        ]);
        return {
          generatedAt: new Date().toISOString(),
          periodDays: days,
          incidents: incidentsRes.data,
          dashboardSummary: dashboardRes.data?.summary || {},
        };
      }
      case 'performance': {
        const [dashboardRes, casesRes] = await Promise.all([
          api.get(`/analytics/dashboard?days=${days}`),
          api.get(`/analytics/cases?days=${days}`),
        ]);
        return {
          generatedAt: new Date().toISOString(),
          periodDays: days,
          dashboard: dashboardRes.data,
          casePerformance: casesRes.data,
        };
      }
      case 'security': {
        const [highRiskRes, incidentsRes] = await Promise.all([
          api.get('/analytics/high-risk'),
          api.get(`/analytics/incidents?days=${days}`),
        ]);
        return {
          generatedAt: new Date().toISOString(),
          periodDays: days,
          highRisk: highRiskRes.data,
          incidentsRisk: incidentsRes.data?.riskDistribution || {},
        };
      }
      case 'compliance': {
        const complianceRes = await api.get(`/analytics/report/anonymized?days=${days}`);
        return {
          generatedAt: new Date().toISOString(),
          periodDays: days,
          complianceSnapshot: complianceRes.data,
        };
      }
      default:
        throw new Error('Unsupported report type');
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType || !dateRange) {
      toast.error('Please select report type and date range.');
      return;
    }

    const now = new Date();
    const reportId = crypto.randomUUID();
    const typeLabel = reportTypeLabelMap[reportType] || reportType;
    const rangeLabel = dateRangeLabelMap[dateRange] || dateRange;

    const processingItem: GeneratedReport = {
      id: reportId,
      name: `${typeLabel} Report`,
      type: typeLabel,
      dateRange: rangeLabel,
      generatedDate: now.toISOString(),
      status: 'Processing',
    };

    setReports((prev) => [processingItem, ...prev]);
    setIsGenerating(true);

    try {
      const days = daysForRange(dateRange);
      const data = await buildReportData(reportType, days);

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, status: 'Completed', data }
            : report,
        ),
      );
      toast.success('Report generated successfully');
    } catch (error: any) {
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: 'Failed' } : report,
        ),
      );
      toast.error(error?.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || !report.data) {
      toast.error('Report data is not ready for download');
      return;
    }

    const content = JSON.stringify(report.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeType = report.type.toLowerCase().replace(/\s+/g, '-');
    const safeRange = report.dateRange.toLowerCase().replace(/\s+/g, '-');
    a.href = url;
    a.download = `${safeType}-${safeRange}-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and download detailed reports for analysis and compliance.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-activity">User Activity</SelectItem>
                  <SelectItem value="incidents">Incidents</SelectItem>
                  <SelectItem value="performance">
                    System Performance
                  </SelectItem>
                  <SelectItem value="security">Security Audit</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateReport} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Weekly User Activity</p>
                  <p className="text-muted-foreground text-sm">Every Monday</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Monthly Incident Summary</p>
                  <p className="text-muted-foreground text-sm">
                    1st of each month
                  </p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Quarterly Compliance Report</p>
                  <p className="text-muted-foreground text-sm">
                    End of quarter
                  </p>
                </div>
                <Badge variant="secondary">Inactive</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-slate-500">
                    No generated reports yet.
                  </TableCell>
                </TableRow>
              )}
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.dateRange}</TableCell>
                  <TableCell>{new Date(report.generatedDate).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === 'Completed'
                          ? 'default'
                          : report.status === 'Processing'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {report.status === 'Completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
