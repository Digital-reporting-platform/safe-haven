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
import { Plus, Eye, Edit, Calendar, User, Activity } from 'lucide-react';
import { useState } from 'react';

const TreatmentPlans = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock treatment plans data
  const plans = [
    {
      id: 'TP001',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      planName: 'Asthma Management Plan',
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      status: 'Active',
      priority: 'High',
      createdBy: 'Dr. Sarah Smith',
      description:
        'Comprehensive asthma management including daily inhaler use, trigger avoidance, and regular monitoring.',
      objectives: [
        'Reduce asthma exacerbations',
        'Improve lung function',
        'Better symptom control',
      ],
    },
    {
      id: 'TP002',
      patientName: 'Michael Chen',
      patientId: 'P002',
      planName: 'Cardiac Rehabilitation',
      startDate: '2024-02-01',
      endDate: '2024-08-01',
      status: 'Active',
      priority: 'High',
      createdBy: 'Dr. James Wilson',
      description:
        'Post-heart attack rehabilitation program including exercise, diet, and medication management.',
      objectives: [
        'Improve cardiovascular fitness',
        'Weight management',
        'Medication compliance',
      ],
    },
    {
      id: 'TP003',
      patientName: 'Emma Davis',
      patientId: 'P003',
      planName: 'Diabetes Management',
      startDate: '2023-12-01',
      endDate: '2024-06-01',
      status: 'Active',
      priority: 'Medium',
      createdBy: 'Dr. Lisa Thompson',
      description:
        'Type 2 diabetes management with focus on blood sugar control, diet, and exercise.',
      objectives: [
        'Maintain HbA1c <7%',
        'Weight loss',
        'Prevent complications',
      ],
    },
    {
      id: 'TP004',
      patientName: 'David Wilson',
      patientId: 'P004',
      planName: 'Physical Therapy',
      startDate: '2024-01-20',
      endDate: '2024-04-20',
      status: 'Completed',
      priority: 'Medium',
      createdBy: 'Physical Therapy',
      description: 'Post-surgical rehabilitation for knee replacement.',
      objectives: ['Restore mobility', 'Strength training', 'Pain management'],
    },
    {
      id: 'TP005',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      planName: 'Mental Health Support',
      startDate: '2024-02-10',
      endDate: '2024-05-10',
      status: 'Active',
      priority: 'High',
      createdBy: 'Dr. Robert Martinez',
      description:
        'Integrated mental health treatment plan for anxiety and depression.',
      objectives: [
        'Reduce anxiety symptoms',
        'Improve coping skills',
        'Medication management',
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
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
            <h1 className="mb-2 text-3xl font-bold">Treatment Plans</h1>
            <p className="text-muted-foreground">
              Create and manage comprehensive treatment plans for patients.
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create Treatment Plan</DialogTitle>
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
                  <Label htmlFor="plan-name" className="text-right">
                    Plan Name
                  </Label>
                  <Input
                    id="plan-name"
                    placeholder="Enter plan name"
                    className="col-span-3"
                  />
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
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-date" className="text-right">
                    Start Date
                  </Label>
                  <Input id="start-date" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end-date" className="text-right">
                    End Date
                  </Label>
                  <Input id="end-date" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="pt-2 text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the treatment plan objectives and approach"
                    className="col-span-3"
                    rows={3}
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
                  Create Plan
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
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-muted-foreground text-xs">All treatment plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter((plan) => plan.status === 'Active').length}
            </div>
            <p className="text-muted-foreground text-xs">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter((plan) => plan.status === 'Completed').length}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter((plan) => plan.priority === 'High').length}
            </div>
            <p className="text-muted-foreground text-xs">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.patientName}</p>
                      <p className="text-muted-foreground text-sm">
                        {plan.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.planName}</p>
                      <p className="text-muted-foreground line-clamp-1 text-sm">
                        {plan.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{plan.startDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(plan.priority)}>
                      {plan.priority}
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
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
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

export default TreatmentPlans;
