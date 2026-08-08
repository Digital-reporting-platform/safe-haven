import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, Calendar, MapPin, User, Edit, Camera, Save, X, Check, AlertCircle, Lock, Globe, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/components/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

const SurvivorProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    language: 'en'
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        language: user.language || 'en'
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/users/profile', {
        ...formData,
        profileImage
      });
      
      if (response.data) {
        setUser(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        language: user.language || 'en'
      });
      setProfileImage(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FDFDF5' }}>
        <div className="text-center p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#F7F3E6', border: '1px solid #E8E7E0' }}>
          <Shield className="h-16 w-16 mx-auto mb-4" style={{ color: '#C15B3E' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#3D4035' }}>Please Log In</h2>
          <p className="mb-6" style={{ color: '#6B705C' }}>You need to be logged in to view your profile.</p>
          <Button 
            onClick={() => window.location.href = '/auth/login'} 
            className="px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: '#C15B3E', color: '#fff' }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFDF5' }}>
      <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#F7F3E6' }}>
              <Shield className="h-8 w-8" style={{ color: '#C15B3E' }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>My Profile</h1>
              <p style={{ color: '#6B705C' }}>Manage your personal information and settings</p>
            </div>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg"
              style={{ backgroundColor: '#C15B3E', color: '#fff' }}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleCancelEdit}
                variant="outline"
                className="px-6 py-3 rounded-lg flex items-center gap-2 font-semibold"
                style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg"
                style={{ backgroundColor: '#4A4D42', color: '#fff' }}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card - Left Side */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <div className="p-6" style={{ background: 'linear-gradient(to right, #C15B3E, #A54B34)' }}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: '#F7F3E6' }}>
                      {profileImage || user.profileImage ? (
                        <img 
                          src={profileImage || user.profileImage} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold" style={{ color: '#C15B3E' }}>
                          {formData.firstName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100" style={{ border: '1px solid #E8E7E0' }}>
                        <Camera className="h-4 w-4" style={{ color: '#6B705C' }} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-blue-100">Survivor</p>
                </div>
              </div>
              
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" style={{ color: '#C15B3E' }} />
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: '#6B705C' }}>Email</p>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                          type="email"
                          style={{ borderColor: '#E8E7E0' }}
                        />
                      ) : (
                        <p className="text-sm font-medium" style={{ color: '#3D4035' }}>{formData.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {formData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4" style={{ color: '#C15B3E' }} />
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: '#6B705C' }}>Phone</p>
                        {isEditing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="mt-1"
                            type="tel"
                            style={{ borderColor: '#E8E7E0' }}
                          />
                        ) : (
                          <p className="text-sm font-medium" style={{ color: '#3D4035' }}>{formData.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" style={{ color: '#C15B3E' }} />
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: '#6B705C' }}>Member Since</p>
                      <p className="text-sm font-medium" style={{ color: '#3D4035' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium mb-2" style={{ color: '#6B705C' }}>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1"
                        placeholder="Enter your first name"
                        style={{ borderColor: '#E8E7E0' }}
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium" style={{ color: '#3D4035' }}>{formData.firstName || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2" style={{ color: '#6B705C' }}>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1"
                        placeholder="Enter your last name"
                        style={{ borderColor: '#E8E7E0' }}
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium" style={{ color: '#3D4035' }}>{formData.lastName || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2" style={{ color: '#6B705C' }}>Language</Label>
                    {isEditing ? (
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: '#E8E7E0',
                          '--tw-ring-color': '#C15B3E'
                        }}
                      >
                        <option value="en">English</option>
                        <option value="am">አማርኛ</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm font-medium" style={{ color: '#3D4035' }}>
                        {formData.language === 'en' ? 'English' : 'አማርኛ'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="flex items-center gap-2 font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>
                  <Shield className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: '#F7F3E6', borderColor: '#E8E7E0' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#3D4035' }}>Email Verification</p>
                      <p className="text-xs" style={{ color: '#6B705C' }}>Account security status</p>
                    </div>
                    <Badge className={user.isEmailVerified ? 'text-green-800' : 'text-yellow-800'} style={{ 
                      backgroundColor: user.isEmailVerified ? '#D1FAE5' : '#FEF3C7',
                      border: '1px solid ' + (user.isEmailVerified ? '#BEE7A5' : '#F59E0B')
                    }}>
                      {user.isEmailVerified ? (
                        <><Check className="h-3 w-3 mr-1" />Verified</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" />Pending</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: '#F7F3E6', borderColor: '#E8E7E0' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#3D4035' }}>Account Status</p>
                      <p className="text-xs" style={{ color: '#6B705C' }}>Current account state</p>
                    </div>
                    <Badge className="text-green-800" style={{ 
                      backgroundColor: '#D1FAE5',
                      border: '1px solid #BEE7A5'
                    }}>
                      <Check className="h-3 w-3 mr-1" />
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl border-0" style={{ backgroundColor: '#fff' }}>
              <CardHeader className="p-6" style={{ background: 'linear-gradient(to right, #F7F3E6, #E8E7E0)' }}>
                <CardTitle className="font-bold" style={{ color: '#3D4035', fontFamily: 'var(--font-sans-primary, sans-serif)' }}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6" style={{ backgroundColor: '#fff' }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 rounded-lg font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={() => window.location.href = '/survivor/safety'}
                  >
                    <Lock className="h-5 w-5 mr-3" style={{ color: '#C15B3E' }} />
                    <div className="text-left">
                      <p className="font-medium">Privacy Settings</p>
                      <p className="text-xs">Control your information</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 rounded-lg font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={() => window.location.href = '/survivor/settings'}
                  >
                    <Bell className="h-5 w-5 mr-3" style={{ color: '#C15B3E' }} />
                    <div className="text-left">
                      <p className="font-medium">Notifications</p>
                      <p className="text-xs">Manage alerts</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 rounded-lg font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={() => window.location.href = '/survivor/messages'}
                  >
                    <Mail className="h-5 w-5 mr-3" style={{ color: '#C15B3E' }} />
                    <div className="text-left">
                      <p className="font-medium">Messages</p>
                      <p className="text-xs">View conversations</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4 rounded-lg font-semibold"
                    style={{ borderColor: '#E8E7E0', color: '#6B705C' }}
                    onClick={() => window.location.href = '/resources'}
                  >
                    <Globe className="h-5 w-5 mr-3" style={{ color: '#C15B3E' }} />
                    <div className="text-left">
                      <p className="font-medium">Resources</p>
                      <p className="text-xs">Get help & support</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurvivorProfilePage;
