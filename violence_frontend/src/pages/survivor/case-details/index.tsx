import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  PlusCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
  Shield,
  TrendingUp,
  MapPin,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { reportService } from '@/services/report';
import { toast } from 'sonner';
import { useApp } from '@/components/AppContext';

import { STATUS_STEPS, mapReportStatusToStep, calculateProgressPercentage } from '@/utils/statusMapping';

export function CaseDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [successMsg, setSuccessMsg] = useState(false);
  const [caseItem, setCaseItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseAssignmentId, setCaseAssignmentId] = useState<string | null>(null);

  // Check if there's an active conversation - if there's a caseAssignmentId or messages, it's active
  const hasActiveConversation = useMemo(() => {
    return !!caseAssignmentId || !!caseItem?.assignedTo || (
      caseItem?.status === 'ACTIVE' || 
      caseItem?.status === 'IN_PROGRESS' ||
      caseItem?.status === 'ASSIGNED_TO_PROFESSIONAL'
    );
  }, [caseAssignmentId, caseItem?.assignedTo, caseItem?.status]);

  useEffect(() => {
    const loadCase = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await reportService.getReportById(id);
        setCaseItem(response);

        // Get case assignment ID from the response if available
        if (response.caseAssignment?.id) {
          setCaseAssignmentId(response.caseAssignment.id);
        }
      } catch (err) {
        console.error('Error loading case:', err);
        setError('Failed to load case details');
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const handleSave = () => {
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  if (isLoading) {
    return <SimpleLoadingScreen />;
  }

  if (error || !caseItem) {
    return (
      <div className="min-h-screen pb-20 font-sans bg-background">
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              {t('survivor.caseDetails.caseNotFound')}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {error || t('survivor.caseDetails.noAccess')}
            </p>
            <Button
              onClick={() => navigate('/survivor/my-cases')}
              className="rounded-full transition-transform hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('survivor.caseDetails.backToMyCases')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans bg-background">
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-12">
        {/* Header */}
        <header className="mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase border-primary bg-primary/10 text-primary"
            >
              {t('survivor.caseDetails.title')}
            </Badge>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/survivor/my-cases')}
              className="flex items-center gap-2 rounded-full transition-all hover:scale-105 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              {t('survivor.caseDetails.back')}
            </Button>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl leading-tight font-medium text-foreground md:text-5xl"
          >
            Case <span className="font-semibold text-primary">{caseItem.id?.substring(0, 8) || caseItem.id}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg leading-relaxed font-normal text-muted-foreground"
          >
            {t('survivor.caseDetails.caseDescription')}
          </motion.p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Case Info Cards */}
          <div className="space-y-6 lg:col-span-2">
            {/* Case Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-xl">
                {/* Top gradient bar */}
                <div className="h-2 w-full bg-gradient-to-r from-primary to-[var(--role-survivor-accent)]" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t('survivor.caseDetails.caseId')}: {caseItem.id?.substring(0, 12)}...
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {caseItem.title || t('survivor.caseDetails.incidentReport')}
                      </CardTitle>
                    </div>
                    <Badge className="rounded-lg px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                      {mapReportStatusToStep(caseItem.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Submitted on {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  {caseItem.status && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Backend Status:</span>
                      <code className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{caseItem.status}</code>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Case Progress</CardTitle>
                      <p className="text-xs text-muted-foreground">Track your case status</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                      <span className="text-lg font-bold text-primary">
                        {mapReportStatusToStep(caseItem.status, hasActiveConversation)}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${calculateProgressPercentage(caseItem.status, hasActiveConversation)}%`,
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--role-survivor-accent)]"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-primary">
                        {calculateProgressPercentage(caseItem.status, hasActiveConversation)}%
                      </span>
                    </div>
                  </div>

                  {/* Step indicators */}
                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, stepIndex) => {
                        const currentStep = mapReportStatusToStep(caseItem.status, hasActiveConversation);
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
                                  ? 'bg-primary border-primary text-white shadow-md'
                                  : 'bg-white border-muted text-muted-foreground'
                              } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{stepIndex + 1}</span>
                              )}
                            </motion.div>
                            <span className={`text-[10px] font-medium whitespace-nowrap ${isCompleted ? 'text-primary' : 'text-muted-foreground'} ${isActive ? 'font-semibold' : ''}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Case Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Case Information</CardTitle>
                      <p className="text-xs text-muted-foreground">Detailed report details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="grid gap-4">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {caseItem.description || caseItem.incidentDescription || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-muted/30 p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Location
                        </h4>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">
                            {caseItem.location || caseItem.region || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-muted/30 p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Submitted
                        </h4>
                        <p className="text-sm font-medium text-foreground">
                          {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <p className="text-xs text-muted-foreground">Manage your case</p>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Button className="w-full h-12 gap-2 rounded-xl bg-primary text-white font-medium shadow-md hover:shadow-lg transition-all">
                    <PlusCircle className="h-5 w-5" />
                    Add Update
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2 rounded-xl border-2 font-medium transition-all hover:bg-muted"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2 rounded-xl border-2 border-red-200 text-red-600 font-medium transition-all hover:bg-red-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Close Case
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold">Need Help?</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have any questions about your case, you can always reach out to your assigned professional.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/survivor/messages')}
                    className="w-full h-11 gap-2 rounded-xl border-primary/30 bg-white font-medium"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Go to Messages
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
