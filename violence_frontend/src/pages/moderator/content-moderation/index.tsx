import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Eye, X, Filter, AlertCircle, FileText, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const ContentModeration = () => {
  const [priority, setPriority] = useState('all');
  const [queue, setQueue] = useState<
    Array<{
      id: string;
      contentType: string;
      title: string;
      author: string;
      submittedDate: string;
      priority: string;
      status: string;
      reason: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async (nextPriority = priority) => {
    try {
      setIsLoading(true);
      const data = await moderatorWorkflowService.getContentQueue(nextPriority);
      setQueue(data);
    } catch (error: any) {
      console.error('Failed to load moderation queue', error);
      toast.error(error?.message || 'Failed to load moderation queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (postId: string, action: 'APPROVE' | 'REJECT' | 'HIDE') => {
    try {
      setProcessingId(postId);
      await moderatorWorkflowService.moderateContent(postId, action);
      
      const actionMessages = {
        APPROVE: 'Content approved successfully',
        REJECT: 'Content rejected',
        HIDE: 'Content hidden from public view'
      };
      
      toast.success(actionMessages[action]);
      await load();
    } catch (error: any) {
      console.error('Failed to moderate content', error);
      toast.error(error?.message || 'Failed to apply moderation action');
    } finally {
      setProcessingId(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: {
        bg: 'rgba(var(--role-moderator-alert-rgb), 0.1)',
        color: 'var(--role-moderator-alert)',
        border: 'var(--role-moderator-alert)'
      },
      medium: {
        bg: 'rgba(var(--role-moderator-primary-rgb), 0.1)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)'
      },
      low: {
        bg: 'var(--role-moderator-neutral)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)'
      }
    };

    const style = styles[priority.toLowerCase() as keyof typeof styles] || styles.medium;

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

  const getContentTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" style={{ color: 'var(--role-moderator-primary)' }} />;
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8" style={{ color: 'var(--role-moderator-alert)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--role-moderator-primary)' }}>
              Content Moderation Queue
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
            Review and moderate pending content submissions
          </p>
        </div>

        {/* Filter Card */}
        <Card className="mb-6 border-2" style={{ 
          borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
          boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
        }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5" style={{ color: 'var(--role-moderator-primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--role-moderator-primary)' }}>
                Filter by Priority:
              </span>
              <Select
                value={priority}
                onValueChange={(value) => {
                  setPriority(value);
                  load(value);
                }}
              >
                <SelectTrigger className="w-48" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Badge variant="outline" style={{ 
                  backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)',
                  color: 'var(--role-moderator-primary)',
                  borderColor: 'var(--role-moderator-primary)'
                }}>
                  {queue.length} items in queue
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Card */}
        <Card className="border-2" style={{ 
          borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
          boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
        }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--role-moderator-primary)' }}>
              <Eye className="h-5 w-5" />
              Moderation Queue ({queue.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: 'var(--role-moderator-primary)' }}></div>
                <p style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>Loading moderation queue...</p>
              </div>
            )}
            
            {!isLoading && queue.length === 0 && (
              <div className="text-center py-12" style={{ color: 'var(--role-moderator-primary)', opacity: 0.5 }}>
                <Check className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">All clear!</p>
                <p className="text-sm">No content pending moderation</p>
              </div>
            )}
            
            <div className="space-y-4">
              {queue.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-lg border-2 p-5 hover:shadow-lg transition-all duration-200"
                  style={{ 
                    borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
                    backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.02)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getContentTypeIcon(item.contentType)}
                        <h4 className="font-semibold text-lg" style={{ color: 'var(--role-moderator-primary)' }}>
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                        <span className="font-medium">By: {item.author}</span>
                        <span>•</span>
                        <span>{new Date(item.submittedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="italic">{item.reason}</span>
                      </div>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="hover:shadow-md transition-all"
                      style={{ 
                        borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)',
                        color: 'var(--role-moderator-primary)'
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="hover:shadow-md transition-all"
                      style={{ 
                        borderColor: 'rgba(var(--role-moderator-success-rgb), 0.3)',
                        color: 'var(--role-moderator-success)'
                      }}
                      onClick={() => act(item.id, 'APPROVE')}
                      disabled={processingId === item.id}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="hover:shadow-md transition-all"
                      style={{ 
                        borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)',
                        color: 'var(--role-moderator-primary)'
                      }}
                      onClick={() => act(item.id, 'HIDE')}
                      disabled={processingId === item.id}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="hover:shadow-md transition-all"
                      style={{ 
                        borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.3)',
                        color: 'var(--role-moderator-alert)'
                      }}
                      onClick={() => act(item.id, 'REJECT')}
                      disabled={processingId === item.id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentModeration;
