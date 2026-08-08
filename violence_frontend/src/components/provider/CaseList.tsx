import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Case {
  id: string;
  trackingNumber: string;
  category: string;
  severity: string;
  priority: string;
  status: string;
  assignedAt: string;
  caseType: string;
  description: string;
  isAnonymous: boolean;
  mlSuggestions?: {
    classificationLabel?: string;
    suggestedCaseType?: string;
    suggestedPriority?: string;
  };
  riskScore?: number;
}

interface CaseListProps {
  role: 'MEDICAL_PROFESSIONAL' | 'LEGAL_ADVISOR';
  fetchCases: (filters: { status?: string; priority?: string }) => Promise<Case[]>;
}

export default function CaseList({ role, fetchCases }: CaseListProps) {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });

  useEffect(() => {
    loadCases();
  }, [filters]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases(filters);
      setCases(data);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return {
          bg: 'bg-[var(--colors-primary-cta)]/10',
          text: 'text-[var(--colors-primary-cta)]',
          border: 'border-[var(--colors-primary-cta)]',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-[var(--colors-accent-highlight)]/10',
          text: 'text-[var(--colors-accent-highlight)]',
          border: 'border-[var(--colors-accent-highlight)]',
        };
      case 'LOW':
        return {
          bg: 'bg-[var(--colors-olive-5)]/10',
          text: 'text-[var(--colors-olive-5)]',
          border: 'border-[var(--colors-olive-5)]',
        };
      default:
        return {
          bg: 'bg-[var(--colors-olive-5)]/5',
          text: 'text-[var(--colors-olive-5)]',
          border: 'border-[var(--colors-olive-5)]',
        };
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'ASSIGNED':
        return {
          bg: 'bg-[var(--colors-olive-5)]/10',
          text: 'text-[var(--colors-olive-5)]',
          border: 'border-[var(--colors-olive-5)]',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-[var(--colors-accent-highlight)]/10',
          text: 'text-[var(--colors-accent-highlight)]',
          border: 'border-[var(--colors-accent-highlight)]',
        };
      case 'RESOLVED':
        return {
          bg: 'bg-[var(--colors-olive-5)]/15',
          text: 'text-[var(--colors-olive-7)]',
          border: 'border-[var(--colors-olive-7)]',
        };
      default:
        return {
          bg: 'bg-[var(--colors-olive-5)]/5',
          text: 'text-[var(--colors-olive-5)]',
          border: 'border-[var(--colors-olive-5)]',
        };
    }
  };

  const isMedical = role === 'MEDICAL_PROFESSIONAL';

  const isLegal = role === 'LEGAL_ADVISOR';

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)] mb-2">
            {isMedical ? 'Medical' : 'Legal'} Cases
          </h1>
          <p className="text-[var(--colors-body-text)] text-lg">
            Manage cases assigned to you
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--colors-heading-text)] mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--color-card)] border border-[var(--border-border-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--colors-olive-5)] focus:border-transparent text-[var(--colors-body-text)] transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--colors-heading-text)] mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--color-card)] border border-[var(--border-border-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--colors-olive-5)] focus:border-transparent text-[var(--colors-body-text)] transition-all"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--colors-olive-5)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--colors-body-text)]">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-card)] rounded-2xl border border-[var(--border-border-secondary)]">
            <div className="text-[var(--colors-body-text)] text-lg">No cases found</div>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--border-border-secondary)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[var(--surface-surface-secondary)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--colors-heading-text)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-border-secondary)]">
                  {cases.map((caseItem) => {
                    const priorityStyle = getPriorityStyle(caseItem.priority);
                    const statusStyle = getStatusStyle(caseItem.status);
                    
                    return (
                      <tr
                        key={caseItem.id}
                        className="hover:bg-[var(--surface-surface-secondary)] cursor-pointer transition-colors"
                        onClick={() => navigate(`${caseItem.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[var(--colors-body-text)]">
                            {caseItem.trackingNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--colors-body-text)]">
                            {caseItem.category?.replace(/_/g, ' ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                          >
                            {caseItem.priority || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {caseItem.status?.replace(/_/g, ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--colors-body-text)]">
                          {caseItem.assignedAt ? new Date(caseItem.assignedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${caseItem.id}`);
                            }}
                            className={`font-medium transition-colors ${isLegal ? 'text-[var(--colors-primary-cta)] hover:text-[var(--colors-terracotta-6)]' : 'text-[var(--colors-olive-5)] hover:text-[var(--colors-olive-7)]'}`}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
