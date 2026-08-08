import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Search,
  Send,
  Stethoscope,
  Lock,
  Shield,
  EyeOff,
  Phone,
  Paperclip,
  MoreVertical,
  User,
  Clock,
  AlertCircle,
  Plus,
  Save,
  X,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api/client';
import { useApp } from '@/components/AppContext';

type CaseItem = {
  id: string;
  caseType: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  report: {
    id: string;
    title: string;
    description: string;
    isAnonymous: boolean;
    trackingNumber?: string;
    reporter?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
    } | null;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
};

type CaseComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isInternal: boolean;
  isSystemMessage?: boolean;
  user?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  author?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
};

const Messaging = () => {
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [draft, setDraft] = useState('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [isInternal, setIsInternal] = useState(false);

  const filteredCases = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return cases;
    return cases.filter((item) => {
      const clientName = item.report.isAnonymous
        ? `Anonymous (${item.report.trackingNumber || 'N/A'})`
        : `${item.report.reporter?.firstName || ''} ${item.report.reporter?.lastName || ''}`.trim();
      return (
        clientName.toLowerCase().includes(key) ||
        item.caseType.toLowerCase().includes(key) ||
        item.report.title?.toLowerCase().includes(key)
      );
    });
  }, [cases, search]);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) || null,
    [cases, selectedCaseId]
  );

  const loadCases = async () => {
    try {
      // Get medical provider appointments/cases from the backend
      const response = await api.get('/medical-provider/appointments');
      // Extract unique cases from appointments
      const appointments = response.data?.appointments || [];
      const uniqueCases = appointments.reduce((acc: CaseItem[], appt: any) => {
        if (appt.caseId && !acc.find((c) => c.id === appt.caseId)) {
          acc.push({
            id: appt.caseId,
            caseType: appt.type || 'MEDICAL_SUPPORT',
            priority: appt.priority || 'MEDIUM',
            status: appt.status || 'ACTIVE',
            createdAt: appt.createdAt,
            updatedAt: appt.updatedAt,
            report: {
              id: appt.reportId,
              title: appt.patientName || 'Untitled Case',
              description: appt.notes || '',
              isAnonymous: appt.isAnonymous || false,
              trackingNumber: appt.trackingNumber,
              reporter: appt.reporter,
            },
          });
        }
        return acc;
      }, []);
      setCases(uniqueCases);
      if (!selectedCaseId && uniqueCases.length > 0) {
        setSelectedCaseId(uniqueCases[0].id);
      }
    } catch (error) {
      console.error('Failed to load cases', error);
      toast.error('Failed to load medical cases');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (caseId: string) => {
    if (!caseId) return;
    try {
      const response = await api.get(`/cases/${caseId}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to load comments', error);
      toast.error('Failed to load case comments');
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadComments(selectedCaseId);
    } else {
      setComments([]);
    }
  }, [selectedCaseId]);

  const handleAddComment = async () => {
    const content = draft.trim();
    if (!selectedCaseId || !content) return;

    try {
      setSending(true);
      await api.post(`/cases/${selectedCaseId}/comments`, {
        content,
        isInternal,
      });
      setDraft('');
      setIsInternal(false);
      setIsAddingNote(false);
      await loadComments(selectedCaseId);
      toast.success('Case note added successfully');
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add case note');
    } finally {
      setSending(false);
    }
  };

  const getClientName = (caseItem: CaseItem) => {
    if (caseItem.report.isAnonymous) {
      return `Anonymous (${caseItem.report.trackingNumber || 'N/A'})`;
    }
    return `${caseItem.report.reporter?.firstName || ''} ${caseItem.report.reporter?.lastName || ''}`.trim() || 'Unknown';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getCommentAuthorName = (comment: CaseComment) => {
    const author = comment.user || comment.author;
    if (!author) return 'System';
    return `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Panel - Conversation List */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-600 shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Medical Communications
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Secure patient messaging & case coordination
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200">
                  <Shield className="mr-1 h-3 w-3" />
                  HIPAA Compliant
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                  <Input
                    placeholder="Search patients by name or case type..."
                    className="pl-10 border-slate-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Case List */}
            <div className="space-y-3">
              {loading ? (
                <Card className="shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600"></div>
                    <p className="text-slate-500">Loading medical cases...</p>
                  </CardContent>
                </Card>
              ) : filteredCases.length === 0 ? (
                <Card className="shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Stethoscope className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-700">
                      No Assigned Medical Cases
                    </h3>
                    <p className="max-w-sm mx-auto text-sm text-slate-500">
                      You don't have any assigned medical cases yet. Cases requiring medical support will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCases.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCaseId === item.id
                        ? 'border-teal-300 bg-teal-50/50 shadow-md'
                        : 'border-slate-200 shadow-sm'
                    }`}
                    onClick={() => setSelectedCaseId(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          item.report.isAnonymous
                            ? 'bg-amber-100'
                            : 'bg-linear-to-br from-teal-100 to-teal-200'
                        }`}>
                          <User className={`h-5 w-5 ${item.report.isAnonymous ? 'text-amber-600' : 'text-teal-600'}`} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 truncate">
                              {getClientName(item)}
                            </h3>
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatTimestamp(item.updatedAt)}
                            </span>
                          </div>

                          <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-normal">
                              {item.caseType}
                            </Badge>
                            {item.report.isAnonymous && (
                              <Badge className="bg-amber-100 text-amber-800 text-xs font-normal">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Anonymous
                              </Badge>
                            )}
                            <Badge className={`text-xs font-normal ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-600 line-clamp-2">
                            {item.report.title || (
                              <span className="italic text-slate-400">No case title</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Case Comments Section */}
            {selectedCase && (
              <Card className="shadow-md">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        selectedCase.report.isAnonymous
                          ? 'bg-amber-100'
                          : 'bg-linear-to-br from-teal-100 to-teal-200'
                      }`}>
                        <User className={`h-5 w-5 ${selectedCase.report.isAnonymous ? 'text-amber-600' : 'text-teal-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Case Notes & Updates
                        </CardTitle>
                        <p className="text-xs text-slate-500">
                          {getClientName(selectedCase)} • {selectedCase.caseType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingNote(true)}
                        disabled={isAddingNote}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Note
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Add Note Form */}
                  {isAddingNote && (
                    <div className="border-b border-slate-100 p-4 bg-slate-50">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Add a case note or update..."
                        className="min-h-[100px] resize-none border-slate-200 focus:border-teal-500 focus:ring-teal-500 mb-3"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span>Internal note (not visible to client)</span>
                        </label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingNote(false);
                              setDraft('');
                              setIsInternal(false);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAddComment}
                            disabled={!draft.trim() || sending}
                            className="bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {sending ? 'Saving...' : 'Save Note'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="mb-3 h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No case notes yet</p>
                        <p className="text-sm text-slate-400">
                          Add notes to document your medical assessment and recommendations
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => {
                        // System message styling (like assignment notifications)
                        if (comment.isSystemMessage) {
                          return (
                            <div key={comment.id} className="flex justify-center my-4">
                              <div className="flex items-center gap-3 rounded-full bg-linear-to-r from-slate-100 to-stone-100 px-5 py-2.5 shadow-sm border border-slate-200">
                                <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center">
                                  <Bot className="h-3.5 w-3.5 text-slate-600" />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium text-slate-700">{comment.content}</span>
                                  <span className="ml-2 text-xs text-slate-400">{formatTimestamp(comment.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Regular comment
                        return (
                          <div
                            key={comment.id}
                            className={`rounded-lg border p-4 ${
                              comment.isInternal
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">
                                  {getCommentAuthorName(comment)}
                                </span>
                                {comment.isInternal && (
                                  <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                                    Internal
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs font-normal">
                                  {comment.user?.role || comment.author?.role || 'Medical Professional'}
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatTimestamp(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Info & Stats */}
          <div className="space-y-6">
            {/* Security Info */}
            <Card className="shadow-sm border-teal-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-teal-500" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <EyeOff className="h-4 w-4 text-emerald-500" />
                  <span>Auto-deleted after 30 days</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>HIPAA compliant storage</span>
                </div>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  All patient communications are encrypted and comply with healthcare privacy regulations.
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-slate-700">
                  <Phone className="mr-2 h-4 w-4 text-teal-500" />
                  Start Video Consultation
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700">
                  <Paperclip className="mr-2 h-4 w-4 text-teal-500" />
                  Attach Medical Records
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700">
                  <Stethoscope className="mr-2 h-4 w-4 text-teal-500" />
                  View Patient History
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Communication Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    Active Conversations
                  </span>
                  <span className="font-semibold text-slate-800">{cases.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Avg. Response Time
                  </span>
                  <span className="font-semibold text-emerald-600">&lt; 2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    Anonymous Cases
                  </span>
                  <span className="font-semibold text-slate-800">
                    {cases.filter(c => c.report.isAnonymous).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="shadow-sm bg-linear-to-br from-teal-50 to-white border-teal-100">
              <CardContent className="p-4">
                <h4 className="font-medium text-teal-800 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Professional Guidelines
                </h4>
                <ul className="text-sm text-teal-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    Maintain patient confidentiality at all times
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    Respond within 24 hours for non-urgent cases
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    Use clear, professional language
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    Document all clinical recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;

