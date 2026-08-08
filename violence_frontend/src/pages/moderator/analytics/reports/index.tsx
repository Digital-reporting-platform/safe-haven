import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Users,
  Eye,
  Activity,
  ArrowLeft,
} from 'lucide-react';

const ModerationReports = () => {
  const navigate = useNavigate();
  const reportStats = [
    {
      title: 'Total Reports',
      value: '1,247',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Resolved Today',
      value: '89',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'Pending Review',
      value: '23',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      title: 'Escalated Cases',
      value: '5',
      icon: Users,
      color: 'text-orange-500',
    },
  ];

  const recentReports = [
    {
      id: 'RPT-001',
      type: 'Content Violation',
      status: 'Resolved',
      priority: 'High',
      timestamp: '2024-03-09 14:30',
    },
    {
      id: 'RPT-002',
      type: 'User Harassment',
      status: 'Under Review',
      priority: 'Medium',
      timestamp: '2024-03-09 13:15',
    },
    {
      id: 'RPT-003',
      type: 'Spam Content',
      status: 'Resolved',
      priority: 'Low',
      timestamp: '2024-03-09 12:45',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'text-green-500';
      case 'Under Review': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="mb-2">Moderation Reports</h1>
          <p className="text-muted-foreground">
            View detailed reports on moderation activities and trends.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reportStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <h2 className="text-2xl font-bold">{stat.value}</h2>
                      <p className="text-muted-foreground text-xs">
                        +12% this week
                      </p>
                    </div>
                    <Icon className={'h-8 w-8 ' + stat.color} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{report.id}</p>
                      <p className="text-sm text-muted-foreground">{report.type}</p>
                    </div>
                    <Badge variant="secondary" className={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                    <p className={`text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{report.timestamp}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
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

export default ModerationReports;
