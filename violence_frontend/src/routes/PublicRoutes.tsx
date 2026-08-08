import { Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { publicRoutes } from './PublicRoutesConfig';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

export function PublicRoutes() {
  return (
    <Routes>
      {publicRoutes.map((route) => {
        const Component = route.component;
        let wrappedComponent;

        if (route.layout === 'public') {
          wrappedComponent = (
            <PublicLayout>
              <Component />
            </PublicLayout>
          );
        } else if (route.layout === 'standalone') {
          wrappedComponent = (
            <Navigation>
              <Component />
            </Navigation>
          );
        } else {
          wrappedComponent = <Component />;
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            element={wrappedComponent}
          />
        );
      })}
    </Routes>
  );
}
