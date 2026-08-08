export interface CaseUpdate {
  date: string;
  text: string;
  type?: 'status_change' | 'note' | 'evidence_added' | 'contact_made';
}

export interface Case {
  id: string;
  status: string;
  date: string;
  title: string;
  updates: CaseUpdate[];
  milestone?: string;
  lastUpdate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedCounselor?: string;
  category?: string;
  isAnonymous?: boolean;
}

export interface CaseFilters {
  status?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  counselor?: string;
}

export const STATUS_STEPS = [
  'Received',
  'Under Review',
  'Assigned',
  'In Support',
  'Closed',
] as const;
export type CaseStatus = (typeof STATUS_STEPS)[number];

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type CasePriority = (typeof PRIORITY_LEVELS)[number];

export class CaseTrackingService {
  private static instance: CaseTrackingService;
  private cases: Case[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): CaseTrackingService {
    if (!CaseTrackingService.instance) {
      CaseTrackingService.instance = new CaseTrackingService();
    }
    return CaseTrackingService.instance;
  }

  private initializeMockData(): void {
    this.cases = [
      {
        id: 'SH-89241',
        status: 'Assigned',
        date: 'Jan 15, 2024',
        title: 'Anonymous Incident Report',
        milestone: 'Counselor Assignment Complete',
        lastUpdate: '2 hours ago',
        priority: 'high',
        assignedCounselor: 'Sarah M.',
        category: 'Domestic Violence',
        isAnonymous: true,
        updates: [
          {
            date: 'Jan 20',
            text: 'Assigned to counselor Sarah for trauma-informed support.',
            type: 'status_change',
          },
          {
            date: 'Jan 16',
            text: 'Case verified and moved to review phase.',
            type: 'status_change',
          },
          {
            date: 'Jan 15',
            text: 'Report received securely via end-to-end encryption.',
            type: 'status_change',
          },
        ],
      },
      {
        id: 'SH-89242',
        status: 'In Support',
        date: 'Jan 18, 2024',
        title: 'Workplace Harassment Case',
        milestone: 'Active Support Phase',
        lastUpdate: '1 day ago',
        priority: 'medium',
        assignedCounselor: 'Michael K.',
        category: 'Workplace Harassment',
        isAnonymous: false,
        updates: [
          {
            date: 'Jan 22',
            text: 'Support session completed - safety plan established.',
            type: 'contact_made',
          },
          {
            date: 'Jan 20',
            text: 'Legal resources provided to survivor.',
            type: 'note',
          },
          {
            date: 'Jan 18',
            text: 'Case assigned for ongoing support.',
            type: 'status_change',
          },
        ],
      },
      {
        id: 'SH-89243',
        status: 'Under Review',
        date: 'Jan 22, 2024',
        title: 'Community Safety Report',
        milestone: 'Initial Review Phase',
        lastUpdate: '3 hours ago',
        priority: 'critical',
        assignedCounselor: 'Pending',
        category: 'Community Safety',
        isAnonymous: true,
        updates: [
          {
            date: 'Jan 23',
            text: 'Evidence review in progress.',
            type: 'note',
          },
          {
            date: 'Jan 22',
            text: 'Report received and queued for review.',
            type: 'status_change',
          },
        ],
      },
    ];
  }

  async getCases(filters?: CaseFilters): Promise<Case[]> {
    let filteredCases = [...this.cases];

    if (filters) {
      if (filters.status) {
        filteredCases = filteredCases.filter(
          (case_) => case_.status === filters.status
        );
      }
      if (filters.priority) {
        filteredCases = filteredCases.filter(
          (case_) => case_.priority === filters.priority
        );
      }
      if (filters.counselor) {
        filteredCases = filteredCases.filter((case_) =>
          case_.assignedCounselor
            ?.toLowerCase()
            .includes(filters.counselor!.toLowerCase())
        );
      }
      if (filters.dateRange) {
        filteredCases = filteredCases.filter((case_) => {
          const caseDate = new Date(case_.date);
          const startDate = new Date(filters.dateRange!.start);
          const endDate = new Date(filters.dateRange!.end);
          return caseDate >= startDate && caseDate <= endDate;
        });
      }
    }

    return filteredCases.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getCaseById(caseId: string): Promise<Case | null> {
    return this.cases.find((case_) => case_.id === caseId) || null;
  }

  async createCase(
    caseData: Omit<Case, 'id' | 'updates' | 'date'>
  ): Promise<Case> {
    const newCase: Case = {
      ...caseData,
      id: `SH-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      updates: [
        {
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          text: 'Case created and submitted for review.',
          type: 'status_change',
        },
      ],
    };

    this.cases.push(newCase);
    return newCase;
  }

  async updateCaseStatus(
    caseId: string,
    newStatus: CaseStatus,
    note?: string
  ): Promise<Case | null> {
    const caseIndex = this.cases.findIndex((case_) => case_.id === caseId);
    if (caseIndex === -1) return null;

    const case_ = this.cases[caseIndex];
    case_.status = newStatus;
    case_.lastUpdate = 'Just now';

    const update: CaseUpdate = {
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      text: note || `Status updated to: ${newStatus}`,
      type: 'status_change',
    };

    case_.updates.unshift(update);

    this.cases[caseIndex] = case_;
    return case_;
  }

  async addCaseUpdate(
    caseId: string,
    update: Omit<CaseUpdate, 'date'>
  ): Promise<Case | null> {
    const caseIndex = this.cases.findIndex((case_) => case_.id === caseId);
    if (caseIndex === -1) return null;

    const case_ = this.cases[caseIndex];
    const newUpdate: CaseUpdate = {
      ...update,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };

    case_.updates.unshift(newUpdate);
    case_.lastUpdate = 'Just now';

    this.cases[caseIndex] = case_;
    return case_;
  }

  getStatusProgress(status: CaseStatus): number {
    const statusIndex = STATUS_STEPS.indexOf(status);
    return Math.round(((statusIndex + 1) / STATUS_STEPS.length) * 100);
  }

  getStatusProgressWidth(status: CaseStatus): number {
    const statusIndex = STATUS_STEPS.indexOf(status);
    return (statusIndex / (STATUS_STEPS.length - 1)) * 100;
  }

  isStatusCompleted(status: CaseStatus, targetStep: string): boolean {
    const statusIndex = STATUS_STEPS.indexOf(status);
    const targetIndex = STATUS_STEPS.indexOf(targetStep as CaseStatus);
    return statusIndex >= targetIndex;
  }

  isStatusActive(status: CaseStatus, step: string): boolean {
    return status === step;
  }

  getPriorityColor(priority: CasePriority): string {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getCaseStats(): Promise<{
    total: number;
    byStatus: Record<CaseStatus, number>;
    byPriority: Record<CasePriority, number>;
    recentlyUpdated: number;
  }> {
    const stats = {
      total: this.cases.length,
      byStatus: {} as Record<CaseStatus, number>,
      byPriority: {} as Record<CasePriority, number>,
      recentlyUpdated: this.cases.filter(
        (c) =>
          c.lastUpdate?.includes('hour') || c.lastUpdate?.includes('Just now')
      ).length,
    };

    STATUS_STEPS.forEach((status) => {
      stats.byStatus[status] = this.cases.filter(
        (c) => c.status === status
      ).length;
    });

    PRIORITY_LEVELS.forEach((priority) => {
      stats.byPriority[priority] = this.cases.filter(
        (c) => c.priority === priority
      ).length;
    });

    return Promise.resolve(stats);
  }
}

export const caseTrackingService = CaseTrackingService.getInstance();
