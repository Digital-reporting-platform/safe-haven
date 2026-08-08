import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { validateEmail, validatePhone, validateName, validatePassword } from '@/utils/validation';
import { toast } from 'sonner';

export function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'John Admin',
    email: 'john.admin@safehaven.org',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    role: 'Administrator',
    joinDate: '2023-01-15',
    lastLogin: '2025-02-20 14:30',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateProfileField = (field: string, value: string) => {
    switch (field) {
      case 'name': return validateName(value, 'Name');
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      default: return undefined;
    }
  };

  const validatePasswordField = (field: string, value: string) => {
    switch (field) {
      case 'newPassword': return validatePassword(value);
      case 'confirmPassword': return value !== passwordData.newPassword ? "Passwords don't match" : undefined;
      default: return undefined;
    }
  };

  const handleProfileBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const val = (profile as any)[field];
    setErrors(prev => ({ ...prev, [field]: validateProfileField(field, val) }));
  };

  const handlePasswordBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const val = (passwordData as any)[field];
    setErrors(prev => ({ ...prev, [field]: validatePasswordField(field, val) }));
  };

  const handleSaveProfile = () => {
    const newErrors = {
      name: validateName(profile.name, 'Name'),
      email: validateEmail(profile.email),
      phone: validatePhone(profile.phone),
    };

    setErrors(prev => ({ ...prev, ...newErrors }));
    setTouched(prev => ({ ...prev, name: true, email: true, phone: true }));

    if (Object.values(newErrors).some(e => e)) {
      toast.error('Please fix the errors in your profile.');
      return;
    }

    // TODO: Implement profile save
    toast.success('Profile updated successfully (Mock)');
    console.log('Save profile', profile);
  };

  const handleChangePassword = () => {
    const newErrors = {
      newPassword: validatePassword(passwordData.newPassword),
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword ? "Passwords don't match" : undefined,
    };

    setErrors(prev => ({ ...prev, ...newErrors }));
    setTouched(prev => ({ ...prev, newPassword: true, confirmPassword: true }));

    if (Object.values(newErrors).some(e => e)) {
      toast.error('Please fix the password errors.');
      return;
    }

    // TODO: Implement password change
    toast.success('Password changed successfully (Mock)');
    console.log('Change password', passwordData);
  };

  const handleUploadAvatar = () => {
    // TODO: Implement avatar upload
    console.log('Upload avatar');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">JA</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="mr-1 h-3 w-3" />
                    {profile.role}
                  </Badge>
                </div>
                <Button variant="outline" onClick={handleUploadAvatar}>
                  Change Avatar
                </Button>
              </div>
              <Separator className="my-6" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="text-center">
                <p className="text-muted-foreground mb-1 text-xs">Last Login</p>
                <p className="text-sm">{profile.lastLogin}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => {
                          setProfile((prev) => ({ ...prev, name: e.target.value }));
                          if (touched.name) setErrors(prev => ({ ...prev, name: validateName(e.target.value, 'Name') }));
                        }}
                        onBlur={() => handleProfileBlur('name')}
                        placeholder="Enter your full name"
                        className={errors.name && touched.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {errors.name && touched.name && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => {
                          setProfile((prev) => ({ ...prev, email: e.target.value }));
                          if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                        }}
                        onBlur={() => handleProfileBlur('email')}
                        placeholder="your.email@example.com"
                        className={errors.email && touched.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {errors.email && touched.email && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => {
                          setProfile((prev) => ({ ...prev, phone: e.target.value }));
                          if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                        }}
                        onBlur={() => handleProfileBlur('phone')}
                        placeholder="e.g. +251 9... or 09..."
                        className={errors.phone && touched.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {errors.phone && touched.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="e.g. Addis Ababa, Ethiopia"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                          if (touched.newPassword) setErrors(prev => ({ ...prev, newPassword: validatePassword(e.target.value) }));
                        }}
                        onBlur={() => handlePasswordBlur('newPassword')}
                        placeholder="••••••••"
                        className={errors.newPassword && touched.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {errors.newPassword && touched.newPassword && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.newPassword}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                          if (touched.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: e.target.value !== passwordData.newPassword ? "Passwords don't match" : undefined }));
                        }}
                        onBlur={() => handlePasswordBlur('confirmPassword')}
                        placeholder="••••••••"
                        className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-muted-foreground text-sm">
                          Receive email updates about account activity
                        </p>
                      </div>
                      <input
                        id="email-notifications"
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        title="Enable Email Notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="system-alerts">System Alerts</Label>
                        <p className="text-muted-foreground text-sm">
                          Get notified about system maintenance and issues
                        </p>
                      </div>
                      <input
                        id="system-alerts"
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        title="Enable System Alerts"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                        <p className="text-muted-foreground text-sm">
                          Receive weekly summary reports
                        </p>
                      </div>
                      <input 
                        id="weekly-reports"
                        type="checkbox" 
                        className="rounded" 
                        title="Enable Weekly Reports"
                      />
                    </div>
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
