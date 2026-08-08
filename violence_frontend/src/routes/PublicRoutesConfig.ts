import { lazy } from 'react';

const HomePage = lazy(() =>
  import('../pages/public/home/index').then((module) => ({
    default: module.HomePage,
  }))
);
const AboutPage = lazy(() =>
  import('../pages/public/general').then((module) => ({
    default: module.AboutPage,
  }))
);
const SupportDirectoryPage = lazy(() =>
  import('../pages/public/provider-directory').then((module) => ({
    default: module.SupportDirectoryPage,
  }))
);
const MissingPersonsPage = lazy(() =>
  import('../pages/public/missing-persons').then((module) => ({
    default: module.MissingPersonsPage,
  }))
);
const MissingPersonsViewPage = lazy(() =>
  import('../pages/public/missing-persons/view').then((module) => ({
    default: module.MissingPersonsViewPage,
  }))
);
const SafetyGuidelinesPage = lazy(() =>
  import('../pages/public/missing-persons/safety-guidelines').then((module) => ({
    default: module.SafetyGuidelinesPage,
  }))
);
const SupportServicesPage = lazy(() =>
  import('../pages/public/general/support-services').then((module) => ({
    default: module.SupportServicesPage,
  }))
);
const RecoveryHub = lazy(() =>
  import('../pages/public/general/recovery-hub').then((module) => ({
    default: module.RecoveryHub,
  }))
);
const TransparencyPage = lazy(() =>
  import('../pages/public/general/transparency').then((module) => ({
    default: module.TransparencyPage,
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
const BlogPage = lazy(() =>
  import('../pages/public/general/blog').then((module) => ({
    default: module.BlogPage,
  }))
);
const PublicEmpowermentPage = lazy(() =>
  import('../pages/public/empowerment').then((module) => ({
    default: module.PublicEmpowermentPage,
  }))
);

export const publicRoutes = [
  {
    path: '/',
    component: HomePage,
    layout: 'public',
  },
  {
    path: '/landing',
    component: HomePage,
    layout: 'public',
  },
  {
    path: '/about',
    component: AboutPage,
    layout: 'public',
  },
  {
    path: '/public-support-directory',
    component: SupportDirectoryPage,
    layout: 'public',
  },
  {
    path: '/missing-persons',
    component: MissingPersonsPage,
    layout: 'public',
  },
  {
    path: '/missing-persons/view',
    component: MissingPersonsViewPage,
    layout: 'public',
  },
  {
    path: '/missing-persons/safety-guidelines',
    component: SafetyGuidelinesPage,
    layout: 'public',
  },
  {
    path: '/support',
    component: SupportServicesPage,
    layout: 'public',
  },
  {
    path: '/recovery-hub',
    component: RecoveryHub,
    layout: 'public',
  },
  {
    path: '/transparency',
    component: TransparencyPage,
    layout: 'public',
  },
  {
    path: '/resources',
    component: ResourcesPage,
    layout: 'standalone', // wrapped in Navigation
  },
  {
    path: '/report',
    component: ReportPage,
    layout: 'standalone', // wrapped in Navigation
  },
  {
    path: '/blog',
    component: BlogPage,
    layout: 'public',
  },
  {
    path: '/empowerment',
    component: PublicEmpowermentPage,
    layout: 'public',
  },
];
