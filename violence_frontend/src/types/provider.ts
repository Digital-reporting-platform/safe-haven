/**
 * Provider Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

// ============================================
// INTERFACES
// ============================================

export interface Provider {
  id: string;
  name: string;
  type: string;
  contactInfo?: string;
  services: string[];
  createdAt: string;
  updatedAt: string;
}
