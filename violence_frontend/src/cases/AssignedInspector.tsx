import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Shield,
  MapPin,
  Phone,
  UserPlus,
  RotateCcw,
  XCircle,
  Bell,
  Calendar,
  Activity,
  Eye,
  FileText,
  Home,
  Scale,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
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

interface AssignedInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    pseudonym: string;
    type: string;
    timeAssigned: string;
    specialists: {
      legal: {
        name: string;
        avatar?: string;
        currentTask: string;
        progress: number;
        lastUpdate: string;
        nextCheckpoint: string;
        status: 'active' | 'waiting' | 'overdue';
      };
      medical: {
        name: string;
        avatar?: string;
        currentTask: string;
        progress: number;
        lastUpdate: string;
        nextCheckpoint: string;
        status: 'active' | 'waiting' | 'overdue';
      };
    };
    updates: Array<{
      id: string;
      type: 'legal' | 'medical';
      specialist: string;
      message: string;
      timestamp: string;
    }>;
    survivorStatus: {
      lastSafetyCheck: string;
      locationEnabled: boolean;
      lastLocation?: string;
      messagesExchanged: number;
    };
    checklist: Array<{
      id: string;
      item: string;
      completed: boolean;
      specialist: 'legal' | 'medical';
    }>;
  };
  onRecallToReview: () => void;
  onForceClose: () => void;
  onEscalateToPolice: () => void;
  onReplaceSpecialist: (type: 'legal' | 'medical') => void;
  onAddSpecialist: () => void;
  isDark: boolean;
}

export const AssignedInspector = ({
  isOpen,
  onClose,
  caseData,
  onRecallToReview,
  onForceClose,
  onEscalateToPolice,
  onReplaceSpecialist,
  onAddSpecialist,
  isDark,
}: AssignedInspectorProps) => {
  const [activeTab, setActiveTab] = useState('specialists');

  const getSpecialistIcon = (type: string) => {
    switch (type) {
      case 'legal':
        return Scale;
      case 'medical':
        return Activity;
      default:
        return Users;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-100';
      case 'waiting':
        return 'text-amber-600 bg-amber-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'legal':
        return '⚖️';
      case 'medical':
        return '🏥';
      default:
        return '📋';
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
                ? 'border-stone-700/50 bg-stone-900/95'
                : 'border-stone-200/50 bg-white/95'
            }`}
          >
            {/* Header */}
            <div
              className={`border-b p-6 ${isDark ? 'border-stone-700/50' : 'border-stone-200/50'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#C15B3E]/10 p-2 text-[#C15B3E]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
                    >
                      {caseData.pseudonym}
                    </h2>
                    <p
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      {caseData.type} Case
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <Badge className="border-[#C15B3E]/20 bg-[#C15B3E]/10 px-3 py-1 text-[#C15B3E]">
                  ASSIGNED TO SPECIALISTS
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span
                    className={isDark ? 'text-stone-400' : 'text-stone-600'}
                  >
                    {caseData.timeAssigned} since assignment
                  </span>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                </div>
                <span
                  className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  2/2 providers active
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onRecallToReview}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Recall to Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={onForceClose}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Force Close
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full flex-col"
              >
                <TabsList
                  className={`mx-6 mt-4 ${isDark ? 'bg-stone-800/50' : 'bg-stone-100/50'}`}
                >
                  <TabsTrigger value="specialists">Specialists</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="survivor">Survivor</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="specialists" className="mt-0 space-y-4">
                    {Object.entries(caseData.specialists).map(
                      ([type, specialist]) => {
                        const Icon = getSpecialistIcon(type);
                        return (
                          <Card
                            key={type}
                            className={
                              isDark
                                ? 'border-stone-700/50 bg-stone-800/50'
                                : 'border-stone-200 bg-white'
                            }
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-[#C15B3E] text-sm text-white">
                                      {specialist.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3
                                      className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
                                    >
                                      {specialist.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span
                                        className={`text-sm capitalize ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
                                      >
                                        {type} Specialist
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge
                                  className={getStatusColor(specialist.status)}
                                >
                                  {specialist.status.toUpperCase()}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <p
                                  className={`mb-1 text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                                >
                                  Current Task
                                </p>
                                <p
                                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                                >
                                  {specialist.currentTask}
                                </p>
                              </div>

                              <div>
                                <div className="mb-2 flex items-center justify-between">
                                  <span
                                    className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                                  >
                                    Progress
                                  </span>
                                  <span
                                    className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
                                  >
                                    {specialist.progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={specialist.progress}
                                  className="h-2"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p
                                    className={`mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                                  >
                                    Last Update
                                  </p>
                                  <p
                                    className={
                                      isDark
                                        ? 'text-slate-400'
                                        : 'text-slate-600'
                                    }
                                  >
                                    {specialist.lastUpdate}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    className={`mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                                  >
                                    Next Checkpoint
                                  </p>
                                  <p
                                    className={
                                      isDark
                                        ? 'text-slate-400'
                                        : 'text-slate-600'
                                    }
                                  >
                                    {specialist.nextCheckpoint}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Message
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Bell className="mr-2 h-4 w-4" />
                                  Bump
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    onReplaceSpecialist(
                                      type as 'legal' | 'medical'
                                    )
                                  }
                                >
                                  Replace
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onAddSpecialist}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Specialist
                    </Button>
                  </TabsContent>

                  <TabsContent value="updates" className="mt-0 space-y-4">
                    <div className="space-y-3">
                      {caseData.updates?.map((update) => (
                        <div
                          key={update.id}
                          className={`rounded-lg border p-4 ${isDark ? 'border-stone-700/50 bg-stone-800/50' : 'border-stone-200 bg-white'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">
                              {getUpdateIcon(update.type)}
                            </span>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span
                                  className={`font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
                                >
                                  {update.specialist}
                                </span>
                                <span
                                  className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-500'}`}
                                >
                                  {update.timestamp}
                                </span>
                              </div>
                              <p
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {update.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="survivor" className="mt-0 space-y-4">
                    <Card
                      className={
                        isDark
                          ? 'border-stone-700/50 bg-stone-800/50'
                          : 'border-stone-200 bg-white'
                      }
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Safety Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              isDark ? 'text-slate-300' : 'text-slate-700'
                            }
                          >
                            Last Safety Check
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {caseData.survivorStatus.lastSafetyCheck}
                          </Badge>
                        </div>

                        {caseData.survivorStatus.locationEnabled && (
                          <div className="flex items-center justify-between">
                            <span
                              className={
                                isDark ? 'text-slate-300' : 'text-slate-700'
                              }
                            >
                              Location
                            </span>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span
                                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {caseData.survivorStatus.lastLocation ||
                                  'Location enabled'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span
                            className={
                              isDark ? 'text-slate-300' : 'text-slate-700'
                            }
                          >
                            Messages Today
                          </span>
                          <Badge variant="outline">
                            {caseData.survivorStatus.messagesExchanged}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={onEscalateToPolice}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Escalate to Police
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="checklist" className="mt-0 space-y-4">
                    <div className="space-y-3">
                      {caseData.checklist?.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${isDark ? 'border-stone-700/50 bg-stone-800/50' : 'border-stone-200 bg-white'}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 ${item.completed ? 'text-emerald-600' : 'text-slate-400'}`}
                          />
                          <div className="flex-1">
                            <p
                              className={`${item.completed ? 'line-through' : ''} ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                            >
                              {item.item}
                            </p>
                            <p
                              className={`text-xs capitalize ${isDark ? 'text-stone-500' : 'text-stone-500'}`}
                            >
                              {item.specialist} specialist
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
