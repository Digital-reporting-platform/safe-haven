import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/components/AppContext';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Magnetic } from '@/components/ui/Magnetic';
import {
  Shield,
  ArrowRight,
  Lock,
  FileText,
  Zap,
  Target,
  HeartHandshake,
  EyeOff,
  Cpu,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import AnimatedMarquee from '@/components/AnimatedMarquee';
import { SectionPreviews } from '../general/SectionPreviews';
import { RecoveryHub } from '../general/recovery-hub';
import HeroSection from '@/components/homepage/HeroSection';

// Section wrapper for consistent spacing
const Section = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`py-12 md:py-16 lg:py-20 ${className}`}>
    {children}
  </section>
);

// Enhanced SectionHeader Component
const SectionHeader = ({
  badge,
  title,
  amharicTitle,
  description,
  className = '',
}: {
  badge?: React.ReactNode;
  title: string;
  amharicTitle?: string;
  description?: string;
  className?: string;
}) => (
  <div className={`mb-16 text-center ${className}`}>
    {badge && (
      <Badge className="mb-6 border-0 bg-[var(--color-primary)]/10 px-6 py-3 font-[Inter] text-sm font-bold text-[var(--color-primary)]">
        {badge}
      </Badge>
    )}

    {/* Amharic Title */}
    {amharicTitle && (
      <div className="mb-2 font-[Abyssinica_SIL] text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
        {amharicTitle}
      </div>
    )}

    {/* English Title */}
    <h2 className="mb-4 font-[Inter] text-4xl leading-tight font-bold text-[var(--color-foreground)] md:text-5xl lg:text-6xl">
      {title}
    </h2>

    {description && (
      <p className="mx-auto max-w-2xl font-[Inter] text-lg leading-relaxed text-[var(--color-foreground)]/80">
        {description}
      </p>
    )}
  </div>
);

// Primary button component
const PrimaryButton = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <Button {...props} className={`button-primary group ${className}`}>
    {children}
    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
  </Button>
);

// Secondary button component
const SecondaryButton = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <Button
    variant="outline"
    {...props}
    className={`h-14 border-2 border-[var(--color-primary)] px-8 font-[Inter] text-base text-[var(--color-primary)] transition-all duration-300 hover:scale-105 hover:bg-[var(--color-primary)]/10 ${className}`}
  >
    {children}
  </Button>
);

// Process Step Component
const ProcessStep = React.memo(
  ({
    step,
    index,
    totalSteps,
  }: {
    step: {
      icon: React.ElementType;
      number: string;
      title: string;
      description: string;
    };
    index: number;
    totalSteps: number;
  }) => (
    <div className="group">
      <Card className="hover-lift border-2 border-[var(--color-primary)]/20 bg-[var(--color-background)] transition-all duration-500 group-hover:scale-105 hover:border-[var(--color-primary)] hover:shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] transition-transform duration-500 group-hover:scale-110">
              <step.icon className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-background)] bg-[var(--color-accent)]">
              <span className="font-[Inter] text-sm font-bold text-white">
                {step.number}
              </span>
            </div>
          </div>

          <h3 className="mb-3 font-[Inter] text-xl leading-tight font-semibold text-[var(--color-foreground)]">
            {step.title}
          </h3>
          <p className="font-[Inter] text-sm leading-relaxed text-[var(--color-foreground)] opacity-80">
            {step.description}
          </p>

          {index < totalSteps - 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-background)]">
                <ArrowRight className="h-3 w-3 text-[var(--color-primary)]" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
);

export function HomePage() {
  const {
    setCurrentPage,
    language: currentLanguage,
    setLanguage: setCurrentLanguage,
  } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHeroMenuOpen, setHeroMenuOpen] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(true);

  const toggleLanguage = () =>
    setCurrentLanguage(currentLanguage === 'ENG' ? 'AMH' : 'ENG');

  const handleAuthNavigation = () => {
    setShowLogin(!showLogin);
    const page = showLogin ? 'login' : 'signup';
    setCurrentPage(page);
    navigate(`/${page}`);
  };

  const processSteps = React.useMemo(
    () => [
      {
        number: '01',
        title: t('home.howItWorks.steps.step1.title'),
        description: t('home.howItWorks.steps.step1.description'),
        icon: FileText,
      },
      {
        number: '02',
        title: t('home.howItWorks.steps.step2.title'),
        description: t('home.howItWorks.steps.step2.description'),
        icon: Target,
      },
      {
        number: '03',
        title: t('home.howItWorks.steps.step3.title'),
        description: t('home.howItWorks.steps.step3.description'),
        icon: HeartHandshake,
      },
    ],
    [t]
  );

  const FloatingParticles = () => {
    return (
      <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `particle-float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.4,
            }}
          />
        ))}
      </div>
    );
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 80 };
  const sx = useSpring(mouseX, springConfig);
  const sy = useSpring(mouseY, springConfig);

  const rotateX = useTransform(sy, [0, 800], [2, -2]);
  const rotateY = useTransform(sx, [0, 1200], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <div
      className="overflow-hidden bg-[var(--color-background)]"
      onMouseMove={handleMouseMove}
    >
      <HeroSection />

      <Section className="from-background via-background/80 to-background bg-gradient-to-r py-0">
        <div className="relative overflow-hidden">
          <AnimatedMarquee
            text={t('home.marquee')}
            className="py-2"
          />
        </div>
      </Section>

      <SectionPreviews />

      {/* How It Works - Modern Process */}
      <Section className="bg-gradient-to-br from-[var(--color-hover)] to-[var(--color-background)] pt-12 md:pt-16 lg:pt-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge={
              <>
                <Zap className="mr-2 h-3.5 w-3.5" />
                {t('home.howItWorks.badge')}
              </>
            }
            title={t('home.howItWorks.title')}
            description={t('home.howItWorks.description')}
          />

          <div className="mx-auto max-w-6xl">
            {/* Desktop Process - Horizontal Cards */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-primary)]/20" />
                <div className="animate-progress-line absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 scale-x-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)]" />

                <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                  {processSteps.map((step: any, index: number) => (
                    <ProcessStep
                      key={index}
                      step={step}
                      index={index}
                      totalSteps={processSteps.length}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Process - Vertical Timeline */}
            <div className="lg:hidden">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-primary)]/20" />

                <div className="space-y-8">
                  {processSteps.map((step: any, index: number) => (
                    <div key={index} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute top-8 left-6 z-10 -translate-x-1/2">
                        <div className="h-4 w-4 rounded-full border-2 border-[var(--color-background)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] shadow-lg" />
                      </div>

                      <Card className="hover-lift ml-12 border-2 border-[var(--color-primary)]/20 bg-[var(--color-background)] transition-all hover:border-[var(--color-primary)] hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Step Icon */}
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
                              <step.icon className="h-6 w-6 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <span className="font-[Inter] text-2xl font-bold text-[var(--color-foreground)]/30">
                                  {step.number}
                                </span>
                                <h3 className="font-[Inter] text-lg font-semibold text-[var(--color-foreground)]">
                                  {step.title}
                                </h3>
                              </div>
                              <p className="font-[Inter] text-sm leading-relaxed text-[var(--color-foreground)] opacity-80">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Below Process */}
            <div className="mt-16 text-center">
              <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-primary)]/20 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 p-8">
                <div className="mb-4 flex items-center justify-center gap-2 text-[var(--color-primary)]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-bold tracking-widest uppercase">
                    {t('home.howItWorks.cta.badge')}
                  </span>
                </div>
                <h3 className="mb-4 font-[Inter] text-2xl font-semibold text-[var(--color-foreground)]">
                  {t('home.howItWorks.cta.title')}
                </h3>
                <p className="mb-6 font-[Inter] text-[var(--color-foreground)] opacity-80">
                  {t('home.howItWorks.cta.description')}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Magnetic amount={0.2}>
                    <PrimaryButton onClick={() => navigate('/report')} className="h-12 px-8">
                      {t('home.howItWorks.cta.startReport')}
                    </PrimaryButton>
                  </Magnetic>
                  <Link to="/resources">
                    <Magnetic amount={0.2}>
                      <SecondaryButton className="h-12 px-8">
                        {t('home.howItWorks.cta.browseResources')}
                      </SecondaryButton>
                    </Magnetic>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Anonymity & Security Section - Redesigned for Visibility */}
      <Section className="relative overflow-hidden border-y border-[var(--color-border)] bg-gradient-to-b from-[var(--color-hover)] to-[var(--color-background)] py-24 md:py-32">
        {/* Background Technical Grid */}
        <div className="technical-grid-bg pointer-events-none absolute inset-0 opacity-[0.03]" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
              {/* Left Column: Context & Guarantees */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary)]" />
                  <span className="font-[Inter] text-xs font-bold tracking-widest text-[var(--color-primary)] uppercase">
                    {t('home.security.badge')}
                  </span>
                </div>

                <h2 className="mb-8 font-[Inter] text-4xl leading-[1.1] font-bold text-[var(--color-foreground)] md:text-5xl lg:text-6xl">
                  {t('home.security.title')} <br />
                  <span className="text-[var(--color-primary)]">
                    {t('home.security.titleHighlight')}
                  </span>
                </h2>

                <p className="mb-12 max-w-xl text-lg leading-relaxed text-[var(--color-foreground)]/70 md:text-xl">
                  {t('home.security.description')}
                </p>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
                      <Lock className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-[var(--color-foreground)]">
                        {t('home.security.features.zeroTrust.title')}
                      </h4>
                      <p className="text-sm leading-relaxed text-[var(--color-foreground)]/60">
                        {t('home.security.features.zeroTrust.description')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5">
                      <Cpu className="h-6 w-6 text-[var(--color-secondary)]" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-[var(--color-foreground)]">
                        {t('home.security.features.encryption.title')}
                      </h4>
                      <p className="text-sm leading-relaxed text-[var(--color-foreground)]/60">
                        {t('home.security.features.encryption.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Visual Security Proof */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Main Vault UI */}
                <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-hover)] px-8 py-4">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-[var(--color-foreground)]/40 uppercase">
                      Security-Kernel-v4.2
                    </span>
                  </div>

                  <div className="space-y-8 p-8 md:p-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                          <Shield className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                            {t('home.security.vault.title')}
                          </h3>
                          <p className="text-xs font-bold tracking-wider text-emerald-500 uppercase">
                            {t('home.security.vault.status')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-[var(--color-foreground)]">
                          {t('home.security.vault.riskLevel')}
                        </div>
                        <div className="text-[10px] text-[var(--color-foreground)]/40 uppercase">
                          {t('home.security.vault.riskLabel')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          label: t('home.security.vault.identityMasking'),
                          status: t('home.security.vault.enabled'),
                          icon: EyeOff,
                        },
                        {
                          label: t('home.security.vault.metadataScrubbing'),
                          status: t('home.security.vault.active'),
                          icon: Shield,
                        },
                        {
                          label: t('home.security.vault.ipAnonymization'),
                          status: t('home.security.vault.verified'),
                          icon: Lock,
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-hover)]/50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-[var(--color-primary)]" />
                            <span className="text-sm font-medium text-[var(--color-foreground)]/80">
                              {item.label}
                            </span>
                          </div>
                          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 font-mono text-xs font-bold tracking-wider text-emerald-500 uppercase">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                      <div className="mb-3 flex items-center justify-between text-[10px] text-[var(--color-foreground)]/40">
                        <span>{t('home.security.vault.encryptionStatus')}</span>
                        <span className="text-emerald-500">{t('home.security.vault.optimal')}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-hover)]">
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: '0%' }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Decorative Glows */}
                <div className="absolute -top-10 -right-10 -z-10 h-40 w-40 rounded-full bg-[var(--color-primary)]/10 blur-[80px]" />
                <div className="absolute -bottom-10 -left-10 -z-10 h-40 w-40 rounded-full bg-[var(--color-secondary)]/10 blur-[80px]" />
              </motion.div>
            </div>
          </div>
        </div>
      </Section>

      {/* Support Services Callout Section */}
      <Section className="border-y border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-2 text-3xl font-bold text-[var(--color-foreground)]">
                {t('home.supportCallout.title')}
              </h2>
              <p className="text-[var(--color-foreground)]/80">
                {t('home.supportCallout.description')}
              </p>
            </div>
            <Link to="/support">
              <Button
                size="lg"
                className="min-w-[220px] bg-[var(--color-primary)] text-white shadow-[var(--color-primary)]/20 shadow-lg hover:bg-[var(--color-primary)]/90"
              >
                {t('home.supportCallout.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      <RecoveryHub />

      {/* CTA Section */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 font-[Inter] text-4xl font-bold md:text-5xl">
              {t('home.finalCta.title')}
            </h2>
            <p className="mb-10 font-[Inter] text-xl leading-relaxed text-white/90">
              {t('home.finalCta.description')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/report')}
                className="h-14 bg-[var(--color-card)] px-8 font-[Inter] text-base text-[var(--color-primary)] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--color-hover)] hover:shadow-xl"
              >
                {t('home.finalCta.submitReport')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/resources">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 border-[var(--color-card-foreground)] px-8 font-[Inter] text-base text-[var(--color-card-foreground)] transition-all duration-300 hover:scale-105 hover:bg-[var(--color-card)]/20"
                >
                  {t('home.finalCta.exploreResources')}
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 font-[Inter] text-sm text-white/80">
              <Lock className="h-4 w-4" />
              <span>
                {t('home.finalCta.security')}
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
