import { useState, useRef, useEffect } from 'react';
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
import {
  Shield,
  CheckCircle2,
  Mail,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/user';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUserRole, setVerifiedUserRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const codeParam = searchParams.get('code') || '';

  // Auto-focus first input on mount & auto-fill code if present in URL
  useEffect(() => {
    if (codeParam && codeParam.length === 6) {
      setOtp(codeParam.split(''));
    } else if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [codeParam]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Go to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus the appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyEmail({ email, otp: otpCode });

      if (result) {
        setIsVerified(true);
        setVerifiedUserRole(result.user.role);
        toast.success(result.message || 'Email verified successfully!');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid or expired code';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setResending(true);
    setError('');

    try {
      const result = await authService.resendEmailVerificationOTP(email);
      toast.success(result.message || 'Verification code resent!');
      if (result.devOtp && result.devOtp.length === 6) {
        setOtp(result.devOtp.split(''));
      } else {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to resend code';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setResending(false);
    }
  };

  // Loading state during verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[#f8f6f2] to-[var(--color-hover)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-[var(--color-primary)]/5 blur-xl"></div>
          <div className="animation-delay-2000 absolute bottom-1/3 left-1/3 h-24 w-24 animate-pulse rounded-full bg-[var(--color-accent)]/5 blur-xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 blur-sm"></div>
              <Card className="relative border-2 border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-lg">
                <CardHeader className="space-y-4 pb-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                      <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                  </div>
                  <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                    Verifying Email
                  </CardTitle>
                  <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                    Please wait while we verify your email address
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[#f8f6f2] to-[var(--color-hover)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-[var(--color-accent)]/5 blur-xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/20 blur-sm"></div>
              <Card className="relative border-2 border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-lg">
                <CardHeader className="space-y-4 pb-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                      <CheckCircle2 className="h-8 w-8 text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                    Email Verified!
                  </CardTitle>
                  <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                    Your email address has been successfully verified
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[var(--color-accent)]">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Verification successful
                      </span>
                    </div>
                    <p className="font-['Noto_Sans_Ethiopic'] text-sm text-[var(--color-muted-foreground)]">
                      You can now access all features of SafeHaven
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        const dashboardRoute = verifiedUserRole 
                          ? DASHBOARD_ROUTES[verifiedUserRole] 
                          : '/dashboard';
                        navigate(dashboardRoute);
                      }}
                      className="w-full rounded-lg bg-[var(--color-accent)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-accent-foreground)] shadow-lg transition-all duration-200 hover:bg-[var(--color-accent)]/90 hover:shadow-xl"
                    >
                      <span className="flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[#f8f6f2] to-[var(--color-hover)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-red-500/5 blur-xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-sm"></div>
              <Card className="relative border-2 border-red-500/50 bg-[var(--color-card)] shadow-lg">
                <CardHeader className="space-y-4 pb-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                  <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                    Verification Failed
                  </CardTitle>
                  <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                    {error}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full rounded-lg bg-[var(--color-primary)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-primary)]/90 hover:shadow-xl"
                    >
                      {resending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span>Resending...</span>
                        </div>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/auth/login')}
                      className="w-full rounded-lg border-2 border-[var(--color-border)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-foreground)] transition-all duration-200 hover:bg-[var(--color-hover)]"
                    >
                      Back to Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default state - OTP input form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[#f8f6f2] to-[var(--color-hover)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-[var(--color-primary)]/5 blur-xl"></div>
        <div className="animation-delay-2000 absolute bottom-1/3 left-1/3 h-24 w-24 animate-pulse rounded-full bg-[var(--color-accent)]/5 blur-xl"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="mb-2 font-['Noto_Sans_Display'] text-3xl font-bold text-[var(--color-accent)]">
              SafeHaven
            </h1>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 blur-sm"></div>
            <Card className="relative border-2 border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-lg">
              <CardHeader className="space-y-4 pb-6 text-center">
                <div className="flex justify-center">
                  <div className="h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
                </div>
                <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                  Enter the 6-digit code sent to<br/>
                  <span className="font-medium text-[var(--color-foreground)]">{email || 'your email'}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-14 w-12 text-center text-2xl font-bold rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full rounded-lg bg-[var(--color-primary)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-primary)]/90 hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Email
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    disabled={resending}
                    variant="outline"
                    className="w-full rounded-lg border-2 border-[var(--color-border)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-foreground)] transition-all duration-200 hover:bg-[var(--color-hover)]"
                  >
                    {resending ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Resending...
                      </span>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/auth/login"
                      className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary)]/80"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
