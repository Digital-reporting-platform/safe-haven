import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../components/AppContext';
import { UserRole } from '@/types/user';
import { DASHBOARD_ROUTES } from '@/constants/routes';

interface Props {
  children: ReactNode;
  roles: UserRole[];
  // List of roles allowed to see this page
}

export function RoleBasedRoute({ children, roles }: Props) {
  const { user, isLoading } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B705C] border-t-transparent"></div>
          <p className="mt-4 text-[#6B705C]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location to return later
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    // User is logged in but attempted a route for a different role.
    const fallback = DASHBOARD_ROUTES[user.role] || '/survivor/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
