import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  MessageSquare,
  Image,
  Video,
  Link,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

const ContentAnalytics = () => {
  const navigate = useNavigate();
  const contentStats = [
    {
      title: 'Total Content Moderated',
      value: '15,432',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Content Types',
      value: '4',
      icon: BarChart3,
      color: 'text-purple-500',
    },
    {
      title: 'Moderation Rate',
      value: '94.2%',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Average Processing Time',
      value: '2.3h',
      icon: FileText,
      color: 'text-orange-500',
    },
  ];

  const contentTypes = [
    {
      type: 'Text Posts',
      count: '8,921',
      percentage: '57.8%',
      icon: MessageSquare,
      color: 'text-blue-500',
    },
    {
      type: 'Images',
      count: '4,156',
      percentage: '26.9%',
      icon: Image,
      color: 'text-green-500',
    },
    {
      type: 'Videos',
      count: '1,892',
      percentage: '12.3%',
      icon: Video,
      color: 'text-red-500',
    },
    {
      type: 'Links',
      count: '463',
      percentage: '3.0%',
      icon: Link,
      color: 'text-purple-500',
    },
  ];

  const moderationTrends = [
    {
      period: 'This Week',
      moderated: '1,247',
      flagged: '89',
      removed: '34',
    },
    {
      period: 'Last Week',
      moderated: '1,189',
      flagged: '76',
      removed: '28',
    },
    {
      period: '2 Weeks Ago',
      moderated: '1,056',
      flagged: '65',
      removed: '22',
    },
  ];

  return (
    <div className="min-h-screen pb-20 font-sans moderator-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate('/moderator/analytics')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Button>
          <h1 className="mb-2">Content Analytics</h1>
          <p className="text-muted-foreground">
            Analyze content moderation patterns and effectiveness.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contentStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <h2 className="text-2xl font-bold">{stat.value}</h2>
                      <p className="text-muted-foreground text-xs">
                        +8% this week
                      </p>
                    </div>
                    <Icon className={'h-8 w-8 ' + stat.color} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Types Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Content Types Distribution</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {contentTypes.map((content, index) => {
              const Icon = content.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={'h-6 w-6 ' + content.color} />
                        <div>
                          <p className="font-medium">{content.type}</p>
                          <p className="text-2xl font-bold">{content.count}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{content.percentage}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Moderation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moderationTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{trend.period}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{trend.moderated}</p>
                      <p className="text-xs text-muted-foreground">Moderated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">{trend.flagged}</p>
                      <p className="text-xs text-muted-foreground">Flagged</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{trend.removed}</p>
                      <p className="text-xs text-muted-foreground">Removed</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentAnalytics;
