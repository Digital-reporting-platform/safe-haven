import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Eye,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HeadphonesIcon,
  ArrowRight,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

type TabType = 'new' | 'assigned' | 'closed';

function CasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'new'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [newCases, setNewCases] = useState<any[]>([]);
  const [assignedCases, setAssignedCases] = useState<CaseAssignment[]>([]);
  const [closedCases, setClosedCases] = useState<CaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['new', 'assigned', 'closed'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      // Fetch new cases (PENDING_REVIEW)
      const newResponse = await counselorService.getUnassignedReports(1, 100);
      setNewCases(newResponse.data || []);

      // Fetch assigned cases (ASSIGNED, IN_PROGRESS)
      const assignedResponse = await counselorService.getPendingCases(1, 100, 'ACTIVE');
      setAssignedCases(assignedResponse.data || []);

      // Fetch closed cases (RESOLVED, CLOSED)
      const closedResponse = await counselorService.getPendingCases(1, 100, 'COMPLETED');
      setClosedCases(closedResponse.data || []);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load cases';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setSearchParams({ tab: value });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING_REVIEW: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
      ASSIGNED: { label: 'Assigned', className: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
      RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
      CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Active', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { className: string }> = {
      CRITICAL: { className: 'bg-red-100 text-red-800' },
      HIGH: { className: 'bg-orange-100 text-orange-800' },
      MEDIUM: { className: 'bg-yellow-100 text-yellow-800' },
      LOW: { className: 'bg-blue-100 text-blue-800' },
    };
    const config = severityMap[severity] || { className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{severity}</Badge>;
  };

  // Filter cases based on search
  const filteredNewCases = useMemo(() => {
    return newCases.filter((c) => {
      const report = c.report || c;
      const title = report.title || '';
      const category = report.category || '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [newCases, searchQuery]);

  const filteredAssignedCases = useMemo(() => {
    return assignedCases.filter((c) => {
      const report = c.report || c;
      const title = report.title || '';
      const assignedToName = c.assignedTo?.firstName || c.assignedTo?.lastName
        ? `${c.assignedTo.firstName || ''} ${c.assignedTo.lastName || ''}`.trim()
        : '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [assignedCases, searchQuery]);

  const filteredClosedCases = useMemo(() => {
    return closedCases.filter((c) => {
      const report = c.report || c;
      const title = report.title || '';
      const assignedToName = c.assignedTo?.firstName || c.assignedTo?.lastName
        ? `${c.assignedTo.firstName || ''} ${c.assignedTo.lastName || ''}`.trim()
        : '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [closedCases, searchQuery]);

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
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] p-3 shadow-lg">
              <HeadphonesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-primary)] bg-clip-text text-4xl font-bold text-transparent">
                Case Management
              </h1>
              <p className="font-medium text-[var(--role-counselor-text)]">
                Review, assign, and monitor cases
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--role-counselor-text)]/40" />
                <Input
                  placeholder="Search cases by tracking number, category, or professional..."
                  className="border-[var(--role-counselor-secondary)]/30 bg-white/50 pl-12 text-[var(--role-counselor-text)] placeholder-[var(--role-counselor-text)]/40 focus:border-[var(--role-counselor-primary)] focus:ring-[var(--role-counselor-primary)]/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <TabsTrigger 
                value="new" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--role-counselor-primary)] data-[state=active]:to-[var(--role-counselor-accent)] data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4" />
                New Cases ({newCases.length})
              </TabsTrigger>
              <TabsTrigger 
                value="assigned" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--role-counselor-primary)] data-[state=active]:to-[var(--role-counselor-accent)] data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Assigned Cases ({assignedCases.length})
              </TabsTrigger>
              <TabsTrigger 
                value="closed" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--role-counselor-primary)] data-[state=active]:to-[var(--role-counselor-accent)] data-[state=active]:text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Closed Cases ({closedCases.length})
              </TabsTrigger>
            </TabsList>

            {/* New Cases Tab */}
            <TabsContent value="new" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                      <div className="rounded-lg bg-[var(--role-counselor-accent)]/20 p-2">
                        <Clock className="h-5 w-5 text-[var(--role-counselor-accent)]" />
                      </div>
                      New Cases (PENDING_REVIEW)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading cases...</div>
                    ) : filteredNewCases.length === 0 ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">
                        <Clock className="mx-auto mb-2 h-8 w-8 text-[var(--role-counselor-text)]/40" />
                        No new cases to review
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredNewCases.map((caseItem, idx) => {
                          const report = caseItem.report || caseItem;
                          return (
                            <motion.div
                              key={caseItem.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group flex items-start justify-between rounded-xl bg-[var(--role-counselor-secondary)]/30 p-6 transition-all duration-300 hover:bg-[var(--role-counselor-secondary)]/50 hover:shadow-lg"
                            >
                              <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                  <h3 className="font-semibold text-[var(--role-counselor-text)] group-hover:text-[var(--role-counselor-primary)]">
                                    {report.trackingNumber || `Case #${caseItem.id.slice(0, 8)}`}
                                  </h3>
                                  {getSeverityBadge(report.severity || 'MEDIUM')}
                                  <Badge className="bg-[var(--role-counselor-accent)]/10 text-[var(--role-counselor-accent)] border-[var(--role-counselor-accent)]/20">{report.category}</Badge>
                                </div>
                                <p className="mb-3 text-sm text-[var(--role-counselor-text)]/80">
                                  {report.title || 'Untitled Case'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--role-counselor-text)]/60">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    ML Type: <span className="font-medium text-[var(--role-counselor-text)]">{report.suggestedCaseType}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Priority: <span className="font-medium text-[var(--role-counselor-text)]">{report.suggestedPriority}</span>
                                  </span>
                                  <span>
                                    Submitted: {new Date(report.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Link to={`/counselor/cases/${caseItem.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] text-white border-0 hover:shadow-lg transition-all duration-300">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View Details
                                </Button>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Assigned Cases Tab */}
            <TabsContent value="assigned" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                      <div className="rounded-lg bg-[var(--role-counselor-primary)]/20 p-2">
                        <Users className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                      </div>
                      Assigned Cases (ASSIGNED, IN_PROGRESS)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading cases...</div>
                    ) : filteredAssignedCases.length === 0 ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">
                        <Users className="mx-auto mb-2 h-8 w-8 text-[var(--role-counselor-text)]/40" />
                        No assigned cases
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAssignedCases.map((caseItem, idx) => {
                          const report = caseItem.report || caseItem;
                          return (
                            <motion.div
                              key={caseItem.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group flex items-start justify-between rounded-xl bg-[var(--role-counselor-secondary)]/30 p-6 transition-all duration-300 hover:bg-[var(--role-counselor-secondary)]/50 hover:shadow-lg"
                            >
                              <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                  <h3 className="font-semibold text-[var(--role-counselor-text)] group-hover:text-[var(--role-counselor-primary)]">
                                    {report.trackingNumber || `Case #${caseItem.id.slice(0, 8)}`}
                                  </h3>
                                  {getStatusBadge(caseItem.status)}
                                </div>
                                <p className="mb-3 text-sm text-[var(--role-counselor-text)]/80">
                                  {report.title || 'Untitled Case'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--role-counselor-text)]/60">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Assigned to: <span className="font-medium text-[var(--role-counselor-text)]">{caseItem.assignedTo?.name || 'Unassigned'}</span>
                                  </span>
                                  <span>
                                    Last Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Link to={`/counselor/cases/${caseItem.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] text-white border-0 hover:shadow-lg transition-all duration-300">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View Case
                                </Button>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Closed Cases Tab */}
            <TabsContent value="closed" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                      <div className="rounded-lg bg-emerald-500/20 p-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      Closed Cases (RESOLVED, CLOSED)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">Loading cases...</div>
                    ) : filteredClosedCases.length === 0 ? (
                      <div className="py-8 text-center text-[var(--role-counselor-text)]/60">
                        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-[var(--role-counselor-text)]/40" />
                        No closed cases
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredClosedCases.map((caseItem, idx) => {
                          const report = caseItem.report || caseItem;
                          return (
                            <motion.div
                              key={caseItem.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group flex items-start justify-between rounded-xl bg-[var(--role-counselor-secondary)]/30 p-6 transition-all duration-300 hover:bg-[var(--role-counselor-secondary)]/50 hover:shadow-lg"
                            >
                              <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                  <h3 className="font-semibold text-[var(--role-counselor-text)] group-hover:text-[var(--role-counselor-primary)]">
                                    {report.trackingNumber || `Case #${caseItem.id.slice(0, 8)}`}
                                  </h3>
                                  {getStatusBadge(caseItem.status)}
                                </div>
                                <p className="mb-3 text-sm text-[var(--role-counselor-text)]/80">
                                  {report.title || 'Untitled Case'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--role-counselor-text)]/60">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Assigned to: <span className="font-medium text-[var(--role-counselor-text)]">{caseItem.assignedTo?.name || 'Unassigned'}</span>
                                  </span>
                                  <span>
                                    Resolution Date: {new Date(caseItem.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Link to={`/counselor/cases/${caseItem.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg transition-all duration-300">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View Case
                                </Button>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

export default CasesPage;
