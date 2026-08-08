/**
 * API Types
 * These types define the structure of API requests and responses
 */

// ============================================
// INTERFACES
// ============================================

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
