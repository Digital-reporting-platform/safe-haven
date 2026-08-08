import { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  FileText,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Download,
  ArrowLeft,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

// Appointments are fetched from backend as assigned cases

function SessionListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [appointments, setAppointments] = useState<CaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await counselorService.getAppointments(1, 50);
      setAppointments(response.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load appointments';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert case assignments to session format
  const sessions = useMemo(() => {
    return appointments.map((caseItem) => ({
      id: caseItem.id,
      clientName: caseItem.report.reporter?.firstName || 'Anonymous',
      clientId: caseItem.report.reporter?.id || 'anonymous',
      date: new Date(caseItem.dueDate || caseItem.createdAt).toISOString().split('T')[0],
      time: new Date(caseItem.dueDate || caseItem.createdAt).toTimeString().slice(0, 5),
      duration: 60,
      type: caseItem.caseType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
      location: 'Virtual - Secure Video',
      status: caseItem.status === 'ACTIVE' ? 'Scheduled' : caseItem.status === 'COMPLETED' ? 'Completed' : caseItem.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled',
      counselor: 'You',
      notes: caseItem.notes || '',
      followUpNeeded: caseItem.status === 'ON_HOLD',
      recordingAvailable: false,
      riskScore: caseItem.report.riskScore,
      priority: caseItem.priority,
    }));
  }, [appointments]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || session.status === statusFilter;
      const matchesType = typeFilter === 'All' || session.type === typeFilter;
      const matchesDate = dateFilter === 'All' || session.date === dateFilter;
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [sessions, searchQuery, statusFilter, typeFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Scheduled':
        return 'bg-[var(--role-counselor-accent)]/20 text-[var(--role-counselor-accent)]';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Scheduled':
        return <Clock className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'In Progress':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getLocationIcon = (location: string) => {
    if (location.includes('Virtual'))
      return <Video className="h-4 w-4 text-[var(--role-counselor-accent)]" />;
    if (location.includes('Phone'))
      return <Phone className="h-4 w-4 text-green-500" />;
    return <MapPin className="h-4 w-4 text-slate-500" />;
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.status === 'Completed'
  ).length;
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'Scheduled'
  ).length;
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(
    (s) => s.date === today && s.status === 'Scheduled'
  ).length;

  return (
    <div className="min-h-screen bg-[var(--role-counselor-bg)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link to="/counselor/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Session Management
              </h1>
              <p className="mt-1 text-slate-600">
                Manage counseling sessions and track client progress
              </p>
            </div>
          </div>
          <Link to="/counselor/sessions/schedule">
            <Button className="bg-[var(--role-counselor-primary)] hover:bg-[var(--role-counselor-primary)]/90">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Cases
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {isLoading ? '...' : totalSessions}
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
                  <p className="text-sm font-medium text-slate-600">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {isLoading ? '...' : completedSessions}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {isLoading ? '...' : upcomingSessions}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-[var(--role-counselor-accent)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Due Today</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {isLoading ? '...' : todaySessions}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                <Input
                  placeholder="Search by client name, type, or counselor..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by session status"
                >
                  <option value="All">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by session type"
                >
                  <option value="All">All Types</option>
                  <option value="Individual Counseling">
                    Individual Counseling
                  </option>
                  <option value="Family Session">Family Session</option>
                  <option value="Crisis Intervention">
                    Crisis Intervention
                  </option>
                  <option value="Initial Assessment">Initial Assessment</option>
                </select>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  aria-label="Filter by date"
                >
                  <option value="All">All Dates</option>
                  <option value={today}>Today</option>
                  <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--role-counselor-secondary)]/30">
                      <User className="h-6 w-6 text-[var(--role-counselor-text)]" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {session.clientName}
                        </h3>
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1">{session.status}</span>
                        </Badge>
                        {session.followUpNeeded && (
                          <Badge
                            variant="outline"
                            className="border-amber-300 text-amber-700"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Follow-up Needed
                          </Badge>
                        )}
                      </div>

                      <p className="mb-3 text-slate-600">{session.type}</p>

                      <div className="mb-3 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {session.time} ({session.duration}min)
                        </div>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(session.location)}
                          {session.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {session.counselor}
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-700">
                            <strong>Notes:</strong> {session.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {session.recordingAvailable && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-1 h-4 w-4" />
                            Recording
                          </Button>
                        )}
                        <Link to={`/counselor/sessions/notes/${session.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-1 h-4 w-4" />
                            View Notes
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-medium text-slate-600">
                No sessions found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SessionListPage;
