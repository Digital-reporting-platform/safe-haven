import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { reportService } from '@/services/report';
import {
  getCaseMessages,
  countUnreadMessagesFromProfessionals,
} from '@/services/caseMessagingService';
import { useApp } from '@/components/AppContext';
import { calculateProgressPercentage, mapReportStatusToStep } from '@/utils/statusMapping';
import {
  Shield,
  MessageSquareText,
  FileText,
  ChevronDown,
  ChevronUp,
  Bell,
  MessageCircle,
  Clock,
  MapPin,
  Eye,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SurvivorReport = {
  id: string;
  title: string;
  description: string;
  status: string;
  caseAssignment?: {
    id: string;
  } | null;
};

type CaseUnreadInfo = {
  [caseId: string]: {
    unreadCount: number;
    totalMessages: number;
  };
};

export function MyCases() {
  const { t } = useTranslation();
  const { user } = useApp();
  const navigate = useNavigate();
  const [cases, setCases] = useState<SurvivorReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadInfo, setUnreadInfo] = useState<CaseUnreadInfo>({});
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await reportService.getMyReports();
        const casesData = response.data || [];
        setCases(casesData);

        // Fetch message counts for each case
        if (user?.id) {
          const unreadData: CaseUnreadInfo = {};
          for (const c of casesData) {
            if (c.caseAssignment?.id) {
              try {
                const messages = await getCaseMessages(c.caseAssignment.id);
                unreadData[c.id] = {
                  unreadCount: countUnreadMessagesFromProfessionals(
                    messages,
                    c.caseAssignment.id,
                    user.id
                  ),
                  totalMessages: messages.length,
                };
              } catch (err) {
                console.error(`Failed to load messages for case ${c.id}`, err);
              }
            }
          }
          setUnreadInfo(unreadData);
        }
      } catch (err) {
        console.error('Error loading cases');
      } finally {
        setIsLoading(false);
      }
    };
    loadCases();
  }, [user?.id]);

  if (isLoading) return <SimpleLoadingScreen />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'UNDER_INVESTIGATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ASSIGNED_TO_PROFESSIONAL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const toggleExpand = (caseId: string) => {
    setExpandedCaseId(expandedCaseId === caseId ? null : caseId);
  };

  return (
    <div className="min-h-screen bg-[var(--role-survivor-bg)] pb-20">
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--role-survivor-text)]">
                {t('survivor.myCases.title')}
              </h1>
              <p className="mt-1 text-[var(--role-survivor-text)]/70">
                {t('survivor.myCases.description')}
              </p>
            </div>
            <Link to="/report">
              <Button className="h-11 gap-2 rounded-xl bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] px-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <FileText className="h-4 w-4" />
                {t('survivor.myCases.newReport')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Cases List */}
        <div className="space-y-4">
          {cases.length > 0 ? (
            cases.map((c, index) => {
              const caseUnread = unreadInfo[c.id]?.unreadCount || 0;
              const totalMessages = unreadInfo[c.id]?.totalMessages || 0;
              
              // Check if there's an active conversation for smart progress calculation
              const hasActiveConversation = !!c.caseAssignment?.id || !!totalMessages || (
                c.status === 'ACTIVE' || 
                c.status === 'IN_PROGRESS' ||
                c.status === 'ASSIGNED_TO_PROFESSIONAL'
              );
              
              const progress = calculateProgressPercentage(c.status, hasActiveConversation);
              const isExpanded = expandedCaseId === c.id;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100"
                >
                  {/* Main Row - Always Visible */}
                  <div
                    className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                    onClick={() => toggleExpand(c.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon with badge */}
                      <div className="relative shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] flex items-center justify-center shadow-md">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        {caseUnread > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-md">
                            {caseUnread > 9 ? '9+' : caseUnread}
                          </span>
                        )}
                      </div>

                      {/* Case Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[var(--role-survivor-text)] truncate">
                            {c.title || t('survivor.myCases.incidentReport')}
                          </h3>
                          <Badge className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusColor(c.status)}`}>
                            {c.status.split('_').join(' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                          <span>ID: {c.id?.substring(0, 8)}...</span>
                          <span className="w-1 h-1 rounded-full bg-stone-300" />
                          <span>{progress}% {t('survivor.myCases.complete')}</span>
                          {totalMessages > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-stone-300" />
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {t('survivor.myCases.messages')} {totalMessages}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-stone-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="mt-3 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)]"
                        style={{ width: `${Math.max(5, progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-stone-100 bg-stone-50/50"
                    >
                      <div className="p-5 space-y-4">
                        {/* Description */}
                        <div>
                          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                            {t('survivor.myCases.caseDescription')}
                          </h4>
                          <p className="text-sm text-stone-700 leading-relaxed">
                            {c.description || t('survivor.myCases.noDescriptionProvided')}
                          </p>
                        </div>

                        {/* Case Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{t('survivor.myCases.submitted')}</span>
                            </div>
                            <p className="text-sm font-medium text-stone-700">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{t('survivor.myCases.status')}</span>
                            </div>
                            <p className="text-sm font-medium text-stone-700">
                              {mapReportStatusToStep(c.status, hasActiveConversation)}
                            </p>
                          </div>
                        </div>

                        {/* Message Alert */}
                        {caseUnread > 0 && (
                          <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              <Bell className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900">
                                {t('survivor.myCases.newMessageFromProfessional', { count: caseUnread, plural: caseUnread !== 1 ? 's' : '' })}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => navigate(`/survivor/case/${c.id}`)}
                            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] text-white font-medium shadow-md hover:shadow-lg transition-all"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('survivor.myCases.fullCaseDetails')}
                            {caseUnread > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                                {caseUnread}
                              </span>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/survivor/messages')}
                            className="h-11 px-4 rounded-xl border-2 border-[var(--role-survivor-primary)]/20 hover:bg-[var(--role-survivor-primary)]/5 transition-all relative"
                          >
                            <MessageSquareText className="h-5 w-5 text-[var(--role-survivor-primary)]" />
                            {caseUnread > 0 && (
                              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                                {caseUnread}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-stone-200 bg-white py-16 text-center shadow-md"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <FileText className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-stone-800">
                {t('survivor.myCases.noCasesYet')}
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-sm text-stone-500">
                {t('survivor.myCases.haventSubmittedReports')}
              </p>
              <Link to="/report">
                <Button className="h-11 gap-2 rounded-xl bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] px-6 text-white shadow-lg">
                  <FileText className="h-4 w-4" />
                  {t('survivor.myCases.submitFirstReport')}
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
