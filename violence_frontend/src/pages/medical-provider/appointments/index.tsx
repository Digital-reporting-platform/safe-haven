import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { medicalWorkflowService, type AppointmentItem } from '@/services/medicalWorkflowService';
import { patientService, type PatientListItem } from '@/services/patientService';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [stats, setStats] = useState({ today: 0, total: 0, confirmed: 0, pending: 0 });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [form, setForm] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'Consultation',
    location: '',
    notes: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  });

  const load = async () => {
    try {
      setIsLoading(true);
      const [appointmentData, patientData] = await Promise.all([
        medicalWorkflowService.getAppointments(),
        patientService.getPatients(undefined, undefined, {
          assignedToMedical: true,
        }),
      ]);
      setStats(appointmentData.stats);
      setAppointments(appointmentData.appointments);
      setPatients(patientData);
    } catch (error) {
      console.error('Failed to load appointments', error);
      toast.error('Failed to load appointments from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const todayIso = new Date().toISOString().split('T')[0];
  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.date === todayIso),
    [appointments, todayIso],
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.date > todayIso).slice(0, 10),
    [appointments, todayIso],
  );

  const schedule = async () => {
    if (!form.patientId || !form.date || !form.time) {
      toast.error('Patient, date and time are required');
      return;
    }
    try {
      setIsScheduling(true);
      await medicalWorkflowService.scheduleAppointment(form);
      toast.success('Appointment scheduled');
      setIsScheduleDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error('Failed to schedule appointment', error);
      toast.error(error?.message || 'Failed to schedule appointment');
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-medical)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-urgent)]/10 to-[var(--role-stable)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Professional Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] p-3 shadow-lg">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] bg-clip-text text-4xl font-bold text-transparent">
                Appointments
              </h1>
              <p className="font-medium text-[var(--colors-body-text)]">
                Schedule and manage patient appointments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="medical-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Patient</Label>
                  <Select value={form.patientId} onValueChange={(value) => setForm((p) => ({ ...p, patientId: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date</Label>
                  <Input
                    type="date"
                    className="col-span-3"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Time</Label>
                  <Input
                    type="time"
                    className="col-span-3"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Duration (min)</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) || 30 }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Type</Label>
                  <Input
                    className="col-span-3"
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Location</Label>
                  <Input
                    className="col-span-3"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Notes</Label>
                  <Input
                    className="col-span-3"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') =>
                      setForm((p) => ({ ...p, priority: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={schedule} className="medical-button-primary" disabled={isScheduling}>
                  {isScheduling ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground py-8 text-center">Loading appointments...</div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-muted-foreground text-sm">{appointment.patientId}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span>{appointment.time} ({appointment.duration}min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{appointment.type}</p>
                    {appointment.notes && <p className="mt-2 rounded bg-gray-50 p-2 text-sm">{appointment.notes}</p>}
                  </div>
                ))}
                {todaysAppointments.length === 0 && (
                  <div className="text-muted-foreground py-8 text-center">No appointments scheduled for today.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <p className="text-muted-foreground text-sm">{appointment.patientId}</p>
                  </div>
                  <div className="text-sm">
                    <p>{appointment.date}</p>
                    <p className="text-muted-foreground">{appointment.time}</p>
                  </div>
                  <p className="text-sm">{appointment.type}</p>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="text-muted-foreground text-center">No upcoming appointments.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-muted-foreground text-xs">Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">From database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Appointments;
