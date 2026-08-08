import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';

const LoginPage = lazy(() =>
  import('../auth/login').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../auth/register').then((module) => ({
    default: module.RegisterPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('../auth/reset-password').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const VerifyEmailPage = lazy(() =>
  import('../auth/verify-email').then((module) => ({
    default: module.VerifyEmailPage,
  }))
);
const ActivateAccountPage = lazy(() =>
  import('../auth/activate-account').then((module) => ({
    default: module.ActivateAccountPage,
  }))
);

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/activate-account" element={<ActivateAccountPage />} />
      {/* Legacy routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
    </Routes>
  );
}
