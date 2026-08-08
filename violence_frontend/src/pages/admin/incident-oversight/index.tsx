import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  AlertCircle,
  Loader2,
  Shield,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api/client';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  isAnonymous: boolean;
  location: string | null;
  detectedRegion: string | null;
  detectedCity: string | null;
  detectedCountry?: string | null;
  locationMismatchWarning: boolean;
  locationMismatchConfirmed: boolean;
  contactEmail?: string | null;
  riskScore: number;
  flaggedAsRepetitive: boolean;
  createdAt: string;
  caseAssignment?: {
    id: string;
    caseType: string;
    status: string;
    notes?: string | null;
    assignedTo: {
      id: string;
      name: string;
      type: string;
    };
    supportProviders?: Array<{
      id: string;
      name: string;
      type: string;
    }>;
  };
}

interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  email?: string;
  city?: string;
  specializations: string[];
}

interface IncidentAnalytics {
  totalReports: number;
}

const ALL_TIME_DAYS = 36500;

export function IncidentOversightPage() {
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<IncidentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
    []
  );
  const [medicalSearch, setMedicalSearch] = useState('');
  const [legalSearch, setLegalSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningReport, setAssigningReport] = useState<Report | null>(null);
  const [selectedProfessionalType, setSelectedProfessionalType] = useState<
    'medical' | 'legal' | null
  >(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<ServiceProvider | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchServiceProviders = useCallback(async () => {
    try {
      const response = await api.get('/professionals?limit=100');
      setServiceProviders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch service providers:', error);
      toast.error('Failed to load service providers');
    }
  }, []);

  const fetchReports = useCallback(async () => {
    const limit = 100;
    let page = 1;
    let totalPages = 1;
    const allReports: Report[] = [];

    do {
      const response = await api.get(`/reports?page=${page}&limit=${limit}`);
      const data = response.data?.data || [];
      const pages = Number(response.data?.pagination?.pages || 1);

      allReports.push(...data);
      totalPages = Number.isFinite(pages) && pages > 0 ? pages : 1;
      page += 1;
    } while (page <= totalPages);

    setReports(allReports);
  }, []);

  const fetchIncidentAnalytics = useCallback(async () => {
    const response = await api.get(
      `/analytics/incidents?days=${ALL_TIME_DAYS}`
    );
    const payload = response.data?.data ?? response.data;
    setAnalytics(payload);
  }, []);

  const fetchOversightData = useCallback(async () => {
    setIsLoading(true);
    const [reportsResult, analyticsResult, providersResult] =
      await Promise.allSettled([
        fetchReports(),
        fetchIncidentAnalytics(),
        fetchServiceProviders(),
      ]);

    if (reportsResult.status === 'rejected') {
      console.error('Failed to fetch reports:', reportsResult.reason);
      const message =
        reportsResult.reason instanceof Error
          ? reportsResult.reason.message
          : 'Failed to load reports';
      toast.error(message);
    }

    if (analyticsResult.status === 'rejected') {
      console.error('Failed to fetch analytics:', analyticsResult.reason);
      const message =
        analyticsResult.reason instanceof Error
          ? analyticsResult.reason.message
          : 'Failed to load incident analytics';
      toast.error(message);
    }

    if (providersResult.status === 'rejected') {
      console.error(
        'Failed to fetch service providers:',
        providersResult.reason
      );
      const message =
        providersResult.reason instanceof Error
          ? providersResult.reason.message
          : 'Failed to load service providers';
      toast.error(message);
    }
    setIsLoading(false);
  }, [fetchIncidentAnalytics, fetchReports, fetchServiceProviders]);

  useEffect(() => {
    fetchOversightData();
  }, [fetchOversightData]);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      await api.put(`/reports/${reportId}`, { status: newStatus });
      toast.success('Report status updated');
      fetchOversightData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignReport = (report: Report) => {
    setAssigningReport(report);
    setShowAssignModal(true);
  };

  const handleViewIncident = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleAutoAssign = async (report: Report) => {
    try {
      // Get ML suggestions
      const response = await api.post(`/cases/auto-route/${report.id}`);
      const suggestions = response.data;
      
      const primaryProfessional = suggestions.suggestedProfessionals?.primary;
      if (!primaryProfessional) {
        toast.error('No available professionals found for this case');
        return;
      }

      const professionalName = primaryProfessional.name || 
        `${primaryProfessional.firstName || ''} ${primaryProfessional.lastName || ''}`.trim() ||
        'Professional';

      // Confirm with admin
      const confirmed = window.confirm(
        `ML suggests assigning to: ${professionalName}\n\n` +
        `Type: ${suggestions.suggestedCaseType}\n` +
        `Priority: ${suggestions.suggestedPriority}\n\n` +
        `Proceed with assignment?`
      );

      if (!confirmed) {
        toast.info('Assignment cancelled');
        return;
      }

      // Create actual assignment
      await api.post(`/cases/assign/${report.id}`, {
        assignedToId: primaryProfessional.id,
        caseType: suggestions.suggestedCaseType,
        priority: suggestions.suggestedPriority,
        notes: 'Auto-assigned by admin',
      });

      toast.success(`Report assigned to ${professionalName}`);
      fetchOversightData();
    } catch (error) {
      toast.error('Failed to auto-assign report');
    }
  };

  const handleAssignSubmit = async (assignedToId: string, caseType: string) => {
    if (!assigningReport) return;

    const priority =
      assigningReport.severity === 'CRITICAL' ||
      assigningReport.severity === 'HIGH'
        ? 'HIGH'
        : assigningReport.severity === 'LOW'
          ? 'LOW'
          : 'MEDIUM';

    try {
      await api.post(`/cases/assign/${assigningReport.id}`, {
        assignedToId,
        caseType,
        priority,
        notes: `Manually assigned from incident oversight (${assigningReport.severity}).`,
      });
      toast.success('Report assigned successfully');
      setShowAssignModal(false);
      setAssigningReport(null);
      await fetchOversightData();
    } catch (error) {
      toast.error('Failed to assign report');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-red-500">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="outline">Under Review</Badge>;
      case 'UNDER_INVESTIGATION':
        return <Badge className="bg-orange-500">Under Investigation</Badge>;
      case 'ASSIGNED_TO_PROFESSIONAL':
        return <Badge className="bg-indigo-500">Assigned</Badge>;
      case 'CLOSED':
        return <Badge className="bg-slate-600">Closed</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-600">Rejected</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-zinc-600">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      PHYSICAL_VIOLENCE: 'Physical Violence',
      SEXUAL_ASSAULT: 'Sexual Assault',
      EMOTIONAL_ABUSE: 'Emotional Abuse',
      PSYCHOLOGICAL_ABUSE: 'Psychological Abuse',
      NEGLECT: 'Neglect',
      CYBERBULLYING: 'Cyberbullying',
      HARASSMENT: 'Harassment',
      DISCRIMINATION: 'Discrimination',
      WORKPLACE_ABUSE: 'Workplace Abuse',
      DOMESTIC_VIOLENCE: 'Domestic Violence',
      CHILD_ABUSE: 'Child Abuse',
      ELDER_ABUSE: 'Elder Abuse',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'MEDICAL_PROFESSIONAL':
        return 'Medical';
      case 'LEGAL_ADVISOR':
        return 'Legal';
      case 'COUNSELOR':
        return 'Counselor';
      case 'NGO':
        return 'NGO';
      case 'COMMUNITY_CENTER':
        return 'Community Center';
      default:
        return type.replace(/_/g, ' ').toLowerCase();
    }
  };

  const getAssignedSupportProviders = (
    report: Report | null,
    providerType: 'MEDICAL_PROFESSIONAL' | 'LEGAL_ADVISOR'
  ) =>
    report?.caseAssignment?.supportProviders?.filter(
      (provider) => provider.type === providerType
    ) || [];

  const getInvitationStatuses = (report: Report | null) => {
    const rawNotes = report?.caseAssignment?.notes;
    if (!rawNotes) return {} as Record<string, 'PENDING' | 'ACCEPTED' | 'DECLINED'>;
    try {
      const parsed = JSON.parse(rawNotes) as {
        invitations?: Record<string, { status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' }>;
      };
      const entries = Object.entries(parsed.invitations || {});
      return Object.fromEntries(
        entries.map(([providerId, value]) => [
          providerId,
          value?.status === 'ACCEPTED' || value?.status === 'DECLINED'
            ? value.status
            : 'PENDING',
        ]),
      ) as Record<string, 'PENDING' | 'ACCEPTED' | 'DECLINED'>;
    } catch {
      return {} as Record<string, 'PENDING' | 'ACCEPTED' | 'DECLINED'>;
    }
  };

  const getProviderInvitationStatus = (report: Report | null, providerId: string) => {
    const statuses = getInvitationStatuses(report);
    return statuses[providerId] || 'PENDING';
  };

  const getAcceptedTeamCount = (report: Report | null) => {
    if (!report?.caseAssignment) return 0;
    const providers = [
      report.caseAssignment.assignedTo,
      ...(report.caseAssignment.supportProviders || []),
    ];
    return providers.filter(
      (provider, index, arr) =>
        arr.findIndex((item) => item.id === provider.id) === index &&
        getProviderInvitationStatus(report, provider.id) === 'ACCEPTED',
    ).length;
  };

  const getTeamSize = (report: Report | null) => {
    if (!report?.caseAssignment) return 0;
    const providers = [
      report.caseAssignment.assignedTo,
      ...(report.caseAssignment.supportProviders || []),
    ];
    return providers.filter(
      (provider, index, arr) =>
        arr.findIndex((item) => item.id === provider.id) === index,
    ).length;
  };

  const getLocationValidationView = (report: Report) => {
    const hasUserLocation = Boolean(
      report.location && report.location.trim().length > 0
    );
    const detectedRegion = (report.detectedRegion || '').trim().toLowerCase();
    const isDetectable =
      detectedRegion.length > 0 && detectedRegion !== 'unknown';

    if (!hasUserLocation) {
      return (
        <Badge variant="outline" className="text-xs">
          No location provided
        </Badge>
      );
    }

    if (!isDetectable) {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <Badge variant="secondary" className="text-xs">
            Unable to verify
          </Badge>
        </div>
      );
    }

    if (report.locationMismatchWarning) {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <Badge variant="destructive" className="text-xs">
            {report.locationMismatchConfirmed
              ? 'Mismatch (Confirmed)'
              : 'Mismatch (Unverified)'}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-[var(--color-text-muted)]">
            (IP/GPS: {report.detectedRegion})
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="text-xs">
          Verified
        </Badge>
        <span className="text-xs text-slate-500">
          (IP/GPS: {report.detectedRegion})
        </span>
      </div>
    );
  };

  const assignedMedicalSupport = getAssignedSupportProviders(
    assigningReport,
    'MEDICAL_PROFESSIONAL'
  );
  const assignedLegalSupport = getAssignedSupportProviders(
    assigningReport,
    'LEGAL_ADVISOR'
  );

  const medicalProviders = serviceProviders.filter(
    (provider) => provider.type === 'MEDICAL_PROFESSIONAL'
  );
  const legalProviders = serviceProviders.filter(
    (provider) => provider.type === 'LEGAL_ADVISOR'
  );

  const filteredMedicalProviders = medicalProviders.filter((provider) =>
    [provider.name, ...(provider.specializations || [])]
      .join(' ')
      .toLowerCase()
      .includes(medicalSearch.toLowerCase())
  );

  const filteredLegalProviders = legalProviders.filter((provider) =>
    [provider.name, ...(provider.specializations || [])]
      .join(' ')
      .toLowerCase()
      .includes(legalSearch.toLowerCase())
  );

  const filteredReports = reports.filter((report) => {
    const statusMatch = filter === 'all' || report.status === filter;
    const severityMatch =
      severityFilter === 'all' || report.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const criticalCount = reports.filter((r) => r.severity === 'CRITICAL').length;
  const underReviewCount = reports.filter(
    (r) => r.status === 'PENDING_REVIEW'
  ).length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const locationMismatchCount = reports.filter(
    (r) => r.locationMismatchWarning && !r.locationMismatchConfirmed
  ).length;

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C15B3E]"
               style={{ boxShadow: '0 10px 25px -5px rgba(193, 91, 62, 0.35)' }}>
            <Shield className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">Incident Oversight</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Monitor, track, and oversee all reported incidents across the platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchOversightData}
            disabled={isLoading}
            className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)] dark:hover:bg-[var(--color-surface)] dark:hover:text-[var(--color-text-secondary)]"
          >
            <Loader2 className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Incident Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="overflow-hidden border-l-4 border-l-[#6B705C] shadow-sm">
          <CardContent className="bg-[#F5F4F0] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">Total Incidents</p>
                <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{analytics?.totalReports ?? reports.length}</h2>
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
                <p className="text-xs font-medium uppercase tracking-wide text-[#AD7D4A]">Under Review</p>
                <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{underReviewCount}</h2>
              </div>
              <div className="rounded-lg bg-[#F7E8D1] p-2.5">
                <Clock className="h-6 w-6 text-[#AD7D4A]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-[#5D624F] shadow-sm">
          <CardContent className="bg-[#F5F4F0] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#5D624F]">Resolved</p>
                <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{resolvedCount}</h2>
              </div>
              <div className="rounded-lg bg-[#E8E7E0] p-2.5">
                <CheckCircle className="h-6 w-6 text-[#5D624F]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-[#C15B3E] shadow-sm">
          <CardContent className="bg-[#FEF5F2] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#A54B34]">Critical</p>
                <h2 className="mt-1 text-2xl font-bold text-[#C15B3E]">{criticalCount}</h2>
              </div>
              <div className="rounded-lg bg-[#F8D4C7] p-2.5">
                <AlertTriangle className="h-6 w-6 text-[#C15B3E]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`overflow-hidden border-l-4 shadow-sm ${locationMismatchCount > 0 ? 'border-l-[#C15B3E]' : 'border-l-[#CCC9BC]'}`}>
          <CardContent className={`pt-5 ${locationMismatchCount > 0 ? 'bg-[#FEF5F2]' : 'bg-[#F5F4F0]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${locationMismatchCount > 0 ? 'text-[#A54B34]' : 'text-[#6B705C]'}`}>Location Mismatch</p>
                <h2 className={`mt-1 text-2xl font-bold ${locationMismatchCount > 0 ? 'text-[#C15B3E]' : 'text-[#4A4D42]'}`}>{locationMismatchCount}</h2>
              </div>
              <div className={`rounded-lg p-2.5 ${locationMismatchCount > 0 ? 'bg-[#F8D4C7]' : 'bg-[#E8E7E0]'}`}>
                <MapPin className={`h-6 w-6 ${locationMismatchCount > 0 ? 'text-[#C15B3E]' : 'text-[#6B705C]'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Incident Reports Table */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Incident Reports</h2>
        <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
          <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                  <FileText className="h-4 w-4 text-[#6B705C]" />
                </div>
                All Reports
              </CardTitle>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48 h-9 border-[#DAD8CE] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING_REVIEW">Under Review</SelectItem>
                    <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                    <SelectItem value="ASSIGNED_TO_PROFESSIONAL">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-36 h-9 border-[#DAD8CE] text-sm">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-[var(--color-text-muted)]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Location Check</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-slate-500 dark:text-[var(--color-text-muted)]"
                    >
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">
                        {report.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(report.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.location || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                      <TableCell>
                        {report.caseAssignment ? (
                          <div className="space-y-1">
                            <div
                              key={report.caseAssignment.id}
                              className="text-xs"
                            >
                              <Badge variant="secondary" className="mr-1">
                                {report.caseAssignment.caseType.replace(
                                  /_/g,
                                  ' '
                                )}
                              </Badge>
                              {report.caseAssignment.assignedTo.name}
                              <Badge variant="outline" className="ml-1">
                                Taking: {getAcceptedTeamCount(report)}/
                                {getTeamSize(report)}
                              </Badge>
                            </div>
                            {(report.caseAssignment.supportProviders || []).map(
                              (provider) => (
                                <div
                                  key={provider.id}
                                  className="text-xs text-slate-600 dark:text-[var(--color-text-secondary)]"
                                >
                                  Support: {provider.name} (
                                  {provider.type.replace(/_/g, ' ')}) -{' '}
                                  {getProviderInvitationStatus(
                                    report,
                                    provider.id,
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-[var(--color-text-muted)]">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${
                            report.riskScore >= 70
                              ? 'text-red-500'
                              : report.riskScore >= 40
                                ? 'text-orange-500'
                                : 'text-green-500'
                          }`}
                        >
                          {Math.round(report.riskScore)}
                        </span>
                      </TableCell>
                      <TableCell>{getLocationValidationView(report)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewIncident(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoAssign(report)}
                          >
                            Auto Assign
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignReport(report)}
                          >
                            Manual Assign
                          </Button>
                          <Select
                            onValueChange={(value) =>
                              handleUpdateStatus(report.id, value)
                            }
                            defaultValue={report.status}
                          >
                            <SelectTrigger className="h-8 w-44">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING_REVIEW">
                                Under Review
                              </SelectItem>
                              <SelectItem value="UNDER_INVESTIGATION">
                                Under Investigation
                              </SelectItem>
                              <SelectItem value="ASSIGNED_TO_PROFESSIONAL">
                                Assigned
                              </SelectItem>
                              <SelectItem value="IN_PROGRESS">
                                In Progress
                              </SelectItem>
                              <SelectItem value="RESOLVED">Resolved</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Report Details</h2>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDetailModal(false)}
              >
                X
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-medium">
                    {getCategoryLabel(selectedReport.category)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Severity</p>
                  {getSeverityBadge(selectedReport.severity)}
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">Status</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">Risk Score</p>
                  <p className="font-bold">
                    {Math.round(selectedReport.riskScore)}
                  </p>
                </div>
              </div>

              {selectedReport.locationMismatchWarning && (
                <div
                  className={`rounded-lg p-4 ${
                    selectedReport.locationMismatchConfirmed
                      ? 'border border-amber-200 bg-amber-50'
                      : 'border border-red-200 bg-red-50'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <AlertCircle
                      className={`h-5 w-5 ${
                        selectedReport.locationMismatchConfirmed
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    />
                    <h3 className="font-bold">Location Verification</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-[var(--color-text-muted)]">User Selected Location</p>
                      <p className="font-medium">
                        {selectedReport.location || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-[var(--color-text-muted)]">Detected Location</p>
                      <p className="font-medium">
                        {selectedReport.detectedRegion || 'Unknown'}
                        {selectedReport.detectedCity &&
                          `, ${selectedReport.detectedCity}`}
                      </p>
                    </div>
                  </div>
                  {!selectedReport.locationMismatchConfirmed && (
                    <p className="mt-3 text-sm text-red-600">
                      Warning: This report has an unverified location. The user
                      selected a different region than where the report was
                      submitted from.
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">Description</p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm dark:bg-[var(--color-surface)] dark:text-[var(--color-text-secondary)]">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-[var(--color-text-muted)]">Submitted</p>
                  <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-[var(--color-text-muted)]">Anonymous</p>
                  <p>{selectedReport.isAnonymous ? 'Yes' : 'No'}</p>
                </div>
                {selectedReport.contactEmail && (
                  <div>
                    <p className="text-slate-500 dark:text-[var(--color-text-muted)]">Contact Email</p>
                    <p>{selectedReport.contactEmail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && assigningReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Assign Report</h2>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAssignModal(false)}
              >
                X
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">Report</p>
                <p className="font-medium">{assigningReport.title}</p>
                <p className="text-sm text-slate-600 dark:text-[var(--color-text-secondary)]">
                  {assigningReport.description.substring(0, 100)}...
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-medium">
                    {getCategoryLabel(assigningReport.category)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Severity</p>
                  {getSeverityBadge(assigningReport.severity)}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm tracking-wide text-slate-500 uppercase dark:text-[var(--color-text-muted)]">
                  Current team
                </p>
                {assigningReport.caseAssignment ? (
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Primary assignment
                        </p>
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-[var(--color-text-muted)]">Case type</p>
                            <p className="font-medium">
                              {assigningReport.caseAssignment.caseType.replace(
                                /_/g,
                                ' '
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Assigned to
                            </p>
                            <p className="font-semibold">
                              {assigningReport.caseAssignment.assignedTo.name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-4 whitespace-nowrap"
                        >
                          {assigningReport.caseAssignment.assignedTo.type ===
                          'COUNSELOR'
                            ? 'Primary Counselor'
                            : getProviderTypeLabel(
                                assigningReport.caseAssignment.assignedTo.type
                              )}
                        </Badge>
                        <Badge
                          className="mt-2"
                          variant={
                            getProviderInvitationStatus(
                              assigningReport,
                              assigningReport.caseAssignment.assignedTo.id,
                            ) === 'ACCEPTED'
                              ? 'default'
                              : getProviderInvitationStatus(
                                    assigningReport,
                                    assigningReport.caseAssignment.assignedTo.id,
                                  ) === 'DECLINED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {getProviderInvitationStatus(
                            assigningReport,
                            assigningReport.caseAssignment.assignedTo.id,
                          )}
                        </Badge>
                      </div>

                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Medical support
                          </p>
                          <Badge variant="outline">
                            Accepted{' '}
                            {
                              assignedMedicalSupport.filter(
                                (provider) =>
                                  getProviderInvitationStatus(
                                    assigningReport,
                                    provider.id,
                                  ) === 'ACCEPTED',
                              ).length
                            }
                            /{assignedMedicalSupport.length}
                          </Badge>
                        </div>
                        {assignedMedicalSupport.length > 0 ? (
                          <div className="mt-3 space-y-3">
                            {assignedMedicalSupport.map((provider) => (
                              <div
                                key={provider.id}
                                className="rounded-lg border border-slate-200 p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium">
                                      {provider.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {getProviderTypeLabel(provider.type)}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">Added</Badge>
                                  <Badge
                                    variant={
                                      getProviderInvitationStatus(
                                        assigningReport,
                                        provider.id,
                                      ) === 'ACCEPTED'
                                        ? 'default'
                                        : getProviderInvitationStatus(
                                              assigningReport,
                                              provider.id,
                                            ) === 'DECLINED'
                                          ? 'destructive'
                                          : 'secondary'
                                    }
                                  >
                                    {getProviderInvitationStatus(
                                      assigningReport,
                                      provider.id,
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">
                            No medical support assigned yet.
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Legal support
                          </p>
                          <Badge variant="outline">
                            Accepted{' '}
                            {
                              assignedLegalSupport.filter(
                                (provider) =>
                                  getProviderInvitationStatus(
                                    assigningReport,
                                    provider.id,
                                  ) === 'ACCEPTED',
                              ).length
                            }
                            /{assignedLegalSupport.length}
                          </Badge>
                        </div>
                        {assignedLegalSupport.length > 0 ? (
                          <div className="mt-3 space-y-3">
                            {assignedLegalSupport.map((provider) => (
                              <div
                                key={provider.id}
                                className="rounded-lg border border-slate-200 p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium">
                                      {provider.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {getProviderTypeLabel(provider.type)}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">Added</Badge>
                                  <Badge
                                    variant={
                                      getProviderInvitationStatus(
                                        assigningReport,
                                        provider.id,
                                      ) === 'ACCEPTED'
                                        ? 'default'
                                        : getProviderInvitationStatus(
                                              assigningReport,
                                              provider.id,
                                            ) === 'DECLINED'
                                          ? 'destructive'
                                          : 'secondary'
                                    }
                                  >
                                    {getProviderInvitationStatus(
                                      assigningReport,
                                      provider.id,
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">
                            No legal support assigned yet.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Team uptake
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {getAcceptedTeamCount(assigningReport)}/{getTeamSize(assigningReport)} accepted
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No current assignment for this report.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Medical providers</p>
                      <p className="text-xs text-slate-500">
                        Search by name or specialization to match report needs.
                      </p>
                    </div>
                    <input
                      type="search"
                      value={medicalSearch}
                      onChange={(event) => setMedicalSearch(event.target.value)}
                      placeholder="e.g. Trauma, emergency, pediatrics"
                      className="w-full max-w-sm rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="max-h-60 space-y-3 overflow-y-auto">
                    {filteredMedicalProviders.length > 0 ? (
                      filteredMedicalProviders.map((provider) => {
                        const alreadyAssigned = assignedMedicalSupport.some(
                          (assigned) => assigned.id === provider.id
                        );
                        return (
                          <div
                            key={provider.id}
                            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-xs text-slate-500">
                                  {provider.city || 'Location not specified'}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {provider.specializations.length > 0 ? (
                                    provider.specializations.map((spec) => (
                                      <Badge key={spec} variant="outline">
                                        {spec}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="secondary">
                                      General care
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                disabled={alreadyAssigned}
                                onClick={() =>
                                  handleAssignSubmit(
                                    provider.id,
                                    'MEDICAL_SUPPORT'
                                  )
                                }
                              >
                                {alreadyAssigned ? 'Assigned' : 'Assign'}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">
                        No medical providers match this search.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Legal providers</p>
                      <p className="text-xs text-slate-500">
                        Search by name or specialization for legal support
                        areas.
                      </p>
                    </div>
                    <input
                      type="search"
                      value={legalSearch}
                      onChange={(event) => setLegalSearch(event.target.value)}
                      placeholder="e.g. Family law, trauma-informed"
                      className="w-full max-w-sm rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="max-h-60 space-y-3 overflow-y-auto">
                    {filteredLegalProviders.length > 0 ? (
                      filteredLegalProviders.map((provider) => {
                        const alreadyAssigned = assignedLegalSupport.some(
                          (assigned) => assigned.id === provider.id
                        );
                        return (
                          <div
                            key={provider.id}
                            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-xs text-slate-500">
                                  {provider.city || 'Location not specified'}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {provider.specializations.length > 0 ? (
                                    provider.specializations.map((spec) => (
                                      <Badge key={spec} variant="outline">
                                        {spec}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="secondary">
                                      Legal support
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                disabled={alreadyAssigned}
                                onClick={() =>
                                  handleAssignSubmit(
                                    provider.id,
                                    'LEGAL_ASSISTANCE'
                                  )
                                }
                              >
                                {alreadyAssigned ? 'Assigned' : 'Assign'}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">
                        No legal providers match this search.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
