import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Settings, Shield, Bell, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import {
  defaultSystemSettings,
  SystemSettings,
  SystemSettingsCategory,
  systemSettingsService,
} from '@/services/systemSettingsService';

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState<SystemSettingsCategory | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);

      try {
        const remoteSettings = await systemSettingsService.getSettings();
        setSettings(remoteSettings);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (category: SystemSettingsCategory) => {
    setSavingCategory(category);

    try {
      const updatedCategory = await systemSettingsService.updateCategory(
        category,
        settings[category],
      );

      setSettings((prev) => ({
        ...prev,
        [category]: updatedCategory,
      }));
      toast.success(`${category[0].toUpperCase()}${category.slice(1)} settings saved`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to save ${category} settings`);
    } finally {
      setSavingCategory(null);
    }
  };

  const updateSetting = <
    TCategory extends SystemSettingsCategory,
    TKey extends keyof SystemSettings[TCategory],
  >(
    category: TCategory,
    key: TKey,
    value: SystemSettings[TCategory][TKey],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="mx-6 px-4 py-8 flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B705C]" />
      </div>
    );
  }

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B705C]"
               style={{ boxShadow: '0 10px 25px -5px rgba(107, 112, 92, 0.35)' }}>
            <Settings className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">System Settings</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Configure system preferences and global settings
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="border-b border-[#DAD8CE] flex space-x-1 bg-transparent p-0 mb-6">
          <TabsTrigger
            value="general"
            className="text-[#6B705C] hover:text-[#4A4D42] data-[state=active]:text-[#4A4D42] data-[state=active]:border-[#6B705C] px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F4F0] flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="text-[#6B705C] hover:text-[#4A4D42] data-[state=active]:text-[#4A4D42] data-[state=active]:border-[#C15B3E] px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:bg-[#FEF5F2] flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-[#6B705C] hover:text-[#4A4D42] data-[state=active]:text-[#4A4D42] data-[state=active]:border-[#AD7D4A] px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:bg-[#FEFAF5] flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="text-[#6B705C] hover:text-[#4A4D42] data-[state=active]:text-[#4A4D42] data-[state=active]:border-[#5D624F] px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F4F0] flex items-center gap-2"
          >
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                  <Settings className="h-4 w-4 text-[#6B705C]" />
                </div>
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      updateSetting('general', 'siteName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      updateSetting('general', 'contactEmail', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      updateSetting('general', 'timezone', value as SystemSettings['general']['timezone'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) =>
                      updateSetting('general', 'language', value as SystemSettings['general']['language'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="am">Amharic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) =>
                    updateSetting('general', 'siteDescription', e.target.value)
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={() => handleSave('general')}
                disabled={savingCategory === 'general'}
                className="flex items-center gap-2 bg-[#6B705C] hover:bg-[#5D624F] text-white"
              >
                {savingCategory === 'general' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#FEF5F2] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F8D4C7] p-1.5">
                  <Shield className="h-4 w-4 text-[#C15B3E]" />
                </div>
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-muted-foreground text-sm">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      updateSetting('security', 'enableTwoFactor', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Logs</Label>
                    <p className="text-muted-foreground text-sm">
                      Log all administrative actions
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableAuditLogs}
                    onCheckedChange={(checked) =>
                      updateSetting('security', 'enableAuditLogs', checked)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      updateSetting(
                        'security',
                        'sessionTimeout',
                        toNumber(e.target.value, settings.security.sessionTimeout),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">
                    Minimum Password Length
                  </Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      updateSetting(
                        'security',
                        'passwordMinLength',
                        toNumber(e.target.value, settings.security.passwordMinLength),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      updateSetting(
                        'security',
                        'maxLoginAttempts',
                        toNumber(e.target.value, settings.security.maxLoginAttempts),
                      )
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('security')}
                disabled={savingCategory === 'security'}
                className="flex items-center gap-2 bg-[#C15B3E] hover:bg-[#A54B34] text-white"
              >
                {savingCategory === 'security' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#FEFAF5] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7E8D1] p-1.5">
                  <Bell className="h-4 w-4 text-[#AD7D4A]" />
                </div>
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        'notifications',
                        'emailNotifications',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Send SMS alerts for critical incidents
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        'notifications',
                        'smsNotifications',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Enable browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        'notifications',
                        'pushNotifications',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-muted-foreground text-sm">
                      Send weekly summary reports
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      updateSetting('notifications', 'weeklyReports', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Incident Alerts</Label>
                    <p className="text-muted-foreground text-sm">
                      Immediate alerts for new incidents
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.incidentAlerts}
                    onCheckedChange={(checked) =>
                      updateSetting('notifications', 'incidentAlerts', checked)
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('notifications')}
                disabled={savingCategory === 'notifications'}
                className="flex items-center gap-2 bg-[#AD7D4A] hover:bg-[#8F6539] text-white"
              >
                {savingCategory === 'notifications' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#E8E7E0] p-1.5">
                  <Wrench className="h-4 w-4 text-[#5D624F]" />
                </div>
                Maintenance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-muted-foreground text-sm">
                      Put the site in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting('maintenance', 'maintenanceMode', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Updates</Label>
                    <p className="text-muted-foreground text-sm">
                      Automatically install security updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance.autoUpdates}
                    onCheckedChange={(checked) =>
                      updateSetting('maintenance', 'autoUpdates', checked)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.maintenance.backupFrequency}
                    onValueChange={(value) =>
                      updateSetting(
                        'maintenance',
                        'backupFrequency',
                        value as SystemSettings['maintenance']['backupFrequency'],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logRetentionDays">Log Retention (days)</Label>
                  <Input
                    id="logRetentionDays"
                    type="number"
                    value={settings.maintenance.logRetentionDays}
                    onChange={(e) =>
                      updateSetting(
                        'maintenance',
                        'logRetentionDays',
                        toNumber(e.target.value, settings.maintenance.logRetentionDays),
                      )
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('maintenance')}
                disabled={savingCategory === 'maintenance'}
                className="flex items-center gap-2 bg-[#5D624F] hover:bg-[#4A4D42] text-white"
              >
                {savingCategory === 'maintenance' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Maintenance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
