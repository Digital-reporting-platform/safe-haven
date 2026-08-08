import { lazy } from 'react';

const LegalDashboardPage = lazy(() =>
  import('../pages/legal/dashboard').then((module) => ({ default: module.default })),
);

const LegalCaseListPage = lazy(() =>
  import('../pages/legal/cases/case-list').then((module) => ({ default: module.default })),
);

const LegalCaseDetailsPage = lazy(() =>
  import('../pages/legal/cases/case-details').then((module) => ({ default: module.default })),
);

const LegalConsultationsPage = lazy(() =>
  import('../pages/legal/consultations').then((module) => ({ default: module.default })),
);

const LegalCourtCalendarPage = lazy(() =>
  import('../pages/legal/court-calendar').then((module) => ({ default: module.default })),
);

const LegalDocumentsPage = lazy(() =>
  import('../pages/legal/documents').then((module) => ({ default: module.default })),
);

const LegalDocLibraryPage = lazy(() =>
  import('../pages/legal/documents/document-library').then((module) => ({ default: module.default })),
);

const LegalDocTemplatesPage = lazy(() =>
  import('../pages/legal/documents/templates').then((module) => ({ default: module.default })),
);

const LegalDocGeneratorPage = lazy(() =>
  import('../pages/legal/documents/generator').then((module) => ({ default: module.default })),
);

const LegalEvidencePage = lazy(() =>
  import('../pages/legal/evidence-management').then((module) => ({ default: module.default })),
);

const LegalMessagingPage = lazy(() =>
  import('../pages/legal/messaging').then((module) => ({ default: module.default })),
);

const LegalInboxPage = lazy(() =>
  import('../pages/legal/messaging/inbox').then((module) => ({ default: module.default })),
);

const LegalThreadPage = lazy(() =>
  import('../pages/legal/messaging/message-thread').then((module) => ({ default: module.default })),
);

const LegalComposerPage = lazy(() =>
  import('../pages/legal/messaging/message-composer').then((module) => ({ default: module.default })),
);

const LegalAttachmentPage = lazy(() =>
  import('../pages/legal/messaging/attachments').then((module) => ({ default: module.default })),
);

const LegalOutcomesPage = lazy(() =>
  import('../pages/legal/outcomes').then((module) => ({ default: module.default })),
);

const LegalProfilePage = lazy(() =>
  import('../pages/legal/profile').then((module) => ({ default: module.default })),
);

const LegalResourcesPage = lazy(() =>
  import('../pages/legal/resources').then((module) => ({ default: module.default })),
);

export const legalProviderRoutes = [
  { path: 'dashboard', component: LegalDashboardPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  // Case Management
  { path: 'cases', component: LegalCaseListPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'cases/:id', component: LegalCaseDetailsPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'consultations', component: LegalConsultationsPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'court-calendar', component: LegalCourtCalendarPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'documents', component: LegalDocumentsPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'documents/document-library', component: LegalDocLibraryPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'documents/templates', component: LegalDocTemplatesPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'documents/generator', component: LegalDocGeneratorPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'evidence-management', component: LegalEvidencePage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messaging', component: LegalMessagingPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messages', component: LegalMessagingPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messages/:caseId', component: LegalThreadPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messaging/inbox', component: LegalInboxPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messaging/message-thread', component: LegalThreadPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messaging/message-composer', component: LegalComposerPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'messaging/attachments', component: LegalAttachmentPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'outcomes', component: LegalOutcomesPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'profile', component: LegalProfilePage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
  { path: 'resources', component: LegalResourcesPage, layout: 'navigation', roles: ['LEGAL_ADVISOR'] },
];
