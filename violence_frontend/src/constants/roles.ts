import { UserRole } from "@/types/user";

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.COUNSELOR]: '/counselor-dashboard',
  [UserRole.MEDICAL_PROFESSIONAL]: '/medical-provider/dashboard',
  [UserRole.LEGAL_ADVISOR]: '/legal/dashboard',
  [UserRole.MODERATOR]: '/moderator/dashboard',
  [UserRole.SURVIVOR]: '/survivor/dashboard',
  [UserRole.SYSTEM]: '/',
  [UserRole.GENERAL_CASE_MANAGER]: '/general-case-manager'
};