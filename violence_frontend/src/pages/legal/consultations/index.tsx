import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Users, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const Consultations = () => {
  const [items, setItems] = useState<
    Array<{
      id: string;
      caseId: string;
      topic: string;
      scheduledAt: string;
      mode: string;
      patientName: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getConsultations();
        setItems(data);
      } catch (error: any) {
        console.error('Failed to load consultations', error);
        toast.error(error?.message || 'Failed to load consultations');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-legal-bg)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--colors-primary-cta)]/10 to-[var(--colors-accent-highlight)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--colors-olive-5)] to-[var(--role-legal-bg)] p-4 shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)]">
                Legal Consultations
              </h1>
              <p className="text-[var(--colors-body-text)] mt-1">
                Manage consultations and appointments with survivors
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card className="border-0 bg-gradient-to-r from-[var(--role-legal-bg)] to-[var(--colors-olive-7)] shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Consultations</p>
                  <p className="text-3xl font-bold text-white">{items.length}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#C15B3E] to-[#C15B3E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Video Sessions</p>
                  <p className="text-3xl font-bold text-white">
                    {items.filter(i => i.mode?.toLowerCase().includes('video')).length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#DDA15E] to-[#DDA15E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Unique Survivors</p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(items.map(i => i.patientName)).size}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consultations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#414435]">Upcoming Consultations</h2>
            {isLoading && <span className="text-sm text-[#6B705C]">Loading...</span>}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#414435] border-t-transparent"></div>
              <p className="mt-4 text-[#6B705C]">Loading consultations...</p>
            </div>
          ) : items.length === 0 ? (
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-[#6B705C]">No consultations available yet for your legal assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group border-0 bg-white/80 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base text-[#414435]">
                          <div className="rounded-lg bg-[#6B705C]/10 p-2">
                            <Video className="h-4 w-4 text-[#6B705C]" />
                          </div>
                          {item.mode}
                        </CardTitle>
                        <Badge variant="outline" className="border-[#6B705C]/20 text-[#6B705C]">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(item.scheduledAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Users className="h-4 w-4 text-[#6B705C] mt-0.5" />
                          <div>
                            <p className="text-xs text-[#6B705C]">Survivor</p>
                            <p className="text-sm font-medium text-[#414435]">{item.patientName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-[#6B705C] mt-0.5" />
                          <div>
                            <p className="text-xs text-[#6B705C]">Topic</p>
                            <p className="text-sm font-medium text-[#414435]">{item.topic}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-[#6B705C] mt-0.5" />
                          <div>
                            <p className="text-xs text-[#6B705C]">Scheduled</p>
                            <p className="text-sm font-medium text-[#414435]">
                              {new Date(item.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Card className="border-0 bg-gradient-to-br from-white/80 to-slate-50/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#414435]/10 p-2">
                  <Calendar className="h-5 w-5 text-[#414435]" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Consultation Workflow
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B705C] text-sm leading-relaxed">
                New legal/combined cases automatically appear here with schedule placeholders based on due dates. 
                Survivors can request consultations through their portal, and they will be routed to your dashboard.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#414435]">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white/80 to-slate-50/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#6B705C]/10 p-2">
                  <Users className="h-5 w-5 text-[#6B705C]" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Survivor Access
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B705C] text-sm leading-relaxed">
                Survivors routed by ML to legal support are included in these consultation records. 
                Each consultation is linked to their case file for complete case management.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#414435]">
                <span>View all survivors</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Consultations;
