import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { moderatorRoutes } from './ModeratorRoutesConfig';

export function ModeratorRoutes() {
  return <AuthenticatedRoutes routes={moderatorRoutes} />;
}
