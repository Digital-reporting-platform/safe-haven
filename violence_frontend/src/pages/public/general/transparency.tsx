import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Database,
  ArrowRight,
  ChevronRight,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Scroll Progress Bar
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Floating Shield Particle
const FloatingShield = ({ delay, left, top }: { delay: number, left: number, top: number }) => (
  <motion.div
    className="absolute pointer-events-none opacity-10"
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [-20, -60, -20],
      opacity: [0, 0.15, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    style={{
      left: `${left}%`,
      top: `${top}%`,
    }}
  >
    <Shield className="w-12 h-12 text-[var(--color-primary)]" />
  </motion.div>
);

// Security Feature Card with 3D Tilt
const SecurityCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setRotateY((e.clientX - centerX) / 20);
    setRotateX(-(e.clientY - centerY) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      className="group relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 overflow-hidden"
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent" />

      <div className="relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20"
        >
          <Icon className="h-8 w-8 text-[var(--color-primary)]" />
        </motion.div>
        <h3 className="mb-4 text-xl font-bold">{title}</h3>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Animated Stat Card
const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
      >
        <stat.icon className="mb-4 h-8 w-8 text-[var(--color-primary)]" />
      </motion.div>
      <motion.p
        className="mb-1 text-4xl font-black text-[var(--color-foreground)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        {stat.value}
      </motion.p>
      <p className="text-sm font-bold tracking-widest text-[var(--color-muted-foreground)] uppercase">
        {stat.label}
      </p>
    </motion.div>
  );
};

// Animated Audit Log Item
const AuditLogItem = ({ log, index }: { log: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ x: 10, scale: 1.02 }}
      className="group flex flex-col items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-[var(--color-card)]/10 md:flex-row"
    >
      <div className="mb-4 flex items-center gap-6 md:mb-0">
        <motion.span
          className="text-lg font-black text-[var(--color-primary)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.2 }}
        >
          {log.date}
        </motion.span>
        <div>
          <p className="font-bold text-[color:var(--color-foreground)]">{log.type}</p>
          <p className="text-sm text-[color:var(--color-foreground)/0.4]">{log.auditor}</p>
        </div>
      </div>
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
        className="flex items-center gap-3 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-6 py-2 text-[var(--colors-golden-5)]"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-bold tracking-widest uppercase text-[var(--color-golden-5)]">
          {log.result}
        </span>
      </motion.div>
    </motion.div>
  );
};

// Animated Text
const AnimatedText = ({ text, className = '' }: { text: string, className?: string }) => {
  return (
    <motion.span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.03 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Magnetic Button
const MagneticButton = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export function TransparencyPage() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);
  const securityFeatures = [
    {
      icon: Lock,
      title: t('transparencyPage.security.f1.title'),
      description: t('transparencyPage.security.f1.desc'),
    },
    {
      icon: EyeOff,
      title: t('transparencyPage.security.f2.title'),
      description: t('transparencyPage.security.f2.desc'),
    },
    {
      icon: Database,
      title: t('transparencyPage.security.f3.title'),
      description: t('transparencyPage.security.f3.desc'),
    },
  ];

  const auditLogs = [
    {
      date: t('transparencyPage.audit.month.jan'),
      type: t('transparencyPage.audit.log1.type'),
      result: t('transparencyPage.audit.log1.result'),
      auditor: t('transparencyPage.audit.log1.auditor'),
    },
    {
      date: t('transparencyPage.audit.month.dec'),
      type: t('transparencyPage.audit.log2.type'),
      result: t('transparencyPage.audit.log2.result'),
      auditor: t('transparencyPage.audit.log2.auditor'),
    },
    {
      date: t('transparencyPage.audit.month.oct'),
      type: t('transparencyPage.audit.log3.type'),
      result: t('transparencyPage.audit.log3.result'),
      auditor: t('transparencyPage.audit.log3.auditor'),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ScrollProgress />

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {React.useMemo(() => {
          const shieldPositions = Array.from({ length: 6 }, () => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
          }));
          return shieldPositions.map((pos, i) => (
            <FloatingShield key={i} delay={i * 1.5} left={pos.left} top={pos.top} />
          ));
        }, [])}
      </div>

      {/* Hero Section with Parallax */}
      <motion.section 
        className="relative overflow-hidden bg-[var(--color-secondary)] pt-32 pb-20"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, var(--color-primary) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, var(--color-primary) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, var(--color-primary) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.1 }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/5 px-4 py-2 text-sm font-bold text-[var(--color-primary)]"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <ShieldCheck className="h-4 w-4" />
              </motion.div>
              {t('transparencyPage.hero.badge')}
            </motion.div>
            
            <motion.h1
              className="mb-6 text-5xl leading-tight font-black text-white md:text-7xl"
            >
              <AnimatedText text={t('transparencyPage.hero.titleStart')} />
              <motion.span 
                className="text-[var(--color-primary)] inline-block"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {t('transparencyPage.hero.titleHighlight')}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 text-xl leading-relaxed text-white/70 max-w-2xl"
            >
              {t('transparencyPage.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4"
            >
              <MagneticButton 
                className="group flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-8 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20"
                onClick={() => {
                  const section = document.getElementById('security-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Shield className="h-5 w-5" />
                {t('transparencyPage.hero.explore')}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.span>
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <motion.path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="var(--color-background)"
              animate={{
                d: [
                  "M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z",
                  "M0,60 C360,0 1080,120 1440,60 L1440,120 L0,120 Z",
                  "M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="border-b border-[var(--color-border)] py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1 text-sm font-bold text-[var(--color-primary)]"
            >
              <TrendingUp className="inline h-4 w-4 mr-1" />
              {t('transparencyPage.stats.badge')}
            </motion.span>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('transparencyPage.stats.title')}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { label: t('transparencyPage.stats.reports'), value: '14,200+', icon: ShieldAlert },
              { label: t('transparencyPage.stats.requests'), value: '100%', icon: Lock },
              { label: t('transparencyPage.stats.uptime'), value: '99.99%', icon: Globe },
              { label: t('transparencyPage.stats.partners'), value: '850+', icon: CheckCircle2 },
            ].map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Security Features with 3D Cards */}
      <section id="security-section" className="bg-[var(--color-hover)] py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('transparencyPage.security.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('transparencyPage.security.subtitle')}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {securityFeatures.map((feature, i) => (
              <SecurityCard key={i} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Audit History */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ rotate: -10 }}
              whileInView={{ rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring" }}
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10"
            >
              <FileText className="h-8 w-8 text-[var(--color-primary)]" />
            </motion.div>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('transparencyPage.audit.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('transparencyPage.audit.subtitle')}
            </p>
          </motion.div>
          
          <div className="relative overflow-hidden rounded-[40px] bg-[var(--color-secondary)] p-12">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <FileText className="h-64 w-64 text-white" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="space-y-4">
                {auditLogs.map((log, i) => (
                  <AuditLogItem key={i} log={log} index={i} />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
              >
                <p className="mb-6 text-sm font-bold tracking-widest text-white/50 uppercase">
                  {t('transparencyPage.audit.requestText')}
                </p>
                <MagneticButton 
                  onClick={() => window.location.href = '/contact'}
                  className="rounded-2xl bg-[var(--color-card)] px-10 py-4 font-black text-[var(--color-secondary)] transition-all hover:bg-[var(--color-hover)]"
                  role="button"
                  tabIndex={0}
                  aria-label={t('transparencyPage.audit.button')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.location.href = '/contact';
                    }
                  }}
                >
                  {t('transparencyPage.audit.button')}
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-hover)] py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-6 text-3xl font-black">
            {t('transparencyPage.contact.title')}
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 font-black text-[var(--color-primary)] transition-all hover:gap-4"
          >
            {t('transparencyPage.contact.button')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
