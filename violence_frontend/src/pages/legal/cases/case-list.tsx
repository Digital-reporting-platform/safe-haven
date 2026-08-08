import CaseList from '@/components/provider/CaseList';
import { api } from '@/services/api/client';

const fetchLegalCases = async (filters: { status?: string; priority?: string }) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.priority) queryParams.append('priority', filters.priority);

  const response = await api.get(`/legal-provider/cases?${queryParams.toString()}`);
  return response.data;
};

export default function LegalCaseList() {
  return <CaseList role="LEGAL_ADVISOR" fetchCases={fetchLegalCases} />;
}
