export enum Role {
  ADMIN = 'admin',
  INSPECTOR = 'inspector',
  USER = 'user',
  PROVIDER = 'provider',
}

export const ROLES = {
  ADMIN: Role.ADMIN,
  INSPECTOR: Role.INSPECTOR,
  USER: Role.USER,
  PROVIDER: Role.PROVIDER,
} as const;
