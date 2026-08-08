import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    role: 'MODERATOR',
    language: 'ENG',
    timezone: 'UTC+3',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await moderatorWorkflowService.getProfile();
        setProfile((prev) => ({ ...prev, ...data }));
      } catch (error: any) {
        console.error('Failed to load moderator profile', error);
        toast.error(error?.message || 'Failed to load moderator profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      setIsSaving(true);
      const data = await moderatorWorkflowService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
      });
      setProfile((prev) => ({ ...prev, ...data }));
      toast.success('Profile saved');
    } catch (error: any) {
      console.error('Failed to save moderator profile', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen pb-20 font-sans moderator-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Moderator Profile</h1>
          <p className="text-muted-foreground">Manage moderator profile settings.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><Label>First Name</Label><Input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} /></div>
              <div><Label>Last Name</Label><Input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><Label>Email</Label><Input value={profile.email} disabled /></div>
              <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Bio</Label><Textarea rows={4} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} /></div>
            <div className="flex justify-end">
              <Button onClick={save} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
