import { lazy } from 'react';

// Dashboard
const CounselorDashboardPage = lazy(() =>
  import('../pages/counselor/dashboard').then((module) => ({
    default: module.default,
  }))
);

// Cases
const CasesPage = lazy(() => import('../pages/counselor/cases'));
const CaseDetailPage = lazy(() => import('../pages/counselor/cases/case-detail'));

// Messages
const MessagesPage = lazy(() => import('../pages/counselor/messages'));

// Notifications
const NotificationsPage = lazy(() => import('../pages/counselor/notifications'));

// Reports Overview (Analytics)
const ReportsOverviewPage = lazy(() => import('../pages/counselor/reports-overview'));

// Profile
const ProfilePage = lazy(() => import('../pages/counselor/profile'));

const RedirectToDashboard = () => {
  window.location.href = '/counselor/dashboard';
  return null;
};

export const counselorRoutes = [
  // Dashboard
  {
    path: '/counselor/dashboard',
    component: CounselorDashboardPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },
  {
    path: '/counselor-dashboard',
    component: RedirectToDashboard,
    layout: 'standalone',
    roles: ['COUNSELOR'],
  },

  // Cases (with tabs)
  {
    path: '/counselor/cases',
    component: CasesPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },
  {
    path: '/counselor/cases/:id',
    component: CaseDetailPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },

  // Messages
  {
    path: '/counselor/messages',
    component: MessagesPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },

  // Notifications
  {
    path: '/counselor/notifications',
    component: NotificationsPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },

  // Reports Overview
  {
    path: '/counselor/reports-overview',
    component: ReportsOverviewPage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },

  // Profile
  {
    path: '/counselor/profile',
    component: ProfilePage,
    layout: 'navigation',
    roles: ['COUNSELOR'],
  },
];
