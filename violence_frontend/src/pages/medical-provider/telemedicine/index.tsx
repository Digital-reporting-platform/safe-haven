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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Video, Phone, MessageCircle, Clock, User } from 'lucide-react';
import { useState } from 'react';

const Telemedicine = () => {
  const [isStartSessionDialogOpen, setIsStartSessionDialogOpen] =
    useState(false);

  // Mock telemedicine sessions data
  const sessions = [
    {
      id: 'T001',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      scheduledDate: '2024-02-20',
      scheduledTime: '10:00 AM',
      duration: 30,
      type: 'Video Consultation',
      status: 'Completed',
      provider: 'Dr. Sarah Smith',
      notes:
        'Patient reported improvement in asthma symptoms. Adjusted inhaler technique.',
    },
    {
      id: 'T002',
      patientName: 'Michael Chen',
      patientId: 'P002',
      scheduledDate: '2024-02-21',
      scheduledTime: '02:30 PM',
      duration: 45,
      type: 'Video Follow-up',
      status: 'Scheduled',
      provider: 'Dr. James Wilson',
      notes: 'Review cardiac rehabilitation progress.',
    },
    {
      id: 'T003',
      patientName: 'Emma Davis',
      patientId: 'P003',
      scheduledDate: '2024-02-19',
      scheduledTime: '11:15 AM',
      duration: 60,
      type: 'Phone Consultation',
      status: 'Completed',
      provider: 'Dr. Lisa Thompson',
      notes:
        'Discussed diabetes management plan. Patient agreed to lifestyle changes.',
    },
    {
      id: 'T004',
      patientName: 'David Wilson',
      patientId: 'P004',
      scheduledDate: '2024-02-22',
      scheduledTime: '09:45 AM',
      duration: 30,
      type: 'Video Consultation',
      status: 'In Progress',
      provider: 'Dr. Robert Martinez',
      notes: 'Currently discussing post-operative recovery.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Consultation':
      case 'Video Follow-up':
        return <Video className="h-4 w-4" />;
      case 'Phone Consultation':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Telemedicine</h1>
            <p className="text-muted-foreground">
              Manage remote medical consultations and virtual sessions.
            </p>
          </div>
          <Dialog
            open={isStartSessionDialogOpen}
            onOpenChange={setIsStartSessionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Start Telemedicine Session</DialogTitle>
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
                  <Label htmlFor="session-type" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Consultation</SelectItem>
                      <SelectItem value="phone">Phone Consultation</SelectItem>
                      <SelectItem value="chat">Text Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStartSessionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsStartSessionDialogOpen(false)}>
                  Start Session
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
              Total Sessions
            </CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sessions.filter((session) => session.status === 'Completed')
                  .length
              }
            </div>
            <p className="text-muted-foreground text-xs">Finished sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sessions.filter((session) => session.status === 'Scheduled')
                  .length
              }
            </div>
            <p className="text-muted-foreground text-xs">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sessions.filter((session) => session.status === 'In Progress')
                  .length
              }
            </div>
            <p className="text-muted-foreground text-xs">Active now</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Telemedicine Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.patientName}</p>
                      <p className="text-muted-foreground text-sm">
                        {session.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(session.type)}
                      <span>{session.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{session.scheduledDate}</p>
                      <p className="text-muted-foreground text-sm">
                        {session.scheduledTime}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{session.duration} min</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {session.status === 'Scheduled' && (
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      {session.status === 'In Progress' && (
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button className="flex h-20 flex-col items-center gap-2">
              <Video className="h-6 w-6" />
              <span className="text-sm">Start Video Call</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <Phone className="h-6 w-6" />
              <span className="text-sm">Audio Call</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Text Chat</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <Clock className="h-6 w-6" />
              <span className="text-sm">Schedule Session</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Telemedicine;
