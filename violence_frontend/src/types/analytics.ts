/**
 * Analytics Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

export interface AnalyticsSnapshot {
  id: string;
  date: string;
  totalReports: number;
  reportsByCategory: string; // JSON string
  reportsBySeverity: string; // JSON string
  resolutionRate: number;
  averageResolutionTime: number;
  anonymousReportCount: number;
  publicReportCount: number;
  casesByType: string; // JSON string
  uniqueReporters: number;
}
