import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Brain,
  Shield,
  FileText,
  Image,
  Video,
  Download,
  Eye,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  Users,
  Heart,
  Scale,
  Home,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

interface CaseDetailInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    type: string;
    timestamp: string;
    pseudonym: string;
    isNew: boolean;
    aiAnalysis: {
      classification: string;
      confidence: number;
      priority: 'Critical' | 'High' | 'Medium';
      rationale: string;
      suggestedRoute: string[];
    };
    evidence: Array<{
      id: string;
      type: 'image' | 'video' | 'document';
      name: string;
      size: string;
      timestamp: string;
      thumbnail?: string;
      hasBlur?: boolean;
    }>;
    security: {
      ipHash: string;
      location: string;
      riskScore: 'Low' | 'Medium' | 'High';
      submissionFrequency: string;
    };
    statement: string;
  };
  onAcceptCase: () => void;
  onMarkSuspicious: () => void;
  onEscalate: () => void;
  isDark: boolean;
}

export const CaseDetailInspector = ({
  isOpen,
  onClose,
  caseData,
  onAcceptCase,
  onMarkSuspicious,
  onEscalate,
  isDark,
}: CaseDetailInspectorProps) => {
  const [acceptedAISuggestions, setAcceptedAISuggestions] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    legal: false,
    medical: false,
  });
  const [assignments, setAssignments] = useState({
    legal: { assigned: false, provider: '', autoAssign: true },
    medical: { assigned: false, provider: '', autoAssign: true },
  });
  const [showFullStatement, setShowFullStatement] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState(false);

  // Case management state: timeline, notes, action plan, messages, referrals, audit trail
  const [timeline, setTimeline] = useState<
    Array<{ id: string; time: string; text: string }>
  >([
    { id: 't-1', time: caseData.timestamp, text: 'Report submitted' },
    {
      id: 't-2',
      time: new Date().toISOString(),
      text: `ML classified: ${caseData.aiAnalysis.classification}`,
    },
  ]);

  const [notes, setNotes] = useState<
    Array<{ id: string; text: string; private: boolean; timestamp: string }>
  >([]);
  const [plan, setPlan] = useState<
    Array<{
      id: string;
      title: string;
      status: 'Planned' | 'In Progress' | 'Completed';
    }>
  >([]);
  const [messages, setMessages] = useState<
    Array<{ id: string; from: string; text: string; timestamp: string }>
  >([]);
  const [referrals, setReferrals] = useState<
    Array<{
      id: string;
      provider: string;
      status: 'Referred' | 'Completed';
      timestamp: string;
    }>
  >([]);
  const [auditTrail, setAuditTrail] = useState<
    Array<{ id: string; actor: string; action: string; timestamp: string }>
  >([
    {
      id: 'a-1',
      actor: 'System',
      action: 'Case created',
      timestamp: caseData.timestamp,
    },
  ]);

  const addTimelineEntry = (text: string) => {
    const entry = {
      id: `t-${Date.now()}`,
      time: new Date().toISOString(),
      text,
    };
    setTimeline((s) => [entry, ...s]);
    setAuditTrail((a) => [
      {
        id: `a-${Date.now()}`,
        actor: 'You',
        action: text,
        timestamp: new Date().toISOString(),
      },
      ...a,
    ]);
  };

  const addNote = (text: string, isPrivate = true) => {
    const note = {
      id: `n-${Date.now()}`,
      text,
      private: isPrivate,
      timestamp: new Date().toISOString(),
    };
    setNotes((s) => [note, ...s]);
    addTimelineEntry(isPrivate ? 'Private note added' : 'Shared note added');
  };

  const addPlanItem = (title: string) => {
    const item = { id: `p-${Date.now()}`, title, status: 'Planned' as const };
    setPlan((s) => [item, ...s]);
    addTimelineEntry(`Intervention planned: ${title}`);
  };

  const sendMessage = (from: string, text: string) => {
    const msg = {
      id: `m-${Date.now()}`,
      from,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((s) => [msg, ...s]);
    addTimelineEntry(`Message from ${from}`);
  };

  const addReferral = (provider: string) => {
    const r = {
      id: `r-${Date.now()}`,
      provider,
      status: 'Referred' as const,
      timestamp: new Date().toISOString(),
    };
    setReferrals((s) => [r, ...s]);
    addTimelineEntry(`Referred to ${provider}`);
  };

  const updateStatus = (newStatus: string, reason?: string) => {
    addTimelineEntry(
      `Status updated to ${newStatus}${reason ? `: ${reason}` : ''}`
    );
    setAuditTrail((a) => [
      {
        id: `a-${Date.now()}`,
        actor: 'You',
        action: `Status -> ${newStatus}`,
        timestamp: new Date().toISOString(),
      },
      ...a,
    ]);
  };

  const specialists = {
    legal: [
      {
        id: '1',
        name: 'Sarah Chen, JD',
        status: 'Available',
        specialization: 'Domestic Violence',
      },
      {
        id: '2',
        name: 'Michael Rodriguez, Esq',
        status: 'Busy',
        specialization: 'Family Law',
      },
      {
        id: '3',
        name: 'Dr. Lisa Park',
        status: 'Available',
        specialization: 'Legal Advocacy',
      },
    ],
    medical: [
      {
        id: '1',
        name: 'Dr. James Wilson',
        status: 'Available',
        specialization: 'Trauma Care',
      },
      {
        id: '2',
        name: 'Nurse Patricia Moore',
        status: 'Available',
        specialization: 'Crisis Support',
      },
      {
        id: '3',
        name: 'Dr. Amanda Foster',
        status: 'Offline',
        specialization: 'Mental Health',
      },
    ],
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(caseData.id);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const handleAcceptAISuggestions = () => {
    setAcceptedAISuggestions(true);
    // Auto-assign based on AI suggestions
    const newAssignments = { ...assignments };
    caseData.aiAnalysis.suggestedRoute.forEach((route) => {
      const routeKey = route.toLowerCase() as keyof typeof assignments;
      if (specialists[routeKey]) {
        const availableSpecialist = specialists[routeKey].find(
          (s) => s.status === 'Available'
        );
        if (availableSpecialist) {
          newAssignments[routeKey] = {
            ...newAssignments[routeKey],
            assigned: true,
            provider: availableSpecialist.name,
          };
        }
      }
    });
    setAssignments(newAssignments);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAssignment = (
    category: keyof typeof assignments,
    providerId: string
  ) => {
    const provider = specialists[category].find((s) => s.id === providerId);
    if (provider) {
      setAssignments((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          assigned: true,
          provider: provider.name,
        },
      }));
    }
  };

  const isAssignmentComplete = Object.values(assignments).some(
    (a) => a.assigned
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col ${
              isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-white'
            } border-l shadow-2xl`}
          >
            {/* Sticky Header */}
            <div
              className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <code
                    className={`font-mono text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  >
                    CASE #{caseData.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="p-1"
                  >
                    {copiedCaseId ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Badge variant="destructive" className="mb-3">
                {caseData.type}
              </Badge>

              <div
                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {caseData.timestamp}
                  </span>
                  <span>{caseData.pseudonym}</span>
                  {caseData.isNew && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={onAcceptCase}
                >
                  Accept Case
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onMarkSuspicious}
                  >
                    Mark Suspicious
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={onEscalate}
                  >
                    Escalate Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* AI Intelligence Panel */}
              <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <h3
                    className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  >
                    ML Analysis
                  </h3>
                  <Badge variant="secondary">
                    {caseData.aiAnalysis.confidence}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div
                      className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      {caseData.aiAnalysis.classification}
                    </div>
                    <div
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      Priority:{' '}
                      <Badge
                        variant={
                          caseData.aiAnalysis.priority === 'Critical'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {caseData.aiAnalysis.priority}
                      </Badge>
                    </div>
                  </div>

                  <p
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {caseData.aiAnalysis.rationale}
                  </p>

                  <div
                    className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    <strong>Suggested Route:</strong>{' '}
                    {caseData.aiAnalysis.suggestedRoute.join(' + ')}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAcceptAISuggestions}
                      disabled={acceptedAISuggestions}
                    >
                      {acceptedAISuggestions
                        ? 'Suggestions Applied'
                        : 'Accept AI Suggestions'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOverride(!showOverride)}
                    >
                      Override Classification
                    </Button>
                  </div>

                  {showOverride && (
                    <div className="mt-3 space-y-2">
                      <select
                        className={`w-full rounded border p-2 ${
                          isDark
                            ? 'border-slate-600 bg-slate-800'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option>Select new classification...</option>
                        <option>Domestic Violence</option>
                        <option>Sexual Assault</option>
                        <option>Missing Person</option>
                        <option>Child Abuse</option>
                      </select>
                      <textarea
                        placeholder="Reason for override (required)"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className={`w-full rounded border p-2 text-sm ${
                          isDark
                            ? 'border-slate-600 bg-slate-800'
                            : 'border-slate-300 bg-white'
                        }`}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Case Management Tabs */}
              <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="survivor">Survivor</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="plan">Action Plan</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="comm">Communication</TabsTrigger>
                    <TabsTrigger value="referrals">Referrals</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Case Summary
                    </h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        <strong>Reported:</strong> {caseData.timestamp}
                      </div>
                      <div>
                        <strong>Type:</strong> {caseData.type} (ML:{' '}
                        {caseData.aiAnalysis.classification})
                      </div>
                      <div>
                        <strong>Priority:</strong>{' '}
                        {caseData.aiAnalysis.priority}
                      </div>
                      <div>
                        <strong>Description:</strong>
                        <div
                          className={`mt-2 rounded border p-3 ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white'}`}
                        >
                          {caseData.statement}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="survivor" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Survivor Profile (limited)
                    </h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        <strong>Pseudonym:</strong> {caseData.pseudonym}
                      </div>
                      <div>
                        <strong>Age range:</strong> Not shared
                      </div>
                      <div>
                        <strong>Gender:</strong> Not shared
                      </div>
                      <div>
                        <strong>Preferences:</strong> Language: Unknown •
                        Communication: In-app messages
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Case History / Timeline
                    </h4>
                    <div className="mt-3 space-y-2">
                      {timeline.map((t) => (
                        <div key={t.id} className="rounded border p-2 text-sm">
                          <div className="text-xs text-slate-500">
                            {new Date(t.time).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {t.text}
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add timeline entry..."
                          id="timeline-input"
                          className="flex-1 rounded border p-2 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById(
                              'timeline-input'
                            ) as HTMLInputElement | null;
                            if (el?.value) {
                              addTimelineEntry(el.value);
                              el.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Progress Notes / Session Notes
                    </h4>
                    <div className="mt-3 space-y-3">
                      <textarea
                        id="note-text"
                        placeholder="Write a private note..."
                        className={`w-full rounded border p-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white'}`}
                        rows={4}
                      ></textarea>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById(
                              'note-text'
                            ) as HTMLTextAreaElement | null;
                            if (el?.value) {
                              addNote(el.value, true);
                              el.value = '';
                            }
                          }}
                        >
                          Add Private Note
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById(
                              'note-text'
                            ) as HTMLTextAreaElement | null;
                            if (el?.value) {
                              addNote(el.value, false);
                              el.value = '';
                            }
                          }}
                        >
                          Add Shared Note
                        </Button>
                      </div>

                      <div className="mt-2 space-y-2">
                        {notes.map((n) => (
                          <div
                            key={n.id}
                            className="rounded border p-2 text-sm"
                          >
                            <div className="text-xs text-slate-500">
                              {new Date(n.timestamp).toLocaleString()} •{' '}
                              {n.private ? 'Counselor-only' : 'Shared'}
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-200">
                              {n.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="plan" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Action / Intervention Plan
                    </h4>
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <input
                          id="plan-input"
                          type="text"
                          placeholder="Add intervention..."
                          className="flex-1 rounded border p-2 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById(
                              'plan-input'
                            ) as HTMLInputElement | null;
                            if (el?.value) {
                              addPlanItem(el.value);
                              el.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="mt-2 space-y-2">
                        {plan.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <div>
                              <div className="text-sm text-slate-700 dark:text-slate-200">
                                {p.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.status}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPlan((s) =>
                                    s.map((i) =>
                                      i.id === p.id
                                        ? { ...i, status: 'In Progress' }
                                        : i
                                    )
                                  );
                                  addTimelineEntry(`Plan started: ${p.title}`);
                                }}
                              >
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setPlan((s) =>
                                    s.map((i) =>
                                      i.id === p.id
                                        ? { ...i, status: 'Completed' }
                                        : i
                                    )
                                  );
                                  addTimelineEntry(
                                    `Plan completed: ${p.title}`
                                  );
                                }}
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="evidence" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Evidence / Attachments
                    </h4>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {caseData.evidence.map((file) => (
                        <div
                          key={file.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md ${
                            isDark
                              ? 'border-slate-600 hover:border-slate-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {file.type === 'image' && (
                              <Image className="h-4 w-4" />
                            )}
                            {file.type === 'video' && (
                              <Video className="h-4 w-4" />
                            )}
                            {file.type === 'document' && (
                              <FileText className="h-4 w-4" />
                            )}
                            <span
                              className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                              {file.type.toUpperCase()}
                            </span>
                          </div>
                          <div
                            className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {file.name}
                          </div>
                          <div
                            className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-1`}
                          >
                            {file.size} • {file.timestamp}
                          </div>
                          {file.hasBlur && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Auto-blurred
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <div
                      className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-3`}
                    >
                      🔒 End-to-end encrypted • Chain of custody verified
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">Upload</Button>
                      <Button variant="outline" size="sm">
                        Request Additional
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="comm" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Communication / Messages
                    </h4>
                    <div className="mt-3 space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className="rounded border p-2">
                          <div className="text-xs text-slate-500">
                            {m.from} • {new Date(m.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {m.text}
                          </div>
                        </div>
                      ))}

                      <div className="mt-2 flex gap-2">
                        <input
                          id="msg-input"
                          className="flex-1 rounded border p-2 text-sm"
                          placeholder="Write a secure message..."
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById(
                              'msg-input'
                            ) as HTMLInputElement | null;
                            if (el?.value) {
                              sendMessage('You', el.value);
                              el.value = '';
                            }
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="referrals" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Referrals & Services
                    </h4>
                    <div className="mt-3 space-y-3">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Suggested Providers
                      </div>
                      {specialists.legal
                        .concat(specialists.medical)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <div>
                              <div className="text-sm text-slate-700 dark:text-slate-200">
                                {s.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {s.specialization}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => addReferral(s.name)}
                              >
                                Refer
                              </Button>
                            </div>
                          </div>
                        ))}

                      <div className="mt-3">
                        <div className="text-sm font-semibold">
                          Active Referrals
                        </div>
                        <div className="mt-2 space-y-2">
                          {referrals.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between rounded border p-2"
                            >
                              <div>
                                <div className="text-sm text-slate-700 dark:text-slate-200">
                                  {r.provider}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {r.status} •{' '}
                                  {new Date(r.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setReferrals((s) =>
                                      s.map((i) =>
                                        i.id === r.id
                                          ? { ...i, status: 'Completed' }
                                          : i
                                      )
                                    )
                                  }
                                >
                                  Mark Completed
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="status" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Status Update
                    </h4>
                    <div className="mt-3 space-y-3">
                      <select
                        id="status-select"
                        className="w-full rounded border p-2 text-sm"
                      >
                        <option value="In Counseling">In Counseling</option>
                        <option value="Referred to Legal">
                          Referred to Legal
                        </option>
                        <option value="Closed - Recovery">
                          Closed - Recovery
                        </option>
                        <option value="On Hold">On Hold</option>
                      </select>
                      <textarea
                        id="status-reason"
                        placeholder="Reason (optional)"
                        className="w-full rounded border p-2 text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const sel = document.getElementById(
                              'status-select'
                            ) as HTMLSelectElement | null;
                            const txt = document.getElementById(
                              'status-reason'
                            ) as HTMLTextAreaElement | null;
                            if (sel) {
                              updateStatus(sel.value, txt?.value);
                            }
                          }}
                        >
                          Update Status
                        </Button>
                        <Button variant="ghost" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audit" className="mt-4">
                    <h4
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Audit Trail
                    </h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      {auditTrail.map((a) => (
                        <div key={a.id} className="rounded border p-2">
                          <div className="text-xs text-slate-500">
                            {a.actor} • {new Date(a.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {a.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sticky Footer */}
            <div
              className={`border-t p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <Button
                className="mb-2 w-full"
                disabled={!isAssignmentComplete}
                onClick={onAcceptCase}
              >
                Confirm and Accept Case
              </Button>
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Close Inspector
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
