import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Heart,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { useApp } from '@/components/AppContext';
import { User, UserRole } from '@/types/user';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { validateEmail, validatePassword } from '@/utils/validation';


interface ValidationErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // MFA state
  const [mfaMode, setMfaMode] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUser, setMfaUser] = useState<{ id: string; email: string; role: UserRole } | null>(null);

   const validateField = (
     field: 'email' | 'password',
     value: string
   ): string | undefined => {
     if (field === 'email') return validateEmail(value);
     if (field === 'password') return validatePassword(value);
     return undefined;
   };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateField(
      field,
      field === 'email' ? loginEmail : loginPassword
    );
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setLoginEmail(value);
    else setLoginPassword(value);
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (!result) {
        toast.error('Login failed. Please try again.');
        return;
      }

      // MFA required for professional roles
      if ('mfaRequired' in result && result.mfaRequired) {
        setMfaMode(true);
        setMfaUser(result.user);
        toast.success(result.message || 'Verification code sent to your email');
        return;
      }

      // No MFA - direct login
      if ('user' in result && result.user) {
        setUser(result.user);
        toast.success(`Welcome back, ${result.user.firstName || result.user.email}`);

        const fromPath =
          (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        const destination =
          fromPath ||
          DASHBOARD_ROUTES[result.user.role] ||
          DASHBOARD_ROUTES[UserRole.SURVIVOR] ||
          '/survivor/dashboard';

        // Small delay to ensure toast is shown before redirect
        setTimeout(() => {
          window.location.assign(destination);
        }, 500);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] handleVerifyMFA called');

    if (!mfaCode || mfaCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    if (!mfaUser) {
      toast.error('Session expired. Please log in again.');
      setMfaMode(false);
      return;
    }

    console.log('[Login] MFA User:', mfaUser);
    console.log('[Login] MFA Code:', mfaCode);

    setIsSubmitting(true);

    try {
      console.log('[Login] Calling authService.verifyLoginOTP...');
      const result = await authService.verifyLoginOTP({
        email: mfaUser.email,
        otp: mfaCode,
      });
      console.log('[Login] verifyLoginOTP result:', result);

      if (result && result.user) {
        setUser(result.user);
        toast.success(`Welcome back, ${result.user.firstName || result.user.email}`);

        const destination =
          DASHBOARD_ROUTES[result.user.role] ||
          DASHBOARD_ROUTES[UserRole.SURVIVOR] ||
          '/survivor/dashboard';

        setTimeout(() => {
          window.location.assign(destination);
        }, 500);
      } else {
        console.log('[Login] No result or user from verifyLoginOTP');
        toast.error('Invalid verification code');
      }
    } catch (error: any) {
      console.error('[Login] verifyLoginOTP error:', error);
      console.error('[Login] Error response:', error.response);
      const message = error?.response?.data?.message || error?.message || 'Invalid verification code';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--colors-ivory-0)]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mesh Gradient Orbs */}
        <div className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-[var(--colors-terracotta-3)] opacity-20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-[var(--colors-golden-3)] opacity-25 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-[var(--colors-olive-4)] opacity-20 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--colors-olive-5) 1px, transparent 1px), linear-gradient(90deg, var(--colors-olive-5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--colors-terracotta-5)] text-white shadow-lg">
              <Shield size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold text-[var(--colors-heading-text)]">
              SafeHaven
            </span>
          </div>
          
          <div className="max-w-lg space-y-6">
            <h1 className="font-serif-editorial text-5xl xl:text-6xl font-medium leading-[1.15] text-[var(--colors-heading-text)]">
              Your safe space for <span className="text-[var(--colors-terracotta-5)]">healing</span> & <span className="text-[var(--colors-olive-5)]">support</span>
            </h1>
            <p className="text-lg text-[var(--colors-body-text)] leading-relaxed">
              Connect with compassionate providers, access resources, and take steps toward safety in a secure, confidential environment.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--colors-olive-6)]">
                <CheckCircle2 size={18} className="text-[var(--colors-terracotta-5)]" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--colors-olive-6)]">
                <CheckCircle2 size={18} className="text-[var(--colors-terracotta-5)]" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--colors-olive-6)]">
                <CheckCircle2 size={18} className="text-[var(--colors-terracotta-5)]" />
                <span>100% confidential</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--colors-body-text)] opacity-70">
            <Heart size={16} className="text-[var(--colors-terracotta-5)]" />
            <span>Caring for survivors since 2025</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full lg:w-1/2 xl:w-2/5 items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md border-none bg-white/80 backdrop-blur-xl shadow-2xl shadow-[var(--colors-olive-5)]/10 rounded-3xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[var(--colors-terracotta-5)] via-[var(--colors-golden-5)] to-[var(--colors-olive-5)]" />
            
            <CardHeader className="space-y-1 pb-2 pt-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--colors-terracotta-5)] to-[var(--colors-terracotta-6)] text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25">
                <Sparkles size={26} strokeWidth={2} />
              </div>
              <CardTitle className="text-center text-2xl font-semibold text-[var(--colors-heading-text)]">
                {mfaMode ? 'Verify Your Identity' : 'Welcome back'}
              </CardTitle>
              <CardDescription className="text-center text-[var(--colors-body-text)] opacity-80">
                {mfaMode 
                  ? `Enter the 6-digit code sent to ${mfaUser?.email || 'your email'}`
                  : 'Sign in to continue your journey'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
          {mfaMode ? (
            // MFA Verification Form
            <form onSubmit={handleVerifyMFA} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mfaCode" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  Verification Code
                </Label>
                <div className="relative group">
                  <Shield className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="mfaCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all text-center text-lg tracking-widest"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-[var(--colors-body-text)] opacity-70">
                  Check your email for the 6-digit verification code
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || mfaCode.length !== 6}
                className="h-12 w-full rounded-xl bg-[var(--colors-terracotta-5)] hover:bg-[var(--colors-terracotta-6)] text-white font-semibold text-base shadow-lg shadow-[var(--colors-terracotta-5)]/25 transition-all hover:shadow-xl hover:shadow-[var(--colors-terracotta-5)]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify & Sign In
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
              
              <button
                type="button"
                onClick={() => {
                  setMfaMode(false);
                  setMfaCode('');
                  setMfaUser(null);
                }}
                className="w-full text-sm text-[var(--colors-body-text)] hover:text-[var(--colors-terracotta-5)] transition-colors"
              >
                Back to login
              </button>
            </form>
          ) : (
            // Regular Login Form
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${errors.email && touched.email ? 'border-[var(--colors-error-red)] focus:border-[var(--colors-error-red)] focus:ring-[var(--colors-error-red)]/20' : ''}`}
                    required
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--colors-error-red)]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-[var(--colors-heading-text)]">
                    Password
                  </Label>
                  <Link 
                    to="/auth/reset-password" 
                    className="text-xs font-medium text-[var(--colors-terracotta-5)] hover:text-[var(--colors-terracotta-6)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`h-12 pl-11 pr-11 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${errors.password && touched.password ? 'border-[var(--colors-error-red)] focus:border-[var(--colors-error-red)] focus:ring-[var(--colors-error-red)]/20' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--colors-olive-5)] opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--colors-error-red)]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-[var(--colors-terracotta-5)] hover:bg-[var(--colors-terracotta-6)] text-white font-semibold text-base shadow-lg shadow-[var(--colors-terracotta-5)]/25 transition-all hover:shadow-xl hover:shadow-[var(--colors-terracotta-5)]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-[var(--colors-ivory-3)]">
            <p className="text-center text-sm text-[var(--colors-body-text)] opacity-80">
              Don't have an account?{' '}
              <Link 
                to="/auth/register" 
                className="font-semibold text-[var(--colors-terracotta-5)] hover:text-[var(--colors-terracotta-6)] transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
          
          {/* Mobile Branding Footer */}
          <div className="mt-8 flex lg:hidden items-center justify-center gap-2 text-sm text-[var(--colors-body-text)] opacity-60">
            <Shield size={16} className="text-[var(--colors-terracotta-5)]" />
            <span>SafeHaven — Your safe space</span>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
