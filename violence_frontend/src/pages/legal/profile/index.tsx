import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Award,
  FileText,
  Save,
  Loader2,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { validateName, validatePhone } from '@/utils/validation';
import { legalWorkflowService, type LegalProfilePayload } from '@/services/legalWorkflowService';

const defaultProfile: LegalProfilePayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  firm: '',
  specialization: '',
  barLicenseNumber: '',
  bio: '',
};

const Profile = () => {
  const [profile, setProfile] = useState<LegalProfilePayload>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err: string | undefined;
    if (field === 'firstName') err = validateName(profile.firstName, 'First name');
    if (field === 'lastName') err = validateName(profile.lastName, 'Last name');
    if (field === 'phone') err = profile.phone ? validatePhone(profile.phone) : undefined;
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getProfile();
        setProfile({ ...defaultProfile, ...data });
      } catch (error: any) {
        console.error('Failed to load legal profile', error);
        toast.error(error?.message || 'Failed to load legal profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    const newErrors = {
      firstName: validateName(profile.firstName, 'First name'),
      lastName: validateName(profile.lastName, 'Last name'),
      phone: profile.phone ? validatePhone(profile.phone) : undefined,
    };

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, phone: true });

    if (Object.values(newErrors).some(e => e)) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    try {
      setIsSaving(true);
      const data = await legalWorkflowService.updateProfile(profile);
      setProfile({ ...defaultProfile, ...data });
      toast.success('Profile saved');
    } catch (error: any) {
      console.error('Failed to save profile', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--role-legal-bg)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--colors-body-text)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-legal-bg)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[#DDA15E]/10 to-[#C15B3E]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[#414435] to-[#6B705C] p-4 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#414435]">
                Legal Provider Profile
              </h1>
              <p className="text-[#6B705C] mt-1">
                Manage your professional information and credentials
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#414435]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#414435]/20 p-2">
                  <Shield className="h-5 w-5 text-[#414435]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-[#414435]">
                    Profile Details
                  </CardTitle>
                  <p className="text-sm text-[#6B705C] mt-0.5">
                    Your professional information is securely stored
                  </p>
                </div>
                <Badge variant="outline" className="border-[#6B705C]/20 text-[#6B705C]">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6B705C]" />
                    First Name
                  </Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, firstName: e.target.value }));
                      if (touched.firstName) setErrors(prev => ({ ...prev, firstName: validateName(e.target.value, 'First name') }));
                    }}
                    onBlur={() => handleBlur('firstName')}
                    className={`border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20 ${
                      errors.firstName && touched.firstName ? 'border-red-500 ring-red-500' : ''
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6B705C]" />
                    Last Name
                  </Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, lastName: e.target.value }));
                      if (touched.lastName) setErrors(prev => ({ ...prev, lastName: validateName(e.target.value, 'Last name') }));
                    }}
                    onBlur={() => handleBlur('lastName')}
                    className={`border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20 ${
                      errors.lastName && touched.lastName ? 'border-red-500 ring-red-500' : ''
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#6B705C]" />
                    Email
                  </Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="border-slate-200 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-[#6B705C]">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#6B705C]" />
                    Phone
                  </Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, phone: e.target.value }));
                      if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                    }}
                    onBlur={() => handleBlur('phone')}
                    className={`border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20 ${
                      errors.phone && touched.phone ? 'border-red-500 ring-red-500' : ''
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && touched.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#6B705C]" />
                    Firm / Organization
                  </Label>
                  <Input
                    value={profile.firm}
                    onChange={(e) => setProfile((p) => ({ ...p, firm: e.target.value }))}
                    className="border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20"
                    placeholder="Enter firm name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#414435] font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#6B705C]" />
                    Specialization
                  </Label>
                  <Input
                    value={profile.specialization}
                    onChange={(e) => setProfile((p) => ({ ...p, specialization: e.target.value }))}
                    className="border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20"
                    placeholder="e.g., Family Law, Domestic Violence"
                  />
                </div>
              </div>

              {/* Bar License */}
              <div className="space-y-2">
                <Label className="text-[#414435] font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#6B705C]" />
                  Bar License Number
                </Label>
                <Input
                  value={profile.barLicenseNumber}
                  onChange={(e) => setProfile((p) => ({ ...p, barLicenseNumber: e.target.value }))}
                  className="border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20"
                  placeholder="Enter bar license number"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-[#414435] font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#6B705C]" />
                  Bio / Professional Summary
                </Label>
                <Textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  className="border-slate-200 focus:border-[#6B705C] focus:ring-[#6B705C]/20 resize-none"
                  placeholder="Describe your experience, expertise, and approach to legal advocacy..."
                />
                <p className="text-xs text-[#6B705C]">
                  This bio may be visible to survivors and case administrators
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  onClick={save}
                  disabled={isSaving}
                  className="bg-[#414435] hover:bg-[#6B705C] text-white px-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
