/**
 * ML Training Data Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

import { IncidentCategory, SeverityLevel } from './incident';

export interface MLTrainingData {
  id: string;
  category: IncidentCategory;
  text: string;
  severity: SeverityLevel;
  frequency: number;
  isActive: boolean;
  createdAt: string;
}
