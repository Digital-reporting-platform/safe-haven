import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Heart,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/user';
import { validateEmail, validatePassword, validateName, validatePhone } from '@/utils/validation';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const validateField = (
  field: keyof FormData,
  value: string,
  allData?: FormData
): string | undefined => {
  switch (field) {
    case 'firstName':
      return validateName(value, 'First name');
    case 'lastName':
      return validateName(value, 'Last name');
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (allData && value !== allData.password) return 'Passwords do not match';
      return undefined;
    default:
      return undefined;
  }
};

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    if (touched[id as keyof FormData]) {
      const error = validateField(id as keyof FormData, value, formData);
      setErrors((prev) => ({ ...prev, [id]: error }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ValidationErrors = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData),
    };

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        role: UserRole.SURVIVOR,
      });

      if (result) {
        toast.success(result.message || 'Account created! Please verify your email.');
        // Redirect to verify-email page with email pre-filled
        navigate(`/auth/verify-email?email=${encodeURIComponent(result.user.email)}`);
      }
    } catch (error: any) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Registration failed';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (field: keyof FormData) => {
    return errors[field] && touched[field]
      ? 'border-[var(--colors-error-red)] focus:border-[var(--colors-error-red)] focus:ring-[var(--colors-error-red)]/20'
      : '';
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--colors-ivory-0)]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mesh Gradient Orbs */}
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-[var(--colors-golden-3)] opacity-20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 -left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--colors-terracotta-3)] opacity-20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--colors-olive-4)] opacity-20 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
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
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--colors-terracotta-5)] text-white shadow-lg">
              <Shield size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold text-[var(--colors-heading-text)]">
              SafeHaven
            </span>
          </div>
          
          <div className="max-w-sm space-y-6">
            <h1 className="font-serif-editorial text-4xl xl:text-5xl font-medium leading-[1.15] text-[var(--colors-heading-text)]">
              Begin your <span className="text-[var(--colors-terracotta-5)]">healing</span> journey
            </h1>
            <p className="text-base text-[var(--colors-body-text)] leading-relaxed">
              Create your account to connect with compassionate providers who understand and are here to help.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm text-[var(--colors-olive-6)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--colors-terracotta-1)]">
                  <CheckCircle2 size={16} className="text-[var(--colors-terracotta-5)]" />
                </div>
                <span>Secure, encrypted platform</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--colors-olive-6)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--colors-terracotta-1)]">
                  <CheckCircle2 size={16} className="text-[var(--colors-terracotta-5)]" />
                </div>
                <span>Verified, compassionate providers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--colors-olive-6)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--colors-terracotta-1)]">
                  <CheckCircle2 size={16} className="text-[var(--colors-terracotta-5)]" />
                </div>
                <span>Your privacy is our priority</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--colors-body-text)] opacity-70">
            <Heart size={16} className="text-[var(--colors-terracotta-5)]" />
            <span>Join thousands on their path to safety</span>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex w-full lg:w-3/5 items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-xl border-none bg-white/80 backdrop-blur-xl shadow-2xl shadow-[var(--colors-olive-5)]/10 rounded-3xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[var(--colors-terracotta-5)] via-[var(--colors-golden-5)] to-[var(--colors-olive-5)]" />

            <CardHeader className="space-y-1 pb-2 pt-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--colors-olive-5)] to-[var(--colors-olive-6)] text-white shadow-lg shadow-[var(--colors-olive-5)]/25">
                <Sparkles size={26} strokeWidth={2} />
              </div>
              <CardTitle className="text-center text-2xl font-semibold text-[var(--colors-heading-text)]">
                Create your account
              </CardTitle>
              <CardDescription className="text-center text-[var(--colors-body-text)] opacity-80">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  First Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('firstName')}
                    className={`h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('firstName')}`}
                    required
                  />
                </div>
                {errors.firstName && touched.firstName && (
                  <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  Last Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('lastName')}
                    className={`h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('lastName')}`}
                    required
                  />
                </div>
                {errors.lastName && touched.lastName && (
                  <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--colors-heading-text)]">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  className={`h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('email')}`}
                  required
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-[var(--colors-heading-text)]">
                Phone <span className="text-[var(--colors-olive-4)] font-normal">(Optional)</span>
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251..."
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('phone')}
                  className={`h-12 pl-11 pr-4 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('phone')}`}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    className={`h-12 pl-11 pr-11 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('password')}`}
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
                  <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--colors-heading-text)]">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--colors-olive-5)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`h-12 pl-11 pr-11 rounded-xl border-[var(--colors-ivory-3)] bg-[var(--colors-ivory-0)] text-[var(--colors-body-text)] placeholder:text-[var(--colors-olive-4)] focus:border-[var(--colors-terracotta-5)] focus:ring-2 focus:ring-[var(--colors-terracotta-5)]/20 transition-all ${getInputClass('confirmPassword')}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--colors-olive-5)] opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-[var(--colors-error-red)] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox id="terms" required className="mt-0.5 border-[var(--colors-ivory-4)] data-[state=checked]:bg-[var(--colors-terracotta-5)] data-[state=checked]:border-[var(--colors-terracotta-5)]" />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-xs leading-relaxed text-[var(--colors-body-text)] opacity-80"
              >
                I agree to the <Link to="/terms" className="text-[var(--colors-terracotta-5)] hover:underline">Terms of Service</Link> and understand my data is encrypted and protected.
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-[var(--colors-terracotta-5)] hover:bg-[var(--colors-terracotta-6)] text-white font-semibold text-base shadow-lg shadow-[var(--colors-terracotta-5)]/25 transition-all hover:shadow-xl hover:shadow-[var(--colors-terracotta-5)]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--colors-ivory-3)]">
            <p className="text-center text-sm text-[var(--colors-body-text)] opacity-80">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-semibold text-[var(--colors-terracotta-5)] hover:text-[var(--colors-terracotta-6)] transition-colors"
              >
                Sign in
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
