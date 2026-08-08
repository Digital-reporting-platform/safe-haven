/**
 * Audit Log Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string; // JSON string
  userId?: string;
  ipAddress?: string;
  createdAt: string;

  // Relations
  report?: any; // Report
}
