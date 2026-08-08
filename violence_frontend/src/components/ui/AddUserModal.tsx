import { useState } from 'react';
import {
  Loader2,
  UserPlus,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Mail,
  User as UserIcon,
  Send,
  AlertCircle,
} from 'lucide-react';
import { validateEmail, validateName } from '@/utils/validation';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';
import {
  adminUserService,
  ADMIN_INVITABLE_ROLES,
} from '@/services/adminUserService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type InvitedUserPayload = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

type InvitableUserRole = (typeof ADMIN_INVITABLE_ROLES)[number];

const isInvitableUserRole = (value: string): value is InvitableUserRole =>
  ADMIN_INVITABLE_ROLES.includes(value as InvitableUserRole);

interface InviteUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserInvited?: (user: InvitedUserPayload) => void;
}

export function AddUserModal({
  isOpen,
  onOpenChange,
  onUserInvited,
}: InviteUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
  const [lastInvitedName, setLastInvitedName] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: UserRole.COUNSELOR as InvitableUserRole,
  });

  const handleRoleChange = (value: string) => {
    if (!isInvitableUserRole(value)) {
      setSubmitError('Please select a valid professional role.');
      return;
    }

    setSubmitError(null);
    setFormData((p) => ({ ...p, role: value }));
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.SURVIVOR]: 'Survivor (Self-Register)',
    [UserRole.COUNSELOR]: 'Counselor',
    [UserRole.MEDICAL_PROFESSIONAL]: 'Medical Professional',
    [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.MODERATOR]: 'Moderator',
    [UserRole.SYSTEM]: 'System',
    [UserRole.GENERAL_CASE_MANAGER]: 'General Case Manager',
  };

  const validateForm = () => {
    const nameErr = validateName(formData.fullName, 'Full name');
    const emailErr = validateEmail(formData.email);
    const roleErr = !(ADMIN_INVITABLE_ROLES as readonly string[]).includes(formData.role) 
      ? 'Please select a valid professional role.' 
      : undefined;

    return { fullName: nameErr, email: emailErr, role: roleErr };
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const results = validateForm();
    setErrors(prev => ({ ...prev, [field]: (results as any)[field] }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: UserRole.COUNSELOR,
    });
    setSubmitError(null);
  };

  const handleAddAnother = () => {
    resetForm();
    setShowSuccessPrompt(false);
    onOpenChange(true);
  };

  const handleGoToUserList = () => {
    setShowSuccessPrompt(false);
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setTouched({ fullName: true, email: true, role: true });

    if (Object.values(validationErrors).some(e => e)) {
      const firstError = Object.values(validationErrors).find(e => e);
      setSubmitError(firstError || 'Please fix the errors.');
      toast.error(firstError || 'Please fix the errors.');
      return;
    }

    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    setIsSubmitting(true);
    try {
      const result = await adminUserService.inviteUser({
        email: formData.email.trim().toLowerCase(),
        firstName,
        lastName,
        role: formData.role,
      });
      const fullName = `${firstName} ${lastName || ''}`.trim();

      onUserInvited?.({
        id: result.user?.id || crypto.randomUUID(),
        fullName,
        email: result.user?.email || formData.email.trim().toLowerCase(),
        role: result.user?.role || formData.role,
        createdAt: result.user?.createdAt || new Date().toISOString(),
      });

      setLastInvitedName(fullName);
      setShowSuccessPrompt(true);
      onOpenChange(false);
      toast.success(result.message || 'Invitation sent successfully');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send invitation.';
      const normalizedMessage = Array.isArray(message) ? message.join(', ') : String(message);
      setSubmitError(normalizedMessage);
      toast.error(normalizedMessage);
      console.error('Invite user request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !isSubmitting && onOpenChange(open)}
      >
        <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-xl bg-[var(--colors-ivory-0)]">
          <DialogHeader className="border-b border-[var(--colors-olive-2)] bg-[var(--colors-olive-5)] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--colors-ivory-0)]/20 p-3 backdrop-blur-sm">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  Invite Professional
                </DialogTitle>
                <DialogDescription className="text-[var(--colors-ivory-2)]">
                  Send an invitation email. They will receive an activation code to set up their account.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[var(--colors-ivory-0)]">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-[var(--colors-heading-text)] font-medium">
                  <UserIcon className="h-4 w-4 text-[var(--colors-olive-5)]" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, fullName: e.target.value }));
                    if (touched.fullName) setErrors(prev => ({ ...prev, fullName: validateName(e.target.value, 'Full name') }));
                  }}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="e.g. Abebe Kebede"
                  className={`h-12 rounded-xl border bg-white focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)] ${
                    errors.fullName && touched.fullName ? 'border-red-500' : 'border-[var(--colors-olive-3)] focus:border-[var(--colors-terracotta-5)]'
                  }`}
                  required
                />
                {errors.fullName && touched.fullName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-[var(--colors-heading-text)] font-medium">
                  <Mail className="h-4 w-4 text-[var(--colors-olive-5)]" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, email: e.target.value }));
                    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@safehaven.org"
                  className={`h-12 rounded-xl border bg-white focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)] ${
                    errors.email && touched.email ? 'border-red-500' : 'border-[var(--colors-olive-3)] focus:border-[var(--colors-terracotta-5)]'
                  }`}
                  required
                />
                {errors.email && touched.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[var(--colors-heading-text)] font-medium">Professional Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--colors-ivory-0)] border-[var(--colors-olive-3)]">
                    {ADMIN_INVITABLE_ROLES.map((role) => (
                      <SelectItem 
                        key={role} 
                        value={role}
                        className="text-[var(--colors-body-text)] focus:bg-[var(--colors-terracotta-0)] focus:text-[var(--colors-terracotta-5)]"
                      >
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="-mx-6 mt-6 -mb-6 border-t border-[var(--colors-olive-2)] bg-[var(--colors-olive-0)] p-6">
              {submitError && (
                <p className="mr-auto text-sm text-[var(--colors-error-red)]">{submitError}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl border-[var(--colors-olive-4)] text-[var(--colors-olive-6)] hover:bg-[var(--colors-olive-1)] hover:text-[var(--colors-olive-7)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[var(--colors-terracotta-5)] px-8 text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25 hover:bg-[var(--colors-terracotta-6)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success View Styled as an AlertDialog */}
      <AlertDialog open={showSuccessPrompt}>
        <AlertDialogContent className="rounded-[2rem] border-[var(--colors-olive-2)] bg-[var(--colors-ivory-0)] p-8 text-center sm:max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--colors-golden-3)] opacity-30 blur-2xl" />
              <div className="relative rounded-full bg-[var(--colors-golden-1)] p-5">
                <CheckCircle2 className="h-12 w-12 text-[var(--colors-olive-5)]" />
              </div>
            </div>
          </div>

          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-[var(--colors-heading-text)]">
              Invitation Sent!
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-base text-[var(--colors-body-text)]">
              <span className="font-semibold text-[var(--colors-heading-text)]">
                {lastInvitedName}
              </span>{' '}
              will receive an email with an activation code to set up their account and password.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={handleAddAnother}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--colors-terracotta-5)] text-base font-bold text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25 hover:bg-[var(--colors-terracotta-6)]"
            >
              <PlusCircle className="h-5 w-5" />
              Invite Another
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToUserList}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--colors-olive-4)] bg-white text-base font-bold text-[var(--colors-olive-6)] hover:bg-[var(--colors-olive-1)] hover:text-[var(--colors-olive-7)]"
            >
              Go to User List
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
