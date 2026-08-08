import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../components/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  fallbackPath = '/auth/login',
}: ProtectedRouteProps) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
