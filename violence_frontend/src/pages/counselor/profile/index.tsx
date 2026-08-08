import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { validateName, validatePhone } from '@/utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err: string | undefined;
    if (field === 'name') err = validateName(name, 'Full name');
    if (field === 'phone') err = phone ? validatePhone(phone) : undefined;
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data as UserProfile;
      setProfile(userData);
      setName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown');
      setPhone(userData.phone || '');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load profile';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors = {
      name: validateName(name, 'Full name'),
      phone: phone ? validatePhone(phone) : undefined,
    };

    setErrors(newErrors);
    setTouched({ name: true, phone: true });

    if (Object.values(newErrors).some(e => e)) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      // Parse name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await api.put('/auth/profile', {
        firstName,
        lastName,
        phone,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
      await fetchProfile();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update profile';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown');
      setPhone(profile.phone || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-(--role-counselor-bg) p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Profile Settings
            </h1>
            <p className="mt-1 text-slate-600">
              Manage your account information
            </p>
          </div>
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : !isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-(--role-counselor-primary) hover:bg-(--role-counselor-primary)/90"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-(--role-counselor-primary) mx-auto" />
            <p className="mt-4 text-slate-500">Loading profile...</p>
          </div>
        )}

        {!isLoading && profile && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Overview */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-(--role-counselor-secondary)/30">
                      <User className="h-12 w-12 text-(--role-counselor-text)" />
                      {isEditing && (
                        <button
                          className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-(--role-counselor-primary)"
                          aria-label="Change profile picture"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{name}</h2>
                    <p className="text-slate-600 capitalize">{profile.role.toLowerCase().replace('_', ' ')}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <Shield className="mr-1 h-3 w-3" />
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Member Since</p>
                      <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-sm">{profile.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (touched.name) setErrors(prev => ({ ...prev, name: validateName(e.target.value, 'Full name') }));
                          }}
                          onBlur={() => handleBlur('name')}
                          placeholder="Full name"
                          className={errors.name && touched.name ? 'border-red-500' : ''}
                        />
                        {errors.name && touched.name && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> {errors.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-800">{name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <p className="text-slate-600">{profile.email}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Phone
                      </label>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                            }}
                            onBlur={() => handleBlur('phone')}
                            placeholder="Add phone number"
                            className={errors.phone && touched.phone ? 'border-red-500' : ''}
                          />
                          {errors.phone && touched.phone && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                              <AlertCircle size={12} /> {errors.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-600">{profile.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Role
                      </label>
                      <p className="text-slate-600 capitalize">{profile.role.toLowerCase().replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Language
                      </label>
                      <p className="text-slate-600 uppercase">{profile.language}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
