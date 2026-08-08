import { api } from './api/client';

export interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  location: string;
  notes: string;
  priority: string;
}

export interface ExaminationItem {
  id: string;
  patientName: string;
  patientId: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  priority: string;
  location: string;
}

export const medicalWorkflowService = {
  async getAppointments() {
    const response = await api.get<{
      stats: { today: number; total: number; confirmed: number; pending: number };
      appointments: AppointmentItem[];
    }>('/medical-provider/appointments');
    return response.data;
  },

  async scheduleAppointment(payload: {
    patientId: string;
    date: string;
    time: string;
    duration?: number;
    type?: string;
    location?: string;
    notes?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    const response = await api.post('/medical-provider/appointments', payload);
    return response.data;
  },

  async getExaminations() {
    const response = await api.get<{
      stats: { total: number; scheduled: number; inProgress: number; completed: number };
      examinations: ExaminationItem[];
    }>('/medical-provider/examinations');
    return response.data;
  },

  async scheduleExamination(payload: {
    patientId: string;
    examType: string;
    date: string;
    time: string;
    location?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    const response = await api.post('/medical-provider/examinations', payload);
    return response.data;
  },
};

