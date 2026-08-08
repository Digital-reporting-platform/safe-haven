import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Zap,
  Webhook,
  Database,
  Shield,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'SMS Gateway',
      type: 'Communication',
      status: 'Connected',
      lastSync: '2025-02-20 14:30',
      icon: Zap,
    },
    {
      id: 2,
      name: 'Email Service',
      type: 'Communication',
      status: 'Connected',
      lastSync: '2025-02-20 13:45',
      icon: Webhook,
    },
    {
      id: 3,
      name: 'External Database',
      type: 'Data',
      status: 'Disconnected',
      lastSync: '2025-02-19 09:15',
      icon: Database,
    },
    {
      id: 4,
      name: 'Security Scanner',
      type: 'Security',
      status: 'Connected',
      lastSync: '2025-02-20 12:00',
      icon: Shield,
    },
  ]);

  const handleToggleIntegration = (id: number) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              status: int.status === 'Connected' ? 'Disconnected' : 'Connected',
            }
          : int
      )
    );
  };

  const handleConfigureIntegration = (id: number) => {
    // TODO: Implement configuration
    console.log('Configure integration', id);
  };

  const handleAddIntegration = () => {
    // TODO: Implement add integration
    console.log('Add new integration');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground mt-2">
              Manage external integrations, APIs, and third-party services.
            </p>
          </div>
          <Button
            onClick={handleAddIntegration}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Integrations</p>
                <p className="text-2xl font-bold">
                  {integrations.filter((i) => i.status === 'Connected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium">Disconnected</p>
                <p className="text-2xl font-bold">
                  {
                    integrations.filter((i) => i.status === 'Disconnected')
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Integrations</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <integration.icon className="h-5 w-5" />
                      <span className="font-medium">{integration.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{integration.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.status === 'Connected'}
                        onCheckedChange={() =>
                          handleToggleIntegration(integration.id)
                        }
                      />
                      <Badge
                        variant={
                          integration.status === 'Connected'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {integration.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{integration.lastSync}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigureIntegration(integration.id)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                defaultValue="••••••••••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://api.example.com/webhook"
                defaultValue="https://api.safehaven.com/webhook"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhook Notifications</Label>
              <p className="text-muted-foreground text-sm">
                Receive real-time notifications for integration events
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Save API Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
