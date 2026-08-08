import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Download,
  Eye,
  Lock,
  Calendar,
  Archive,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

interface ResolvedInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    pseudonym: string;
    type: string;
    resolvedDate: string;
    totalDuration: string;
    outcome: 'successful' | 'transferred' | 'withdrawn' | 'escalated';
    outcomeDescription: string;
    finalReport: {
      summary: string;
      servicesProvided: string[];
      followUpRequired: boolean;
      followUpNotes?: string;
    };
    timeline: Array<{
      id: string;
      stage: 'received' | 'under-review' | 'assigned' | 'resolved';
      action: string;
      timestamp: string;
      actor: string;
      duration?: string;
    }>;
    specialists: {
      legal?: {
        name: string;
        organization: string;
        servicesProvided: string[];
        outcome: string;
        finalNotes: string;
      };
      medical?: {
        name: string;
        organization: string;
        servicesProvided: string[];
        outcome: string;
        finalNotes: string;
      };
    };
    evidence: Array<{
      id: string;
      type: 'image' | 'document' | 'audio' | 'video';
      name: string;
      size: string;
      timestamp: string;
      archived: boolean;
    }>;
    metrics: {
      responseTime: string;
      resolutionTime: string;
      specialistEngagement: number;
      survivorSatisfaction?: number;
    };
    auditTrail: Array<{
      id: string;
      action: string;
      actor: string;
      timestamp: string;
      details: string;
    }>;
  };
  onReopen: () => void;
  onArchive: () => void;
  onExportRecord: () => void;
  isDark: boolean;
}

export const ResolvedInspector = ({
  isOpen,
  onClose,
  caseData,
  onReopen,
  onArchive,
  onExportRecord,
  isDark,
}: ResolvedInspectorProps) => {
  const [activeTab, setActiveTab] = useState('summary');

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'successful':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'transferred':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'withdrawn':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSpecialistIcon = (type: string) => {
    switch (type) {
      case 'legal':
        return '⚖️';
      case 'medical':
        return '🏥';
      default:
        return '👤';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 z-50 h-full w-[800px] overflow-y-auto border-l shadow-2xl backdrop-blur-xl ${
              isDark
                ? 'border-slate-700/50 bg-slate-900/95'
                : 'border-slate-200/50 bg-white/95'
            }`}
          >
            {/* Header */}
            <div
              className={`border-b p-6 ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    >
                      {caseData.pseudonym}
                    </h2>
                    <p
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      {caseData.type} Case - Forensic Record
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <Badge
                  className={`px-3 py-1 ${getOutcomeColor(caseData.outcome)}`}
                >
                  CASE RESOLVED - {caseData.outcome.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span
                    className={isDark ? 'text-slate-400' : 'text-slate-600'}
                  >
                    Resolved: {caseData.resolvedDate}
                  </span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span
                    className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Total Duration:
                  </span>
                  <span
                    className={isDark ? 'text-slate-400' : 'text-slate-600'}
                  >
                    {caseData.totalDuration}
                  </span>
                </div>
                <div>
                  <span
                    className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Case ID:
                  </span>
                  <span
                    className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {caseData.id}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onExportRecord}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Record
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full flex-col"
              >
                <TabsList
                  className={`mx-6 mt-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}
                >
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="specialists">Specialists</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                <div className="flex-1 p-6">
                  <TabsContent value="summary" className="mt-0 space-y-4">
                    <Card
                      className={
                        isDark
                          ? 'border-slate-700/50 bg-slate-800/50'
                          : 'border-slate-200 bg-white'
                      }
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Case Outcome
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4
                            className={`mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            Resolution Summary
                          </h4>
                          <p
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                          >
                            {caseData.finalReport.summary}
                          </p>
                        </div>

                        <div>
                          <h4
                            className={`mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            Services Provided
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {caseData.finalReport.servicesProvided.map(
                              (service, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {service}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        {caseData.finalReport.followUpRequired && (
                          <div>
                            <h4
                              className={`mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              Follow-up Required
                            </h4>
                            <p
                              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                              {caseData.finalReport.followUpNotes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card
                      className={
                        isDark
                          ? 'border-slate-700/50 bg-slate-800/50'
                          : 'border-slate-200 bg-white'
                      }
                    >
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            Response Time
                          </p>
                          <p
                            className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {caseData.metrics.responseTime}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            Resolution Time
                          </p>
                          <p
                            className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {caseData.metrics.resolutionTime}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            Specialist Engagement
                          </p>
                          <p
                            className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {caseData.metrics.specialistEngagement}/3
                          </p>
                        </div>
                        {caseData.metrics.survivorSatisfaction && (
                          <div>
                            <p
                              className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              Survivor Satisfaction
                            </p>
                            <p
                              className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                            >
                              {caseData.metrics.survivorSatisfaction}/5
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0 space-y-3">
                    {caseData.timeline.map((event) => (
                      <div
                        key={event.id}
                        className={`rounded-lg border p-4 ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              event.stage === 'resolved'
                                ? 'bg-emerald-100 text-emerald-600'
                                : event.stage === 'assigned'
                                  ? 'bg-blue-100 text-blue-600'
                                  : event.stage === 'under-review'
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <h4
                                className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                              >
                                {event.action}
                              </h4>
                              <span
                                className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                              >
                                {event.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                By {event.actor}
                              </p>
                              {event.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {event.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="specialists" className="mt-0 space-y-4">
                    {Object.entries(caseData.specialists).map(
                      ([type, specialist]) => (
                        <Card
                          key={type}
                          className={
                            isDark
                              ? 'border-slate-700/50 bg-slate-800/50'
                              : 'border-slate-200 bg-white'
                          }
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getSpecialistIcon(type)}
                              </span>
                              <div>
                                <h3
                                  className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                                >
                                  {specialist.name}
                                </h3>
                                <p
                                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                                >
                                  {specialist.organization}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4
                                className={`mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                              >
                                Services Provided
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {specialist.servicesProvided.map(
                                  (service, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {service}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <h4
                                className={`mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                              >
                                Outcome
                              </h4>
                              <p
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {specialist.outcome}
                              </p>
                            </div>

                            <div>
                              <h4
                                className={`mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                              >
                                Final Notes
                              </h4>
                              <p
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {specialist.finalNotes}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </TabsContent>

                  <TabsContent value="evidence" className="mt-0 space-y-3">
                    {caseData.evidence.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-4 ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <div>
                              <h4
                                className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                              >
                                {item.name}
                              </h4>
                              <p
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {item.size} • {item.timestamp}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.archived && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="mr-1 h-3 w-3" />
                                Archived
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="audit" className="mt-0 space-y-3">
                    {caseData.auditTrail.map((entry) => (
                      <div
                        key={entry.id}
                        className={`rounded-lg border p-4 ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                            >
                              {entry.action}
                            </h4>
                            <p
                              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}
                            >
                              {entry.details}
                            </p>
                            <p
                              className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-2`}
                            >
                              By {entry.actor} • {entry.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
