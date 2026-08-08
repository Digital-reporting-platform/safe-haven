import { useEffect, useState } from 'react';
import { Loader2, UserCog, Mail, Phone as PhoneIcon, User as UserIcon, AlertCircle } from 'lucide-react';
import { validateEmail, validateName, validatePhone } from '@/utils/validation';
import { toast } from 'sonner';
import { UserRole, UserStatus } from '@/types/user';
import {
  adminUserService,
  ADMIN_EDITABLE_ROLES,
  type AdminUser,
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

interface EditUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onUserUpdated?: (user: AdminUser) => void;
}

type AssignableUserRole = (typeof ADMIN_EDITABLE_ROLES)[number];

const isAssignableUserRole = (value: string): value is AssignableUserRole =>
  ADMIN_EDITABLE_ROLES.includes(value as AssignableUserRole);

export function EditUserModal({
  isOpen,
  onOpenChange,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const roleLabels: Record<UserRole, string> = {
    [UserRole.SURVIVOR]: 'Survivor',
    [UserRole.COUNSELOR]: 'Counselor',
    [UserRole.MEDICAL_PROFESSIONAL]: 'Medical Professional',
    [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.MODERATOR]: 'Moderator',
    [UserRole.SYSTEM]: 'System',
    [UserRole.GENERAL_CASE_MANAGER]: 'General Case Manager',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: UserRole.SURVIVOR as AssignableUserRole,
    status: UserStatus.ACTIVE as UserStatus,
    language: 'en',
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleRoleChange = (value: string) => {
    if (!isAssignableUserRole(value)) {
      setSubmitError('Please select a valid role.');
      return;
    }

    setSubmitError(null);
    setFormData((p) => ({ ...p, role: value }));
  };

  useEffect(() => {
    if (!user || !isOpen) return;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    setFormData({
      fullName,
      email: user.email || '',
      phone: user.phone || '',
      role: (ADMIN_EDITABLE_ROLES.includes(user.role as AssignableUserRole)
        ? (user.role as AssignableUserRole)
        : UserRole.SURVIVOR),
      status: user.status,
      language: user.language || 'en',
    });
    setSubmitError(null);
  }, [user, isOpen]);

  const validateForm = () => {
    if (!user) return { fullName: 'No user selected' };

    const nameErr = validateName(formData.fullName, 'Full name');
    const emailErr = validateEmail(formData.email);
    const phoneErr = formData.phone ? validatePhone(formData.phone) : undefined;
    const roleErr = !(ADMIN_EDITABLE_ROLES as readonly string[]).includes(formData.role) 
      ? 'Please select a valid role.' 
      : undefined;

    return { fullName: nameErr, email: emailErr, phone: phoneErr, role: roleErr };
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const results = validateForm();
    setErrors(prev => ({ ...prev, [field]: (results as any)[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setTouched({ fullName: true, email: true, phone: true, role: true });

    if (Object.values(validationErrors).some(e => e)) {
      const firstError = Object.values(validationErrors).find(e => e);
      setSubmitError(firstError || 'Please fix the errors.');
      toast.error(firstError || 'Please fix the errors.');
      return;
    }

    if (!user) return;

    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'User';

    setIsSubmitting(true);
    try {
      const updatedUser = await adminUserService.updateUser(user.id, {
        email: formData.email.trim().toLowerCase(),
        firstName,
        lastName,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        status: formData.status,
        language: formData.language.trim() || 'en',
      });

      toast.success(`User updated: ${updatedUser.email}`);
      onUserUpdated?.(updatedUser);
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update user.';
      const normalizedMessage = Array.isArray(message) ? message.join(', ') : String(message);
      setSubmitError(normalizedMessage);
      toast.error(normalizedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && onOpenChange(open)}
    >
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-xl bg-[var(--colors-ivory-0)]">
        <DialogHeader className="border-b border-[var(--colors-olive-2)] bg-[var(--colors-olive-5)] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--colors-ivory-0)]/20 p-3 backdrop-blur-sm">
              <UserCog className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">Edit User</DialogTitle>
              <DialogDescription className="text-[var(--colors-ivory-2)]">
                Update profile details, role, and account status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[var(--colors-ivory-0)]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editFullName" className="flex items-center gap-2 text-[var(--colors-heading-text)] font-medium">
                <UserIcon className="h-4 w-4 text-[var(--colors-olive-5)]" /> Full Name
              </Label>
              <Input
                id="editFullName"
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editEmail" className="flex items-center gap-2 text-[var(--colors-heading-text)] font-medium">
                <Mail className="h-4 w-4 text-[var(--colors-olive-5)]" /> Email Address
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, email: e.target.value }));
                  if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                }}
                onBlur={() => handleBlur('email')}
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

            <div className="space-y-2">
              <Label htmlFor="editPhone" className="flex items-center gap-2 text-[var(--colors-heading-text)] font-medium">
                <PhoneIcon className="h-4 w-4 text-[var(--colors-olive-5)]" /> Phone Number
              </Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, phone: e.target.value }));
                  if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                }}
                onBlur={() => handleBlur('phone')}
                placeholder="+251..."
                className={`h-12 rounded-xl border bg-white focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)] ${
                  errors.phone && touched.phone ? 'border-red-500' : 'border-[var(--colors-olive-3)] focus:border-[var(--colors-terracotta-5)]'
                }`}
              />
              {errors.phone && touched.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--colors-heading-text)] font-medium">Role</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--colors-ivory-0)] border-[var(--colors-olive-3)]">
                  {ADMIN_EDITABLE_ROLES.map((role) => (
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

            <div className="space-y-2">
              <Label className="text-[var(--colors-heading-text)] font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, status: val as UserStatus }))
                }
              >
                <SelectTrigger className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--colors-ivory-0)] border-[var(--colors-olive-3)]">
                  <SelectItem value={UserStatus.INVITED} className="text-[var(--colors-body-text)] focus:bg-[var(--colors-golden-1)] focus:text-[var(--colors-golden-6)]">Invited</SelectItem>
                  <SelectItem value={UserStatus.ACTIVE} className="text-[var(--colors-body-text)] focus:bg-[var(--colors-olive-1)] focus:text-[var(--colors-olive-6)]">Active</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE} className="text-[var(--colors-body-text)] focus:bg-[var(--colors-ivory-2)] focus:text-[var(--colors-body-text)]">Inactive</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED} className="text-[var(--colors-body-text)] focus:bg-[var(--colors-terracotta-0)] focus:text-[var(--colors-terracotta-5)]">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLanguage" className="text-[var(--colors-heading-text)] font-medium">Language</Label>
              <Input
                id="editLanguage"
                value={formData.language}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, language: e.target.value }))
                }
                placeholder="en"
                className="h-12 rounded-xl border-[var(--colors-olive-3)] bg-white focus:border-[var(--colors-terracotta-5)] focus:ring-[var(--colors-terracotta-5)]/20 text-[var(--colors-body-text)]"
              />
            </div>
          </div>

          <DialogFooter className="-mx-6 mt-6 -mb-6 border-t border-[var(--colors-olive-2)] bg-[var(--colors-olive-0)] p-6">
            {submitError && <p className="mr-auto text-sm text-[var(--colors-error-red)]">{submitError}</p>}
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
              disabled={isSubmitting || !user}
              className="rounded-xl bg-[var(--colors-terracotta-5)] px-8 text-white shadow-lg shadow-[var(--colors-terracotta-5)]/25 hover:bg-[var(--colors-terracotta-6)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
