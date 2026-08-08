import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Lock,
  ArrowRight,
  CheckCircle2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { validateEmail, validatePassword } from '@/utils/validation';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

   // If no token, show email request form
   if (!token) {
     const handleRequestReset = async (e: React.FormEvent) => {
       e.preventDefault();
       
       const emailErr = validateEmail(email);
       if (emailErr) {
         setErrors({ email: emailErr });
         setTouched({ email: true });
         return;
       }

       setIsLoading(true);

       try {
         await authService.forgotPassword({ email });
         setIsLoading(false);
         setIsSuccess(true);
         setErrors({});
         setTouched({});
       } catch (error: any) {
         const message = error.response?.data?.message || 'Failed to send reset link';
         toast.error(message);
         setIsLoading(false);
       }
     };

     if (isSuccess) {
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
                         <Mail className="h-8 w-8 text-[var(--color-primary)]" />
                       </div>
                     </div>
                     <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                       Check Your Email
                     </CardTitle>
                     <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                       We've sent password reset instructions to your email
                       address
                     </CardDescription>
                   </CardHeader>

                   <CardContent className="space-y-6">
                     <div className="space-y-4 text-center">
                       <div className="flex items-center justify-center gap-2 text-[var(--color-primary)]">
                         <CheckCircle2 className="h-5 w-5" />
                         <span className="text-sm font-medium">
                           Email sent successfully
                         </span>
                       </div>
                       <p className="font-['Noto_Sans_Ethiopic'] text-sm text-[var(--color-muted-foreground)]">
                         Please check your inbox and follow the link to reset
                         your password
                       </p>
                     </div>

                     <div className="space-y-4">
                       <Button
                         onClick={() => navigate('/auth/login')}
                         className="w-full rounded-lg bg-[var(--color-primary)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-primary)]/90 hover:shadow-xl"
                       >
                         Return to Login
                       </Button>

                       <div className="text-center">
                         <p className="font-['Noto_Sans_Ethiopic'] text-sm text-[var(--color-muted-foreground)]">
                           Didn't receive the email?{' '}
                           <button
                             onClick={() => setIsSuccess(false)}
                             className="font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary)]/80"
                           >
                             Try again
                           </button>
                         </p>
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
                     Reset Password
                   </CardTitle>
                   <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                     Enter your email address and we'll send you a link to reset
                     your password
                   </CardDescription>
                 </CardHeader>

                 <CardContent className="space-y-6">
                   <form onSubmit={handleRequestReset} className="space-y-6">
                     <div className="space-y-2">
                       <Label
                         htmlFor="email"
                         className="font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-foreground)]"
                       >
                         Email Address
                       </Label>
                       <div className="relative">
                         <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[var(--color-muted-foreground)]" />
                         <Input
                           id="email"
                           type="email"
                           placeholder="your.email@example.com"
                           value={email}
                           onChange={(e) => {
                             setEmail(e.target.value);
                             if (touched.email) setErrors({ email: validateEmail(e.target.value) });
                           }}
                           onBlur={() => {
                             setTouched({ email: true });
                             setErrors({ email: validateEmail(email) });
                           }}
                           className={`rounded-lg border-2 bg-[var(--color-input-background)] py-3 pr-4 pl-10 font-['Noto_Sans_Ethiopic'] transition-all duration-200 ${
                             errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-[var(--color-border)]/50 focus:border-[var(--color-primary)]'
                           }`}
                           required
                         />
                         {errors.email && touched.email && (
                           <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                             <AlertCircle size={12} /> {errors.email}
                           </p>
                         )}
                       </div>
                     </div>

                     <Button
                       type="submit"
                       className="w-full transform rounded-lg bg-[var(--color-primary)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--color-primary)]/90 hover:shadow-xl"
                       disabled={isLoading}
                     >
                       {isLoading ? (
                         <div className="flex items-center gap-2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                           <span>Sending...</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span>Send Reset Link</span>
                           <ArrowRight className="h-4 w-4" />
                         </div>
                       )}
                     </Button>
                   </form>

                   <div className="text-center">
                     <Link
                       to="/auth/login"
                       className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary)]/80"
                     >
                       Back to Login
                     </Link>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
       </div>
     );
   }

   // Reset password form with token
   const handleResetPassword = async (e: React.FormEvent) => {
     e.preventDefault();

     const passErr = validatePassword(newPassword);
     const matchErr = newPassword !== confirmPassword ? "Passwords don't match" : undefined;

     if (passErr || matchErr) {
       setErrors({ newPassword: passErr, confirmPassword: matchErr });
       setTouched({ newPassword: true, confirmPassword: true });
       return;
     }

     setIsLoading(true);

     try {
       await authService.resetPassword({ token, password: newPassword });
       setIsLoading(false);
       setIsSuccess(true);
     } catch (error: any) {
       const message = error.response?.data?.message || 'Failed to reset password';
       toast.error(message);
       setIsLoading(false);
     }
   };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[#f8f6f2] to-[var(--color-hover)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-[var(--color-primary)]/5 blur-xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 blur-sm"></div>
              <Card className="relative border-2 border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-lg">
                <CardHeader className="space-y-4 pb-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                      <CheckCircle2 className="h-8 w-8 text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                    Password Reset Successful
                  </CardTitle>
                  <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                    Your password has been successfully reset
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    onClick={() => navigate('/auth/login')}
                    className="w-full rounded-lg bg-[var(--color-accent)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-accent-foreground)] shadow-lg transition-all duration-200 hover:bg-[var(--color-accent)]/90 hover:shadow-xl"
                  >
                    Continue to Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/20 blur-sm"></div>
            <Card className="relative border-2 border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-lg">
              <CardHeader className="space-y-4 pb-6 text-center">
                <div className="flex justify-center">
                  <div className="h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent"></div>
                </div>
                <CardTitle className="font-['Noto_Sans_Display'] text-2xl font-bold text-[var(--color-foreground)]">
                  Set New Password
                </CardTitle>
                <CardDescription className="font-['Noto_Sans_Ethiopic'] text-base text-[var(--color-muted-foreground)]">
                  Create a strong password for your account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-password"
                        className="font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-foreground)]"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[var(--color-muted-foreground)]" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (touched.newPassword) setErrors(prev => ({ ...prev, newPassword: validatePassword(e.target.value) }));
                          }}
                          onBlur={() => {
                            setTouched(prev => ({ ...prev, newPassword: true }));
                            setErrors(prev => ({ ...prev, newPassword: validatePassword(newPassword) }));
                          }}
                          className={`rounded-lg border-2 bg-[var(--color-input-background)] py-3 pr-12 pl-10 font-['Noto_Sans_Ethiopic'] transition-all duration-200 ${
                            errors.newPassword && touched.newPassword ? 'border-red-500 focus:border-red-500' : 'border-[var(--color-border)]/50 focus:border-[var(--color-accent)]'
                          }`}
                          required
                        />
                        {errors.newPassword && touched.newPassword && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> {errors.newPassword}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 transform text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-foreground)]"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[var(--color-muted-foreground)]" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (touched.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: e.target.value !== newPassword ? "Passwords don't match" : undefined }));
                          }}
                          onBlur={() => {
                            setTouched(prev => ({ ...prev, confirmPassword: true }));
                            setErrors(prev => ({ ...prev, confirmPassword: confirmPassword !== newPassword ? "Passwords don't match" : undefined }));
                          }}
                          className={`rounded-lg border-2 bg-[var(--color-input-background)] py-3 pr-4 pl-10 font-['Noto_Sans_Ethiopic'] transition-all duration-200 ${
                            errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-[var(--color-border)]/50 focus:border-[var(--color-accent)]'
                          }`}
                          required
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full transform rounded-lg bg-[var(--color-accent)] py-3 font-['Noto_Sans_Ethiopic'] font-medium text-[var(--color-accent-foreground)] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--color-accent)]/90 hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"></div>
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Reset Password</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
