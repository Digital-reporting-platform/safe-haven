import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { legalProviderRoutes } from './LegalProviderRoutesConfig';

export function LegalProviderRoutes() {
  return (
    <Routes>
      {/* Redirect /legal to /legal/dashboard */}
      <Route path="/" element={<Navigate to="/legal/dashboard" replace />} />
      {/* All other legal routes */}
      <Route path="/*" element={<AuthenticatedRoutes routes={legalProviderRoutes} />} />
    </Routes>
  );
}
