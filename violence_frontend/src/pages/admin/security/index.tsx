import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export function SecurityPage() {
  const navigate = useNavigate();

  const securityMetrics = [
    {
      title: 'Active Sessions',
      value: '1,247',
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      title: 'Failed Login Attempts',
      value: '23',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      title: 'Security Alerts',
      value: '5',
      icon: Shield,
      color: 'text-orange-500',
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ];

  const securitySections = [
    {
      title: 'Audit Logs',
      description: 'View and monitor system audit logs and user activities',
      path: 'audit-logs',
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Access Control',
      description: 'Manage user roles, permissions, and access policies',
      path: 'access-control',
      icon: Lock,
      color: 'text-green-500',
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system performance and security metrics',
      path: 'monitoring',
      icon: Activity,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage system security, access controls, and audit logs.
        </p>
      </div>

      {/* Security Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {securitySections.map((section, index) => (
          <Card key={index} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className={`h-6 w-6 ${section.color}`} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {section.description}
              </p>
              <Button onClick={() => navigate(section.path)} className="w-full">
                Access
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Security Events */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">Multiple failed login attempts</p>
                <p className="text-muted-foreground text-sm">
                  IP: 192.168.1.100 - 10 minutes ago
                </p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Security update completed</p>
                <p className="text-muted-foreground text-sm">
                  System patches applied - 2 hours ago
                </p>
              </div>
              <Badge variant="default">Info</Badge>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <Lock className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">New user role assigned</p>
                <p className="text-muted-foreground text-sm">
                  Admin role granted to user@example.com - 4 hours ago
                </p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
