import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Scale,
  Gavel,
  Scroll,
  Stamp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Scroll Progress Bar
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--colors-terracotta-5)] origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Animated Document Card with fold effect
const DocumentCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="relative rounded-2xl border-2 border-[var(--color-primary)]/20 bg-[var(--color-card)] p-8 transition-all duration-500 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-[var(--color-primary)]/10">
        {/* Document corner fold effect */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <motion.div 
            className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[var(--colors-terracotta-5)]/20 to-transparent"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            style={{ 
              clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
            }}
          />
        </div>

        <motion.div
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0 
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--colors-terracotta-5)]/20"
        >
          <Icon className="h-8 w-8 text-[var(--colors-terracotta-5)]" />
        </motion.div>
        
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">{description}</p>

        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--colors-terracotta-5)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

// Key Term with accordion effect
const KeyTermItem = ({ title, description, index }: { title: string, description: string, index: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-hover)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10"
          >
            <ChevronRight className="h-5 w-5 text-[var(--colors-terracotta-5)]" />
          </motion.div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <Scale className="h-5 w-5 text-[var(--color-muted-foreground)]" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--color-border)]"
          >
            <p className="p-6 text-[var(--color-muted-foreground)]">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
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

// Floating document icon
const FloatingDocument = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute pointer-events-none opacity-5"
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [-20, -60, -20],
      opacity: [0, 0.1, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  >
    <Scroll className="w-16 h-16 text-amber-600" />
  </motion.div>
);

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

export function TermsPage() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);
  const termsSections = [
    {
      icon: FileText,
      title: t('termsPage.overview.service.title'),
      description: t('termsPage.overview.service.desc'),
    },
    {
      icon: Shield,
      title: t('termsPage.overview.privacy.title'),
      description: t('termsPage.overview.privacy.desc'),
    },
    {
      icon: Users,
      title: t('termsPage.overview.responsibilities.title'),
      description: t('termsPage.overview.responsibilities.desc'),
    },
  ];

  const keyTerms = [
    {
      title: t('termsPage.keyTerms.t1.title'),
      description: t('termsPage.keyTerms.t1.desc'),
    },
    {
      title: t('termsPage.keyTerms.t2.title'),
      description: t('termsPage.keyTerms.t2.desc'),
    },
    {
      title: t('termsPage.keyTerms.t3.title'),
      description: t('termsPage.keyTerms.t3.desc'),
    },
    {
      title: t('termsPage.keyTerms.t4.title'),
      description: t('termsPage.keyTerms.t4.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ScrollProgress />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <FloatingDocument key={i} delay={i * 2} />
        ))}
      </div>

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
              'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
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
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/5 px-4 py-2 text-sm font-bold text-amber-500"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <FileText className="h-4 w-4" />
              </motion.div>
              {t('termsPage.hero.badge')}
            </motion.div>
            
            <motion.h1
              className="mb-6 text-5xl leading-tight font-black text-white md:text-7xl"
            >
              <AnimatedText text={t('termsPage.hero.titleStart')} />
              <motion.span 
                className="text-amber-500 inline-block"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {t('termsPage.hero.titleHighlight')}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 text-xl leading-relaxed text-white/70 max-w-2xl"
            >
              {t('termsPage.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4"
            >
              <MagneticButton 
                className="group flex items-center gap-2 rounded-2xl bg-[var(--colors-terracotta-5)] px-8 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-[var(--colors-terracotta-5)]/20"
                onClick={() => {
                  const section = document.getElementById('terms-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Gavel className="h-5 w-5" />
                {t('termsPage.hero.review')}
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

      {/* Terms Overview with Document Cards */}
      <section id="terms-section" className="border-b border-[var(--color-border)] py-20">
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
              className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1 text-sm font-bold text-[var(--colors-terracotta-5)]"
            >
              {t('termsPage.overview.badge')}
            </motion.span>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('termsPage.overview.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('termsPage.overview.desc')}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {termsSections.map((section, i) => (
              <DocumentCard key={i} {...section} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Key Terms with Accordion */}
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
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10"
            >
              <Stamp className="h-8 w-8 text-[var(--colors-terracotta-5)]" />
            </motion.div>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('termsPage.keyTerms.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('termsPage.keyTerms.desc')}
            </p>
          </motion.div>
          <div className="mx-auto max-w-3xl space-y-4">
            {keyTerms.map((term, i) => (
              <KeyTermItem key={i} {...term} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Important Notices */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t('termsPage.notices.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--color-muted-foreground)]">
              {t('termsPage.notices.desc')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-10">
              <div className="mb-6 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-black">{t('termsPage.notices.emergency.title')}</h3>
              </div>
              <p className="text-[var(--color-muted-foreground)] mb-4">
                {t('termsPage.notices.emergency.desc')}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <li>{t('termsPage.notices.emergency.l1')}</li>
                <li>{t('termsPage.notices.emergency.l2')}</li>
                <li>{t('termsPage.notices.emergency.l3')}</li>
              </ul>
            </div>
            <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-10">
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <h3 className="text-xl font-black">{t('termsPage.notices.rights.title')}</h3>
              </div>
              <p className="text-[var(--color-muted-foreground)] mb-4">
                {t('termsPage.notices.rights.desc')}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <li>{t('termsPage.notices.rights.l1')}</li>
                <li>{t('termsPage.notices.rights.l2')}</li>
                <li>{t('termsPage.notices.rights.l3')}</li>
                <li>{t('termsPage.notices.rights.l4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-hover)] py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-6 text-3xl font-black">
            {t('termsPage.contact.title')}
          </h2>
          <p className="mb-8 text-[var(--color-muted-foreground)]">
            {t('termsPage.contact.desc')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 font-black text-[var(--color-primary)] transition-all hover:gap-4"
          >
            {t('termsPage.contact.button')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
