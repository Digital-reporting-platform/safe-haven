import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { medicalProviderRoutes } from './MedicalProviderRoutesConfig';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function MedicalProviderRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/medical-provider' || location.pathname === '/medical-provider/') {
      navigate('/medical-provider/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <AuthenticatedRoutes routes={medicalProviderRoutes} />;
}
