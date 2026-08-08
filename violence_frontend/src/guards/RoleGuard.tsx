import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUserProfile } from '../services/userService';
import { Role } from '../config/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Accept a single role or an array of allowed roles */
  requiredRole: Role | Role[];
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  fallbackPath = '/unauthorized',
}) => {
  const [hasRole, setHasRole] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await getCurrentUserProfile();
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        setHasRole(user?.role != null && allowed.includes(user.role as Role));
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasRole(false);
      }
    };

    checkRole();
  }, [requiredRole]);

  if (hasRole === null) {
    return <div>Loading...</div>;
  }

  if (!hasRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
