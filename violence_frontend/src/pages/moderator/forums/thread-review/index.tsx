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
import { Eye, Check, X, MessageSquare } from 'lucide-react';

const ThreadReview = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const mockThreads = [
    {
      id: '1',
      title: 'Need help with anxiety',
      author: 'worrieduser',
      category: 'Mental Health',
      replies: 12,
      views: 45,
      createdDate: '2024-01-15',
      status: 'pending_review',
      priority: 'medium',
      reason: 'Sensitive topic',
    },
    {
      id: '2',
      title: 'Domestic violence support',
      author: 'needhelp',
      category: 'Support',
      replies: 8,
      views: 32,
      createdDate: '2024-01-14',
      status: 'approved',
      priority: 'high',
      reason: 'Urgent support needed',
    },
    {
      id: '3',
      title: 'Legal advice needed',
      author: 'confused123',
      category: 'Legal',
      replies: 5,
      views: 18,
      createdDate: '2024-01-13',
      status: 'pending_review',
      priority: 'low',
      reason: 'New user thread',
    },
    {
      id: '4',
      title: 'Resource sharing',
      author: 'helper456',
      category: 'Resources',
      replies: 3,
      views: 25,
      createdDate: '2024-01-12',
      status: 'flagged',
      priority: 'medium',
      reason: 'Contains external links',
    },
  ];

  const filteredThreads = mockThreads.filter(
    (thread) => filterStatus === 'all' || thread.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="destructive">Pending Review</Badge>;
      case 'approved':
        return (
          <Badge variant="default" style={{ backgroundColor: 'var(--role-moderator-success)', color: 'white' }}>
            Approved
          </Badge>
        );
      case 'flagged':
        return <Badge variant="secondary">Flagged</Badge>;
      case 'rejected':
        return <Badge variant="outline">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
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
            {priority}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Thread Review</h1>
          <p className="text-muted-foreground">
            Review and moderate forum threads.
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
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forum Threads ({filteredThreads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thread</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredThreads.map((thread) => (
                <TableRow key={thread.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{thread.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {thread.reason}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{thread.author}</TableCell>
                  <TableCell>{thread.category}</TableCell>
                  <TableCell>{thread.replies}</TableCell>
                  <TableCell>{thread.views}</TableCell>
                  <TableCell>{getPriorityBadge(thread.priority)}</TableCell>
                  <TableCell>{getStatusBadge(thread.status)}</TableCell>
                  <TableCell>{thread.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {thread.status === 'pending_review' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default ThreadReview;
