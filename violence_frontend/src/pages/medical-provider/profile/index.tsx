import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Briefcase, Award, Building2, Upload, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { validateName, validatePhone } from '@/utils/validation';
import { AlertCircle } from 'lucide-react';
import { medicalProfileService, type MedicalProfilePayload } from '@/services/medicalProfileService';

const defaultProfile: MedicalProfilePayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialty: '',
  licenseNumber: '',
  hospital: '',
  bio: '',
  resumeUrl: '',
  certifications: [''],
  workHistory: [{ company: '', role: '', period: '' }],
};

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [profile, setProfile] = useState<MedicalProfilePayload>(defaultProfile);

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
        const data = await medicalProfileService.getProfile();
        setProfile({
          ...defaultProfile,
          ...data,
          certifications: data.certifications?.length ? data.certifications : [''],
          workHistory: data.workHistory?.length ? data.workHistory : [{ company: '', role: '', period: '' }],
        });
      } catch (error: any) {
        console.error('Failed to load medical profile', error);
        toast.error(error?.message || 'Unable to load profile from backend');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const completion = useMemo(() => {
    const checks = [
      profile.firstName,
      profile.lastName,
      profile.phone,
      profile.specialty,
      profile.licenseNumber,
      profile.hospital,
      profile.bio,
      profile.resumeUrl,
      profile.workHistory.some((x) => x.company && x.role),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [profile]);

  const handleSave = async () => {
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
      const cleaned: Partial<MedicalProfilePayload> = {
        ...profile,
        certifications: profile.certifications.map((x) => x.trim()).filter(Boolean),
        workHistory: profile.workHistory
          .map((x) => ({
            company: x.company?.trim(),
            role: x.role?.trim(),
            period: x.period?.trim(),
          }))
          .filter((x) => x.company || x.role || x.period),
      };
      const saved = await medicalProfileService.updateProfile(cleaned);
      setProfile({
        ...defaultProfile,
        ...saved,
        certifications: saved.certifications?.length ? saved.certifications : [''],
        workHistory: saved.workHistory?.length ? saved.workHistory : [{ company: '', role: '', period: '' }],
      });
      toast.success('Profile saved successfully');
    } catch (error: any) {
      console.error('Failed to save profile', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setIsUploadingResume(true);
      const result = await medicalProfileService.uploadResume(file);
      setProfile((prev) => ({
        ...prev,
        resumeUrl: result.resumeUrl,
      }));
      toast.success('Resume uploaded successfully');
    } catch (error: any) {
      console.error('Resume upload failed', error);
      toast.error(error?.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const updateWork = (index: number, key: 'company' | 'role' | 'period', value: string) => {
    setProfile((prev) => ({
      ...prev,
      workHistory: prev.workHistory.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-surface-primary)]">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-medical)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
          <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-urgent)]/10 to-[var(--role-stable)]/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          <div className="text-center text-[var(--colors-body-text)]">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-medical)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-urgent)]/10 to-[var(--role-stable)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Professional Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] p-3 shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-medical)] to-[var(--colors-olive-5)] bg-clip-text text-4xl font-bold text-transparent">
                Medical Profile
              </h1>
              <p className="font-medium text-[var(--colors-body-text)]">
                Professional identity and credentials
              </p>
            </div>
          </div>
        </motion.div>

        {/* Completion Badge */}
        <div className="mb-6 flex justify-end">
          <Badge variant={completion >= 80 ? 'default' : 'secondary'} className="bg-[var(--role-medical)] text-white">{completion}% Complete</Badge>
        </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Identity & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input 
                  value={profile.firstName} 
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, firstName: e.target.value }));
                    if (touched.firstName) setErrors(prev => ({ ...prev, firstName: validateName(e.target.value, 'First name') }));
                  }} 
                  onBlur={() => handleBlur('firstName')}
                  placeholder="First name"
                  className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  value={profile.lastName} 
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, lastName: e.target.value }));
                    if (touched.lastName) setErrors(prev => ({ ...prev, lastName: validateName(e.target.value, 'Last name') }));
                  }} 
                  onBlur={() => handleBlur('lastName')}
                  placeholder="Last name"
                  className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
               <div>
                <Label>Phone</Label>
                <Input 
                  value={profile.phone} 
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, phone: e.target.value }));
                    if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                  }} 
                  onBlur={() => handleBlur('phone')}
                  placeholder="e.g. +251 9... or 09..."
                  className={errors.phone && touched.phone ? 'border-red-500' : ''}
                />
                {errors.phone && touched.phone && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Specialty</Label>
                <Select value={profile.specialty || undefined} onValueChange={(value) => setProfile((p) => ({ ...p, specialty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                    <SelectItem value="Forensic Medicine">Forensic Medicine</SelectItem>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="General Practice">General Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>License Number</Label>
                <Input value={profile.licenseNumber} onChange={(e) => setProfile((p) => ({ ...p, licenseNumber: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Current Workplace</Label>
              <Input value={profile.hospital} onChange={(e) => setProfile((p) => ({ ...p, hospital: e.target.value }))} placeholder="Hospital / Clinic / Medical Center" />
            </div>
            <div>
              <Label>Professional Summary</Label>
              <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Resume URL</Label>
              <Input
                value={profile.resumeUrl}
                onChange={(e) => setProfile((p) => ({ ...p, resumeUrl: e.target.value }))}
                placeholder="https://.../resume.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Resume File</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                />
                <Button variant="outline" disabled={isUploadingResume}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingResume ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Open uploaded resume
                </a>
              )}
            </div>
            <div className="space-y-2">
              <Label>Certifications</Label>
              {profile.certifications.map((cert, idx) => (
                <div key={`cert-${idx}`} className="flex gap-2">
                  <Input
                    value={cert}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        certifications: p.certifications.map((c, i) => (i === idx ? e.target.value : c)),
                      }))
                    }
                    placeholder="e.g. Trauma-Informed Care Certification"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        certifications:
                          p.certifications.length > 1
                            ? p.certifications.filter((_, i) => i !== idx)
                            : [''],
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setProfile((p) => ({ ...p, certifications: [...p.certifications, ''] }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Previous Workplaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.workHistory.map((item, idx) => (
              <div key={`work-${idx}`} className="rounded-md border p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    value={item.company || ''}
                    onChange={(e) => updateWork(idx, 'company', e.target.value)}
                    placeholder="Organization"
                  />
                  <Input
                    value={item.role || ''}
                    onChange={(e) => updateWork(idx, 'role', e.target.value)}
                    placeholder="Role"
                  />
                  <Input
                    value={item.period || ''}
                    onChange={(e) => updateWork(idx, 'period', e.target.value)}
                    placeholder="Period (e.g. 2021-2024)"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        workHistory:
                          p.workHistory.length > 1
                            ? p.workHistory.filter((_, i) => i !== idx)
                            : [{ company: '', role: '', period: '' }],
                      }))
                    }
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setProfile((p) => ({
                  ...p,
                  workHistory: [...p.workHistory, { company: '', role: '', period: '' }],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Workplace
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Professional Profile'}
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;
