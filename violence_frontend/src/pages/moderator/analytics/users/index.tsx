import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Shield,
  Eye,
  ArrowLeft,
} from 'lucide-react';

const UserBehavior = () => {
  const navigate = useNavigate();
  const behaviorStats = [
    {
      title: 'Active Users',
      value: '12,847',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Users Under Watch',
      value: '234',
      icon: Eye,
      color: 'text-orange-500',
    },
    {
      title: 'Risk Assessments',
      value: '1,892',
      icon: Shield,
      color: 'text-purple-500',
    },
    {
      title: 'Behavioral Alerts',
      value: '156',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
  ];

  const userSegments = [
    {
      segment: 'New Users',
      count: '3,421',
      riskLevel: 'Low',
      activity: 'High engagement',
    },
    {
      segment: 'Regular Users',
      count: '7,892',
      riskLevel: 'Low',
      activity: 'Consistent activity',
    },
    {
      segment: 'High-Risk Users',
      count: '156',
      riskLevel: 'High',
      activity: 'Frequent flags',
    },
    {
      segment: 'Suspended Users',
      count: '23',
      riskLevel: 'Critical',
      activity: 'No activity',
    },
  ];

  const flaggedActivities = [
    {
      user: 'User_001',
      activity: 'Multiple spam reports',
      riskScore: '85',
      status: 'Under Review',
      lastActivity: '2024-03-09 14:30',
    },
    {
      user: 'User_002',
      activity: 'Harassment pattern',
      riskScore: '92',
      status: 'Flagged',
      lastActivity: '2024-03-09 13:15',
    },
    {
      user: 'User_003',
      activity: 'Inappropriate content',
      riskScore: '78',
      status: 'Monitored',
      lastActivity: '2024-03-09 12:45',
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review': return 'text-yellow-500';
      case 'Flagged': return 'text-red-500';
      case 'Monitored': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

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
          <h1 className="mb-2">User Behavior Analytics</h1>
          <p className="text-muted-foreground">
            Monitor user behavior patterns and flag triggers.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {behaviorStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <h2 className="text-2xl font-bold">{stat.value}</h2>
                      <p className="text-muted-foreground text-xs">
                        +5% this week
                      </p>
                    </div>
                    <Icon className={'h-8 w-8 ' + stat.color} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Segments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Segments</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userSegments.map((segment, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{segment.segment}</p>
                      <p className="text-2xl font-bold">{segment.count}</p>
                      <p className="text-sm text-muted-foreground">{segment.activity}</p>
                    </div>
                    <Badge variant="secondary" className={getRiskColor(segment.riskLevel)}>
                      {segment.riskLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Flagged Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged User Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedActivities.map((activity) => (
                <div key={activity.user} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.activity}</p>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Risk: {activity.riskScore}
                    </Badge>
                    <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.lastActivity}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
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

export default UserBehavior;
