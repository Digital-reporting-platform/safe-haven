import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Moon,
  Sun,
  Globe,
  Save,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { validateEmail, validateName } from '@/utils/validation';
import { toast } from 'sonner';
import { useApp } from '@/components/AppContext';
import { api } from '@/services/api/client';

export function SettingsPage() {
  const { t } = useTranslation();
  const { user, setUser } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    let err: string | undefined;
    if (field === 'firstName') err = validateName(value, 'First name');
    if (field === 'lastName') err = profile.lastName ? validateName(value, 'Last name') : undefined;
    if (field === 'email') err = validateEmail(value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err: string | undefined;
    if (field === 'firstName') err = validateName(profile.firstName, 'First name');
    if (field === 'lastName') err = profile.lastName ? validateName(profile.lastName, 'Last name') : undefined;
    if (field === 'email') err = validateEmail(profile.email);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSave = async () => {
    const newErrors = {
      firstName: validateName(profile.firstName, 'First name'),
      lastName: profile.lastName ? validateName(profile.lastName, 'Last name') : undefined,
      email: validateEmail(profile.email),
    };

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true });

    if (Object.values(newErrors).some(e => e)) {
      toast.error(t('settings.errors.saveError'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        preferences: {
          notifications,
          privacy,
          theme: isDark ? 'dark' : 'light'
        }
      });
      
      if (response.data) {
        setUser(response.data);
        toast.success(t('settings.success.profileUpdated'));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('settings.errors.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm(t('settings.confirmations.deleteAccount'))) {
      try {
        await api.delete('/auth/account');
        toast.success(t('settings.success.accountDeleted'));
        // Clear token and redirect to login after deletion
        localStorage.removeItem('sh_token');
        window.location.href = '/auth/login';
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('settings.errors.deleteError'));
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDF5' }}>
      <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#F7F3E6' }}>
              <Settings className="h-6 w-6" style={{ color: '#C15B3E' }} />
            </div>
            <Badge 
              className="px-4 py-2 font-bold"
              style={{ 
                backgroundColor: '#C15B3E', 
                color: '#fff',
                fontFamily: 'var(--font-sans-primary, sans-serif)',
                letterSpacing: '0.05em'
              }}
            >
              {t('settings.title')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
            {t('settings.title')} & <span style={{ color: '#C15B3E' }}>{t('settings.preferences')}</span>
          </h1>
          <p className="max-w-2xl" style={{ color: '#6B705C' }}>
            {t('settings.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Settings */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <User className="h-5 w-5" />
                  {t('settings.profile.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                      {t('settings.profile.firstName')}
                    </Label>
                    <Input 
                      id="firstName" 
                      placeholder={t('settings.profile.firstNamePlaceholder')}
                      value={profile.firstName}
                      onChange={(e) => {
                        handleInputChange('firstName', e.target.value);
                        if (touched.firstName) setErrors(prev => ({ ...prev, firstName: validateName(e.target.value, 'First name') }));
                      }}
                      onBlur={() => handleBlur('firstName')}
                      className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                      style={{ borderColor: errors.firstName && touched.firstName ? '#ef4444' : '#E8E7E0' }}
                    />
                    {errors.firstName && touched.firstName && (
                      <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}>
                        <AlertCircle size={12} /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                      {t('settings.profile.lastName')}
                    </Label>
                    <Input 
                      id="lastName" 
                      placeholder={t('settings.profile.lastNamePlaceholder')}
                      value={profile.lastName}
                      onChange={(e) => {
                        handleInputChange('lastName', e.target.value);
                        if (touched.lastName) setErrors(prev => ({ ...prev, lastName: validateName(e.target.value, 'Last name') }));
                      }}
                      onBlur={() => handleBlur('lastName')}
                      className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                      style={{ borderColor: errors.lastName && touched.lastName ? '#ef4444' : '#E8E7E0' }}
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}>
                        <AlertCircle size={12} /> {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                    {t('settings.profile.email')}
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder={t('settings.profile.emailPlaceholder')}
                    value={profile.email}
                    onChange={(e) => {
                      handleInputChange('email', e.target.value);
                      if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => handleBlur('email')}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                    style={{ borderColor: errors.email && touched.email ? '#ef4444' : '#E8E7E0' }}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}>
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <Shield className="h-5 w-5" />
                  {t('settings.privacy.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="privacy" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.privacy.anonymousMode')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.privacy.anonymousDescription')}
                      </p>
                    </div>
                    <Switch
                      id="privacy"
                      checked={privacy}
                      onCheckedChange={setPrivacy}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="visibility" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.privacy.profileVisibility')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.privacy.profileVisibilityDescription')}
                      </p>
                    </div>
                    <Switch id="visibility" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <Bell className="h-5 w-5" />
                  {t('settings.notifications.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.notifications.push')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.notifications.pushDescription')}
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.notifications.email')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.notifications.emailDescription')}
                      </p>
                    </div>
                    <Switch id="email-notif" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <Eye className="h-5 w-5" />
                  {t('settings.appearance.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.appearance.darkMode')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.appearance.darkModeDescription')}
                      </p>
                    </div>
                    <Switch
                      id="theme"
                      checked={isDark}
                      onCheckedChange={setIsDark}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="language" style={{ color: '#6B705C', fontSize: '14px', fontWeight: '500' }}>
                        {t('settings.appearance.language')}
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#6B705C' }}>
                        {t('settings.appearance.languageDescription')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" style={{ color: '#C15B3E' }} />
                      <span className="text-sm font-medium" style={{ color: '#3D4035' }}>
                        {t('settings.appearance.currentLanguage')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  {t('settings.actions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start gap-2 font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isLoading ? t('settings.actions.saving') : t('settings.actions.saveChanges')}
                  </Button>
                  
                  <Button
                    className="w-full justify-start gap-2 font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={() => window.location.href = '/survivor/profile'}
                  >
                    <Eye className="h-4 w-4" />
                    {t('settings.actions.previewProfile')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #C15B3E, #A54B34)' }}>
                <CardContent className="text-center text-white">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">
                    {t('settings.status.verified')}
                  </h3>
                  <p className="text-sm opacity-90">
                    {t('settings.status.verifiedDescription')}
                  </p>
                </CardContent>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D1FAE5' }} />
                    <span className="text-sm font-medium" style={{ color: '#3D4035' }}>
                      {t('settings.status.emailVerified')}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D1FAE5' }} />
                    <span className="text-sm font-medium" style={{ color: '#3D4035' }}>
                      {t('settings.status.accountActive')}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D1FAE5' }} />
                    <span className="text-sm font-medium" style={{ color: '#3D4035' }}>
                      {t('settings.status.privacyProtected')}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t" style={{ borderColor: '#E8E7E0' }}>
                  <Button
                    className="w-full justify-start gap-2 font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#ef4444' }}
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('settings.actions.deleteAccount')}
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
