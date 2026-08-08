import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Briefcase, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';
import { AddCaseModal } from '@/components/ui/AddCaseModal';

type AssignmentStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

type BackendCase = {
  id: string;
  caseType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: AssignmentStatus;
  createdAt: string;
  assignedTo?: { name?: string | null } | null;
  report?: {
    id: string;
    category?: string;
    description?: string;
    status?: string;
  } | null;
};

type UiCase = {
  id: string;
  backendCaseId: string;
  type: string;
  status: string;
  priority: string;
  date: string;
  assignedTo: string;
  description: string;
};

type ReportOption = {
  id: string;
  label: string;
};

export function CaseManagementPage() {
  const [cases, setCases] = useState<UiCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);

  const toLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const mapStatusToUi = (status: AssignmentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Under Review';
      case 'ON_HOLD':
        return 'In Progress';
      case 'COMPLETED':
        return 'Resolved';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cases?limit=100');
      const data: BackendCase[] = response.data?.data || [];
      const mapped: UiCase[] = data.map((item) => ({
        id: `#${(item.report?.id || item.id).slice(0, 8).toUpperCase()}`,
        backendCaseId: item.id,
        type: toLabel(item.report?.category || item.caseType || 'OTHER'),
        status: mapStatusToUi(item.status),
        priority: toLabel(item.priority),
        date: item.createdAt,
        assignedTo: item.assignedTo?.name || 'Unassigned',
        description: item.report?.description || 'No description',
      }));
      setCases(mapped);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchReportOptions = async () => {
    try {
      const response = await api.get('/reports?limit=100');
      const reports = response.data?.data || [];
      const options: ReportOption[] = reports.map((report: any) => ({
        id: report.id,
        label: `${String(report.id).slice(0, 8).toUpperCase()} - ${toLabel(
          report.category || 'OTHER',
        )} (${toLabel(report.status || 'PENDING_REVIEW')})`,
      }));
      setReportOptions(options);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load reports for case creation');
    }
  };

  const handleOpenAddCase = async () => {
    setIsAddModalOpen(true);
    fetchReportOptions();
  };

  const handleAddCase = async (reportId: string) => {
    setIsCreatingCase(true);
    try {
      // Get ML suggestions
      const response = await api.post(`/cases/auto-route/${reportId.trim()}`);
      const suggestions = response.data;
      
      const primaryProfessional = suggestions.suggestedProfessionals?.primary;
      if (!primaryProfessional) {
        toast.error('No available professionals found for this case');
        setIsCreatingCase(false);
        return;
      }

      // Create actual assignment
      await api.post(`/cases/assign/${reportId.trim()}`, {
        assignedToId: primaryProfessional.id,
        caseType: suggestions.suggestedCaseType,
        priority: suggestions.suggestedPriority,
        notes: 'Created via admin case management',
      });

      toast.success('Case created and assigned successfully');
      setIsAddModalOpen(false);
      await fetchCases();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create case');
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleViewCase = (caseItem: UiCase) => {
    window.alert(
      `Case: ${caseItem.id}\nType: ${caseItem.type}\nStatus: ${caseItem.status}\nPriority: ${caseItem.priority}\nAssigned To: ${caseItem.assignedTo}\nDate: ${new Date(caseItem.date).toLocaleString()}\n\nDescription:\n${caseItem.description}`,
    );
  };

  const handleEditCase = async (caseItem: UiCase) => {
    const nextStatus = window.prompt(
      'Enter new status: ACTIVE, ON_HOLD, COMPLETED, CANCELLED',
      'ON_HOLD',
    );
    if (!nextStatus) return;

    const normalized = nextStatus.toUpperCase();
    const allowed = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(normalized)) {
      toast.error('Invalid status');
      return;
    }

    try {
      await api.put(`/cases/${caseItem.backendCaseId}/status`, {
        status: normalized,
      });
      toast.success('Case status updated');
      fetchCases();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update case');
    }
  };

  const handleDeleteCase = async (caseItem: UiCase) => {
    const confirmed = window.confirm(`Cancel case ${caseItem.id}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/cases/${caseItem.backendCaseId}`);
      toast.success('Case cancelled');
      fetchCases();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel case');
    }
  };

  const underReviewCount = useMemo(
    () => cases.filter((c) => c.status === 'Under Review').length,
    [cases],
  );
  const resolvedCount = useMemo(
    () => cases.filter((c) => c.status === 'Resolved').length,
    [cases],
  );

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5D624F]"
               style={{ boxShadow: '0 10px 25px -5px rgba(93, 98, 79, 0.35)' }}>
            <Briefcase className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">Case Management</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Handle case assignments, track progress, and manage resolution workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchCases}
            disabled={isLoading}
            className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035]"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenAddCase}
            disabled={isLoading}
            className="h-9 bg-[#C15B3E] px-3 text-sm font-medium text-white shadow-sm hover:bg-[#A54B34]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Case
          </Button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Active Cases</h2>
        <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
          <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
              <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                <Briefcase className="h-4 w-4 text-[#6B705C]" />
              </div>
              Case Assignments
            </CardTitle>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                    No cases found.
                  </TableCell>
                </TableRow>
              )}
              {cases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell className="font-medium">{case_.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{case_.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {case_.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        case_.status === 'Resolved'
                          ? 'default'
                          : case_.status === 'In Progress'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {case_.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        case_.priority === 'Critical'
                          ? 'destructive'
                          : case_.priority === 'High'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {case_.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{case_.assignedTo}</TableCell>
                  <TableCell>
                    {new Date(case_.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCase(case_)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCase(case_)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCase(case_)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>

      {/* Case Statistics */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Case Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="overflow-hidden border-l-4 border-l-[#6B705C] shadow-sm">
            <CardContent className="bg-[#F5F4F0] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">Total Cases</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{cases.length}</h2>
                </div>
                <div className="rounded-lg bg-[#E8E7E0] p-2.5">
                  <Briefcase className="h-6 w-6 text-[#6B705C]" />
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
                  <CheckCircle2 className="h-6 w-6 text-[#5D624F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCaseModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        reports={reportOptions}
        isSubmitting={isCreatingCase}
        onSubmit={handleAddCase}
      />
    </div>
  );
}
