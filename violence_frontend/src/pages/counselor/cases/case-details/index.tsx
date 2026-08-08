import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle,
  FileText,
  MessageSquare,
  Edit,
  Download,
  Phone,
  Mail,
  MapPin,
  Activity,
  History,
  Plus,
  Save,
  X,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CasePriority,
  CASE_PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/types/case';
import { Link } from 'react-router-dom';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const fetchCaseData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await counselorService.getCaseById(id);
      setCaseData(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load case';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading case details...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Case not found</div>
      </div>
    );
  }

  const priority = PRIORITY_COLORS[caseData.priority as CasePriority] || PRIORITY_COLORS.MEDIUM;
  const riskLevel =
    (caseData.report?.riskScore || 0) > 80
      ? 'text-red-600'
      : (caseData.report?.riskScore || 0) > 50
        ? 'text-amber-600'
        : 'text-emerald-600';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <FileText className="h-4 w-4" />;
      case 'milestone':
        return <CheckCircle className="h-4 w-4" />;
      case 'legal':
        return <Shield className="h-4 w-4" />;
      case 'assessment':
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'creation':
        return 'bg-blue-500';
      case 'milestone':
        return 'bg-emerald-500';
      case 'legal':
        return 'bg-(--role-counselor-accent)';
      case 'assessment':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
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
                  {caseData.report?.title || 'Untitled Case'}
                </h1>
                <p className="text-slate-600">
                  Case #{caseData.id} • {caseData.report?.isAnonymous 
                    ? `Anonymous (Ref: ${caseData.report?.trackingNumber || 'N/A'})` 
                    : `${caseData.report?.reporter?.firstName || ''} ${caseData.report?.reporter?.lastName || ''}`.trim() || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${priority.bg} ${priority.text} border-${priority.text}/20`}
              >
                {CASE_PRIORITY_LABELS[caseData.priority as CasePriority] || caseData.priority}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {caseData.status}
              </Badge>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Case Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Case Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-slate-800">
                      Case Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span>{caseData.caseType?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Created:</span>
                        <span>{formatDate(caseData.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Updated:</span>
                        <span>{formatDate(caseData.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assigned To:</span>
                        <span>{caseData.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-slate-800">
                      Risk Assessment
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Risk Score:
                        </span>
                        <span className={`text-xl font-bold ${riskLevel}`}>
                          {caseData.report?.riskScore || 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full ${(caseData.report?.riskScore || 0) > 80 ? 'bg-red-500' : (caseData.report?.riskScore || 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${caseData.report?.riskScore || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500">
                        High risk - immediate intervention required
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-slate-800">
                    Description
                  </h4>
                  <p className="text-slate-600">{caseData.report?.description || 'No description provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Case Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Case Notes & Updates</CardTitle>
                  <Button onClick={() => setIsAddingNote(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingNote && (
                  <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <Textarea
                      placeholder="Add a new case note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setIsAddingNote(false)}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Note
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingNote(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {caseData.report?.caseComments?.map((note: any) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {note.author?.name || 'System'}
                          </span>
                          {note.isInternal && (
                            <Badge
                              variant="outline"
                              className="text-xs text-red-600"
                            >
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800">
                    {caseData.report?.isAnonymous 
                      ? `Anonymous User` 
                      : `${caseData.report?.reporter?.firstName || ''} ${caseData.report?.reporter?.lastName || ''}`.trim() || 'Unknown'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {caseData.report?.isAnonymous 
                      ? `Tracking: ${caseData.report?.trackingNumber || 'N/A'}` 
                      : (caseData.report?.reporter?.email || 'No email provided')}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{caseData.report?.location || 'Location not specified'}</span>
                  </div>
                  {caseData.report?.reporter?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{caseData.report.reporter.phone}</span>
                    </div>
                  )}
                  {caseData.report?.reporter?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{caseData.report.reporter.email}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <p className="mb-1 text-xs text-slate-600">
                    Category
                  </p>
                  <p className="text-sm">
                    {caseData.report?.category || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Client
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Session
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Flag className="mr-2 h-4 w-4" />
                  Escalate Priority
                </Button>
              </CardContent>
            </Card>

            {/* Case Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Case Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        Case created
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(caseData.createdAt)}
                      </p>
                    </div>
                  </div>
                  {caseData.status === 'ACTIVE' && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          Case assigned to professional
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(caseData.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">No documents attached</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailsPage;
