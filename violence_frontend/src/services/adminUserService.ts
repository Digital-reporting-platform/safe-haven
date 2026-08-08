import { api } from './api/client';
import { UserRole, UserStatus } from '@/types/user';

// Survivors self-register, only professionals can be invited by admin
export const ADMIN_INVITABLE_ROLES = [
  UserRole.COUNSELOR,
  UserRole.MEDICAL_PROFESSIONAL,
  UserRole.LEGAL_ADVISOR,
  UserRole.MODERATOR,
  UserRole.ADMIN,
] as const;

// All roles that can be assigned when editing existing users (includes SURVIVOR)
export const ADMIN_EDITABLE_ROLES = [
  UserRole.SURVIVOR,
  UserRole.COUNSELOR,
  UserRole.MEDICAL_PROFESSIONAL,
  UserRole.LEGAL_ADVISOR,
  UserRole.MODERATOR,
  UserRole.ADMIN,
] as const;

type InvitableUserRole = (typeof ADMIN_INVITABLE_ROLES)[number];
type EditableUserRole = (typeof ADMIN_EDITABLE_ROLES)[number];

export type AdminUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  language?: string;
  createdAt: string;
  updatedAt: string;
};

export type InviteUserPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  role: InvitableUserRole;
};

export type UpdateAdminUserPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  language?: string;
};

const isInvitableRole = (role: unknown): role is InvitableUserRole =>
  typeof role === 'string' &&
  (ADMIN_INVITABLE_ROLES as readonly string[]).includes(role);

const normalizeRole = (role: unknown): InvitableUserRole | undefined => {
  if (typeof role !== 'string') return undefined;

  const normalized = role.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return isInvitableRole(normalized) ? normalized : undefined;
};

export const adminUserService = {
  async getUsers(): Promise<AdminUser[]> {
    const response = await api.get('/auth/users');
    return response.data || [];
  },

  async inviteUser(payload: InviteUserPayload): Promise<{ message: string; user: AdminUser }> {
    const normalizedRole = normalizeRole(payload.role);
    if (!normalizedRole) {
      throw new Error('Invalid user role selected for invitation.');
    }

    const response = await api.post('/auth/invite', {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: normalizedRole,
    });
    return response.data;
  },

  async resendInvitation(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-otp', {
      email: email.trim().toLowerCase(),
      type: 'ACCOUNT_ACTIVATION',
    });
    return response.data;
  },

  async updateUser(
    userId: string,
    payload: UpdateAdminUserPayload,
  ): Promise<AdminUser> {
    const normalizedRole = normalizeRole(payload.role);
    if (payload.role && !normalizedRole) {
      throw new Error('Invalid user role selected for account update.');
    }

    const response = await api.put(`/auth/users/${userId}`, {
      ...payload,
      ...(normalizedRole ? { role: normalizedRole } : {}),
    });
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/auth/users/${userId}`);
  },
};
