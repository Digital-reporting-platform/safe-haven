import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Eye, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Shield,
  Activity,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const ModeratorDashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingReviews: 0,
    activeFlags: 0,
    totalUsers: 0,
    forumPosts: 0,
  });
  const [recentActivities, setRecentActivities] = useState<
    Array<{ id: string; message: string; time: string; priority: string; author: string }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await moderatorWorkflowService.getDashboard();
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
      } catch (error: any) {
        console.error('Failed to load moderator dashboard', error);
        toast.error(error?.message || 'Failed to load moderator dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'var(--role-moderator-alert)';
      case 'medium':
        return 'var(--role-moderator-primary)';
      case 'low':
        return 'var(--role-moderator-success)';
      default:
        return 'var(--role-moderator-primary)';
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8" style={{ color: 'var(--role-moderator-primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--role-moderator-primary)' }}>
              Moderator Control Center
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
            Monitor and manage forum posts, community content, and reported violations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 hover:shadow-lg transition-all duration-300" style={{ 
            borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                    Pending Reviews
                  </p>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--role-moderator-alert)' }}>
                    {stats.pendingReviews}
                  </h2>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(var(--role-moderator-alert-rgb), 0.1)' }}>
                  <Eye className="h-8 w-8" style={{ color: 'var(--role-moderator-alert)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300" style={{ 
            borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                    Reported Posts
                  </p>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--role-moderator-alert)' }}>
                    {stats.activeFlags}
                  </h2>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(var(--role-moderator-alert-rgb), 0.1)' }}>
                  <AlertTriangle className="h-8 w-8" style={{ color: 'var(--role-moderator-alert)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300" style={{ 
            borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                    Flagged Users
                  </p>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--role-moderator-primary)' }}>
                    {stats.totalUsers}
                  </h2>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--role-moderator-neutral)' }}>
                  <Users className="h-8 w-8" style={{ color: 'var(--role-moderator-primary)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300" style={{ 
            borderColor: 'rgba(var(--role-moderator-success-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                    Total Forum Posts
                  </p>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--role-moderator-success)' }}>
                    {stats.forumPosts}
                  </h2>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(var(--role-moderator-success-rgb), 0.1)' }}>
                  <MessageCircle className="h-8 w-8" style={{ color: 'var(--role-moderator-success)' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 border-2" style={{ 
            borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardHeader className="border-b" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: 'var(--role-moderator-primary)' }} />
                <CardTitle style={{ color: 'var(--role-moderator-primary)' }}>Recent Activities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--role-moderator-primary)' }}></div>
                </div>
              )}
              {!isLoading && recentActivities.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--role-moderator-primary)', opacity: 0.5 }}>
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No recent moderation activities</p>
                </div>
              )}
              <div className="space-y-3">
                {recentActivities.map((item) => (
                  <div 
                    key={item.id} 
                    className="rounded-lg border-l-4 p-4 hover:shadow-md transition-all duration-200"
                    style={{ 
                      borderLeftColor: getPriorityColor(item.priority),
                      backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.03)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--role-moderator-primary)' }}>
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--role-moderator-primary)', opacity: 0.6 }}>
                          <span className="font-medium">{item.author}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.time).toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: getPriorityColor(item.priority),
                          color: getPriorityColor(item.priority)
                        }}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2" style={{ 
            borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
            boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
          }}>
            <CardHeader className="border-b" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--role-moderator-primary)' }} />
                <CardTitle style={{ color: 'var(--role-moderator-primary)' }}>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button 
                className="w-full justify-start text-left h-auto py-4 px-4 hover:shadow-md transition-all duration-200" 
                variant="outline"
                style={{ 
                  borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.3)',
                  color: 'var(--role-moderator-primary)'
                }}
                onClick={() => navigate('/moderator/content-moderation')}
              >
                <Eye className="mr-3 h-5 w-5" style={{ color: 'var(--role-moderator-alert)' }} />
                <div>
                  <div className="font-semibold">Review Forum Posts</div>
                  <div className="text-xs opacity-70">Moderate community content</div>
                </div>
              </Button>

              <Button 
                className="w-full justify-start text-left h-auto py-4 px-4 hover:shadow-md transition-all duration-200" 
                variant="outline"
                style={{ 
                  borderColor: 'rgba(var(--role-moderator-success-rgb), 0.3)',
                  color: 'var(--role-moderator-primary)'
                }}
                onClick={() => navigate('/moderator/forums/reported-content')}
              >
                <MessageCircle className="mr-3 h-5 w-5" style={{ color: 'var(--role-moderator-success)' }} />
                <div>
                  <div className="font-semibold">Handle Reports</div>
                  <div className="text-xs opacity-70">Review user reports</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboardPage;
