import { useState } from 'react';
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
import { Eye, UserCheck, UserX, AlertTriangle, Shield } from 'lucide-react';

const FlaggedUsers = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const mockFlaggedUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'SURVIVOR',
      flagReason: 'Inappropriate behavior',
      flaggedDate: '2024-01-15',
      status: 'active',
      severity: 'medium',
      flagCount: 2,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'COUNSELOR',
      flagReason: 'Harassment',
      flaggedDate: '2024-01-14',
      status: 'suspended',
      severity: 'high',
      flagCount: 5,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'SURVIVOR',
      flagReason: 'Spam',
      flaggedDate: '2024-01-13',
      status: 'active',
      severity: 'low',
      flagCount: 1,
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'MEDICAL_PROFESSIONAL',
      flagReason: 'False information',
      flaggedDate: '2024-01-12',
      status: 'under_review',
      severity: 'medium',
      flagCount: 3,
    },
  ];

  const filteredUsers = mockFlaggedUsers.filter(
    (user) => filterStatus === 'all' || user.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" style={{ backgroundColor: 'var(--role-moderator-success)', color: 'white' }}>
            Active
          </Badge>
        );
      case 'suspended':
        return <Badge variant="destructive" style={{ backgroundColor: 'var(--role-moderator-alert)', color: 'white' }}>Suspended</Badge>;
      case 'under_review':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge className="text-xs" style={{ backgroundColor: 'rgba(var(--role-moderator-alert-rgb), 0.1)', color: 'var(--role-moderator-alert)', border: 'none' }}>
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="text-xs" style={{ backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)', color: 'var(--role-moderator-primary)', border: 'none' }}>
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge className="text-xs" style={{ backgroundColor: 'var(--role-moderator-neutral)', color: 'var(--role-moderator-primary)', border: 'none' }}>
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {severity}
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      SURVIVOR: 'bg-blue-500',
      COUNSELOR: 'bg-purple-500',
      MEDICAL_PROFESSIONAL: 'bg-green-500',
      LEGAL_ADVISOR: 'bg-orange-500',
      ADMIN: 'bg-red-500',
      MODERATOR: 'var(--role-moderator-primary)',
    };
    return (
      <Badge
        variant="default"
        style={role === 'MODERATOR' ? { backgroundColor: 'var(--role-moderator-primary)', color: 'white' } : {}}
        className={role !== 'MODERATOR' ? (colors[role as keyof typeof colors] || 'bg-gray-500') : ''}
      >
        {role}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Flagged Users</h1>
          <p className="text-muted-foreground">
            Review users flagged for violations.
          </p>
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Flag Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flagged Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.flagReason}</TableCell>
                  <TableCell>{getSeverityBadge(user.severity)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>{user.flagCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.flaggedDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserX className="h-4 w-4" />
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
  </div>
  );
};

export default FlaggedUsers;
