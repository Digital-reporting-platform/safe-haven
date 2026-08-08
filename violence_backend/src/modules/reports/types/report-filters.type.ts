import {
  IncidentCategory,
  ReportStatus,
  SeverityLevel,
} from '@prisma/client';

export type ReportFilters = {
  status?: ReportStatus;
  category?: IncidentCategory;
  severity?: SeverityLevel;
  flagged?: boolean;
  reporterId?: string;
};
