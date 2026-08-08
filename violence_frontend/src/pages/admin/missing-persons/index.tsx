import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  Loader2,
  AlertTriangle,
  Users,
  Search,
  Eye,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  Info,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { missingPersonsService } from '@/services/missingPersonsService';
import { MissingPerson, MissingPersonStatus, MISSING_PERSON_STATUS_COLORS, MISSING_PERSON_STATUS_LABELS } from '@/types/forum';

interface Stats {
  total: number;
  byStatus: {
    pending: number;
    active: number;
    found: number;
    closed: number;
  };
}

interface Sighting {
  id: string;
  missingPersonId: string;
  location: string;
  sightingDate: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  isVerified: boolean;
  createdAt: string;
  missingPerson?: MissingPerson;
}

export function AdminMissingPersonsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingReports, setPendingReports] = useState<MissingPerson[]>([]);
  const [allReports, setAllReports] = useState<MissingPerson[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [sightingsLoading, setSightingsLoading] = useState(false);

  const loadSightings = useCallback(async () => {
    try {
      console.log('Loading sightings...');
      setSightingsLoading(true);
      const data = await missingPersonsService.getSightings();
      console.log('Sightings data received:', data);
      setSightings(data);
    } catch (err) {
      console.error('Failed to load sightings:', err);
      toast.error('Failed to load sightings');
    } finally {
      setSightingsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const statsPromise = missingPersonsService.getStats();
      const pendingPromise = missingPersonsService.getPending();
      const allPromise = missingPersonsService.getAllAdmin();
      
      const [statsData, pendingData, allData] = await Promise.all([
        statsPromise,
        pendingPromise,
        allPromise,
      ]);
      
      setStats(statsData);
      setPendingReports(pendingData);
      setAllReports(allData);

      // Also refresh sightings if that tab is active
      if (activeTab === 'sightings') {
        await loadSightings();
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load missing persons data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadSightings]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await missingPersonsService.approve(id);
      toast.success('Report approved successfully');
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Failed to approve:', err);
      toast.error('Failed to approve report');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      await missingPersonsService.reject(id);
      toast.success('Report rejected successfully');
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Failed to reject:', err);
      toast.error('Failed to reject report');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifySighting = async (sightingId: string) => {
    try {
      setProcessingId(sightingId);
      await missingPersonsService.verifySighting(sightingId);
      toast.success('Sighting verified successfully');
      // Refresh sightings
      await loadSightings();
    } catch (err) {
      console.error('Failed to verify sighting:', err);
      toast.error('Failed to verify sighting');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: MissingPersonStatus) => {
    const colors = MISSING_PERSON_STATUS_COLORS[status];
    const label = MISSING_PERSON_STATUS_LABELS[status];
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
        {label}
      </Badge>
    );
  };

  const renderStatsCards = () => {
    if (!stats) return null;
    const cards = [
      { title: 'Total Reports', value: stats.total, icon: BarChart3, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-600' },
      { title: 'Pending Review', value: stats.byStatus.pending, icon: AlertTriangle, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-600' },
      { title: 'Active Cases', value: stats.byStatus.active, icon: Search, color: 'bg-rose-500', lightColor: 'bg-rose-50 text-rose-600' },
      { title: 'Found', value: stats.byStatus.found, icon: CheckCircle, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-600' },
      { title: 'Closed', value: stats.byStatus.closed, icon: XCircle, color: 'bg-slate-500', lightColor: 'bg-slate-50 text-slate-600' },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-[var(--color-surface)] dark:shadow-[var(--color-border)]/50 dark:ring-[var(--color-border)]">
            <div className={`h-1.5 ${card.color}`}></div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase dark:text-[var(--color-text-muted)]">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-[var(--color-text-primary)]">{card.value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${card.lightColor}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReportsTable = (reports: MissingPerson[], showActions: boolean) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-[var(--color-text-secondary)]">Loading reports...</h3>
          <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">Fetching missing persons data</p>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Users className="h-8 w-8 text-slate-400 dark:text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-[var(--color-text-secondary)]">No reports found</h3>
          <p className="text-sm text-slate-500">
            {showActions ? 'No pending reports to review' : 'No reports in this category'}
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Last Seen Location</TableHead>
            <TableHead>Last Seen Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
            {!showActions && <TableHead>View</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {report.firstName} {report.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell>{report.age || 'Unknown'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {report.lastSeenLocation}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {new Date(report.lastSeenDate).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(report.id)}
                      disabled={processingId === report.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(report.id)}
                      disabled={processingId === report.id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {processingId === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </TableCell>
              )}
              {!showActions && (
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/missing-persons/${report.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderSightingsTable = () => {
    if (sightingsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-[var(--color-text-secondary)]">Loading sightings...</h3>
        </div>
      );
    }

    if (sightings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Eye className="h-8 w-8 text-slate-400 dark:text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-[var(--color-text-secondary)]">No sightings yet</h3>
          <p className="text-sm text-slate-500 dark:text-[var(--color-text-muted)]">No sightings have been reported</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Missing Person</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Report Details</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sightings.map((sighting: Sighting) => (
            <TableRow key={sighting.id} className="hover:bg-slate-50/50 dark:hover:bg-[var(--color-surface)]/20">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-[var(--color-surface)] dark:text-[var(--color-text-secondary)]">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-[var(--color-text-primary)]">
                    {sighting.missingPerson?.firstName} {sighting.missingPerson?.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-[var(--color-text-muted)]" />
                  {sighting.location}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-[var(--color-text-muted)]" />
                  {new Date(sighting.sightingDate).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                {sighting.description ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="max-w-[120px] truncate text-xs">
                          {sighting.description}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-[var(--color-border)]">
                          <MessageSquare className="h-4 w-4 text-rose-500" />
                          <h4 className="font-semibold text-slate-800 dark:text-[var(--color-text-primary)]">Sighting Report</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-[var(--color-text-secondary)]">
                          {sighting.description}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-xs italic text-slate-400 dark:text-[var(--color-text-muted)]">No details provided</span>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {sighting.contactName && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User className="h-3 w-3 text-slate-400 dark:text-[var(--color-text-muted)]" />
                      {sighting.contactName}
                    </div>
                  )}
                  {sighting.contactPhone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone className="h-3 w-3 text-slate-400 dark:text-[var(--color-text-muted)]" />
                      {sighting.contactPhone}
                    </div>
                  )}
                  {sighting.contactEmail && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="h-3 w-3 text-slate-400 dark:text-[var(--color-text-muted)]" />
                      {sighting.contactEmail}
                    </div>
                  )}
                  {!sighting.contactName && !sighting.contactPhone && !sighting.contactEmail && (
                    <span className="text-xs italic text-slate-400 dark:text-[var(--color-text-muted)]">Anonymous</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {sighting.isVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-100 shadow-none">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {!sighting.isVerified && (
                  <Button
                    size="sm"
                    onClick={() => handleVerifySighting(sighting.id)}
                    disabled={processingId === sighting.id}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  >
                    {processingId === sighting.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Verify
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-slate-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-full w-full rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 h-full w-full rounded-full bg-white/5 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-rose-200" />
                <span className="text-sm font-medium text-rose-100">Admin Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                Missing Persons
                <span className="block text-rose-200">Administration</span>
              </h1>
              <p className="mt-2 text-rose-100/90">
                Review, approve, and manage missing person reports
              </p>
            </div>
            <Button 
              onClick={loadData} 
              variant="outline" 
              disabled={loading || sightingsLoading}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(loading || sightingsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="h-10 w-full fill-slate-50 lg:h-12" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64 C480,128 960,0 1440,64 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 lg:px-8">
        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Tabs */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 dark:bg-[var(--color-surface)] dark:shadow-[var(--color-border)]/50 dark:ring-[var(--color-border)]">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]/50">
            <h2 className="text-lg font-bold text-slate-800 dark:text-[var(--color-text-primary)]">Missing Persons Reports</h2>
          </div>
          <div className="p-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                if (value === 'sightings') {
                  loadSightings();
                }
              }}
            >
              <TabsList className="mb-6 grid w-full grid-cols-6 rounded-xl bg-slate-100 p-1 dark:bg-[var(--color-surface)]">
                <TabsTrigger value="pending" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm relative dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">
                  Pending
                  {stats && stats.byStatus.pending > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                      {stats.byStatus.pending}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">All</TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">Active</TabsTrigger>
                <TabsTrigger value="found" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">Found</TabsTrigger>
                <TabsTrigger value="closed" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">Closed</TabsTrigger>
                <TabsTrigger value="sightings" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[var(--color-surface)] dark:data-[state=active]:text-[var(--color-primary)]">
                  Sightings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderReportsTable(pendingReports, true)}
                </div>
              </TabsContent>

              <TabsContent value="all">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderReportsTable(allReports, false)}
                </div>
              </TabsContent>

              <TabsContent value="active">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderReportsTable(
                    allReports.filter((r) => r.status === MissingPersonStatus.ACTIVE),
                    false
                  )}
                </div>
              </TabsContent>

              <TabsContent value="found">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderReportsTable(
                    allReports.filter((r) => r.status === MissingPersonStatus.FOUND),
                    false
                  )}
                </div>
              </TabsContent>

              <TabsContent value="closed">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderReportsTable(
                    allReports.filter((r) => r.status === MissingPersonStatus.CLOSED),
                    false
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sightings">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {renderSightingsTable()}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
