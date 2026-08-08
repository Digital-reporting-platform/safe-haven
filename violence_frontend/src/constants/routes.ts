import { UserRole } from '@/types/user';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CASES: '/cases',
  CASE_DETAIL: '/cases/:id',
  INSPECTORS: '/inspectors',
  PROFILE: '/profile',
  ADMIN: '/admin',
};

export const DASHBOARD_ROUTES = {
  [UserRole.SURVIVOR]: '/survivor/dashboard',
  [UserRole.COUNSELOR]: '/counselor/dashboard',
  [UserRole.MEDICAL_PROFESSIONAL]: '/medical-provider/dashboard',
  [UserRole.LEGAL_ADVISOR]: '/legal/dashboard',
  [UserRole.ADMIN]: '/admin',
  [UserRole.MODERATOR]: '/moderator/dashboard',
  [UserRole.SYSTEM]: '/system/dashboard',
  [UserRole.GENERAL_CASE_MANAGER]: '/case-manager/dashboard',
};
