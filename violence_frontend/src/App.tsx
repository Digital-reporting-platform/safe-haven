import React, { lazy, Suspense, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import { ScrollToTop } from './components/ScrollToTop';
import { AppProvider, useApp } from './components/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { SimpleLoadingScreen } from './components/SimpleLoadingScreen';
import { QuickExitButton } from './components/QuickExitButton';
import SafeHavenChatbot from './components/chatbot';

// Services & Types
import { authService } from './services/authService';
import { UserRole } from './types/user';
import { DASHBOARD_ROUTES } from './constants/routes';

// --- Lazy loaded page components ---
const HomePage = lazy(() =>
  import('./pages/public/home/index').then((m) => ({ default: m.HomePage }))
);
const AboutPage = lazy(() =>
  import('./pages/public/general').then((m) => ({ default: m.AboutPage }))
);
const SupportDirectoryPage = lazy(() =>
  import('./pages/public/provider-directory').then((m) => ({
    default: m.SupportDirectoryPage,
  }))
);
const MissingPersonsPage = lazy(() =>
  import('./pages/public/missing-persons').then((m) => ({
    default: m.MissingPersonsPage,
  }))
);
const MissingPersonsViewPage = lazy(() =>
  import('./pages/public/missing-persons/view').then((m) => ({
    default: m.MissingPersonsViewPage,
  }))
);
const SupportServicesPage = lazy(() =>
  import('./pages/public/general/support-services').then((m) => ({
    default: m.SupportServicesPage,
  }))
);
const RecoveryHub = lazy(() =>
  import('./pages/public/general/recovery-hub').then((m) => ({
    default: m.RecoveryHub,
  }))
);
const TransparencyPage = lazy(() =>
  import('./pages/public/general/transparency').then((m) => ({
    default: m.TransparencyPage,
  }))
);
const ResourcesPage = lazy(() =>
  import('./pages/public/resources').then((m) => ({ default: m.ResourcesPage }))
);
const ReportPage = lazy(() =>
  import('./pages/public/anonymous-reporting').then((m) => ({
    default: m.ReportPage,
  }))
);
const BlogPage = lazy(() =>
  import('./pages/public/general/blog').then((m) => ({
    default: m.BlogPage,
  }))
);
const PrivacyPage = lazy(() =>
  import('./pages/public/general/privacy').then((m) => ({
    default: m.PrivacyPage,
  }))
);
const TermsPage = lazy(() =>
  import('./pages/public/general/terms').then((m) => ({
    default: m.TermsPage,
  }))
);
const AccessibilityPage = lazy(() =>
  import('./pages/public/general/accessibility').then((m) => ({
    default: m.AccessibilityPage,
  }))
);
const ContactPage = lazy(() =>
  import('./pages/public/general/contact').then((m) => ({
    default: m.ContactPage,
  }))
);
const TrackPage = lazy(() =>
  import('./pages/track/index').then((m) => ({
    default: m.default,
  }))
);
const PublicEmpowermentPage = lazy(() =>
  import('./pages/public/empowerment').then((m) => ({
    default: m.PublicEmpowermentPage,
  }))
);

// Auth
const LoginPage = lazy(() =>
  import('./auth/login').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./auth/register').then((m) => ({ default: m.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./auth/reset-password').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const VerifyEmailPage = lazy(() =>
  import('./auth/verify-email').then((m) => ({ default: m.VerifyEmailPage }))
);
const ActivateAccountPage = lazy(() =>
  import('./auth/activate-account').then((m) => ({
    default: m.ActivateAccountPage,
  }))
);

// Survivor/Victim
const VictimDashboardPage = lazy(() =>
  import('./pages/survivor/dashboard/index').then((m) => ({
    default: m.VictimDashboardPage,
  }))
);
const MyCases = lazy(() =>
  import('./pages/survivor/my-cases/index').then((m) => ({
    default: m.MyCases,
  }))
);
const CommunityForumPage = lazy(() =>
  import('./pages/survivor/community-forum/index').then((m) => ({
    default: m.CommunityForumPage,
  }))
);
const EmpowermentPage = lazy(() =>
  import('./pages/survivor/empowerment/index').then((m) => ({
    default: m.EmpowermentPage,
  }))
);
const SafetySettings = lazy(() =>
  import('./pages/survivor/safety/index').then((m) => ({
    default: m.SafetySettings,
  }))
);
const Messages = lazy(() =>
  import('./pages/survivor/messages/index').then((m) => ({
    default: m.Messages,
  }))
);
const SettingsPage = lazy(() =>
  import('./pages/survivor/settings/index').then((m) => ({
    default: m.SettingsPage,
  }))
);
const CaseDetailsPage = lazy(() =>
  import('./pages/survivor/case-details/index').then((m) => ({
    default: m.CaseDetailsPage,
  }))
);
const SurvivorProfilePage = lazy(() => import('./pages/survivor/profile/index'));

// Routing Logic
import { RoleBasedRoute } from './routes/RoleBasedRoute';
import { AdminRoutes } from './routes/AdminRoutes';
import { ModeratorRoutes } from './routes/ModeratorRoutes';
import { MedicalProviderRoutes } from './routes/MedicalProviderRoutes';
import { LegalProviderRoutes } from './routes/LegalProviderRoutes';
import { counselorRoutes } from './routes/CounselorRoutesConfig';
const LogoutPage = lazy(() =>
  import('./auth/logout').then((m) => ({ default: m.LogoutPage }))
);

function PublicLayout() {
  const { user } = useApp();
  const location = useLocation();

  // Redirect logged-in users from homepage to their dashboard
  if (user && location.pathname === '/') {
    return <Navigate to={DASHBOARD_ROUTES[user.role] || '/survivor/dashboard'} replace />;
  }

  // Homepage has its own navigation in HeroSection, don't wrap with Navigation
  if (location.pathname === '/') {
    return (
      <>
        <Outlet />
        <Footer />
      </>
    );
  }

  // All other public pages (including when user is logged in) get the standard Navigation wrapper
  return (
    <Navigation>
      <Outlet />
      <Footer />
    </Navigation>
  );
}

function AppContent() {
  const { user, setUser, isLoading, setIsLoading } = useApp();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      // Skip session recovery if user just logged out
      if (localStorage.getItem('just_logged_out') === 'true') {
        localStorage.removeItem('just_logged_out');
        // Also clear any remaining tokens to be safe
        localStorage.removeItem('sh_token');
        localStorage.removeItem('sh_user');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If no token exists, skip recovery
      if (!localStorage.getItem('sh_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Recover user profile using JWT from localStorage
        const currentUser = await authService.getCurrentSession();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Session recovery failed:', error);
        localStorage.removeItem('sh_token');
        localStorage.removeItem('sh_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // Removed Supabase onAuthStateChange - Not needed for NestJS
  }, [setUser, setIsLoading]);

  if (isLoading) return <LoadingScreen />;

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <ScrollToTop />
      <QuickExitButton />
      <SafeHavenChatbot />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <Routes location={location}>
            {/* Public Routes - Use LoadingScreen with "Empowering Survivors" */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Suspense fallback={<LoadingScreen />}><HomePage /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<LoadingScreen />}><AboutPage /></Suspense>} />
              <Route
                path="/public-support-directory"
                element={<Suspense fallback={<LoadingScreen />}><SupportDirectoryPage /></Suspense>}
              />
              <Route
                path="/missing-persons"
                element={<Suspense fallback={<LoadingScreen />}><MissingPersonsPage /></Suspense>}
              />
              <Route
                path="/missing-persons/view"
                element={<Suspense fallback={<LoadingScreen />}><MissingPersonsViewPage /></Suspense>}
              />
              <Route
                path="/support-services"
                element={<Suspense fallback={<LoadingScreen />}><SupportServicesPage /></Suspense>}
              />
              <Route path="/recovery-hub" element={<Suspense fallback={<LoadingScreen />}><RecoveryHub /></Suspense>} />
              <Route path="/transparency" element={<Suspense fallback={<LoadingScreen />}><TransparencyPage /></Suspense>} />
              <Route path="/blog" element={<Suspense fallback={<LoadingScreen />}><BlogPage /></Suspense>} />
              <Route path="/public/empowerment" element={<Suspense fallback={<LoadingScreen />}><PublicEmpowermentPage /></Suspense>} />
              <Route path="/privacy" element={<Suspense fallback={<LoadingScreen />}><PrivacyPage /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<LoadingScreen />}><TermsPage /></Suspense>} />
              <Route path="/accessibility" element={<Suspense fallback={<LoadingScreen />}><AccessibilityPage /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<LoadingScreen />}><ContactPage /></Suspense>} />
            </Route>

            <Route
              path="/report"
              element={
                <Navigation>
                  <Suspense fallback={<LoadingScreen />}>
                    <ReportPage />
                  </Suspense>
                </Navigation>
              }
            />
            <Route
              path="/track"
              element={
                <Navigation>
                  <Suspense fallback={<LoadingScreen />}>
                    <TrackPage />
                  </Suspense>
                </Navigation>
              }
            />
            <Route
              path="/resources"
              element={
                <Navigation>
                  <Suspense fallback={<LoadingScreen />}>
                    <ResourcesPage />
                  </Suspense>
                </Navigation>
              }
            />

              {/* Auth Access - Use LoadingScreen for public auth pages */}
              <Route path="/auth/login" element={<Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense>} />
              <Route path="/auth/register" element={<Suspense fallback={<LoadingScreen />}><RegisterPage /></Suspense>} />
              <Route
                path="/auth/reset-password"
                element={<Suspense fallback={<LoadingScreen />}><ResetPasswordPage /></Suspense>}
              />
              <Route path="/auth/verify-email" element={<Suspense fallback={<LoadingScreen />}><VerifyEmailPage /></Suspense>} />
              <Route
                path="/auth/activate-account"
                element={<Suspense fallback={<LoadingScreen />}><ActivateAccountPage /></Suspense>}
              />
              <Route
                path="/login"
                element={<Navigate to="/auth/login" replace />}
              />
              <Route
                path="/signup"
                element={<Navigate to="/auth/register" replace />}
              />

              {/* Survivor Protected Routes - Use SimpleLoadingScreen */}
              <Route
                path="/survivor/dashboard"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <VictimDashboardPage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/my-cases"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <MyCases />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/community-forum"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <CommunityForumPage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/empowerment"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <EmpowermentPage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/safety"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <SafetySettings />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/messages"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <Messages />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/settings"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <SettingsPage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/case/:id"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <CaseDetailsPage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/survivor/profile"
                element={
                  <RoleBasedRoute roles={[UserRole.SURVIVOR]}>
                    <Navigation>
                      <Suspense fallback={<SimpleLoadingScreen />}>
                        <SurvivorProfilePage />
                      </Suspense>
                    </Navigation>
                  </RoleBasedRoute>
                }
              />

              {/* Counselor Routes Mapping - Use SimpleLoadingScreen */}
              {counselorRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RoleBasedRoute roles={route.roles as UserRole[]}>
                      <Navigation>
                        <Suspense fallback={<SimpleLoadingScreen />}>
                          {React.createElement(route.component)}
                        </Suspense>
                      </Navigation>
                    </RoleBasedRoute>
                  }
                />
              ))}

              {/* Specialized Modules - Use SimpleLoadingScreen */}
              <Route path="/medical-provider/*" element={<Suspense fallback={<SimpleLoadingScreen />}><MedicalProviderRoutes /></Suspense>} />
              <Route path="/legal/*" element={
                <Suspense fallback={<SimpleLoadingScreen />}>
                  <LegalProviderRoutes />
                </Suspense>
              } />
              <Route path="/moderator/*" element={<Suspense fallback={<SimpleLoadingScreen />}><ModeratorRoutes /></Suspense>} />
              <Route path="/admin/*" element={<Suspense fallback={<SimpleLoadingScreen />}><AdminRoutes /></Suspense>} />

              {/* Logout - must be before catch-all */}
              <Route path="/auth/logout" element={<Suspense fallback={<SimpleLoadingScreen />}><LogoutPage /></Suspense>} />


              {/* Catch-all */}
              <Route
                path="*"
                element={
                  user ? (
                    <Navigate
                      to={DASHBOARD_ROUTES[user.role] || '/survivor/dashboard'}
                      replace
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark', 'high-contrast']}
    >
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
        <Toaster richColors position="top-right" />
      </AppProvider>
    </ThemeProvider>
  );
}
