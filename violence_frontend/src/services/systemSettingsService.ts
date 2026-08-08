import { api } from './api/client';

export type GeneralSystemSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  timezone: 'UTC' | 'EST' | 'PST' | 'GMT';
  language: 'en' | 'es' | 'fr' | 'am';
};

export type SecuritySystemSettings = {
  enableTwoFactor: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  enableAuditLogs: boolean;
  maxLoginAttempts: number;
};

export type NotificationSystemSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  incidentAlerts: boolean;
};

export type MaintenanceSystemSettings = {
  maintenanceMode: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  logRetentionDays: number;
  autoUpdates: boolean;
};

export type SystemSettings = {
  general: GeneralSystemSettings;
  security: SecuritySystemSettings;
  notifications: NotificationSystemSettings;
  maintenance: MaintenanceSystemSettings;
};

export type SystemSettingsCategory = keyof SystemSettings;

export const defaultSystemSettings: SystemSettings = {
  general: {
    siteName: 'SafeHaven',
    siteDescription: 'A platform for survivor support and resources',
    contactEmail: 'admin@safehaven.org',
    timezone: 'UTC',
    language: 'en',
  },
  security: {
    enableTwoFactor: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    enableAuditLogs: true,
    maxLoginAttempts: 5,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    incidentAlerts: true,
  },
  maintenance: {
    maintenanceMode: false,
    backupFrequency: 'daily',
    logRetentionDays: 90,
    autoUpdates: true,
  },
};

export const systemSettingsService = {
  async getSettings(): Promise<SystemSettings> {
    const token = localStorage.getItem('sh_token');
    if (!token) {
      throw new Error('Please log in as an admin to access system settings.');
    }

    const response = await api.get('/system-settings');
    return response.data;
  },

  async updateCategory<K extends SystemSettingsCategory>(
    category: K,
    data: SystemSettings[K],
  ): Promise<SystemSettings[K]> {
    const token = localStorage.getItem('sh_token');
    if (!token) {
      throw new Error('Please log in as an admin to update system settings.');
    }

    const response = await api.put(`/system-settings/${category}`, { data });
    return response.data?.data;
  },
};
