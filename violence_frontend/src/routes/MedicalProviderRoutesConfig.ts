import { lazy } from 'react';

const MedicalDashboardPage = lazy(() =>
  import('../pages/medical-provider/dashboard').then((module) => ({
    default: module.default,
  }))
);

const MedicalCaseListPage = lazy(() =>
  import('../pages/medical-provider/cases/case-list').then((module) => ({
    default: module.default,
  }))
);

const MedicalCaseDetailsPage = lazy(() =>
  import('../pages/medical-provider/cases/case-details').then((module) => ({
    default: module.default,
  }))
);

const MedicalForensicExamsPage = lazy(() =>
  import('../pages/medical-provider/examinations/forensic-exams').then((module) => ({
    default: module.default,
  }))
);

const MedicalAppointmentsPage = lazy(() =>
  import('../pages/medical-provider/appointments').then((module) => ({
    default: module.default,
  }))
);

const MedicalMessagingPage = lazy(() =>
  import('../pages/medical-provider/messaging').then((module) => ({
    default: module.default,
  }))
);

const MedicalProfilePage = lazy(() =>
  import('../pages/medical-provider/profile').then((module) => ({
    default: module.default,
  }))
);

// Note: Medical professionals may share some routes with counselors
// This file contains routes specific to MEDICAL_PROFESSIONAL role
export const medicalProviderRoutes = [
  {
    path: 'dashboard',
    component: MedicalDashboardPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  // Case Management
  {
    path: 'cases',
    component: MedicalCaseListPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'cases/:id',
    component: MedicalCaseDetailsPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'examinations',
    component: MedicalForensicExamsPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'examinations/forensic-exams',
    component: MedicalForensicExamsPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'appointments',
    component: MedicalAppointmentsPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'messages',
    component: MedicalMessagingPage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
  {
    path: 'profile',
    component: MedicalProfilePage,
    layout: 'navigation',
    roles: ['MEDICAL_PROFESSIONAL'],
  },
];
