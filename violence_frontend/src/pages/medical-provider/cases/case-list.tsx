import CaseList from '@/components/provider/CaseList';
import { api } from '@/services/api/client';

const fetchMedicalCases = async (filters: { status?: string; priority?: string }) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.priority) queryParams.append('priority', filters.priority);

  console.log('[fetchMedicalCases] filters:', filters, 'queryParams:', queryParams.toString());

  const response = await api.get(`/medical-provider/cases?${queryParams.toString()}`);

  console.log('[fetchMedicalCases] received data:', response.data);
  return response.data;
};

export default function MedicalCaseList() {
  return <CaseList role="MEDICAL_PROFESSIONAL" fetchCases={fetchMedicalCases} />;
}
