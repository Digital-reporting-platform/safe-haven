import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// 1. Make sure you import the ARRAY 'adminRoutes' from the config
import { adminRoutes } from './AdminRoutesConfig';
import { RoleBasedRoute } from './RoleBasedRoute';
import { Navigation } from '../components/Navigation';
import { UserRole } from '@/types/user';

export function AdminRoutes() {
  // ERROR WAS HERE: adminRoutes was likely seen as a function () => Element
  return (
    <Routes>
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RoleBasedRoute roles={route.roles as UserRole[]}>
              <Navigation>{React.createElement(route.component)}</Navigation>
            </RoleBasedRoute>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
