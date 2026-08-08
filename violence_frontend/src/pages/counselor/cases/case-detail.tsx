import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Users,
  Brain,
  Save,
  Image as ImageIcon,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { counselorService, CaseAssignment, Professional } from '@/services/counselorService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { STATUS_STEPS, mapReportStatusToStep, calculateProgressPercentage } from '@/utils/statusMapping';

function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Check if there's an active conversation - if there's any assignment or messages, it's active
  const hasActiveConversation = !!caseData?.assignedTo || !!caseData?.caseAssignmentId || (
    caseData?.status === 'ACTIVE' || 
    caseData?.status === 'IN_PROGRESS' ||
    caseData?.status === 'ASSIGNED_TO_PROFESSIONAL'
  );

  useEffect(() => {
    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const fetchCaseData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // Try to fetch as case assignment first
      let data;
      try {
        data = await counselorService.getCaseById(id);
      } catch {
        // If not found as case assignment, fetch as report
        const response = await counselorService.getUnassignedReports(1, 1000);
        const report = response.data.find((r: any) => r.id === id || r.report?.id === id);
        if (report) {
          data = {
            id: report.id,
            report: report.report || report,
            status: 'PENDING_REVIEW',
            priority: report.severity || 'MEDIUM',
            caseType: report.suggestedCaseType,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
          };
        }
      }
      
      setCaseData(data);

      // Fetch professionals based on ML suggestion
      if (data?.report?.suggestedCaseType || data?.caseType) {
        const caseType = data.report?.suggestedCaseType || data.caseType;
        const pros = await counselorService.getProfessionals(caseType);
        setProfessionals(pros);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load case';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCase = async () => {
    if (!selectedProfessional || !caseData) {
      toast.error('Please select a professional');
      return;
    }

    setIsAssigning(true);
    try {
      const reportId = caseData.report?.id || caseData.id;
      await counselorService.assignCase(reportId, {
        assignedToId: selectedProfessional,
        caseType: caseData.report?.suggestedCaseType || caseData.caseType,
        priority: caseData.report?.suggestedPriority || caseData.priority,
        notes: assignmentNotes || 'Case assigned by counselor',
      });

      toast.success('Case assigned successfully!');
      navigate('/counselor/cases?tab=assigned');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to assign case';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading case details...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Case not found</div>
      </div>
    );
  }

  const report = caseData.report || caseData;
  const isAssigned = caseData.status !== 'PENDING_REVIEW' && caseData.assignedTo;

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/counselor/cases">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cases
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {(() => {
                    // For anonymous reports, show tracking number
                    if (report.trackingNumber) {
                      return report.trackingNumber;
                    }
                    // For pending/unassigned cases
                    const id = caseData?.id || '';
                    if (typeof id === 'string' && id.startsWith('pending-')) {
                      return `Report #${id.replace('pending-', '').slice(0, 8)}`;
                    }
                    // For assigned cases
                    return `Case #${id.slice(0, 8)}`;
                  })()}
                </h1>
                <p className="text-slate-600">
                  {report.isAnonymous ? 'Anonymous Report' : report.title || 'Untitled Case'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(caseData.status)}
              {getSeverityBadge(report.severity || 'MEDIUM')}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Report Information */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-slate-800">Description</h4>
                  <p className="text-slate-600">{report.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Category</h4>
                    <Badge variant="outline">{report.category}</Badge>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Severity</h4>
                    {getSeverityBadge(report.severity || 'MEDIUM')}
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Date Submitted</h4>
                    <p className="text-sm text-slate-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Location</h4>
                    <p className="text-sm text-slate-600">{report.location || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="border-2 border-[var(--role-counselor-primary)]/20">
              <CardHeader className="bg-gradient-to-r from-[var(--role-counselor-primary)]/5 to-transparent pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--role-counselor-primary)]/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Case Progress</CardTitle>
                    <p className="text-xs text-slate-600">Track case status</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Current Status</span>
                    <span className="text-lg font-bold text-[var(--role-counselor-primary)]">
                      {mapReportStatusToStep(caseData.status, hasActiveConversation)}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${calculateProgressPercentage(caseData.status, hasActiveConversation)}%`,
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)]"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-600">Progress</span>
                    <span className="text-xs font-medium text-[var(--role-counselor-primary)]">
                      {calculateProgressPercentage(caseData.status, hasActiveConversation)}%
                    </span>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, stepIndex) => {
                      const currentStep = mapReportStatusToStep(caseData.status, hasActiveConversation);
                      const isCompleted = stepIndex <= STATUS_STEPS.indexOf(currentStep);
                      const isActive = stepIndex === STATUS_STEPS.indexOf(currentStep);

                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * stepIndex }}
                            className={`z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted
                                ? 'bg-[var(--role-counselor-primary)] border-[var(--role-counselor-primary)] text-white shadow-md'
                                : 'bg-white border-slate-300 text-slate-500'
                            } ${isActive ? 'ring-4 ring-[var(--role-counselor-primary)]/20 scale-110' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{stepIndex + 1}</span>
                            )}
                          </motion.div>
                          <span className={`text-[10px] font-medium whitespace-nowrap ${isCompleted ? 'text-[var(--role-counselor-primary)]' : 'text-slate-500'} ${isActive ? 'font-semibold' : ''}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ML Suggestion Section */}
            <Card className="border-2 border-[var(--role-counselor-primary)]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                  ML Classification & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Suggested Case Type</h4>
                    <Badge className="bg-[var(--role-counselor-primary)]/10 text-[var(--role-counselor-primary)]">
                      {report.suggestedCaseType}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Suggested Priority</h4>
                    {getSeverityBadge(report.suggestedPriority || 'MEDIUM')}
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Suggested Professional Type</h4>
                    <p className="text-sm text-slate-600">{report.suggestedProfessionalType || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Confidence Score</h4>
                    <p className="text-sm font-medium text-slate-800">
                      {Math.round((report.classificationScore || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            {report.evidenceFiles && report.evidenceFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Evidence Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {report.evidenceFiles.map((file: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <FileText className="mb-2 h-8 w-8 text-slate-400" />
                        <p className="text-sm font-medium text-slate-800">
                          {file.fileName || `Evidence ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignment Section - Only show if not assigned */}
            {!isAssigned && (
              <Card className="border-2 border-[var(--role-counselor-accent)]">
                <CardHeader>
                  <CardTitle className="text-[var(--role-counselor-accent)]">
                    🎯 Assign Case to Professional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="professional">Select Professional *</Label>
                    <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                      <SelectTrigger id="professional">
                        <SelectValue placeholder="Choose a professional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.length === 0 ? (
                          <div className="p-2 text-sm text-slate-500">
                            No professionals available
                          </div>
                        ) : (
                          professionals.map((pro) => (
                            <SelectItem key={pro.id} value={pro.id}>
                              {pro.name || `${pro.firstName} ${pro.lastName}`} - {pro.role}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-slate-500">
                      Pre-filled based on ML suggestion: {report.suggestedProfessionalType}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Assignment Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes for the assigned professional..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAssignCase}
                    disabled={!selectedProfessional || isAssigning}
                    className="w-full bg-[var(--role-counselor-primary)] hover:bg-[var(--role-counselor-primary)]/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isAssigning ? 'Assigning...' : 'Assign Case'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* After Assignment - Show assignment info */}
            {isAssigned && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Assignment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Assigned Professional</h4>
                    <p className="text-slate-600">{caseData.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">Status Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-600">
                          Created: {new Date(caseData.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-600">
                          Assigned: {new Date(caseData.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Reporter Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--role-counselor-primary)]/10">
                    <User className="h-8 w-8 text-[var(--role-counselor-primary)]" />
                  </div>
                  <h4 className="font-semibold text-slate-800">
                    {report.reporter?.firstName || 'Anonymous'} {report.reporter?.lastName || ''}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {report.reporter?.email || 'No contact information'}
                  </p>
                </div>
                {report.reporter?.phone && (
                  <div className="border-t border-slate-200 pt-3">
                    <p className="mb-1 text-xs text-slate-600">Phone</p>
                    <p className="text-sm">{report.reporter.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Case Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Risk Score</span>
                  <span className="text-lg font-bold text-red-600">
                    {report.riskScore || 0}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${
                      (report.riskScore || 0) > 70
                        ? 'bg-red-500'
                        : (report.riskScore || 0) > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${report.riskScore || 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {hasActiveConversation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-slate-600">
                    Communicate with the survivor and assigned professionals about this case.
                  </p>
                  <Button
                    onClick={() => {
                      // Navigate to the appropriate messages page based on user role
                      const user = JSON.parse(localStorage.getItem('user') || '{}');
                      if (user.role === 'MEDICAL_PROFESSIONAL') {
                        navigate('/medical-provider/messages');
                      } else if (user.role === 'LEGAL_ADVISOR') {
                        navigate('/legal/messages');
                      } else if (user.role === 'COUNSELOR') {
                        navigate('/counselor/messages');
                      } else {
                        navigate('/survivor/messages');
                      }
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Go to Messages
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailPage;
