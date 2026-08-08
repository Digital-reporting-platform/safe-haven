export enum Permission {
  // Incident permissions
  CREATE_INCIDENT = 'create_incident',
  READ_INCIDENT = 'read_incident',
  UPDATE_INCIDENT = 'update_incident',
  DELETE_INCIDENT = 'delete_incident',

  // Case permissions
  CREATE_CASE = 'create_case',
  READ_CASE = 'read_case',
  UPDATE_CASE = 'update_case',
  DELETE_CASE = 'delete_case',

  // User permissions
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Provider permissions
  CREATE_PROVIDER = 'create_provider',
  READ_PROVIDER = 'read_provider',
  UPDATE_PROVIDER = 'update_provider',
  DELETE_PROVIDER = 'delete_provider',

  // Forum permissions
  CREATE_FORUM = 'create_forum',
  READ_FORUM = 'read_forum',
  UPDATE_FORUM = 'update_forum',
  DELETE_FORUM = 'delete_forum',

  // Message permissions
  SEND_MESSAGE = 'send_message',
  READ_MESSAGE = 'read_message',
  DELETE_MESSAGE = 'delete_message',

  // Upload permissions
  UPLOAD_FILE = 'upload_file',
  DOWNLOAD_FILE = 'download_file',
  DELETE_FILE = 'delete_file',
}

export const PERMISSIONS = {
  CREATE_INCIDENT: Permission.CREATE_INCIDENT,
  READ_INCIDENT: Permission.READ_INCIDENT,
  UPDATE_INCIDENT: Permission.UPDATE_INCIDENT,
  DELETE_INCIDENT: Permission.DELETE_INCIDENT,

  CREATE_CASE: Permission.CREATE_CASE,
  READ_CASE: Permission.READ_CASE,
  UPDATE_CASE: Permission.UPDATE_CASE,
  DELETE_CASE: Permission.DELETE_CASE,

  CREATE_USER: Permission.CREATE_USER,
  READ_USER: Permission.READ_USER,
  UPDATE_USER: Permission.UPDATE_USER,
  DELETE_USER: Permission.DELETE_USER,

  CREATE_PROVIDER: Permission.CREATE_PROVIDER,
  READ_PROVIDER: Permission.READ_PROVIDER,
  UPDATE_PROVIDER: Permission.UPDATE_PROVIDER,
  DELETE_PROVIDER: Permission.DELETE_PROVIDER,

  CREATE_FORUM: Permission.CREATE_FORUM,
  READ_FORUM: Permission.READ_FORUM,
  UPDATE_FORUM: Permission.UPDATE_FORUM,
  DELETE_FORUM: Permission.DELETE_FORUM,

  SEND_MESSAGE: Permission.SEND_MESSAGE,
  READ_MESSAGE: Permission.READ_MESSAGE,
  DELETE_MESSAGE: Permission.DELETE_MESSAGE,

  UPLOAD_FILE: Permission.UPLOAD_FILE,
  DOWNLOAD_FILE: Permission.DOWNLOAD_FILE,
  DELETE_FILE: Permission.DELETE_FILE,
} as const;

import { Role } from './roles';

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission), // Admin has all permissions
  [Role.INSPECTOR]: [
    Permission.READ_INCIDENT,
    Permission.UPDATE_INCIDENT,
    Permission.CREATE_CASE,
    Permission.READ_CASE,
    Permission.UPDATE_CASE,
    Permission.DELETE_CASE,
    Permission.READ_USER,
    Permission.READ_PROVIDER,
    Permission.READ_FORUM,
    Permission.READ_MESSAGE,
    Permission.DOWNLOAD_FILE,
  ],
  [Role.USER]: [
    Permission.CREATE_INCIDENT,
    Permission.READ_INCIDENT,
    Permission.CREATE_FORUM,
    Permission.READ_FORUM,
    Permission.SEND_MESSAGE,
    Permission.READ_MESSAGE,
    Permission.UPLOAD_FILE,
    Permission.DOWNLOAD_FILE,
  ],
  [Role.PROVIDER]: [
    Permission.CREATE_PROVIDER,
    Permission.READ_PROVIDER,
    Permission.UPDATE_PROVIDER,
    Permission.READ_INCIDENT,
    Permission.READ_CASE,
    Permission.SEND_MESSAGE,
    Permission.READ_MESSAGE,
    Permission.UPLOAD_FILE,
    Permission.DOWNLOAD_FILE,
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};
