import { useEffect, useState } from 'react';
import { useApp } from '@/components/AppContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Users,
  Shield,
  Search,
  Plus,
  LifeBuoy,
  Mic,
  FileText,
  Sparkles,
  MessageCircle,
  BookOpen,
  Target,
  ArrowRight,
  Bell,
  MessageSquareText,
  Eye,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { reportService } from '@/services/report';
import {
  getCaseMessages,
  countUnreadMessagesFromProfessionals,
  type CaseMessage,
} from '@/services/caseMessagingService';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateProgressPercentage } from '@/utils/statusMapping';

// 1. Define the interface outside the component
interface ResourceItem {
  icon: any;
  title: string;
  description: string;
  available: boolean;
}

export function VictimDashboardPage() {
  const { t } = useTranslation();
  // --- ALL HOOKS MUST BE HERE ---
  const { user } = useApp();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentCaseAssignmentId, setCurrentCaseAssignmentId] = useState<string | null>(null);

  // 2. Navigation handler inside the component
  const handleNewReport = () => {
    navigate('/report');
  };

  // 3. Data fetching inside the component
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await reportService.getMyReports(1, 10);
        const cases = response.data || [];
        setMyCases(cases);

        // Fetch messages for the current case if available
        const currentCase = cases[0];
        if (currentCase?.caseAssignment?.id) {
          const assignmentId = currentCase.caseAssignment.id;
          setCurrentCaseAssignmentId(assignmentId);

          try {
            const messagesData = await getCaseMessages(assignmentId);
            setMessages(messagesData);

            // Count unread messages from professionals
            if (user?.id) {
              const unread = countUnreadMessagesFromProfessionals(
                messagesData,
                assignmentId,
                user.id
              );
              setUnreadCount(unread);
            }
          } catch (msgErr) {
            console.error('Failed to load messages', msgErr);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.id]);

  // 4. Local UI Data
  const availableResources: ResourceItem[] = [
    {
      icon: Heart,
      title: t('survivor.dashboard.crisisHotline'),
      description: t('survivor.dashboard.emergencySupport'),
      available: true,
    },
    {
      icon: Users,
      title: t('survivor.dashboard.peerSupportGroups'),
      description: t('survivor.dashboard.weeklyVirtualMeetings'),
      available: true,
    },
    {
      icon: Shield,
      title: t('survivor.dashboard.legalAid'),
      description: t('survivor.dashboard.freeLegalConsultation'),
      available: false,
    },
  ];

  const quickActions = [
    {
      icon: FileText,
      title: t('survivor.dashboard.newReport'),
      description: t('survivor.dashboard.fileReport'),
      path: '/report',
      color: 'from-[var(--role-survivor-primary)] to-[var(--role-survivor-primary)]/80',
    },
    {
      icon: MessageCircle,
      title: t('survivor.dashboard.communityPost'),
      description: t('survivor.dashboard.communityPostDesc'),
      path: '/survivor/community-forum',
      color: 'from-[var(--role-survivor-text)] to-[var(--role-survivor-text)]/80',
    },
    {
      icon: Mic,
      title: t('survivor.dashboard.voiceMessage'),
      description: t('survivor.dashboard.voiceMessageDesc'),
      path: '/survivor/messages',
      color: 'from-[var(--colors-golden-6)] to-[var(--colors-golden-6)]/80',
    },
    {
      icon: Sparkles,
      title: t('survivor.dashboard.empowerment'),
      description: t('survivor.dashboard.empowermentDesc'),
      path: '/survivor/empowerment',
      color: 'from-[var(--colors-terracotta-4)] to-[var(--role-survivor-primary)]',
    },
  ];


  if (isLoading) return <SimpleLoadingScreen />;

  const currentCase = myCases[0];

  // Check if there's an active conversation for progress calculation
  const hasActiveConversation = !!currentCaseAssignmentId || !!currentCase?.assignedTo || (
    currentCase?.status === 'ACTIVE' || 
    currentCase?.status === 'IN_PROGRESS' ||
    currentCase?.status === 'ASSIGNED_TO_PROFESSIONAL'
  );

  return (
    <div className="min-h-screen bg-[var(--role-survivor-bg)] p-6">
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--role-survivor-text)]">
              {t('survivor.dashboard.welcomeBack', { name: user?.firstName || 'Survivor' })}
            </h1>
            <p className="text-[var(--role-survivor-text)]/70">
              {t('survivor.dashboard.safetyMatters')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="gap-2 border-[var(--role-survivor-text)]/30 text-[var(--role-survivor-text)] hover:bg-[var(--role-survivor-text)]/10"
            >
              <Search className="h-4 w-4" /> {t('survivor.dashboard.search')}
            </Button>
            <Button
              className="gap-2 bg-[var(--role-survivor-primary)] hover:bg-[var(--colors-terracotta-6)] text-white"
              onClick={handleNewReport}
            >
              <Plus className="h-4 w-4" /> {t('survivor.dashboard.newReport')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {currentCase ? (
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] flex items-center justify-center shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1 -right-1"
                          >
                            <div className="relative">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-[var(--role-survivor-text)]">
                        {t('survivor.dashboard.activeCase')}
                      </CardTitle>
                      <p className="text-sm text-[var(--role-survivor-text)]/60 line-clamp-1">
                        {currentCase.title || t('survivor.dashboard.incidentReport')}
                      </p>
                    </div>
                  </div>
                  <Badge className="rounded-lg bg-[var(--role-survivor-accent)]/20 text-[var(--role-survivor-text)] border-0 px-3 py-1 text-xs font-semibold">
                    {currentCase.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--role-survivor-text)]/70 font-medium">{t('survivor.dashboard.caseProgress')}</span>
                    <span className="text-[var(--role-survivor-primary)] font-bold">
                      {calculateProgressPercentage(currentCase?.status, hasActiveConversation)}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[var(--colors-ivory-3)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${calculateProgressPercentage(currentCase?.status, hasActiveConversation)}%`,
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)]"
                    />
                  </div>
                </div>

                {/* Message Notification Banner */}
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Bell className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900">
                              {t('survivor.dashboard.newMessageFromProfessional', { count: unreadCount, plural: unreadCount !== 1 ? 's' : '' })}
                            </p>
                            <p className="text-xs text-amber-700/70 mt-0.5">
                              {t('survivor.dashboard.tapBelowToView')}
                            </p>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => navigate(`/survivor/case/${currentCase.id}`)}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('survivor.dashboard.viewDetails')}
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/survivor/messages')}
                    className="h-12 px-4 rounded-xl border-2 border-[var(--role-survivor-primary)]/20 hover:bg-[var(--role-survivor-primary)]/5 hover:border-[var(--role-survivor-primary)]/40 transition-all relative"
                  >
                    <MessageSquareText className="h-5 w-5 text-[var(--role-survivor-primary)]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none bg-white p-12 text-center shadow-md">
              <p className="text-[var(--role-survivor-text)]/60">
                {t('survivor.dashboard.noActiveReports')}
              </p>
            </Card>
          )}

          {/* Quick Actions - Solid Gradient Cards */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-[var(--role-survivor-text)]">
              {t('survivor.dashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path}>
                  <Card
                    className="group cursor-pointer border-0 p-0 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className={`bg-gradient-to-r p-4 ${action.color}`}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">
                            {action.title}
                          </h3>
                          <p className="text-sm text-white/80">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--role-survivor-text)]/70">
                        {t('survivor.dashboard.goTo')}
                      </span>
                      <div className="h-6 w-6 rounded-full bg-[var(--colors-ivory-2)] flex items-center justify-center group-hover:bg-[var(--role-survivor-accent)] transition-colors">
                        <ArrowRight className="h-3 w-3 text-[var(--role-survivor-text)] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--role-survivor-text)]">{t('survivor.dashboard.availableResources')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableResources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-[var(--colors-ivory-1)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <resource.icon className="h-5 w-5 text-[var(--role-survivor-text)]/60" />
                      <div>
                        <p className="text-sm font-medium text-[var(--role-survivor-text)]">
                          {resource.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-[var(--role-survivor-text)]/60">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${resource.available ? 'bg-[var(--role-survivor-accent)]' : 'bg-[var(--colors-ivory-4)]'}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden border-0 text-white shadow-lg"
            style={{
              background: 'linear-gradient(to bottom right, var(--role-survivor-primary), var(--role-survivor-accent))',
            }}
          >
            <CardContent className="relative z-10 p-6">
              <div className="mb-4 flex items-center gap-3">
                <LifeBuoy className="h-8 w-8 text-white" />
                <div>
                  <h3 className="text-lg font-semibold">{t('survivor.dashboard.needHelp')}</h3>
                  <p className="text-sm opacity-90">{t('survivor.dashboard.supportAvailable')}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full border-0 bg-white font-bold text-[var(--role-survivor-primary)] hover:bg-[var(--colors-ivory-1)]"
              >
                {t('survivor.dashboard.contactSupport')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
