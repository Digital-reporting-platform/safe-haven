import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Heart,
  Target,
  Eye,
  Lock,
  Globe2,
  Star,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Handshake,
  Lightbulb,
  BarChart3,
  Activity,
  Sparkles,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Magnetic Button Component
const MagneticButton = ({ children, className = '', onClick }: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void 
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children}
    </motion.button>
  );
};

// Counter Animation Component
const Counter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      countRef.current = Math.floor(progress * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Floating Animation Component
const FloatingElement = ({ children, delay = 0, duration = 3 }: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
}) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

export function AboutPage() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: 10847, label: 'Reports Processed', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { number: 250000, label: 'Lives Impacted', icon: Users, color: 'from-purple-500 to-pink-500' },
    { number: 98, label: 'Success Rate %', icon: Award, color: 'from-green-500 to-emerald-500' },
    { number: 24, label: 'Support Available (hrs)', icon: Clock, color: 'from-orange-500 to-red-500' },
  ];

  const values = [
    {
      icon: Shield,
      title: t('aboutPage.values.safety.title'),
      description: t('aboutPage.values.safety.desc'),
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      delay: 0,
    },
    {
      icon: Lock,
      title: t('aboutPage.values.confidentiality.title'),
      description: t('aboutPage.values.confidentiality.desc'),
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      delay: 0.1,
    },
    {
      icon: Heart,
      title: t('aboutPage.values.trauma.title'),
      description: t('aboutPage.values.trauma.desc'),
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      delay: 0.2,
    },
    {
      icon: Users,
      title: t('aboutPage.values.community.title'),
      description: t('aboutPage.values.community.desc'),
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      delay: 0.3,
    },
    {
      icon: Globe2,
      title: t('aboutPage.values.cultural.title'),
      description: t('aboutPage.values.cultural.desc'),
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      delay: 0.4,
    },
    {
      icon: Award,
      title: t('aboutPage.values.excellence.title'),
      description: t('aboutPage.values.excellence.desc'),
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      delay: 0.5,
    },
  ];

  const teamCategories = [
    {
      icon: Heart,
      title: 'Mental Health Professionals',
      description: 'Licensed psychologists and counselors providing trauma-informed support',
      count: '15+',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Technology Experts',
      description: 'Ethiopian developers ensuring secure and accessible platform design',
      count: '12+',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Handshake,
      title: 'Community Advocates',
      description: 'Local leaders bridging cultural understanding and community trust',
      count: '25+',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Scale,
      title: 'Legal Advisors',
      description: 'Experts in Ethiopian law ensuring proper protocols and user rights',
      count: '8+',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Activity,
      title: 'Medical Professionals',
      description: 'Doctors and nurses providing health guidance and referrals',
      count: '10+',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: 'Research Team',
      description: 'Data analysts and researchers measuring impact and improving services',
      count: '6+',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 py-20 lg:py-32"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            {/* Animated Badge */}
            <motion.div 
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-6 py-3 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="h-5 w-5 text-[var(--color-primary)]" />
              </motion.div>
              <span className="text-sm font-semibold tracking-wider text-[var(--color-primary)] uppercase">
                {t('aboutPage.hero.badge')}
              </span>
            </motion.div>

            {/* Animated Title */}
            <motion.h1 
              className="mb-8 text-4xl font-bold text-[var(--color-foreground)] md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('aboutPage.hero.titleStart')}
              <motion.span 
                className="text-[var(--color-primary)]"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {t('aboutPage.hero.titleHighlight')}
              </motion.span>
              <br />
              {t('aboutPage.hero.titleEnd')}
            </motion.h1>

            {/* Animated Description */}
            <motion.p 
              className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-[var(--color-foreground)]/80 md:text-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('aboutPage.hero.description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <MagneticButton>
                <Link to="/report">
                  <Button className="bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-[var(--color-primary)]/90 transition-all duration-300 hover:scale-105">
                    {t('aboutPage.hero.getHelp')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/resources">
                  <Button variant="outline" className="border-2 border-[var(--color-border)] px-8 py-4 text-lg font-semibold text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-300">
                    {t('aboutPage.hero.learnMore')}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Mission */}
            <div className="rounded-2xl border-2 border-[var(--color-primary)]/20 bg-[var(--color-background)] p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                  <Target className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('aboutPage.mission.title')}
                </h2>
              </div>
              <p className="mb-6 leading-relaxed text-[var(--color-foreground)]/80">
                {t('aboutPage.mission.desc')}
              </p>
              <div className="space-y-3">
                {[
                  t('aboutPage.mission.item1'),
                  t('aboutPage.mission.item2'),
                  t('aboutPage.mission.item3'),
                  t('aboutPage.mission.item4'),
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/80">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision */}
            <div className="rounded-2xl border-2 border-[var(--color-secondary)]/20 bg-[var(--color-background)] p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10">
                  <Eye className="h-6 w-6 text-[var(--color-secondary)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('aboutPage.vision.title')}
                </h2>
              </div>
              <p className="mb-6 leading-relaxed text-[var(--color-foreground)]/80">
                {t('aboutPage.vision.desc')}
              </p>
              <div className="space-y-3">
                {[
                  t('aboutPage.vision.item1'),
                  t('aboutPage.vision.item2'),
                  t('aboutPage.vision.item3'),
                  t('aboutPage.vision.item4'),
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Star className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)]" />
                    <span className="text-[var(--color-foreground)]/80">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gradient-to-br from-[var(--color-hover)] to-[var(--color-background)] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
              {t('aboutPage.values.title')}
            </h2>
            <p className="text-lg text-[var(--color-foreground)]/80">
              {t('aboutPage.values.subtitle')}
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: t('aboutPage.values.safety.title'),
                description: t('aboutPage.values.safety.desc'),
                color: 'var(--color-primary)',
              },
              {
                icon: Lock,
                title: t('aboutPage.values.confidentiality.title'),
                description: t('aboutPage.values.confidentiality.desc'),
                color: 'var(--color-primary)',
              },
              {
                icon: Heart,
                title: t('aboutPage.values.trauma.title'),
                description: t('aboutPage.values.trauma.desc'),
                color: 'var(--color-accent)',
              },
              {
                icon: Users,
                title: t('aboutPage.values.community.title'),
                description: t('aboutPage.values.community.desc'),
                color: 'var(--color-secondary)',
              },
              {
                icon: Globe2,
                title: t('aboutPage.values.cultural.title'),
                description: t('aboutPage.values.cultural.desc'),
                color: 'var(--color-accent)',
              },
              {
                icon: Award,
                title: t('aboutPage.values.excellence.title'),
                description: t('aboutPage.values.excellence.desc'),
                color: 'var(--color-secondary)',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-lg"
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${value.color}15`,
                  }}
                >
                  <value.icon
                    className="h-7 w-7"
                    style={{ color: value.color }}
                  />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-foreground)]">
                  {value.title}
                </h3>
                <p className="leading-relaxed text-[var(--color-foreground)]/80">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              {t('aboutPage.cta.title')}
            </h2>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              {t('aboutPage.cta.desc')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/report">
                <Button className="bg-[var(--color-card)] px-8 py-3 text-[var(--color-primary)] hover:bg-[var(--color-hover)]">
                  {t('aboutPage.cta.getHelp')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  className="border-[var(--color-card-foreground)] px-8 py-3 text-[var(--color-card-foreground)] hover:bg-[var(--color-card)]/10"
                >
                  {t('aboutPage.cta.partner')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
