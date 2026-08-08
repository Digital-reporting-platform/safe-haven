import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Plus,
  User,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Edit,
  Eye,
  Settings,
  Download,
  Upload,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';

const mockCases = [
  {
    id: 'case-1',
    clientName: 'Sarah M.',
    clientId: 'client-1',
    caseType: 'Emergency Shelter',
    riskLevel: 'High',
    status: 'Active',
    priority: 'Urgent',
    assignedCounselor: 'Grace Thompson',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20T14:30:00Z',
    progress: 65,
    description:
      'Client requires immediate shelter placement due to domestic violence situation. Has 2 children under 5 years old.',
    nextSteps: [
      'Complete intake assessment',
      'Contact emergency shelter services',
      'Arrange transportation',
      'Follow up within 24 hours',
    ],
    contacts: {
      emergency: '+1 (555) 123-4567',
      email: 'sarah.m@email.com',
      address: 'Downtown Area',
    },
    documents: [
      {
        name: 'Intake Form',
        type: 'PDF',
        uploaded: '2024-01-15',
        status: 'Complete',
      },
      {
        name: 'Risk Assessment',
        type: 'DOC',
        uploaded: '2024-01-16',
        status: 'Complete',
      },
      { name: 'Safety Plan', type: 'PDF', uploaded: null, status: 'Pending' },
    ],
    sessions: [
      {
        date: '2024-01-16',
        type: 'Initial Assessment',
        status: 'Completed',
        duration: 60,
      },
      {
        date: '2024-01-18',
        type: 'Follow-up',
        status: 'Completed',
        duration: 45,
      },
      {
        date: '2024-01-22',
        type: 'Counseling Session',
        status: 'Scheduled',
        duration: 60,
      },
    ],
  },
  {
    id: 'case-2',
    clientName: 'Maria G.',
    clientId: 'client-3',
    caseType: 'Trauma Recovery',
    riskLevel: 'Medium',
    status: 'Active',
    priority: 'High',
    assignedCounselor: 'Grace Thompson',
    createdDate: '2024-01-10',
    lastUpdated: '2024-01-19T16:45:00Z',
    progress: 80,
    description:
      'PTSD treatment following workplace trauma. Making good progress with EMDR therapy.',
    nextSteps: [
      'Continue EMDR sessions',
      'Review progress assessment',
      'Update treatment plan',
      'Schedule follow-up appointment',
    ],
    contacts: {
      emergency: '+1 (555) 987-6543',
      email: 'maria.g@email.com',
      address: 'Midtown District',
    },
    documents: [
      {
        name: 'Treatment Plan',
        type: 'PDF',
        uploaded: '2024-01-12',
        status: 'Complete',
      },
      {
        name: 'Progress Notes',
        type: 'DOC',
        uploaded: '2024-01-19',
        status: 'Complete',
      },
      {
        name: 'Discharge Summary',
        type: 'PDF',
        uploaded: null,
        status: 'Not Started',
      },
    ],
    sessions: [
      {
        date: '2024-01-12',
        type: 'Initial Assessment',
        status: 'Completed',
        duration: 90,
      },
      {
        date: '2024-01-17',
        type: 'EMDR Session',
        status: 'Completed',
        duration: 60,
      },
      {
        date: '2024-01-23',
        type: 'Follow-up',
        status: 'Scheduled',
        duration: 60,
      },
    ],
  },
  {
    id: 'case-3',
    clientName: 'James K.',
    clientId: 'client-5',
    caseType: 'Substance Abuse',
    riskLevel: 'High',
    status: 'Active',
    priority: 'High',
    assignedCounselor: 'Grace Thompson',
    createdDate: '2024-01-08',
    lastUpdated: '2024-01-20T09:20:00Z',
    progress: 30,
    description:
      'Alcohol dependency treatment. Client motivated but struggling with early recovery challenges.',
    nextSteps: [
      'Complete detoxification assessment',
      'Connect with AA sponsor',
      'Review medication options',
      'Weekly check-in calls',
    ],
    contacts: {
      emergency: '+1 (555) 555-0123',
      email: 'james.k@email.com',
      address: 'North District',
    },
    documents: [
      {
        name: 'Substance Assessment',
        type: 'PDF',
        uploaded: '2024-01-10',
        status: 'Complete',
      },
      {
        name: 'Recovery Plan',
        type: 'DOC',
        uploaded: '2024-01-15',
        status: 'In Progress',
      },
      {
        name: 'Medical Records',
        type: 'PDF',
        uploaded: null,
        status: 'Requested',
      },
    ],
    sessions: [
      {
        date: '2024-01-10',
        type: 'Initial Assessment',
        status: 'Completed',
        duration: 75,
      },
      {
        date: '2024-01-17',
        type: 'Counseling Session',
        status: 'Completed',
        duration: 60,
      },
      {
        date: '2024-01-21',
        type: 'Group Session',
        status: 'Scheduled',
        duration: 90,
      },
    ],
  },
];

const caseStatuses = ['All', 'Active', 'Closed', 'Pending'];
const riskLevels = ['All', 'High', 'Medium', 'Low'];
const caseTypes = [
  'All',
  'Emergency Shelter',
  'Domestic Violence',
  'Trauma Recovery',
  'Family Counseling',
  'Substance Abuse',
];

function GeneralCasePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // "list" or "detail"

  const filteredCases = useMemo(() => {
    return mockCases.filter((caseItem) => {
      const matchesSearch =
        caseItem.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || caseItem.status === statusFilter;
      const matchesRisk =
        riskFilter === 'All' || caseItem.riskLevel === riskFilter;
      const matchesType =
        typeFilter === 'All' || caseItem.caseType === typeFilter;
      return matchesSearch && matchesStatus && matchesRisk && matchesType;
    });
  }, [searchQuery, statusFilter, riskFilter, typeFilter]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]';
      case 'Closed':
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800';
      case 'Pending':
        return 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]';
      case 'Requested':
        return 'bg-orange-100 text-orange-800';
      case 'Not Started':
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Scheduled':
        return 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  // Calculate statistics
  const totalCases = mockCases.length;
  const activeCases = mockCases.filter((c) => c.status === 'Active').length;
  const highRiskCases = mockCases.filter((c) => c.riskLevel === 'High').length;
  const urgentCases = mockCases.filter((c) => c.priority === 'Urgent').length;
  const avgProgress = Math.round(
    mockCases.reduce((sum, c) => sum + c.progress, 0) / mockCases.length
  );

  if (viewMode === 'detail' && selectedCase) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCase(null);
                  setViewMode('list');
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-indigo-500" />
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                    Case Details: {selectedCase.clientName}
                  </h1>
                  <p className="mt-1 text-[var(--color-text-secondary)]">
                    Case ID: {selectedCase.id} • {selectedCase.caseType}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Case
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Case
              </Button>
            </div>
          </div>

          {/* Case Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Case Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Badge className={getStatusColor(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                  <Badge className={getRiskColor(selectedCase.riskLevel)}>
                    {selectedCase.riskLevel} Risk
                  </Badge>
                  <Badge className={getPriorityColor(selectedCase.priority)}>
                    {selectedCase.priority} Priority
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <strong>Client:</strong> {selectedCase.clientName}
                  </div>
                  <div>
                    <strong>Counselor:</strong> {selectedCase.assignedCounselor}
                  </div>
                  <div>
                    <strong>Created:</strong>{' '}
                    {new Date(selectedCase.createdDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(selectedCase.lastUpdated).toLocaleString()}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-[var(--color-text-primary)]">
                    Description
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">{selectedCase.description}</p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-[var(--color-text-primary)]">Progress</h4>
                  <div className="flex items-center gap-4">
                    <div className="h-3 flex-1 rounded-full bg-[var(--color-border)]">
                      <div
                        className="h-3 rounded-full bg-[var(--color-primary)]"
                        style={{ width: `${selectedCase.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedCase.progress}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-[var(--color-text-primary)]">
                    Next Steps
                  </h4>
                  <ul className="space-y-1">
                    {selectedCase.nextSteps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"></div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-sm font-medium">Emergency Contact</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {selectedCase.contacts.emergency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {selectedCase.contacts.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {selectedCase.contacts.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedCase.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[var(--color-text-muted)]" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {doc.type} •{' '}
                          {doc.uploaded
                            ? `Uploaded ${new Date(doc.uploaded).toLocaleDateString()}`
                            : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDocumentStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sessions</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedCase.sessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[var(--color-text-muted)]" />
                      <div>
                        <p className="text-sm font-medium">{session.type}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(session.date).toLocaleDateString()} •{' '}
                          {session.duration} minutes
                        </p>
                      </div>
                    </div>
                    <Badge className={getSessionStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link to="/counselor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-500" />
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                  General Case Management
                </h1>
                <p className="mt-1 text-[var(--color-text-secondary)]">
                  Comprehensive case overview and management interface
                </p>
              </div>
            </div>
          </div>
          <Button className="bg-[var(--color-primary)] hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Total Cases
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {totalCases}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Active Cases
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {activeCases}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    High Risk
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {highRiskCases}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Urgent</p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {urgentCases}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Avg Progress
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {avgProgress}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                <Input
                  placeholder="Search by client name, case type, or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  {caseStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status} Status
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  aria-label="Filter by risk level"
                >
                  {riskLevels.map((risk) => (
                    <option key={risk} value={risk}>
                      {risk} Risk
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by case type"
                >
                  {caseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {caseItem.clientName}
                        </h3>
                        <Badge className={getStatusColor(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                        <Badge className={getRiskColor(caseItem.riskLevel)}>
                          {caseItem.riskLevel} Risk
                        </Badge>
                        <Badge className={getPriorityColor(caseItem.priority)}>
                          {caseItem.priority}
                        </Badge>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-4 text-sm text-[var(--color-text-secondary)] md:grid-cols-4">
                        <div>
                          <strong>Type:</strong> {caseItem.caseType}
                        </div>
                        <div>
                          <strong>Counselor:</strong>{' '}
                          {caseItem.assignedCounselor}
                        </div>
                        <div>
                          <strong>Created:</strong>{' '}
                          {new Date(caseItem.createdDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Last Updated:</strong>{' '}
                          {new Date(caseItem.lastUpdated).toLocaleString()}
                        </div>
                      </div>

                      <p className="mb-3 line-clamp-2 text-[var(--color-text-secondary)]">
                        {caseItem.description}
                      </p>

                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Progress</span>
                          <span className="font-medium">
                            {caseItem.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-[var(--color-primary)]"
                            style={{ width: `${caseItem.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setViewMode('detail');
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-4 w-4" />
                          Edit Case
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          Schedule Session
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Add Note
                        </Button>
                        {caseItem.priority === 'Urgent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700"
                          >
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            Urgent Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
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

export default GeneralCasePage;
