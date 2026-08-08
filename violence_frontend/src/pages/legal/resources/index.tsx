import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  ExternalLink,
  Library,
  Scale,
  Shield,
  ArrowRight,
  Tag,
  Info
} from 'lucide-react';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const Resources = () => {
  const [resources, setResources] = useState<
    Array<{ id: string; title: string; category: string; type: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getResources();
        setResources(data);
      } catch (error: any) {
        console.error('Failed to load resources', error);
        toast.error(error?.message || 'Failed to load resources');
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
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--colors-accent-highlight)]/10 to-[var(--colors-primary-cta)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-legal-bg)] to-[var(--colors-olive-5)] p-4 shadow-lg">
              <Library className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)]">
                Legal Resources
              </h1>
              <p className="text-[var(--colors-body-text)] mt-1">
                Templates, guides, and legal reference materials
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
          <Card className="border-0 bg-gradient-to-r from-[#414435] to-[#414435]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Resources</p>
                  <p className="text-3xl font-bold text-white">{resources.length}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Library className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#6B705C] to-[#6B705C]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Categories</p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(resources.map(r => r.category)).size}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#DDA15E] to-[#DDA15E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Templates</p>
                  <p className="text-3xl font-bold text-white">
                    {resources.filter(r => r.type?.toLowerCase().includes('template')).length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#414435]/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#414435]/20 p-2">
                    <BookOpen className="h-5 w-5 text-[#414435]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#414435]">
                    Available Resources
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-100 px-3 py-1">
                    <span className="text-sm text-[#6B705C]">{resources.length} items</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#414435] border-t-transparent"></div>
                  <p className="mt-4 text-[#6B705C]">Loading resources...</p>
                </div>
              ) : resources.length === 0 ? (
                <div className="py-12 text-center">
                  <Library className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-[#6B705C]">No resources available.</p>
                  <p className="text-sm text-[#6B705C]/70 mt-1">
                    Legal templates and guides will appear here when available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource, idx) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex items-start gap-4 rounded-xl p-4 border border-slate-200 bg-slate-50/50 transition-all duration-300 hover:bg-slate-100/80 hover:shadow-md cursor-pointer"
                    >
                      <div className="rounded-lg bg-[#414435]/10 p-3 shrink-0">
                        <FileText className="h-5 w-5 text-[#414435]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[#414435] truncate group-hover:text-[#6B705C] transition-colors">
                            {resource.title}
                          </h4>
                          <Badge className={`${
                            resource.type?.toLowerCase().includes('template')
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : resource.type?.toLowerCase().includes('guide')
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                          } px-2 py-1 text-xs shrink-0`}>
                            {resource.type || 'Document'}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#6B705C] mt-1">{resource.category}</p>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="rounded-lg bg-[#414435]/10 p-2 hover:bg-[#414435]/20 transition-colors">
                          <ExternalLink className="h-4 w-4 text-[#414435]" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50/80 to-blue-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Legal Templates
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B705C] text-sm leading-relaxed">
                Access standardized legal document templates including protection orders, 
                consent forms, and legal advocacy letters. All templates are reviewed by 
                legal professionals.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#414435]">
                <span>Browse templates</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Info className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Reference Guides
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B705C] text-sm leading-relaxed">
                Comprehensive guides on legal procedures, survivor rights, and advocacy 
                best practices. Keep updated with the latest legal resources for 
                supporting survivors.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#414435]">
                <span>View guides</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources;
