import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { counselorRoutes } from './CounselorRoutesConfig';

export function CounselorRoutes() {
  return <AuthenticatedRoutes routes={counselorRoutes} />;
}
