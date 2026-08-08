import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { survivorRoutes } from './SurvivorRoutesConfig';

export function SurvivorRoutes() {
  return <AuthenticatedRoutes routes={survivorRoutes} />;
}
