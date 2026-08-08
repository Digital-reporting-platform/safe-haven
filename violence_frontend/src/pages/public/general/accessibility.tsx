import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Eye,
  Keyboard,
  Volume2,
  Monitor,
  Smartphone,
  ArrowRight,
  ChevronRight,
  Focus,
  Type,
  Contrast,
  MousePointer2,
  Ear,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Scroll Progress with high contrast
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] via-[var(--colors-golden-5)] to-[var(--colors-terracotta-5)] origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Keyboard-navigable card with focus indicator
const AccessibleCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Focus ring for keyboard navigation */}
      <motion.div
        className="absolute -inset-1 rounded-3xl border-4 border-[var(--color-primary)]/0"
        animate={{
          borderColor: isFocused ? 'rgba(107, 112, 92, 0.5)' : 'rgba(107, 112, 92, 0)',
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      <div className="relative rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-card)] p-8 transition-all duration-500 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 focus:outline-none">
        {/* Screen reader only text */}
        <span className="sr-only">Accessibility feature: {title}. {description}</span>
        
        <motion.div
          animate={{ 
            scale: isHovered || isFocused ? 1.1 : 1,
            rotate: isHovered || isFocused ? 5 : 0 
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--colors-golden-5)]/20"
        >
          <Icon className="h-8 w-8 text-[var(--color-primary)]" />
        </motion.div>
        
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">{description}</p>

        {/* Animated focus indicator line */}
        <motion.div
          className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--colors-terracotta-5)] rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

// Interactive keyboard demo
const KeyboardDemo = () => {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap = {
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        Tab: 'Tab',
        Enter: 'Enter',
        ' ': 'Space',
        Escape: 'Esc',
      };
      const displayLabel = keyMap[e.key] || e.key;
      setActiveKey(displayLabel);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setActiveKey(null), 300);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const keys = [
    { key: 'Tab', label: 'Tab' },
    { key: 'Enter', label: 'Enter' },
    { key: ' ', label: 'Space' },
    { key: 'ArrowUp', label: '↑' },
    { key: 'ArrowDown', label: '↓' },
    { key: 'ArrowLeft', label: '←' },
    { key: 'ArrowRight', label: '→' },
    { key: 'Escape', label: 'Esc' },
  ];

  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <h4 className="mb-4 font-bold flex items-center gap-2">
        <Keyboard className="h-5 w-5 text-[var(--color-primary)]" />
        {t('accessibilityPage.keyboardDemo.title')}
      </h4>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
        {t('accessibilityPage.keyboardDemo.desc')}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {keys.map(({ key, label }) => (
          <motion.div
            key={label}
            className="flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-3 text-sm font-mono"
            animate={{
              scale: activeKey === label ? 0.9 : 1,
              backgroundColor: activeKey === label ? 'rgba(107, 112, 92, 0.3)' : undefined,
              borderColor: activeKey === label ? 'rgba(107, 112, 92, 0.5)' : undefined,
            }}
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Contrast toggle demo
const ContrastDemo = () => {
  const { t } = useTranslation();
  const [highContrast, setHighContrast] = React.useState(false);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <h4 className="mb-4 font-bold flex items-center gap-2">
        <Contrast className="h-5 w-5 text-[var(--color-primary)]" />
        {t('accessibilityPage.contrastDemo.title')}
      </h4>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
        {t('accessibilityPage.contrastDemo.desc')}
      </p>
      <button
        onClick={() => setHighContrast(!highContrast)}
        className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-hover)] px-4 py-2 text-sm font-bold transition-all hover:bg-[var(--color-primary)]/10"
        aria-pressed={highContrast ? "true" : "false"}
      >
        <motion.div
          className="h-5 w-10 rounded-full bg-[var(--color-border)] p-1"
          animate={{ backgroundColor: highContrast ? 'rgba(107, 112, 92, 0.5)' : undefined }}
        >
          <motion.div
            className="h-3 w-3 rounded-full bg-white"
            animate={{ x: highContrast ? 20 : 0 }}
          />
        </motion.div>
        {highContrast ? t('accessibilityPage.contrastDemo.on') : t('accessibilityPage.contrastDemo.off')}
      </button>
      <motion.div
        className="rounded-lg p-4 text-center font-bold"
        animate={{
          backgroundColor: highContrast ? '#000' : 'var(--color-hover)',
          color: highContrast ? '#fff' : 'var(--color-foreground)',
        }}
      >
        {highContrast ? t('accessibilityPage.contrastDemo.highContrast') : t('accessibilityPage.contrastDemo.standard')}
      </motion.div>
    </div>
  );
};

// Text size demo
const TextSizeDemo = () => {
  const { t } = useTranslation();
  const [textSize, setTextSize] = React.useState(100);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <h4 className="mb-4 font-bold flex items-center gap-2">
        <Type className="h-5 w-5 text-[var(--color-primary)]" />
        {t('accessibilityPage.textSizeDemo.title')}
      </h4>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
        {t('accessibilityPage.textSizeDemo.desc')}
      </p>
      <input
        type="range"
        min="100"
        max="200"
        value={textSize}
        onChange={(e) => setTextSize(Number(e.target.value))}
        className="mb-4 w-full"
        aria-label="Adjust text size percentage"
      />
      <motion.p
        className="text-center"
        animate={{ fontSize: `${textSize}%` }}
      >
        {t('accessibilityPage.textSizeDemo.preview')} {textSize}%
      </motion.p>
    </div>
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

export function AccessibilityPage() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  const accessibilityFeatures = [
    {
      icon: Eye,
      title: t('accessibilityPage.features.visual.title'),
      description: t('accessibilityPage.features.visual.desc'),
    },
    {
      icon: Keyboard,
      title: t('accessibilityPage.features.keyboard.title'),
      description: t('accessibilityPage.features.keyboard.desc'),
    },
    {
      icon: Volume2,
      title: t('accessibilityPage.features.audio.title'),
      description: t('accessibilityPage.features.audio.desc'),
    },
  ];

  const supportedStandards = [
    {
      title: t('accessibilityPage.standards.wcag.title'),
      description: t('accessibilityPage.standards.wcag.desc'),
      icon: Monitor,
    },
    {
      title: t('accessibilityPage.standards.mobile.title'),
      description: t('accessibilityPage.standards.mobile.desc'),
      icon: Smartphone,
    },
    {
      title: t('accessibilityPage.standards.cross.title'),
      description: t('accessibilityPage.standards.cross.desc'),
      icon: Accessibility,
    },
  ];

  // Ideally, this would come from config or CMS
  const lastUpdatedDate = 'March 2026';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ScrollProgress />
      
      {/* Skip to content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        {t('accessibilityPage.footer.skipLink')}
      </a>

      {/* Hero Section with Parallax */}
      <motion.section 
        className="relative overflow-hidden bg-[var(--color-secondary)] pt-32 pb-20"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/5 px-4 py-2 text-sm font-bold text-emerald-500"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Accessibility className="h-4 w-4" />
              </motion.div>
              {t('accessibilityPage.badge')}
            </motion.div>
            
            <motion.h1
              className="mb-6 text-5xl leading-tight font-black text-white md:text-7xl"
            >
              <AnimatedText text={t('accessibilityPage.hero.titleStart')} />
              <motion.span 
                className="text-emerald-500 inline-block"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {t('accessibilityPage.hero.titleHighlight')}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 text-xl leading-relaxed text-white/70 max-w-2xl"
            >
              {t('accessibilityPage.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4"
            >
              <MagneticButton 
                className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                onClick={() => {
                  const section = document.getElementById('features-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Focus className="h-5 w-5" />
                {t('accessibilityPage.hero.explore')}
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

      {/* Main Content */}
      <main id="main-content">
        {/* Accessibility Features with AccessibleCards */}
        <section id="features-section" className="border-b border-[var(--color-border)] py-20">
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
                <Ear className="inline h-4 w-4 mr-1" />
                {t('accessibilityPage.features.badge')}
              </motion.span>
              <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
                {t('accessibilityPage.features.title')}
              </h2>
              <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
                {t('accessibilityPage.features.subtitle')}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {accessibilityFeatures.map((feature, i) => (
                <AccessibleCard key={i} {...feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Accessibility Demos */}
        <section className="bg-[var(--color-hover)] py-24">
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
                className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
              >
                <MousePointer2 className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
                {t('accessibilityPage.demos.title')}
              </h2>
              <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
                {t('accessibilityPage.demos.subtitle')}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <KeyboardDemo />
              <ContrastDemo />
              <TextSizeDemo />
            </div>
          </div>
        </section>

      {/* Standards & Compliance */}
      <section className="bg-[var(--color-hover)] py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('accessibilityPage.standards.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('accessibilityPage.standards.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {supportedStandards.map((standard, i) => (
              <div
                key={i}
                className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                    <standard.icon className="h-8 w-8 text-[var(--color-primary)]" />
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-black">{standard.title}</h3>
                <p className="text-[var(--color-muted-foreground)]">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Help */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
              <h2 className="mb-6 text-3xl font-black">
                {t('accessibilityPage.support.title')}
              </h2>
              <p className="mb-8 text-[var(--color-muted-foreground)]">
                {t('accessibilityPage.support.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/support"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-8 py-4 font-black text-white transition-all hover:bg-[var(--color-primary)]/90"
                >
                  {t('accessibilityPage.support.contact')} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-8 py-4 font-black text-[var(--color-foreground)] transition-all hover:bg-[var(--color-hover)]"
                >
                  {t('accessibilityPage.support.report')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* Footer Note */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-hover)] py-20 text-center">
        <div className="container mx-auto px-6">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {t('accessibilityPage.footer.note')}{lastUpdatedDate}.
          </p>
        </div>
      </section>
    </div>
  );
}
