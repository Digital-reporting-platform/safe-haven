import { useEffect, useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Calendar, FileText, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { medicalWorkflowService, type ExaminationItem } from '@/services/medicalWorkflowService';
import { patientService, type PatientListItem } from '@/services/patientService';

const ForensicExams = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, inProgress: 0, completed: 0 });
  const [exams, setExams] = useState<ExaminationItem[]>([]);
  const [form, setForm] = useState({
    patientId: '',
    examType: 'Forensic Medical Examination',
    date: '',
    time: '',
    location: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  });

  const load = async () => {
    setIsLoading(true);

    // Load examinations first. If this fails, the page cannot render core data.
    try {
      const examData = await medicalWorkflowService.getExaminations();
      setStats(examData.stats);
      setExams(examData.examinations);
    } catch (error: any) {
      console.error('Failed to load forensic examinations', error);
      toast.error(error?.message || 'Failed to load examinations from database');
      setStats({ total: 0, scheduled: 0, inProgress: 0, completed: 0 });
      setExams([]);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }

    // Patient list is secondary (used for schedule dropdown). Do not block exams table.
    try {
      const patientData = await patientService.getPatients(undefined, undefined, {
        assignedToMedical: true,
      });
      setPatients(patientData);
    } catch (error: any) {
      console.error('Failed to load patient options for examinations', error);
      toast.error(error?.message || 'Failed to load patient list for scheduling');
      setPatients([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patientOptions = useMemo(
    () => patients.filter((p) => !!p.id),
    [patients],
  );

  const scheduleExam = async () => {
    if (!form.patientId || !form.date || !form.time || !form.examType) {
      toast.error('Please complete patient, exam type, date and time');
      return;
    }
    try {
      setIsScheduling(true);
      await medicalWorkflowService.scheduleExamination(form);
      toast.success('Examination scheduled');
      setIsScheduleDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error('Failed to schedule exam', error);
      toast.error(error?.message || 'Failed to schedule examination');
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[rgba(107, 112, 92, 0.15)] text-[#4F5342] border-[#4F5342]';
      case 'In Progress':
        return 'bg-[rgba(221, 161, 94, 0.1)] text-[#DDA15E] border-[#DDA15E]';
      case 'Scheduled':
        return 'bg-[rgba(107, 112, 92, 0.1)] text-[#6B705C] border-[#6B705C]';
      case 'Cancelled':
        return 'bg-[rgba(193, 91, 62, 0.1)] text-[#C15B3E] border-[#C15B3E]';
      default:
        return 'bg-[rgba(107, 112, 92, 0.05)] text-[#6B705C] border-[#6B705C]';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-[rgba(193, 91, 62, 0.1)] text-[#C15B3E] border-[#C15B3E]';
      case 'MEDIUM':
        return 'bg-[rgba(221, 161, 94, 0.1)] text-[#DDA15E] border-[#DDA15E]';
      case 'LOW':
        return 'bg-[rgba(107, 112, 92, 0.1)] text-[#6B705C] border-[#6B705C]';
      default:
        return 'bg-[rgba(107, 112, 92, 0.05)] text-[#6B705C] border-[#6B705C]';
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
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] bg-clip-text text-4xl font-bold text-transparent">
                Forensic Examinations
              </h1>
              <p className="font-medium text-[var(--colors-body-text)]">
                Manage and schedule medical examinations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--role-medical)] hover:bg-[var(--colors-olive-9)]">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] border-[var(--border-border-secondary)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--colors-heading-text)]">Schedule Forensic Examination</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[var(--colors-heading-text)]">Patient</Label>
                  <Select value={form.patientId} onValueChange={(value) => setForm((p) => ({ ...p, patientId: value }))}>
                    <SelectTrigger className="col-span-3 border-[var(--border-border-secondary)]">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientOptions.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[var(--colors-heading-text)]">Exam Type</Label>
                  <Input
                    className="col-span-3 border-[var(--border-border-secondary)]"
                    value={form.examType}
                    onChange={(e) => setForm((p) => ({ ...p, examType: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[#4A4D42]">Date</Label>
                  <Input
                    type="date"
                    className="col-span-3 border-[#E8E7E0]"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[#4A4D42]">Time</Label>
                  <Input
                    type="time"
                    className="col-span-3 border-[#E8E7E0]"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[#4A4D42]">Location</Label>
                  <Input
                    className="col-span-3 border-[#E8E7E0]"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Medical Center Room 5"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-[#4A4D42]">Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') =>
                      setForm((p) => ({ ...p, priority: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3 border-[#E8E7E0]">
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
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="border-[#E8E7E0] text-[#3D4035] hover:bg-[#F7F3E6]">
                  Cancel
                </Button>
                <Button onClick={scheduleExam} disabled={isScheduling} className="bg-[#C15B3E] hover:bg-[#A54B34]">
                  {isScheduling ? 'Scheduling...' : 'Schedule Exam'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-[#E8E7E0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#4A4D42]">Total Exams</CardTitle>
            <FileText className="text-[#6B705C] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3D4035]">{stats.total}</div>
            <p className="text-[#6B705C] text-xs">From database</p>
          </CardContent>
        </Card>
        <Card className="border-[#E8E7E0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#4A4D42]">Scheduled</CardTitle>
            <Calendar className="text-[#6B705C] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3D4035]">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card className="border-[#E8E7E0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#4A4D42]">In Progress</CardTitle>
            <FileText className="text-[#6B705C] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3D4035]">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="border-[#E8E7E0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#4A4D42]">Completed</CardTitle>
            <FileText className="text-[#6B705C] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3D4035]">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E8E7E0] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#4A4D42]">Forensic Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-[#6B705C] py-8 text-center">Loading examinations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F7F3E6]">
                  <TableHead className="text-[#4A4D42]">Exam ID</TableHead>
                  <TableHead className="text-[#4A4D42]">Patient</TableHead>
                  <TableHead className="text-[#4A4D42]">Type</TableHead>
                  <TableHead className="text-[#4A4D42]">Date & Time</TableHead>
                  <TableHead className="text-[#4A4D42]">Status</TableHead>
                  <TableHead className="text-[#4A4D42]">Priority</TableHead>
                  <TableHead className="text-[#4A4D42]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id} className="border-[#E8E7E0]">
                    <TableCell className="font-medium text-[#3D4035]">{exam.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#3D4035]">{exam.patientName}</p>
                        <p className="text-[#6B705C] text-xs">{exam.patientId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#3D4035]">{exam.type}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-[#3D4035]">{exam.scheduledDate}</p>
                        <p className="text-[#6B705C] text-sm">{exam.scheduledTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(exam.status)}`}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityStyle(exam.priority)}`}>
                        {exam.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-[#E8E7E0] text-[#3D4035] hover:bg-[#F7F3E6]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-[#6B705C] text-center">
                      No examinations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default ForensicExams;
