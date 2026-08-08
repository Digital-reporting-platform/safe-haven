import CaseDetails from '@/components/provider/CaseDetails';
import { api } from '@/services/api/client';

const fetchMedicalCaseDetails = async (caseId: string) => {
  const response = await api.get(`/medical-provider/cases/${caseId}`);
  return response.data;
};

const updateMedicalCaseStatus = async (caseId: string, status: string) => {
  const response = await api.put(`/medical-provider/cases/${caseId}/status`, { status });
  return response.data;
};

const addMedicalNotes = async (caseId: string, notes: any) => {
  const response = await api.post(`/medical-provider/cases/${caseId}/notes`, notes);
  return response.data;
};

const requestMedicalMeeting = async (caseId: string, data: any) => {
  const response = await api.post(`/medical-provider/cases/${caseId}/meeting-request`, data);
  return response.data;
};

const fetchMedicalComments = async (caseId: string) => {
  const response = await api.get(`/medical-provider/cases/${caseId}/comments`);
  return response.data;
};

const addMedicalComment = async (caseId: string, content: string) => {
  const response = await api.post(`/medical-provider/cases/${caseId}/comments`, { content });
  return response.data;
};

export default function MedicalCaseDetails() {
  return (
    <CaseDetails
      role="MEDICAL_PROFESSIONAL"
      fetchCaseDetails={fetchMedicalCaseDetails}
      updateStatus={updateMedicalCaseStatus}
      addNotes={addMedicalNotes}
      requestMeeting={requestMedicalMeeting}
      fetchComments={fetchMedicalComments}
      addComment={addMedicalComment}
    />
  );
}
