import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  MessageSquare,
  Phone,
  FileText,
  Image,
  Video,
  Edit3,
  Send,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  Shield,
  ArrowRight,
  Check,
  Square,
  CheckSquare,
  Activity,
  Calendar,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface UnderReviewInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    pseudonym: string;
    type: string;
    timeInReview: string;
    specialists: {
      legal: {
        name: string;
        status: 'waiting' | 'completed' | 'in-progress';
        message: string;
      };
      medical: {
        name: string;
        status: 'waiting' | 'completed' | 'in-progress';
        message: string;
      };
      shelter?: {
        name: string;
        status: 'waiting' | 'completed' | 'in-progress';
        message: string;
      };
    };
    tasks: Array<{ id: string; text: string; completed: boolean }>;
    chatHistory: Array<{
      id: string;
      sender: 'manager' | 'survivor';
      message: string;
      timestamp: string;
    }>;
    survivorLastActive: string;
    evidence: Array<{
      id: string;
      type: 'image' | 'video' | 'document';
      name: string;
      annotations?: string;
    }>;
    timeline: Array<{
      id: string;
      action: string;
      timestamp: string;
      actor: string;
    }>;
  };
  onMarkResolved: () => void;
  onEscalate: () => void;
  onTransfer: () => void;
  onMoveToAssigned: () => void;
  isDark: boolean;
}

export const UnderReviewInspector = ({
  isOpen,
  onClose,
  caseData,
  onMarkResolved,
  onEscalate,
  onTransfer,
  onMoveToAssigned,
  isDark,
}: UnderReviewInspectorProps) => {
  const [activeTab, setActiveTab] = useState<
    'coordination' | 'evidence' | 'timeline'
  >('coordination');
  const [newMessage, setNewMessage] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    specialists: true,
    tasks: true,
    notes: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'waiting':
        return 'text-amber-500';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '🟢';
      case 'in-progress':
        return '🔵';
      case 'waiting':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const toggleTask = (taskId: string) => {
    // Task toggle logic would go here
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
            className={`fixed top-0 right-0 z-50 flex h-full w-[500px] flex-col ${
              isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-white'
            } border-l shadow-2xl`}
          >
            {/* Header */}
            <div
              className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600 px-3 py-1 text-white">
                      UNDER REVIEW
                    </Badge>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                className={`mb-2 font-mono text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
              >
                CASE #{caseData.id} - {caseData.pseudonym}
              </div>

              <div
                className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time in review: {caseData.timeInReview}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={onMarkResolved}
                >
                  Mark Resolved
                </Button>
                <Button variant="outline" onClick={onEscalate}>
                  Escalate
                </Button>
                <Button variant="outline" onClick={onTransfer}>
                  Transfer
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div
              className={`flex border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              {[
                { id: 'coordination', label: 'Coordination', icon: Users },
                { id: 'evidence', label: 'Evidence', icon: FileText },
                { id: 'timeline', label: 'Timeline', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? `border-b-2 border-amber-500 ${isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`
                      : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'coordination' && (
                <div className="space-y-6 p-6">
                  {/* Specialist Assignment Status */}
                  <div>
                    <button
                      onClick={() => toggleSection('specialists')}
                      className={`mb-4 flex w-full items-center justify-between ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      <h3 className="font-semibold">
                        Specialist Assignment Status
                      </h3>
                      {expandedSections.specialists ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedSections.specialists && (
                      <div className="space-y-3">
                        {Object.entries(caseData.specialists).map(
                          ([type, specialist]) => (
                            <div
                              key={type}
                              className={`rounded-lg border p-4 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">
                                    {type}:
                                  </span>
                                  <span
                                    className={
                                      isDark
                                        ? 'text-slate-300'
                                        : 'text-slate-700'
                                    }
                                  >
                                    {specialist.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {getStatusIcon(specialist.status)}
                                  </span>
                                  <span
                                    className={`text-sm ${getStatusColor(specialist.status)}`}
                                  >
                                    {specialist.message}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                >
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Message
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                >
                                  Reassign
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks Checklist */}
                  <div>
                    <button
                      onClick={() => toggleSection('tasks')}
                      className={`mb-4 flex w-full items-center justify-between ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      <h3 className="font-semibold">Pending Tasks</h3>
                      {expandedSections.tasks ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedSections.tasks && (
                      <div className="space-y-2">
                        {caseData.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3"
                          >
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`${task.completed ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                              {task.completed ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                            <span
                              className={`text-sm ${task.completed ? 'text-slate-500 line-through' : isDark ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Private Notes */}
                  <div>
                    <button
                      onClick={() => toggleSection('notes')}
                      className={`mb-4 flex w-full items-center justify-between ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      <h3 className="font-semibold">Private Case Notes</h3>
                      {expandedSections.notes ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedSections.notes && (
                      <textarea
                        name="privateNotes"
                        value={privateNotes}
                        onChange={(e) => setPrivateNotes(e.target.value)}
                        placeholder="Internal strategy notes (not shared with survivor)..."
                        className={`w-full rounded-lg border p-3 text-sm ${
                          isDark
                            ? 'border-slate-600 bg-slate-800 text-slate-200'
                            : 'border-slate-300 bg-white text-slate-800'
                        }`}
                        rows={4}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      Evidence Files ({caseData.evidence.length})
                    </h3>
                    <Button size="sm" variant="outline">
                      <Upload className="mr-1 h-3 w-3" />
                      Request Additional
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {caseData.evidence.map((file) => (
                      <div
                        key={file.id}
                        className={`rounded-lg border p-4 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
                      >
                        <div className="mb-2 flex items-center gap-3">
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
                            className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {file.name}
                          </span>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>

                        {file.annotations && (
                          <div
                            className={`rounded p-2 text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                          >
                            <div className="mb-1 flex items-center gap-1">
                              <Edit3 className="h-3 w-3" />
                              <span className="font-medium">Private Note:</span>
                            </div>
                            {file.annotations}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          Add Annotation
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4 p-6">
                  <h3
                    className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  >
                    Activity Timeline
                  </h3>

                  <div className="space-y-3">
                    {caseData.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          {index < caseData.timeline.length - 1 && (
                            <div
                              className={`h-8 w-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            {event.action}
                          </p>
                          <p
                            className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                          >
                            {event.actor} • {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`border-t p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={onMoveToAssigned}
                >
                  Move to Assigned
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={onMarkResolved}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
