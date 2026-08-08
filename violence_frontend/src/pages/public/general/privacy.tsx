import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  ArrowRight,
  CheckCircle2,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Magnetic Button Component
const MagneticButton = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

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
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.button>
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

// Privacy Feature Card with 3D Tilt
const PrivacyCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
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

// Animated Data Rights Item
const DataRightItem = ({ title, description, index }: { title: string, description: string, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 10, scale: 1.02 }}
      className="group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-[var(--color-hover)]"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2, type: "spring" }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 flex-shrink-0"
      >
        <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
      </motion.div>
      <div>
        <h4 className="font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors">{title}</h4>
        <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </motion.div>
  );
};

// Animated Text Character by Character
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

export function PrivacyPage() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  const privacyPrinciples = [
    {
      icon: Lock,
      title: t('privacyPage.principles.dataMinimization.title'),
      description: t('privacyPage.principles.dataMinimization.desc'),
    },
    {
      icon: Eye,
      title: t('privacyPage.principles.transparency.title'),
      description: t('privacyPage.principles.transparency.desc'),
    },
    {
      icon: Database,
      title: t('privacyPage.principles.secureStorage.title'),
      description: t('privacyPage.principles.secureStorage.desc'),
    },
  ];

  const dataRights = [
    {
      title: t('privacyPage.rights.access.title'),
      description: t('privacyPage.rights.access.desc'),
    },
    {
      title: t('privacyPage.rights.portability.title'),
      description: t('privacyPage.rights.portability.desc'),
    },
    {
      title: t('privacyPage.rights.deletion.title'),
      description: t('privacyPage.rights.deletion.desc'),
    },
    {
      title: t('privacyPage.rights.withdraw.title'),
      description: t('privacyPage.rights.withdraw.desc'),
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
              {t('privacyPage.badge')}
            </motion.div>
            
            <motion.h1
              className="mb-6 text-5xl leading-tight font-black text-white md:text-7xl"
            >
              <AnimatedText text={t('privacyPage.hero.titleStart')} />
              <motion.span 
                className="text-[var(--color-primary)] inline-block"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {t('privacyPage.hero.titleHighlight')}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 text-xl leading-relaxed text-white/70 max-w-2xl"
            >
              {t('privacyPage.hero.description')}
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
                  const section = document.getElementById('principles-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('privacyPage.hero.learnMore')}
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
              initial={{ d: "M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" }}
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

      {/* Principles Section */}
      <section id="principles-section" className="border-b border-[var(--color-border)] py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('privacyPage.principles.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('privacyPage.principles.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {privacyPrinciples.map((principle, i) => (
              <PrivacyCard key={i} {...principle} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="bg-[var(--color-hover)] py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('privacyPage.dataCollection.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('privacyPage.dataCollection.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-10">
              <h3 className="mb-6 text-2xl font-black">{t('privacyPage.dataCollection.youProvide.title')}</h3>
              <ul className="space-y-4 text-[var(--color-muted-foreground)]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.youProvide.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.youProvide.item2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.youProvide.item3')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-10">
              <h3 className="mb-6 text-2xl font-black">{t('privacyPage.dataCollection.autoCollected.title')}</h3>
              <ul className="space-y-4 text-[var(--color-muted-foreground)]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.autoCollected.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.autoCollected.item2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{t('privacyPage.dataCollection.autoCollected.item3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('privacyPage.rights.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('privacyPage.rights.subtitle')}
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
              <div className="grid gap-4">
                {dataRights.map((right, i) => (
                  <DataRightItem key={i} {...right} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-hover)] py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-6 text-3xl font-black">
            {t('privacyPage.contact.title')}
          </h2>
          <p className="mb-8 text-[var(--color-muted-foreground)]">
            {t('privacyPage.contact.subtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 font-black text-[var(--color-primary)] transition-all hover:gap-4"
          >
            {t('privacyPage.contact.button')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
