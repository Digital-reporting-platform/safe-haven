import CaseDetails from '@/components/provider/CaseDetails';
import { api } from '@/services/api/client';

const fetchLegalCaseDetails = async (caseId: string) => {
  const response = await api.get(`/legal-provider/cases/${caseId}`);
  return response.data;
};

const updateLegalCaseStatus = async (caseId: string, status: string) => {
  const response = await api.put(`/legal-provider/cases/${caseId}/status`, { status });
  return response.data;
};

const addLegalNotes = async (caseId: string, notes: any) => {
  const response = await api.post(`/legal-provider/cases/${caseId}/notes`, notes);
  return response.data;
};

const requestLegalMeeting = async (caseId: string, data: any) => {
  const response = await api.post(`/legal-provider/cases/${caseId}/meeting-request`, data);
  return response.data;
};

const fetchLegalComments = async (caseId: string) => {
  const response = await api.get(`/legal-provider/cases/${caseId}/comments`);
  return response.data;
};

const addLegalComment = async (caseId: string, content: string) => {
  const response = await api.post(`/legal-provider/cases/${caseId}/comments`, { content });
  return response.data;
};

export default function LegalCaseDetails() {
  return (
    <CaseDetails
      role="LEGAL_ADVISOR"
      fetchCaseDetails={fetchLegalCaseDetails}
      updateStatus={updateLegalCaseStatus}
      addNotes={addLegalNotes}
      requestMeeting={requestLegalMeeting}
      fetchComments={fetchLegalComments}
      addComment={addLegalComment}
    />
  );
}
