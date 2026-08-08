import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Bell,
  History,
  HardDriveDownload,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Fingerprint,
  BellRing,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SafetySettings() {
  const { t } = useTranslation();
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = () => {
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const safetySections = [
    {
      id: 'anonymity',
      title: t('survivor.safety.anonymityControls'),
      desc: t('survivor.safety.anonymityDesc'),
      icon: Fingerprint,
      gradient: 'from-primary/20 to-accent/20',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
      controls: [
        {
          id: 'ghost-mode',
          label: t('survivor.safety.privateIdentityMode'),
          desc: t('survivor.safety.privateIdentityDesc'),
          defaultChecked: true,
        },
        {
          id: 'enc-reporting',
          label: t('survivor.safety.anonymousReporting'),
          desc: t('survivor.safety.anonymousReportingDesc'),
          defaultChecked: true,
        },
      ],
    },
    {
      id: 'vault',
      title: t('survivor.safety.privacyPreferences'),
      desc: t('survivor.safety.privacyDesc'),
      icon: Lock,
      gradient: 'from-secondary/20 to-primary/20',
      iconBg: 'bg-secondary/15',
      iconColor: 'text-secondary-foreground',
      controls: [
        {
          id: 'auto-wipe',
          label: t('survivor.safety.clearHistoryOnExit'),
          desc: t('survivor.safety.clearHistoryDesc'),
          defaultChecked: true,
        },
        {
          id: 'auto-logout',
          label: t('survivor.safety.inactivityTimeout'),
          desc: t('survivor.safety.inactivityDesc'),
          defaultChecked: false,
        },
      ],
    },
    {
      id: 'alerts',
      title: t('survivor.safety.safetyNotifications'),
      desc: t('survivor.safety.safetyNotifDesc'),
      icon: BellRing,
      gradient: 'from-accent/20 to-primary/20',
      iconBg: 'bg-accent/15',
      iconColor: 'text-accent-foreground',
      controls: [
        {
          id: 'stealth-notif',
          label: t('survivor.safety.stealthNotifications'),
          desc: t('survivor.safety.stealthNotifDesc'),
          defaultChecked: true,
        },
        {
          id: 'emergency-override',
          label: t('survivor.safety.criticalSOSAlerts'),
          desc: t('survivor.safety.criticalSOSDesc'),
          defaultChecked: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 font-sans bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-24 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-5xl px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase border-primary/30 bg-primary/10 text-primary"
            >
              {t('survivor.safety.secureEnvironment')}
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl leading-tight font-medium text-foreground md:text-5xl"
          >
            {t('survivor.safety.title')}{' '}
            <span className="font-semibold text-primary">& Identity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mt-4 text-lg leading-relaxed text-muted-foreground"
          >
            {t('survivor.safety.description')}
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 -mt-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: t('survivor.safety.privacyLevel'), value: t('survivor.safety.high'), icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: t('survivor.safety.encryption'), value: t('survivor.safety.active'), icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
            { label: t('survivor.safety.session'), value: t('survivor.safety.secure'), icon: Fingerprint, color: 'text-accent-foreground', bg: 'bg-accent/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Controls */}
          <div className="space-y-12 lg:col-span-8">
            {safetySections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx + 0.3 }}
              >
                <Card className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg">
                  <CardHeader className={`border-b border-border/50 bg-gradient-to-r ${section.gradient} p-6 md:p-8`}>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-2xl p-3 ${section.iconBg}`}>
                        <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-card-foreground">
                          {section.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {section.desc}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 md:p-8">
                    {section.controls.map((control) => (
                      <div
                        key={control.id}
                        className="flex items-start justify-between gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="space-y-1 flex-1">
                          <Label
                            htmlFor={control.id}
                            className="cursor-pointer text-sm font-semibold text-foreground"
                          >
                            {control.label}
                          </Label>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {control.desc}
                          </p>
                        </div>
                        <Switch
                          id={control.id}
                          defaultChecked={control.defaultChecked}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar Status & Tools */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Live Identity Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="rounded-3xl border border-border/50 bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-bold text-foreground">
                      Status Dashboard
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Network Privacy
                      </span>
                      <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 text-[9px] font-bold tracking-wider uppercase">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Session Key
                      </span>
                      <Badge className="rounded-lg bg-primary/10 text-primary border-none px-3 py-1 text-[9px] font-bold tracking-wider uppercase">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <Button
                    onClick={handleSave}
                    className="h-12 w-full rounded-xl border-none bg-primary font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Save Changes
                  </Button>

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 text-center text-xs font-bold text-primary"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Settings Updated
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Quick Tools */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <h4 className="px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Data Management
              </h4>

              <Button
                variant="outline"
                className="group flex h-14 w-full items-center justify-between rounded-xl border border-border bg-card px-4 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary-foreground/20">
                    <HardDriveDownload className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-sm font-semibold">
                    {t('survivor.safety.downloadMyData')}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
              </Button>

              <Button
                variant="outline"
                className="group flex h-14 w-full items-center justify-between rounded-xl border border-border bg-card px-4 transition-all hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 group-hover:bg-destructive-foreground/20">
                    <Trash2 className="h-4 w-4 text-destructive group-hover:text-destructive-foreground" />
                  </div>
                  <span className="text-sm font-semibold">{t('survivor.safety.deleteAccount')}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-destructive-foreground" />
              </Button>

              <Button
                variant="outline"
                className="group h-14 w-full rounded-xl border border-border bg-card px-4 font-semibold text-muted-foreground transition-all hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold">{t('survivor.safety.resetDefaults')}</span>
                </div>
              </Button>
            </motion.div>
          </aside>
        </div>

        {/* Informational Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <div className="group space-y-4 rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-6 hover:border-primary/30 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('survivor.safety.endToEndEncryption')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('survivor.safety.endToEndDesc')}</p>
            </div>
          </div>
          <div className="group space-y-4 rounded-3xl border border-border/50 bg-gradient-to-br from-accent/5 to-transparent p-6 hover:border-accent/30 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent-foreground shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('survivor.safety.dataProtection')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('survivor.safety.dataProtectionDesc')}</p>
            </div>
          </div>
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-auto lg:w-auto hidden lg:block"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur-md">
          <div className="relative">
            <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500 opacity-40" />
            <div className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-bold tracking-widest whitespace-nowrap text-muted-foreground uppercase">
            {t('survivor.safety.encryptionActiveSecure')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
