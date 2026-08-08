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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Edit, Send, User, Building } from 'lucide-react';
import { useState } from 'react';

const Referrals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock referrals data
  const referrals = [
    {
      id: 'R001',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      specialty: 'Pulmonology',
      provider: 'Dr. Maria Rodriguez',
      facility: 'City General Hospital',
      referralDate: '2024-02-15',
      appointmentDate: '2024-02-28',
      status: 'Scheduled',
      priority: 'High',
      reason: 'Specialized asthma management and pulmonary function testing.',
      notes: 'Patient requires advanced respiratory therapy.',
    },
    {
      id: 'R002',
      patientName: 'Michael Chen',
      patientId: 'P002',
      specialty: 'Cardiology',
      provider: 'Dr. James Wilson',
      facility: 'Heart Center Medical',
      referralDate: '2024-02-10',
      appointmentDate: '2024-03-05',
      status: 'Pending',
      priority: 'Urgent',
      reason: 'Cardiac rehabilitation following myocardial infarction.',
      notes: 'Post-heart attack care and rehabilitation program.',
    },
    {
      id: 'R003',
      patientName: 'Emma Davis',
      patientId: 'P003',
      specialty: 'Endocrinology',
      provider: 'Dr. Lisa Thompson',
      facility: 'Diabetes Care Center',
      referralDate: '2024-01-20',
      appointmentDate: '2024-02-10',
      status: 'Completed',
      priority: 'Medium',
      reason: 'Diabetes management and insulin therapy optimization.',
      notes: 'Successfully transitioned to endocrinology care.',
    },
    {
      id: 'R004',
      patientName: 'David Wilson',
      patientId: 'P004',
      specialty: 'Orthopedics',
      provider: 'Dr. Robert Martinez',
      facility: 'Orthopedic Institute',
      referralDate: '2024-02-01',
      appointmentDate: '2024-02-20',
      status: 'Completed',
      priority: 'Medium',
      reason: 'Post-operative knee replacement rehabilitation.',
      notes: 'Excellent progress in physical therapy.',
    },
    {
      id: 'R005',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      specialty: 'Psychiatry',
      provider: 'Dr. Jennifer Lee',
      facility: 'Mental Health Center',
      referralDate: '2024-02-18',
      appointmentDate: null,
      status: 'Sent',
      priority: 'High',
      reason: 'Anxiety and depression management.',
      notes: 'Patient requires psychiatric evaluation and treatment.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sent':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Patient Referrals</h1>
            <p className="text-muted-foreground">
              Manage and track patient referrals to specialists and other
              healthcare providers.
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Referral
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create Patient Referral</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient-select" className="text-right">
                    Patient
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p001">Sarah Johnson (P001)</SelectItem>
                      <SelectItem value="p002">Michael Chen (P002)</SelectItem>
                      <SelectItem value="p003">Emma Davis (P003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specialty" className="text-right">
                    Specialty
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pulmonology">Pulmonology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="endocrinology">
                        Endocrinology
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="reason" className="pt-2 text-right">
                    Reason
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe the reason for referral"
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="provider" className="text-right">
                    Provider
                  </Label>
                  <Input
                    id="provider"
                    placeholder="Referred provider name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="facility" className="text-right">
                    Facility
                  </Label>
                  <Input
                    id="facility"
                    placeholder="Healthcare facility"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Send Referral
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Send className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Send className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                referrals.filter(
                  (ref) => ref.status === 'Pending' || ref.status === 'Sent'
                ).length
              }
            </div>
            <p className="text-muted-foreground text-xs">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Send className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((ref) => ref.status === 'Scheduled').length}
            </div>
            <p className="text-muted-foreground text-xs">Appointments set</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Send className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((ref) => ref.status === 'Completed').length}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Referral Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{referral.patientName}</p>
                      <p className="text-muted-foreground text-sm">
                        {referral.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{referral.specialty}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{referral.provider}</p>
                      <p className="text-muted-foreground text-sm">
                        {referral.facility}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{referral.referralDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(referral.status)}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(referral.priority)}>
                      {referral.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {referral.status === 'Sent' && (
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="default">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
