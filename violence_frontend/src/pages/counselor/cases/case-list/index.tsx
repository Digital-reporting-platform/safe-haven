import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Users,
  MoreVertical,
  Eye,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  CasePriority,
  CASE_PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/types/case';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

// Cases are fetched from backend as assigned case assignments

function CaseListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [cases, setCases] = useState<CaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cases on mount
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      // Counselors see ON_HOLD cases (pending review), not ACTIVE cases (already assigned)
      const response = await counselorService.getPendingCases(1, 50, 'ON_HOLD');
      setCases(response.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load cases';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  // Map case assignments to display format
  const displayCases = useMemo(() => {
    return cases.map((caseItem) => ({
      id: caseItem.id,
      title: caseItem.report.title || 'Untitled Case',
      clientName: caseItem.report.reporter?.firstName || 'Anonymous',
      type: caseItem.caseType,
      priority: caseItem.priority as CasePriority,
      status: caseItem.status === 'ACTIVE' ? 'Active' : caseItem.status === 'COMPLETED' ? 'Resolved' : caseItem.status === 'ON_HOLD' ? 'On Hold' : 'Active',
      createdDate: caseItem.createdAt,
      lastUpdated: new Date(caseItem.updatedAt).toLocaleDateString(),
      assignedTo: caseItem.assignedTo?.name || 'Pending assignment',
      riskScore: caseItem.report.riskScore || 0,
      description: caseItem.report.description || 'No description available',
    }));
  }, [cases]);

  const filteredCases = useMemo(() => {
    return displayCases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || caseItem.status === filterStatus;
      const matchesPriority =
        filterPriority === 'All' || caseItem.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [displayCases, searchQuery, filterStatus, filterPriority]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Active':
        return <AlertTriangle className="h-4 w-4 text-[var(--color-primary)]" />;
      default:
        return <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800';
      case 'Active':
        return 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="min-h-screen bg-[var(--role-counselor-bg)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--role-counselor-text)]">
              Case Management
            </h1>
            <p className="mt-1 text-[var(--role-counselor-text)]">Track and manage client cases</p>
          </div>
          <Button className="bg-[var(--role-counselor-primary)] hover:bg-[var(--role-counselor-primary)]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--role-counselor-text)]">
                    Total Cases
                  </p>
                  <p className="text-3xl font-bold text-[var(--role-counselor-text)]">
                    {isLoading ? '...' : cases.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-[var(--role-counselor-primary)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--role-counselor-text)]">
                    Active Cases
                  </p>
                  <p className="text-3xl font-bold text-[var(--role-counselor-text)]">
                    {isLoading ? '...' : cases.filter((c) => c.status === 'ACTIVE').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-[var(--role-counselor-primary)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--role-counselor-text)]">
                    High Priority
                  </p>
                  <p className="text-3xl font-bold text-[var(--role-counselor-text)]">
                    {isLoading ? '...' : cases.filter(
                      (c) => c.priority === 'CRITICAL' || c.priority === 'HIGH'
                    ).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-[var(--role-counselor-text)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Resolved</p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {isLoading ? '...' : cases.filter((c) => c.status === 'COMPLETED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-[var(--role-counselor-accent)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[var(--color-text-muted)]" />
                <Input
                  placeholder="Search by case title or client name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter by case status"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  aria-label="Filter by case priority"
                >
                  <option value="All">All Priority</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case List */}
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => {
            const priority = PRIORITY_COLORS[caseItem.priority];
            return (
              <Card
                key={caseItem.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)]">
                        {getStatusIcon(caseItem.status)}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            {caseItem.title}
                          </h3>
                          <Badge
                            className={`${priority.bg} ${priority.text} border-${priority.text}/20`}
                          >
                            {CASE_PRIORITY_LABELS[caseItem.priority]}
                          </Badge>
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                          </Badge>
                        </div>

                        <div className="mb-3 grid grid-cols-1 gap-4 text-sm text-[var(--color-text-secondary)] md:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {caseItem.clientName}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created:{' '}
                            {new Date(
                              caseItem.createdDate
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Updated: {caseItem.lastUpdated}
                          </div>
                          <div
                            className={`flex items-center gap-2 font-medium ${getRiskColor(caseItem.riskScore)}`}
                          >
                            Risk: {caseItem.riskScore}%
                          </div>
                        </div>

                        <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                          {caseItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/counselor/cases/case-details/${caseItem.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCases.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
              <h3 className="mb-2 text-lg font-medium text-[var(--color-text-secondary)]">
                No cases found
              </h3>
              <p className="text-[var(--color-text-muted)]">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CaseListPage;
