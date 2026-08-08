import { lazy } from 'react';

const ModeratorDashboard = lazy(() =>
  import('../pages/moderator/dashboard/index').then((module) => ({
    default: module.default,
  }))
);
const ThreadReview = lazy(() =>
  import('../pages/moderator/forums/thread-review/index').then((module) => ({
    default: module.default,
  }))
);
const ReportedContent = lazy(() =>
  import('../pages/moderator/forums/reported-content/index').then((module) => ({
    default: module.default,
  }))
);
const FlaggedUsers = lazy(() =>
  import('../pages/moderator/forums/flagged-users/index').then((module) => ({
    default: module.default,
  }))
);
const ContentModeration = lazy(() =>
  import('../pages/moderator/content-moderation/index').then((module) => ({
    default: module.default,
  }))
);
const UserManagement = lazy(() =>
  import('../pages/moderator/user-management/index').then((module) => ({
    default: module.default,
  }))
);
const Guidelines = lazy(() =>
  import('../pages/moderator/guidelines/index').then((module) => ({
    default: module.default,
  }))
);
const Analytics = lazy(() =>
  import('../pages/moderator/analytics/index').then((module) => ({
    default: module.default,
  }))
);
const ModerationReports = lazy(() =>
  import('../pages/moderator/analytics/reports/index').then((module) => ({
    default: module.default,
  }))
);
const ContentAnalytics = lazy(() =>
  import('../pages/moderator/analytics/content/index').then((module) => ({
    default: module.default,
  }))
);
const UserBehavior = lazy(() =>
  import('../pages/moderator/analytics/users/index').then((module) => ({
    default: module.default,
  }))
);
const Profile = lazy(() =>
  import('../pages/moderator/profile/index').then((module) => ({
    default: module.default,
  }))
);

export const moderatorRoutes = [
  {
    path: 'dashboard',
    component: ModeratorDashboard,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'forums/thread-review',
    component: ThreadReview,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'forums/reported-content',
    component: ReportedContent,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'forums/flagged-users',
    component: FlaggedUsers,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'content-moderation',
    component: ContentModeration,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'user-management',
    component: UserManagement,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'guidelines',
    component: Guidelines,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'analytics',
    component: Analytics,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'analytics/reports',
    component: ModerationReports,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'analytics/content',
    component: ContentAnalytics,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'analytics/users',
    component: UserBehavior,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
  {
    path: 'profile',
    component: Profile,
    layout: 'navigation',
    roles: ['MODERATOR'],
  },
];
