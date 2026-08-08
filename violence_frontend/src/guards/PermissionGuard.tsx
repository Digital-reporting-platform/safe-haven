import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUserProfile } from '../services/userService';
import { hasPermission } from '../config/permissions';
import { Permission } from '../config/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission;
  fallbackPath?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/unauthorized',
}) => {
  const [hasPerm, setHasPerm] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const user = await getCurrentUserProfile();
        if (!user) {
          setHasPerm(false);
          return;
        }
        setHasPerm(hasPermission(user.role as any, requiredPermission)); // Cast to Role if needed
      } catch (error) {
        console.error('Error checking user permission:', error);
        setHasPerm(false);
      }
    };

    checkPermission();
  }, [requiredPermission]);

  if (hasPerm === null) {
    // Loading state
    return <div>Loading...</div>;
  }

  if (!hasPerm) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
