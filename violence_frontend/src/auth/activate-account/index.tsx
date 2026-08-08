import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  CheckCircle2,
  Mail,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { useApp } from '@/components/AppContext';

export function ActivateAccountPage() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const otpFromUrl = searchParams.get('otp');

  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: emailFromUrl || '',
    otp: otpFromUrl || '',
    password: '',
    confirmPassword: '',
  });

  // Auto-activate if both email and OTP are in URL
  useEffect(() => {
    if (emailFromUrl && otpFromUrl) {
      // Don't auto-activate - let user set password first
      setFormData({
        email: emailFromUrl,
        otp: otpFromUrl,
        password: '',
        confirmPassword: '',
      });
    }
  }, [emailFromUrl, otpFromUrl]);

  const validateForm = () => {
    if (!formData.email || !formData.otp || !formData.password) {
      return 'All fields are required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please provide a valid email address.';
    }

    if (formData.otp.length !== 6) {
      return 'Activation code must be 6 digits.';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return 'Password must be at least 8 chars with uppercase, lowercase, and number.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Activate account
      const result = await authService.activateAccount({
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      });

      toast.success(result.message || 'Account activated successfully!');

      // Step 2: Auto-login with the new credentials
      const loginResult = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      if (!loginResult) {
        throw new Error('Login failed after activation');
      }

      // Handle MFA required for professional roles
      if ('mfaRequired' in loginResult && loginResult.mfaRequired) {
        // Redirect to login page with MFA mode - they'll need to enter the OTP
        toast.success('Account activated! Please check your email for a verification code to complete login.');
        setTimeout(() => {
          navigate(`/auth/login?email=${encodeURIComponent(formData.email)}&mfa=required`);
        }, 2000);
        setIsActivated(true);
        return;
      }

      // No MFA required - direct login (SURVIVOR role)
      if ('user' in loginResult && loginResult.user) {
        const user = loginResult.user;
        setUser(user);
        
        const dashboardRoute = DASHBOARD_ROUTES[user.role] || '/survivor/dashboard';
        const displayName = 'firstName' in user ? (user.firstName || user.email) : user.email;
        toast.success(`Welcome, ${displayName}! Redirecting to your dashboard...`);
        
        // Small delay to show the welcome message
        setTimeout(() => {
          navigate(dashboardRoute);
        }, 1500);

        setIsActivated(true);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to activate account. Please check your activation code.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first.');
      return;
    }

    setResending(true);
    try {
      const result = await authService.resendActivationOTP(formData.email);
      toast.success(result.message || 'New activation code sent!');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to resend activation code.';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  if (isActivated) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[var(--colors-ivory-0)]">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-[var(--colors-golden-3)] opacity-20 blur-[120px]" />
          <div className="absolute top-1/3 -left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--colors-terracotta-3)] opacity-20 blur-[100px]" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md border-[var(--colors-olive-2)] bg-white/95 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--colors-golden-1)]">
                <CheckCircle2 className="h-10 w-10 text-[var(--colors-olive-5)]" />
              </div>
              <CardTitle className="text-2xl font-bold text-[var(--colors-heading-text)]">
                Account Activated!
              </CardTitle>
              <CardDescription className="text-[var(--colors-body-text)]">
                Your SafeHaven account has been successfully activated. You can now log in with your email and password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="h-12 w-full rounded-xl bg-[var(--colors-terracotta-5)] text-base font-semibold text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25 hover:bg-[var(--colors-terracotta-6)]"
                disabled
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to dashboard...
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--colors-ivory-0)]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-[var(--colors-golden-3)] opacity-20 blur-[120px]" />
        <div className="absolute top-1/3 -left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--colors-terracotta-3)] opacity-20 blur-[100px]" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--colors-olive-4)] opacity-20 blur-[80px]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--colors-terracotta-5)] text-white shadow-lg">
              <Shield size={26} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-semibold text-[var(--colors-heading-text)]">
              SafeHaven
            </span>
          </div>

          <Card className="border-[var(--colors-olive-2)] bg-white/95 shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[var(--colors-olive-5)]/10 p-2">
                  <UserPlus className="h-5 w-5 text-[var(--colors-olive-5)]" />
                </div>
                <CardTitle className="text-xl font-bold text-[var(--colors-heading-text)]">
                  Activate Your Account
                </CardTitle>
              </div>
              <CardDescription className="text-[var(--colors-body-text)]">
                Enter the activation code from your email and create a secure password to complete your account setup.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleActivate} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-[var(--colors-heading-text)]">
                    <Mail className="h-4 w-4 text-[var(--colors-olive-5)]" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@safehaven.org"
                    className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20"
                    required
                  />
                </div>

                {/* OTP */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-[var(--colors-heading-text)]">
                    Activation Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="123456"
                    maxLength={6}
                    className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white text-center text-2xl tracking-[0.5em] focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20"
                    required
                  />
                  <p className="text-xs text-[var(--colors-olive-6)]">
                    Enter the 6-digit code from your invitation email
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-[var(--colors-heading-text)]">
                    <Lock className="h-4 w-4 text-[var(--colors-olive-5)]" />
                    Create Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 chars, uppercase, lowercase, number"
                      className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white pr-10 focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--colors-olive-5)] hover:text-[var(--colors-olive-7)]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[var(--colors-heading-text)]">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white pr-10 focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--colors-olive-5)] hover:text-[var(--colors-olive-7)]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-[var(--colors-error-red)]/10 p-3 text-sm text-[var(--colors-error-red)]">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl bg-[var(--colors-terracotta-5)] text-base font-semibold text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25 hover:bg-[var(--colors-terracotta-6)]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Activate Account
                    </>
                  )}
                </Button>

                {/* Resend */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending}
                    className="text-sm text-[var(--colors-olive-6)] hover:text-[var(--colors-terracotta-5)] disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : "Didn't receive the code? Resend"}
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center text-sm">
                <span className="text-[var(--colors-body-text)]">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-medium text-[var(--colors-terracotta-5)] hover:text-[var(--colors-terracotta-6)]"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ActivateAccountPage;
