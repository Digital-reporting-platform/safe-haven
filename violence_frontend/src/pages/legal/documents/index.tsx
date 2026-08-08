import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  FileText,
  File,
  Download,
  Clock,
  Folder,
  FilePlus,
  Shield,
  ArrowRight,
  FileSearch
} from 'lucide-react';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const Documents = () => {
  const [docs, setDocs] = useState<
    Array<{
      id: string;
      reportId: string;
      caseTitle: string;
      name: string;
      fileType: string;
      url: string;
      uploadedAt: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getDocuments();
        setDocs(data);
      } catch (error: any) {
        console.error('Failed to load legal documents', error);
        toast.error(error?.message || 'Failed to load legal documents');
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
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--colors-olive-5)]/10 to-[var(--role-legal-bg)]/10 blur-3xl" />
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
            <div className="rounded-2xl bg-gradient-to-r from-[var(--colors-olive-5)] to-[var(--role-legal-bg)] p-4 shadow-lg">
              <Folder className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)]">
                Legal Documents
              </h1>
              <p className="text-[var(--colors-body-text)] mt-1">
                Manage evidence and files for your assigned cases
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
                  <p className="text-sm font-medium text-white/80">Total Documents</p>
                  <p className="text-3xl font-bold text-white">{docs.length}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#6B705C] to-[#6B705C]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Evidence Files</p>
                  <p className="text-3xl font-bold text-white">
                    {docs.filter(d => d.fileType?.toLowerCase().includes('pdf') || d.fileType?.toLowerCase().includes('image')).length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#DDA15E] to-[#DDA15E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Linked Cases</p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(docs.map(d => d.caseTitle)).size}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <FileSearch className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#6B705C]/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#6B705C]/20 p-2">
                    <FileText className="h-5 w-5 text-[#6B705C]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#414435]">
                    Document Library
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-100 px-3 py-1">
                    <span className="text-sm text-[#6B705C]">{docs.length} files</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#414435] border-t-transparent"></div>
                  <p className="mt-4 text-[#6B705C]">Loading documents...</p>
                </div>
              ) : docs.length === 0 ? (
                <div className="py-12 text-center">
                  <Folder className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-[#6B705C]">No legal documents available yet.</p>
                  <p className="text-sm text-[#6B705C]/70 mt-1">
                    Documents linked to your cases will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {docs.map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex items-start gap-4 rounded-xl p-4 border border-slate-200 bg-slate-50/50 transition-all duration-300 hover:bg-slate-100/80 hover:shadow-md"
                    >
                      <div className="rounded-lg bg-[#6B705C]/10 p-3 shrink-0">
                        <File className="h-5 w-5 text-[#6B705C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[#414435] truncate group-hover:text-[#6B705C] transition-colors">
                            {doc.name}
                          </h4>
                          <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs shrink-0">
                            {doc.fileType || 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#6B705C] mt-1">{doc.caseTitle}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-[#6B705C]/70">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(doc.uploadedAt).toLocaleString()}
                          </span>
                          <span>ID: {doc.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="rounded-lg bg-[#414435]/10 p-2 cursor-pointer hover:bg-[#414435]/20 transition-colors">
                          <Download className="h-4 w-4 text-[#414435]" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Info Cards */}
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
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Secure Storage
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B705C] text-sm leading-relaxed">
                All documents are stored securely with encryption. Evidence files are 
                protected and accessible only to authorized legal personnel.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#414435]">
                <span>Security details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-50/80 to-amber-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <FilePlus className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Upload Guidelines
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#6B705C] text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  Supported formats: PDF, DOCX, JPG, PNG
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  Maximum file size: 25MB per document
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  All uploads are logged for audit compliance
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Documents;
