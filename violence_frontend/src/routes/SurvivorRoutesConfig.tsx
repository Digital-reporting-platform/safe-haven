import { lazy } from 'react';
import React from 'react';

const VictimDashboardPage = lazy(() =>
  import('../pages/survivor/dashboard/index').then((module) => ({
    default: module.VictimDashboardPage,
  }))
);
const MyCases = lazy(() =>
  import('../pages/survivor/my-cases/index').then((module) => ({
    default: module.MyCases,
  }))
);
const CommunityForumPage = lazy(() =>
  import('../pages/survivor/community-forum/index').then((module) => ({
    default: module.CommunityForumPage,
  }))
);
const EmpowermentPage = lazy(() =>
  import('../pages/survivor/empowerment/index').then((module) => ({
    default: module.EmpowermentPage,
  }))
);
const SafetySettings = lazy(() =>
  import('../pages/survivor/safety/index').then((module) => ({
    default: module.SafetySettings,
  }))
);
const Messages = lazy(() =>
  import('../pages/survivor/messages/index').then((module) => ({
    default: module.Messages,
  }))
);
const SettingsPage = lazy(() =>
  import('../pages/survivor/settings/index').then((module) => ({
    default: module.SettingsPage,
  }))
);
const CaseDetailsPage = lazy(() =>
  import('../pages/survivor/case-details/index').then((module) => ({
    default: module.CaseDetailsPage,
  }))
);
const MissingPersonsPage = lazy(() =>
  import('../pages/public/missing-persons').then((module) => ({
    default: module.MissingPersonsPage,
  }))
);
const ResourcesPage = lazy(() =>
  import('../pages/public/resources').then((module) => ({
    default: module.ResourcesPage,
  }))
);
const ReportPage = lazy(() =>
  import('../pages/public/anonymous-reporting').then((module) => ({
    default: module.ReportPage,
  }))
);

const ProfilePage = lazy(() => import('../pages/survivor/profile/index'));

export const survivorRoutes = [
  {
    path: '/survivor/dashboard',
    component: VictimDashboardPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/my-cases',
    component: MyCases,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/community-forum',
    component: CommunityForumPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/empowerment',
    component: EmpowermentPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/safety',
    component: SafetySettings,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/messages',
    component: Messages,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/settings',
    component: SettingsPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/case/:id',
    component: CaseDetailsPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/report-incident',
    component: ReportPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/missing-persons/submit',
    component: MissingPersonsPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/verified-support-directory',
    component: ResourcesPage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
  {
    path: '/survivor/profile',
    component: ProfilePage,
    layout: 'navigation',
    roles: ['SURVIVOR'],
  },
];
