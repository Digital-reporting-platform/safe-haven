import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Check, X, MessageSquare, AlertTriangle, Filter, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const ReportedContent = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reports, setReports] = useState<Array<{
    id: string;
    contentType: string;
    title: string;
    author: string;
    submittedDate: string;
    priority: string;
    status: string;
    reason: string;
  }>>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      // Get forum posts that need moderation
      const data = await moderatorWorkflowService.getContentQueue('all');
      // Filter to show only pending and hidden posts (reported/flagged content)
      const flaggedPosts = data.filter(post => 
        post.status === 'pending' || post.status === 'rejected'
      );
      setReports(flaggedPosts);
    } catch (error: any) {
      console.error('Failed to load reported content', error);
      toast.error(error?.message || 'Failed to load reported content');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (report) => filterStatus === 'all' || report.status === filterStatus
  );

  const handleAction = async (reportId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setProcessingId(reportId);
      await moderatorWorkflowService.moderateContent(reportId, action);
      
      const actionMessages = {
        APPROVE: 'Content approved and published',
        REJECT: 'Content removed'
      };
      
      toast.success(actionMessages[action]);
      await loadReports();
    } catch (error: any) {
      toast.error('Failed to process report');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: {
        bg: 'rgba(var(--role-moderator-alert-rgb), 0.1)',
        color: 'var(--role-moderator-alert)',
        border: 'var(--role-moderator-alert)',
        label: 'Needs Review'
      },
      approved: {
        bg: 'rgba(var(--role-moderator-success-rgb), 0.1)',
        color: 'var(--role-moderator-success)',
        border: 'var(--role-moderator-success)',
        label: 'Approved'
      },
      rejected: {
        bg: 'rgba(var(--role-moderator-primary-rgb), 0.1)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)',
        label: 'Hidden'
      }
    };

    const style = styles[status as keyof typeof styles] || styles.pending;

    return (
      <Badge 
        variant="outline" 
        className="text-xs font-semibold"
        style={{ 
          backgroundColor: style.bg,
          color: style.color,
          borderColor: style.border
        }}
      >
        {style.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: {
        bg: 'rgba(var(--role-moderator-alert-rgb), 0.15)',
        color: 'var(--role-moderator-alert)',
        border: 'var(--role-moderator-alert)'
      },
      medium: {
        bg: 'rgba(var(--role-moderator-primary-rgb), 0.15)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)'
      },
      low: {
        bg: 'var(--role-moderator-neutral)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)'
      }
    };

    const style = styles[priority as keyof typeof styles] || styles.medium;

    return (
      <Badge 
        variant="outline" 
        className="text-xs font-semibold"
        style={{ 
          backgroundColor: style.bg,
          color: style.color,
          borderColor: style.border
        }}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getPostTypeIcon = () => {
    return <MessageSquare className="h-4 w-4" style={{ color: 'var(--role-moderator-primary)' }} />;
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8" style={{ color: 'var(--role-moderator-alert)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--role-moderator-primary)' }}>
              Reported Forum Content
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
            Review and manage reported posts and threads from the community
          </p>
        </div>

      {/* Filters */}
      <Card className="mb-6 border-2" style={{ 
        borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
        boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
      }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5" style={{ color: 'var(--role-moderator-primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--role-moderator-primary)' }}>
              Filter by Status:
            </span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Badge variant="outline" style={{ 
                backgroundColor: 'rgba(var(--role-moderator-alert-rgb), 0.1)',
                color: 'var(--role-moderator-alert)',
                borderColor: 'var(--role-moderator-alert)'
              }}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {filteredReports.length} reports
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-2" style={{ 
        borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
        boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
      }}>
        <CardHeader className="border-b" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--role-moderator-primary)' }}>
            <MessageSquare className="h-5 w-5" />
            Reported Content ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Content</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Author</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Category</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Priority</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Status</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Date</TableHead>
                  <TableHead style={{ color: 'var(--role-moderator-primary)', fontWeight: 600 }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: 'var(--role-moderator-primary)' }}></div>
                        <p style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>Loading reports...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div style={{ color: 'var(--role-moderator-primary)', opacity: 0.5 }}>
                        <Check className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="font-medium">No flagged content</p>
                        <p className="text-sm">All posts are clean!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredReports.map((report) => (
                  <TableRow 
                    key={report.id}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{ 
                      borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)',
                      backgroundColor: report.status === 'pending' ? 'rgba(var(--role-moderator-alert-rgb), 0.02)' : 'transparent'
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPostTypeIcon()}
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--role-moderator-primary)' }}>
                            {report.title}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--role-moderator-primary)', opacity: 0.6 }}>
                            {report.contentType}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: 'var(--role-moderator-primary)' }}>{report.author}</TableCell>
                    <TableCell style={{ color: 'var(--role-moderator-primary)' }}>{report.reason}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>{report.submittedDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:shadow-md transition-all"
                          style={{ 
                            borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)',
                            color: 'var(--role-moderator-primary)'
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:shadow-md transition-all"
                              style={{ 
                                borderColor: 'rgba(var(--role-moderator-success-rgb), 0.3)',
                                color: 'var(--role-moderator-success)'
                              }}
                              onClick={() => handleAction(report.id, 'APPROVE')}
                              disabled={processingId === report.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:shadow-md transition-all"
                              style={{ 
                                borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.3)',
                                color: 'var(--role-moderator-alert)'
                              }}
                              onClick={() => handleAction(report.id, 'REJECT')}
                              disabled={processingId === report.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default ReportedContent;
