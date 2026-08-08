import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  TrendingUp,
  Clock,
  FileText,
  Target,
  Award,
  ArrowRight,
  Calendar,
  Scale
} from 'lucide-react';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const Outcomes = () => {
  const [data, setData] = useState<{
    totalCases: number;
    completedCases: number;
    successRate: number;
    averageResolutionDays: number;
    recentOutcomes: Array<{
      id: string;
      reportId: string;
      title: string;
      completedAt: string;
      priority: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await legalWorkflowService.getOutcomes();
        setData(result);
      } catch (error: any) {
        console.error('Failed to load outcomes', error);
        toast.error(error?.message || 'Failed to load outcomes');
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
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--colors-accent-highlight)]/10 to-[var(--colors-primary-cta)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-legal-bg)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--colors-accent-highlight)] to-[var(--colors-primary-cta)] p-4 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)]">
                Case Outcomes
              </h1>
              <p className="text-[var(--colors-body-text)] mt-1">
                Performance metrics and completed case outcomes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-0 bg-gradient-to-r from-[#414435] to-[#414435]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Cases</p>
                  <p className="text-3xl font-bold text-white">{data?.totalCases || 0}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#C15B3E] to-[#C15B3E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Completed</p>
                  <p className="text-3xl font-bold text-white">{data?.completedCases || 0}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#6B705C] to-[#6B705C]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Success Rate</p>
                  <p className="text-3xl font-bold text-white">{data?.successRate || 0}%</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#DDA15E] to-[#DDA15E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Avg Resolution</p>
                  <p className="text-3xl font-bold text-white">{data?.averageResolutionDays || 0}d</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Outcomes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#DDA15E]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#DDA15E]/20 p-2">
                  <Award className="h-5 w-5 text-[#DDA15E]" />
                </div>
                <CardTitle className="text-xl font-bold text-[#414435]">
                  Recent Outcomes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#414435] border-t-transparent"></div>
                  <p className="mt-4 text-[#6B705C]">Loading outcomes...</p>
                </div>
              ) : (data?.recentOutcomes || []).length === 0 ? (
                <div className="py-12 text-center">
                  <Scale className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-[#6B705C]">No completed legal outcomes yet.</p>
                  <p className="text-sm text-[#6B705C]/70 mt-1">
                    Completed cases will appear here with their outcomes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(data?.recentOutcomes || []).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group rounded-xl p-5 border border-slate-200 bg-slate-50/50 transition-all duration-300 hover:bg-slate-100/80 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-emerald-100 p-3 shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#414435] truncate group-hover:text-[#6B705C] transition-colors">
                              {item.title}
                            </h4>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                              <span className="flex items-center gap-1.5 text-[#6B705C]">
                                <Calendar className="h-3.5 w-3.5" />
                                Completed {new Date(item.completedAt).toLocaleDateString()}
                              </span>
                              <span className="text-[#6B705C]/60">|</span>
                              <span className="text-[#6B705C]">Report: {item.reportId.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Badge className={`${
                            item.priority?.toLowerCase().includes('critical') || item.priority?.toLowerCase().includes('high')
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : item.priority?.toLowerCase().includes('medium')
                                ? 'bg-amber-100 text-amber-700 border-amber-300'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          } px-2 py-1 text-xs`}>
                            {item.priority || 'Normal'}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Performance Highlights
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#6B705C] text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-emerald-600" />
                  {data?.successRate || 0}% success rate across all legal cases
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-emerald-600" />
                  Average resolution time of {data?.averageResolutionDays || 0} days
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-emerald-600" />
                  {data?.completedCases || 0} cases successfully resolved
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-50/80 to-slate-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Outcome Categories
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#6B705C] text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-slate-600" />
                  Protection orders obtained
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-slate-600" />
                  Legal representation secured
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-slate-600" />
                  Case settlements reached
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Outcomes;
