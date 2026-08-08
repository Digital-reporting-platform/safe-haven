export interface AuthenticatedUser {
  id?: string;
  sub?: string;
  email?: string;
  role?: string;
}

export type AuthenticatedRequest = {
  [key: string]: unknown;
  user?: AuthenticatedUser;
};
