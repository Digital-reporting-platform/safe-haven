import { lazy } from 'react';
import React from 'react';

const AdminPage = lazy(() =>
  import('../pages/admin/dashboard').then((module) => ({
    default: module.AdminPage,
  }))
);

const UserManagementPage = lazy(() =>
  import('../pages/admin/user-management').then((module) => ({
    default: module.UserManagementPage,
  }))
);
const UsersPage = lazy(() =>
  import('../pages/admin/user-management/users').then((module) => ({
    default: module.UsersPage,
  }))
);
const RolesPage = lazy(() =>
  import('../pages/admin/user-management/roles').then((module) => ({
    default: module.RolesPage,
  }))
);
const PermissionsPage = lazy(() =>
  import('../pages/admin/user-management/permissions').then((module) => ({
    default: module.PermissionsPage,
  }))
);

const IncidentOversightPage = lazy(() =>
  import('../pages/admin/incident-oversight').then((module) => ({
    default: module.IncidentOversightPage,
  }))
);
const CaseManagementPage = lazy(() =>
  import('../pages/admin/case-management').then((module) => ({
    default: module.CaseManagementPage,
  }))
);

const ProviderVerificationPage = lazy(() =>
  import('../pages/admin/provider-verification').then((module) => ({
    default: module.ProviderVerificationPage,
  }))
);
const PendingProvidersPage = lazy(() =>
  import('../pages/admin/provider-verification/pending-providers').then(
    (module) => ({ default: module.PendingProvidersPage })
  )
);
const VerifiedProvidersPage = lazy(() =>
  import('../pages/admin/provider-verification/verified-providers').then(
    (module) => ({ default: module.VerifiedProvidersPage })
  )
);
const VerificationProcessPage = lazy(() =>
  import('../pages/admin/provider-verification/verification-process').then(
    (module) => ({ default: module.VerificationProcessPage })
  )
);

const AnalyticsPage = lazy(() =>
  import('../pages/admin/analytics').then((module) => ({
    default: module.AnalyticsPage,
  }))
);
const ReportsPage = lazy(() =>
  import('../pages/admin/analytics/reports').then((module) => ({
    default: module.ReportsPage,
  }))
);
const StatisticsPage = lazy(() =>
  import('../pages/admin/analytics/statistics').then((module) => ({
    default: module.StatisticsPage,
  }))
);
const InsightsPage = lazy(() =>
  import('../pages/admin/analytics/insights').then((module) => ({
    default: module.InsightsPage,
  }))
);

const IntegrationsPage = lazy(() =>
  import('../pages/admin/integrations').then((module) => ({
    default: module.IntegrationsPage,
  }))
);
const SystemSettingsPage = lazy(() =>
  import('../pages/admin/system-settings').then((module) => ({
    default: module.SystemSettingsPage,
  }))
);

const SecurityPage = lazy(() =>
  import('../pages/admin/security').then((module) => ({
    default: module.SecurityPage,
  }))
);
const AuditLogsPage = lazy(() =>
  import('../pages/admin/security/audit-logs').then((module) => ({
    default: module.AuditLogsPage,
  }))
);
const AccessControlPage = lazy(() =>
  import('../pages/admin/security/access-control').then((module) => ({
    default: module.AccessControlPage,
  }))
);
const MonitoringPage = lazy(() =>
  import('../pages/admin/security/monitoring').then((module) => ({
    default: module.MonitoringPage,
  }))
);

const BackupRecoveryPage = lazy(() =>
  import('../pages/admin/backup-recovery').then((module) => ({
    default: module.BackupRecoveryPage,
  }))
);
const ProfilePage = lazy(() =>
  import('../pages/admin/profile').then((module) => ({
    default: module.ProfilePage,
  }))
);
const AdminMissingPersonsPage = lazy(() =>
  import('../pages/admin/missing-persons').then((module) => ({
    default: module.AdminMissingPersonsPage,
  }))
);

const ContactSubmissionsPage = lazy(() =>
  import('../pages/admin/contact-submissions').then((module) => ({
    default: module.default,
  }))
);

export const adminRoutes = [
  {
    path: '',
    component: AdminPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'user-management',
    component: UserManagementPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'user-management/users',
    component: UsersPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'user-management/roles',
    component: RolesPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'user-management/permissions',
    component: PermissionsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'incident-oversight',
    component: IncidentOversightPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'case-management',
    component: CaseManagementPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'provider-verification',
    component: ProviderVerificationPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'provider-verification/pending-providers',
    component: PendingProvidersPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'provider-verification/verified-providers',
    component: VerifiedProvidersPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'provider-verification/verification-process',
    component: VerificationProcessPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'analytics',
    component: AnalyticsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'analytics/reports',
    component: ReportsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'analytics/statistics',
    component: StatisticsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'analytics/insights',
    component: InsightsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'integrations',
    component: IntegrationsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'system-settings',
    component: SystemSettingsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'security',
    component: SecurityPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'security/audit-logs',
    component: AuditLogsPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'security/access-control',
    component: AccessControlPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'security/monitoring',
    component: MonitoringPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'backup-recovery',
    component: BackupRecoveryPage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'profile',
    component: ProfilePage,
    layout: 'navigation',
    roles: ['ADMIN'],
  },
  {
    path: 'missing-persons',
    component: AdminMissingPersonsPage,
    layout: 'navigation',
    roles: ['ADMIN', 'COUNSELOR', 'SYSTEM'],
  },
  {
    path: 'contact-submissions',
    component: ContactSubmissionsPage,
    layout: 'navigation',
    roles: ['ADMIN', 'MODERATOR'],
  },
];
