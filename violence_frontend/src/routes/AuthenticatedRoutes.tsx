import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Navigation } from '../components/Navigation';
import { RoleBasedRoute } from './RoleBasedRoute';

const PageLoader = () => (
  <div className="min-h-screen bg-[#FDFDF5] flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B705C] border-t-transparent"></div>
      <p className="mt-4 text-[#6B705C]">Loading page...</p>
    </div>
  </div>
);

interface RouteConfig {
  path: string;
  component: React.ComponentType;
  layout: string;
  roles: string[];
}

interface AuthenticatedRoutesProps {
  routes: RouteConfig[];
}

export function AuthenticatedRoutes({ routes }: AuthenticatedRoutesProps) {
  return (
    <Routes>
      {routes.map((route) => {
        const Component = route.component;
        let wrappedComponent;

        const componentWithSuspense = (
          <Suspense fallback={<PageLoader />}>
            <Component />
          </Suspense>
        );

        if (route.layout === 'navigation') {
          wrappedComponent = (
            <Navigation>
              {componentWithSuspense}
            </Navigation>
          );
        } else if (route.layout === 'standalone') {
          wrappedComponent = componentWithSuspense;
        } else {
          wrappedComponent = componentWithSuspense;
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RoleBasedRoute roles={route.roles as any}>
                {wrappedComponent}
              </RoleBasedRoute>
            }
          />
        );
      })}
    </Routes>
  );
}
