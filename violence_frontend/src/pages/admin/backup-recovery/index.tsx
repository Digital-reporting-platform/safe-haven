import React, { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';

export function BackupRecoveryPage() {
  const [selectedBackup, setSelectedBackup] = useState('');

  // Mock backup data
  const backups = [
    {
      id: 1,
      name: 'Daily Backup - 2025-02-20',
      type: 'Full',
      size: '2.4 GB',
      status: 'Completed',
      createdAt: '2025-02-20 02:00:00',
    },
    {
      id: 2,
      name: 'Weekly Backup - 2025-02-16',
      type: 'Incremental',
      size: '856 MB',
      status: 'Completed',
      createdAt: '2025-02-16 02:00:00',
    },
    {
      id: 3,
      name: 'Manual Backup - User Data',
      type: 'Partial',
      size: '1.2 GB',
      status: 'In Progress',
      createdAt: '2025-02-20 14:30:00',
    },
  ];

  const backupStats = [
    {
      title: 'Total Backups',
      value: '247',
      icon: Database,
      color: 'text-blue-500',
    },
    {
      title: 'Storage Used',
      value: '1.8 TB',
      icon: Upload,
      color: 'text-green-500',
    },
    {
      title: 'Last Backup',
      value: '2 hours ago',
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      title: 'Success Rate',
      value: '99.7%',
      icon: CheckCircle,
      color: 'text-purple-500',
    },
  ];

  const handleCreateBackup = () => {
    // TODO: Implement backup creation
    console.log('Create backup');
  };

  const handleRestoreBackup = (backupId: number) => {
    // TODO: Implement backup restore
    console.log('Restore backup', backupId);
  };

  const handleDownloadBackup = (backupId: number) => {
    // TODO: Implement backup download
    console.log('Download backup', backupId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Backup & Recovery</h1>
        <p className="text-muted-foreground mt-2">
          Manage system backups, recovery operations, and data protection.
        </p>
      </div>

      {/* Backup Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {backupStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create New Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select backup type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Backup</SelectItem>
                  <SelectItem value="incremental">
                    Incremental Backup
                  </SelectItem>
                  <SelectItem value="partial">Partial Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateBackup} className="w-full">
              Create Backup
            </Button>
          </CardContent>
        </Card>

        {/* Restore Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore from Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Backup</label>
              <Select value={selectedBackup} onValueChange={setSelectedBackup}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose backup to restore" />
                </SelectTrigger>
                <SelectContent>
                  {backups
                    .filter((b) => b.status === 'Completed')
                    .map((backup) => (
                      <SelectItem key={backup.id} value={backup.id.toString()}>
                        {backup.name} ({backup.size})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Warning</span>
              </div>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Restoring from backup will overwrite current data. This action
                cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!selectedBackup}
            >
              Restore Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{backup.type}</Badge>
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {backup.status === 'In Progress' && (
                        <Progress value={65} className="w-16" />
                      )}
                      <Badge
                        variant={
                          backup.status === 'Completed'
                            ? 'default'
                            : backup.status === 'In Progress'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {backup.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{backup.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {backup.status === 'Completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBackup(backup.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.id)}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
