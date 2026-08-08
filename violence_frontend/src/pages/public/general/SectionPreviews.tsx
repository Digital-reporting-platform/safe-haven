import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Shield,
  Compass,
  Users,
  Scale,
  Search,
  ArrowRight,
  Lock,
  Clock,
  FileText,
  CheckCircle,
  TrendingUp,
  Award,
  Heart,
  Phone,
  Mail,
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

export function SectionPreviews() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('report');
  const [totalCommunityMembers, setTotalCommunityMembers] = useState<number | null>(null);
  const [supportStats, setSupportStats] = useState({
    total: 0,
    legal: 0,
    medical: 0,
    counseling: 0,
  });
  const [missingStats, setMissingStats] = useState<{
    active: number;
    resolved: number;
    rate: number;
    recentSuccesses: any[];
  }>({
    active: 0,
    resolved: 0,
    rate: 0,
    recentSuccesses: []
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Define sections with translations
  const sections = [
    {
      id: 'report',
      title: t('sectionPreviews.tabs.report.title'),
      shortTitle: t('sectionPreviews.tabs.report.shortTitle'),
      icon: Shield,
      color: 'var(--colors-primary-cta)',
      description: t('sectionPreviews.tabs.report.description'),
      stats: { value: t('sectionPreviews.tabs.report.stats.value'), label: t('sectionPreviews.tabs.report.stats.label') },
    },
    {
      id: 'help',
      title: t('sectionPreviews.tabs.help.title'),
      shortTitle: t('sectionPreviews.tabs.help.shortTitle'),
      icon: Compass,
      color: 'var(--colors-terracotta-6)',
      description: t('sectionPreviews.tabs.help.description'),
      stats: { value: t('sectionPreviews.tabs.help.stats.value'), label: t('sectionPreviews.tabs.help.stats.label') },
    },
    {
      id: 'community',
      title: t('sectionPreviews.tabs.community.title'),
      shortTitle: t('sectionPreviews.tabs.community.shortTitle'),
      icon: Users,
      color: 'var(--colors-olive-7)',
      description: t('sectionPreviews.tabs.community.description'),
      stats: { value: '5,432', label: t('sectionPreviews.tabs.community.stats.label') },
    },
    {
      id: 'support',
      title: t('sectionPreviews.tabs.support.title'),
      shortTitle: t('sectionPreviews.tabs.support.shortTitle'),
      icon: Scale,
      color: 'var(--colors-olive-8)',
      description: t('sectionPreviews.tabs.support.description'),
      stats: { value: '200+', label: t('sectionPreviews.tabs.support.stats.label') },
    },
    {
      id: 'missing',
      title: t('sectionPreviews.tabs.missing.title'),
      shortTitle: t('sectionPreviews.tabs.missing.shortTitle'),
      icon: Search,
      color: 'var(--colors-terracotta-9)',
      description: t('sectionPreviews.tabs.missing.description'),
      stats: { value: '89%', label: t('sectionPreviews.tabs.missing.stats.label') },
    },
  ];

  useEffect(() => {
    const fetchTotalMembers = async () => {
      try {
        const { api } = await import('../../../services/api/client');
        const [peerRes, qaRes, resourcesRes, storiesRes, professionalsRes, missingRes] = await Promise.all([
          api.get('/forum/posts?category=PEER_SUPPORT').catch(() => ({ data: [] })),
          api.get('/forum/posts?category=QUESTIONS_ANSWERS').catch(() => ({ data: [] })),
          api.get('/forum/posts?category=RESOURCES').catch(() => ({ data: [] })),
          api.get('/forum/posts?category=STORYTELLING').catch(() => ({ data: [] })),
          api.get('/professionals?verified=true&limit=1000').catch(() => ({ data: { data: [] } })),
          api.get('/missing-persons').catch(() => ({ data: [] }))
        ]);

        const allPosts = [
          ...(peerRes.data || []),
          ...(qaRes.data || []),
          ...(resourcesRes.data || []),
          ...(storiesRes.data || []),
        ];

        const uniqueAuthors = new Set();
        allPosts.forEach(post => {
          const authorId = post.authorId || post.author?.id;
          if (authorId) uniqueAuthors.add(authorId);
        });

        setTotalCommunityMembers(uniqueAuthors.size);

        // Process Professionals Data
        const providers = Array.isArray(professionalsRes.data?.data) ? professionalsRes.data.data : [];
        setSupportStats({
          total: providers.length,
          legal: providers.filter((p: any) => p.type === 'LEGAL_ADVISOR' || p.role === 'LEGAL_ADVISOR').length,
          medical: providers.filter((p: any) => p.type === 'MEDICAL_PROFESSIONAL' || p.role === 'MEDICAL_PROFESSIONAL').length,
          counseling: providers.filter((p: any) => p.type === 'COUNSELOR' || p.role === 'COUNSELOR').length,
        });

        // Process Missing Persons Data
        const missingPersons = Array.isArray(missingRes.data) ? missingRes.data : [];
        const activeMissing = missingPersons.filter((m: any) => m.status === 'ACTIVE' || m.status === 'MISSING').length;
        const resolvedMissing = missingPersons.filter((m: any) => m.status === 'FOUND' || m.status === 'CLOSED').length;
        const totalMissing = activeMissing + resolvedMissing;
        const resolutionRate = totalMissing > 0 ? Math.round((resolvedMissing / totalMissing) * 100) : 0;

        const recentSuccesses = missingPersons
          .filter((m: any) => m.status === 'FOUND' || m.status === 'CLOSED')
          .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          .slice(0, 3)
          .map((m: any) => ({
            name: `${m.firstName || 'Unknown'} ${m.lastName ? m.lastName[0] + '.' : ''}`,
            age: m.age?.toString() || 'N/A',
            location: m.lastSeenLocation || 'Unknown',
            status: m.status === 'FOUND' ? 'Found Safe' : 'Resolved',
            days: m.createdAt && (m.resolvedAt || m.updatedAt) ? Math.max(1, Math.floor((new Date(m.resolvedAt || m.updatedAt).getTime() - new Date(m.createdAt).getTime()) / (1000 * 3600 * 24))).toString() : '?',
            icon: '✓'
          }));

        setMissingStats({
          active: activeMissing,
          resolved: resolvedMissing,
          rate: resolutionRate,
          recentSuccesses
        });
      } catch (error) {
        console.error('Failed to fetch total community members:', error);
      }
    };

    fetchTotalMembers();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-[var(--color-hover)] to-[var(--color-background)] px-6 py-20 md:px-12"
    >
      {/* Animated background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-primary)]/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header with advanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 inline-block"
          >
            <Badge
              variant="secondary"
              className="border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-4 py-2 text-[var(--color-primary)]"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('sectionPreviews.badge')}
            </Badge>
          </motion.div>

          <div className="mb-8">
            <h2 className="inline-flex items-baseline">
              <span className="mx-2 text-4xl text-[var(--color-foreground)] md:text-6xl">
                {t('sectionPreviews.title')}{' '}
              </span>
              <span className="relative">
                <span className="text-4xl font-bold text-[var(--color-primary)] md:text-6xl">
                  {t('sectionPreviews.titleHighlight')}
                </span>
                <motion.span
                  className="absolute right-0 -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </span>
            </h2>
          </div>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[var(--color-foreground)]/80 md:text-xl">
            {t('sectionPreviews.description')}
          </p>
        </motion.div>

        {/* Advanced Navigation Cards Grid */}
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {sections.map((section, index) => {
            let dynamicSection = section;
            if (section.id === 'community' && totalCommunityMembers !== null) {
              dynamicSection = { ...section, stats: { ...section.stats, value: totalCommunityMembers.toLocaleString() } };
            } else if (section.id === 'support') {
              dynamicSection = { ...section, stats: { ...section.stats, value: `${supportStats.total}+` } };
            } else if (section.id === 'missing') {
              dynamicSection = { ...section, stats: { ...section.stats, value: `${missingStats.rate}%` } };
            }

            return (
              <NavigationCard
                key={dynamicSection.id}
                section={dynamicSection}
                index={index}
                isActive={activeSection === dynamicSection.id}
                onClick={() => setActiveSection(dynamicSection.id)}
              />
            );
          })}
        </div>

        {/* Advanced Content Preview Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {activeSection === 'report' && (
              <ReportPreview onNavigate={() => navigate('/report')} />
            )}
            {activeSection === 'help' && (
              <HelpPreview onNavigate={() => navigate('/resources')} />
            )}
            {activeSection === 'community' && (
              <CommunityPreview
                onNavigate={() => navigate('/survivor/community-forum')}
              />
            )}
            {activeSection === 'support' && (
              <LegalPreview onNavigate={() => navigate('/support-services')} stats={supportStats} />
            )}
            {activeSection === 'missing' && (
              <MissingPreview
                onReport={() => navigate('/missing-persons')}
                onSearch={() => navigate('/missing-persons/view')}
                stats={missingStats}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// Advanced Navigation Card Component with 3D effects
function NavigationCard({ section, index, isActive, onClick }: any) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isActive ? 0 : rotateX,
        rotateY: isActive ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        backgroundColor: isActive
          ? `color-mix(in srgb, ${section.color}, transparent 92%)`
          : undefined,
      }}
      className={`relative rounded-2xl p-5 transition-all duration-500 md:p-6 ${isActive
          ? 'shadow-2xl'
          : 'bg-[var(--color-background)]/70 hover:bg-[var(--color-background)]/90 hover:shadow-xl'
        } `}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, color-mix(in srgb, ${section.color}, transparent 75%), transparent 70%)`,
        }}
        animate={{
          opacity: isActive ? 1 : 0,
        }}
      />

      {/* Active border animation */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: section.color }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${section.color}, transparent 85%), color-mix(in srgb, ${section.color}, transparent 95%))`,
            }}
          />
        </motion.div>
      )}

      <div
        className="relative z-10 flex flex-col items-center gap-3"
        style={{ transform: 'translateZ(20px)' }}
      >
        {/* Icon with particle effect */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="relative"
        >
          <motion.div
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl md:h-14 md:w-14"
            style={{
              backgroundColor: `color-mix(in srgb, ${section.color}, transparent ${isActive ? '75%' : '85%'})`,
            }}
            animate={{
              boxShadow: isActive
                ? `0 0 30px color-mix(in srgb, ${section.color}, transparent 75%)`
                : '0 0 0px rgba(0,0,0,0)',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${section.color}, transparent 80%), transparent)`,
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />

            <section.icon
              className="relative z-10 h-6 w-6 md:h-7 md:w-7"
              style={{ color: section.color }}
            />
          </motion.div>

          {/* Pulse rings on active */}
          {isActive && (
            <>
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: section.color }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{
                    scale: [1, 1.5, 1.8],
                    opacity: [0.5, 0.2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 1,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Title and stats */}
        <div className="text-center">
          <motion.p
            className="mb-1 text-xs text-[var(--color-foreground)] md:text-sm"
            animate={{
              color: isActive ? section.color : 'var(--color-foreground)',
            }}
          >
            {section.shortTitle}
          </motion.p>
          <p className="line-clamp-1 text-[10px] text-[var(--color-foreground)]/70 md:text-xs">
            {section.description}
          </p>

          {/* Stat badge */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 rounded-full px-2 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${section.color}, transparent 85%)`,
                color: section.color,
              }}
            >
              {section.stats.value}
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// Enhanced Preview Components
function ReportPreview({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  
  return (
    <Card className="relative overflow-hidden border-2 border-[var(--colors-primary-cta)]/20 bg-[var(--color-background)]/90 p-8 shadow-2xl backdrop-blur-xl md:p-12">
      {/* Animated background pattern */}
      <div className="absolute top-0 right-0 h-64 w-64 opacity-[0.03]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Shield className="h-full w-full text-[var(--colors-primary-cta)]" />
        </motion.div>
      </div>

      <div className="relative z-10 grid items-start gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <motion.div
            className="mb-6 flex items-center gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-primary-cta)]/15">
                <Shield className="h-8 w-8 text-[var(--colors-primary-cta)]" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--colors-primary-cta)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-4 w-4 text-white" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-2xl text-[var(--color-foreground)] md:text-3xl">
                {t('sectionPreviews.reportPreview.title')}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--colors-primary-cta)]" />
                <p className="text-sm text-[var(--colors-primary-cta)]">
                  {t('sectionPreviews.reportPreview.subtitle')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.p
            className="mb-6 leading-relaxed text-[var(--color-foreground)]/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t('sectionPreviews.reportPreview.description')}
          </motion.p>

          <div className="mb-8 space-y-4">
            {[
              { icon: Lock, text: t('sectionPreviews.reportPreview.features.encryption'), progress: 100 },
              {
                icon: FileText,
                text: t('sectionPreviews.reportPreview.features.anonymous'),
                progress: 100,
              },
              {
                icon: Clock,
                text: t('sectionPreviews.reportPreview.features.available'),
                progress: 100,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--colors-primary-cta)]/10">
                  <item.icon className="h-5 w-5 text-[var(--colors-primary-cta)]" />
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-sm text-[var(--color-foreground)]">
                    {item.text}
                  </p>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              className="group w-full bg-[var(--colors-primary-cta)] px-8 py-6 text-white shadow-xl transition-all hover:bg-[var(--colors-terracotta-6)] hover:shadow-2xl md:w-auto"
              onClick={onNavigate}
            >
              <Shield className="mr-2 h-5 w-5" />
              {t('sectionPreviews.reportPreview.cta')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/8 to-[var(--color-primary)]/15 p-8"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="mb-6 flex items-center gap-2 text-lg text-[var(--color-foreground)]">
            <Award className="h-5 w-5 text-[var(--colors-primary-cta)]" />
            {t('sectionPreviews.reportPreview.whatToReport')}
          </h4>
          <div className="space-y-3">
            {[
              t('sectionPreviews.reportPreview.reportTypes.physical'),
              t('sectionPreviews.reportPreview.reportTypes.sexual'),
              t('sectionPreviews.reportPreview.reportTypes.workplace'),
              t('sectionPreviews.reportPreview.reportTypes.domestic'),
              t('sectionPreviews.reportPreview.reportTypes.child'),
              t('sectionPreviews.reportPreview.reportTypes.online'),
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="group flex items-start gap-3"
              >
                <motion.div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--colors-terracotta-9)]/20 transition-colors group-hover:bg-[var(--colors-terracotta-9)]/30"
                  whileHover={{ scale: 1.1 }}
                >
                  <CheckCircle className="h-4 w-4 text-[var(--colors-terracotta-9)]" />
                </motion.div>
                <span className="text-sm text-[var(--color-foreground)]">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Card>
  );
}

function HelpPreview({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  
  return (
    <Card className="relative overflow-hidden border-2 border-[var(--colors-terracotta-6)]/20 bg-[var(--color-background)]/90 p-8 shadow-2xl backdrop-blur-xl md:p-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <motion.div
            className="mb-6 flex items-center gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-terracotta-6)]/15">
              <Compass className="h-8 w-8 text-[var(--colors-terracotta-6)]" />
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[var(--colors-terracotta-6)]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-2xl text-[var(--color-foreground)] md:text-3xl">
                {t('sectionPreviews.helpPreview.title')}
              </h3>
              <p className="flex items-center gap-1 text-sm text-[var(--colors-terracotta-6)]">
                <Heart className="h-4 w-4" />
                {t('sectionPreviews.helpPreview.subtitle')}
              </p>
            </div>
          </motion.div>

          <p className="mb-8 leading-relaxed text-[var(--color-foreground)]/80">
            {t('sectionPreviews.helpPreview.description')}
          </p>

          <div className="grid gap-4">
            {[
              {
                title: t('sectionPreviews.helpPreview.emergencyNumbers.police.title'),
                value: t('sectionPreviews.helpPreview.emergencyNumbers.police.number'),
                icon: Phone,
                desc: t('sectionPreviews.helpPreview.emergencyNumbers.police.desc'),
                color: 'var(--colors-terracotta-10)',
              },
              {
                title: t('sectionPreviews.helpPreview.emergencyNumbers.medical.title'),
                value: t('sectionPreviews.helpPreview.emergencyNumbers.medical.number'),
                icon: Phone,
                desc: t('sectionPreviews.helpPreview.emergencyNumbers.medical.desc'),
                color: 'var(--colors-terracotta-6)',
              },
              {
                title: t('sectionPreviews.helpPreview.emergencyNumbers.support.title'),
                value: t('sectionPreviews.helpPreview.emergencyNumbers.support.number'),
                icon: Phone,
                desc: t('sectionPreviews.helpPreview.emergencyNumbers.support.desc'),
                color: 'var(--colors-olive-8)',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group cursor-pointer rounded-xl border-2 border-[var(--color-border)] bg-gradient-to-br from-[var(--color-background)] to-[var(--color-hover)] p-5 transition-all hover:border-[var(--colors-terracotta-6)]/40 hover:shadow-lg"
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onNavigate}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon
                      className="h-6 w-6"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-[var(--color-foreground)]/70">
                      {item.title}
                    </p>
                    <p
                      className="mb-0.5 text-2xl"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </p>
                    <p className="text-xs text-[var(--color-foreground)]/60">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--color-foreground)]/40 transition-all group-hover:translate-x-1 group-hover:text-[var(--colors-terracotta-6)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border-2 border-[var(--colors-terracotta-6)]/20 bg-gradient-to-br from-[var(--colors-terracotta-6)]/8 to-[var(--colors-terracotta-6)]/15 p-8"
        >
          <h4 className="mb-6 text-lg text-[var(--color-foreground)]">
            {t('sectionPreviews.helpPreview.services')}
          </h4>
          <div className="space-y-4">
            {[
              t('sectionPreviews.helpPreview.servicesList.crisis'),
              t('sectionPreviews.helpPreview.servicesList.therapy'),
              t('sectionPreviews.helpPreview.servicesList.legal'),
              t('sectionPreviews.helpPreview.servicesList.medical'),
              t('sectionPreviews.helpPreview.servicesList.shelter'),
              t('sectionPreviews.helpPreview.servicesList.financial'),
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 rounded-lg bg-[var(--color-background)]/50 p-3 transition-colors hover:bg-[var(--color-background)]/80"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-[var(--colors-terracotta-6)]" />
                <span className="text-sm text-[var(--color-foreground)]">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Card>
  );
}

function CommunityPreview({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMembers: 0,
    groups: {
      PEER_SUPPORT: 0,
      QUESTIONS_ANSWERS: 0,
      RESOURCES: 0,
      STORYTELLING: 0,
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { api } = await import('../../../services/api/client');

        // Fetch posts for each category to get exact numbers
        const [peerRes, qaRes, resourcesRes, storiesRes] = await Promise.all([
          api.get('/forum/posts?category=PEER_SUPPORT'),
          api.get('/forum/posts?category=QUESTIONS_ANSWERS'),
          api.get('/forum/posts?category=RESOURCES'),
          api.get('/forum/posts?category=STORYTELLING'),
        ]);

        // Calculate total active members by counting unique authors across all categories
        let totalMembers = 0;
        try {
          const allPosts = [
            ...(peerRes.data || []),
            ...(qaRes.data || []),
            ...(resourcesRes.data || []),
            ...(storiesRes.data || []),
          ];

          const uniqueAuthors = new Set();
          allPosts.forEach(post => {
            const authorId = post.authorId || post.author?.id;
            if (authorId) uniqueAuthors.add(authorId);
          });

          totalMembers = uniqueAuthors.size;
        } catch (e) {
          console.warn("Could not calculate unique authors for total members count", e);
        }

        setStats({
          totalMembers: totalMembers,
          groups: {
            PEER_SUPPORT: peerRes.data?.length || 0,
            QUESTIONS_ANSWERS: qaRes.data?.length || 0,
            RESOURCES: resourcesRes.data?.length || 0,
            STORYTELLING: storiesRes.data?.length || 0,
          }
        });
      } catch (error) {
        console.error('Failed to fetch community stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Card className="relative overflow-hidden border-2 border-[var(--colors-olive-7)]/20 bg-[var(--color-background)]/90 p-8 shadow-2xl backdrop-blur-xl md:p-12">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <motion.div
            className="mb-6 flex items-center gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-olive-7)]/15">
              <Users className="h-8 w-8 text-[var(--colors-olive-7)]" />
            </div>
            <div>
              <h3 className="text-2xl text-[var(--color-foreground)] md:text-3xl">
                {t('sectionPreviews.communityPreview.title')}
              </h3>
              <p className="text-sm text-[var(--colors-olive-7)]">
                {stats.totalMembers.toLocaleString()} {t('sectionPreviews.communityPreview.stats.members')}
              </p>
            </div>
          </motion.div>

          <p className="mb-8 text-[var(--color-foreground)]/80">
            {t('sectionPreviews.communityPreview.description')}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: t('sectionPreviews.communityPreview.categoryList.peer'),
                members: stats.groups.PEER_SUPPORT.toLocaleString(),
                icon: Heart,
              },
              { title: t('sectionPreviews.communityPreview.categoryList.qa'), members: stats.groups.QUESTIONS_ANSWERS.toLocaleString(), icon: Users },
              {
                title: t('sectionPreviews.communityPreview.categoryList.resources'),
                members: stats.groups.RESOURCES.toLocaleString(),
                icon: Compass,
              },
              { title: t('sectionPreviews.communityPreview.categoryList.stories'), members: stats.groups.STORYTELLING.toLocaleString(), icon: Award },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                  className="group cursor-pointer rounded-xl border-2 border-[var(--colors-olive-7)]/20 bg-gradient-to-br from-[var(--color-background)] to-[var(--colors-olive-7)]/5 p-5"
                  onClick={onNavigate}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Icon className="h-6 w-6 text-[var(--colors-olive-7)]" />
                    <Badge
                      variant="secondary"
                      className="bg-[var(--colors-olive-7)]/10 text-xs text-[var(--colors-olive-7)]"
                    >
                      {item.members}
                    </Badge>
                  </div>
                  <p className="text-[var(--color-foreground)] transition-colors group-hover:text-[var(--colors-olive-7)]">
                    {item.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border-2 border-[var(--colors-olive-7)]/20 bg-gradient-to-br from-[var(--colors-olive-7)]/8 to-[var(--colors-olive-7)]/15 p-6"
        >
          <h4 className="mb-4 text-sm text-[var(--color-foreground)]">
            {t('sectionPreviews.communityPreview.recentActivity')}
          </h4>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="mb-4 rounded-lg bg-[var(--color-background)]/60 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[var(--colors-olive-7)]/20" />
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-foreground)]">
                    {t('sectionPreviews.communityPreview.anonymousUser')}
                  </p>
                  <p className="text-[10px] text-[var(--color-foreground)]/60">
                    {t('sectionPreviews.communityPreview.timeAgo.hours', { count: 2 })}
                  </p>
                </div>
              </div>
              <p className="line-clamp-2 text-xs text-[var(--color-foreground)]/80">
                {t('sectionPreviews.communityPreview.samplePost')}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
}

function LegalPreview({ onNavigate, stats }: { onNavigate: () => void, stats: { total: number, legal: number, medical: number, counseling: number } }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border-2 border-[var(--colors-olive-8)]/20 bg-[var(--color-background)]/90 p-8 shadow-2xl backdrop-blur-xl md:p-12">
      <motion.div
        className="mb-6 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-olive-8)]/15">
          <Scale className="h-8 w-8 text-[var(--colors-olive-8)]" />
        </div>
        <div>
          <h3 className="text-2xl text-[var(--color-foreground)] md:text-3xl">
            {t('sectionPreviews.supportPreview.title')}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge className="border-green-500/20 bg-green-500/10 px-2 py-0 text-[10px] font-bold tracking-tighter text-green-500 uppercase">
              {t('sectionPreviews.supportPreview.features.verified')}
            </Badge>
            <p className="text-sm text-[var(--colors-olive-8)]">
              {stats.total}+ {t('sectionPreviews.supportPreview.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      <p className="mb-8 text-[var(--color-foreground)]/80">
        {t('sectionPreviews.supportPreview.description')}
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: t('sectionPreviews.supportPreview.categoryList.legal'), count: stats.legal.toLocaleString(), icon: Scale },
          { title: t('sectionPreviews.supportPreview.categoryList.medical'), count: stats.medical.toLocaleString(), icon: Heart },
          { title: t('sectionPreviews.supportPreview.categoryList.counseling'), count: stats.counseling.toLocaleString(), icon: Users },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative cursor-pointer rounded-xl border-2 border-[var(--colors-olive-8)]/20 bg-gradient-to-br from-[var(--colors-olive-8)]/5 to-[var(--colors-olive-8)]/10 p-6 text-center transition-all hover:shadow-lg"
            onClick={onNavigate}
          >
            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <item.icon className="mx-auto mb-3 h-8 w-8 text-[var(--colors-olive-8)]" />
            <p className="mb-1 text-3xl text-[var(--colors-olive-8)]">
              {item.count}+
            </p>
            <p className="text-sm text-[var(--color-foreground)]">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function MissingPreview({
  onReport,
  onSearch,
  stats,
}: {
  onReport: () => void;
  onSearch: () => void;
  stats: { active: number, resolved: number, rate: number, recentSuccesses: any[] };
}) {
  const { t } = useTranslation();
  
  return (
    <Card className="border-2 border-[var(--colors-terracotta-9)]/20 bg-[var(--color-background)]/90 p-8 shadow-2xl backdrop-blur-xl md:p-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <motion.div
            className="mb-6 flex items-center gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-terracotta-9)]/15">
                <Search className="h-8 w-8 text-[var(--colors-terracotta-9)]" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--colors-terracotta-9)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-4 w-4 text-white" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-2xl text-[var(--color-foreground)] md:text-3xl">
                {t('sectionPreviews.missingPreview.title')}
              </h3>
              <p className="text-sm text-[var(--colors-terracotta-9)]">
                {stats.rate}% {t('sectionPreviews.missingPreview.stats.rate')}
              </p>
            </div>
          </motion.div>

          <p className="mb-8 text-[var(--color-foreground)]/80">
            {t('sectionPreviews.missingPreview.description')}
          </p>

          <div className="mb-6 space-y-4">
            {[
              { icon: Search, text: '24/7 Emergency Reporting', available: true },
              { icon: Shield, text: 'Anonymous Reporting Option', available: true },
              { icon: Users, text: 'Family Support Services', available: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--colors-terracotta-9)]/10">
                  <item.icon className="h-5 w-5 text-[var(--colors-terracotta-9)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-foreground)]">
                    {item.text}
                  </p>
                </div>
                {item.available && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              className="h-14 flex-1 bg-[var(--colors-terracotta-9)] text-white hover:bg-[var(--colors-terracotta-9)]/90 shadow-lg"
              onClick={onReport}
            >
              <Search className="mr-2 h-5 w-5" />
              {t('sectionPreviews.missingPreview.actions.report')}
            </Button>
            <Button
              variant="outline"
              className="group h-14 flex-1 border-2 border-[var(--colors-accent-highlight)] bg-gradient-to-r from-[var(--colors-accent-highlight)]/5 to-[var(--colors-golden-1)]/5 px-8 font-[Inter] text-base font-medium text-[var(--colors-accent-highlight)] shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[var(--colors-accent-highlight)]/15 hover:to-[var(--colors-golden-2)]/15 hover:border-[var(--colors-accent-highlight)] hover:shadow-lg hover:text-[var(--colors-accent-highlight)]"
              onClick={onSearch}
            >
              <Search className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              {t('sectionPreviews.missingPreview.actions.search')}
              <ArrowRight className="ml-3 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-[var(--colors-terracotta-9)]/20 bg-gradient-to-br from-[var(--colors-terracotta-9)]/5 to-[var(--colors-terracotta-9)]/10 p-8"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="mb-6 flex items-center gap-2 text-lg text-[var(--color-foreground)]">
            <Award className="h-5 w-5 text-[var(--colors-terracotta-9)]" />
            {t('sectionPreviews.missingPreview.recentSuccesses')}
          </h4>
          <div className="space-y-4">
            {stats.recentSuccesses.length > 0 ? (
              stats.recentSuccesses.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="group cursor-pointer rounded-xl border border-[var(--colors-terracotta-9)]/20 bg-[var(--color-background)]/80 p-4 transition-all hover:border-[var(--colors-terracotta-9)]/40 hover:shadow-lg"
                  onClick={onSearch}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--colors-terracotta-9)]/20">
                        <span className="text-lg font-bold text-[var(--colors-terracotta-9)]">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-foreground)]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--color-foreground)]/70">
                          Age {item.age} • {item.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-green-600">
                        {item.status === 'Found Safe' ? t('sectionPreviews.missingPreview.foundSafe') : t('sectionPreviews.missingPreview.resolved')}
                      </p>
                      <p className="text-[10px] text-[var(--color-foreground)]/60">
                        {t('sectionPreviews.missingPreview.daysToResolve', { count: item.days })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm italic text-[var(--color-foreground)]/60">{t('sectionPreviews.missingPreview.noSuccessStories')}</p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--colors-terracotta-9)]/20 bg-[var(--color-background)]/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl text-[var(--colors-terracotta-9)]">{stats.active.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  {t('sectionPreviews.missingPreview.stats.active')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl text-green-600">{stats.rate}%</p>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  {t('sectionPreviews.missingPreview.stats.rate')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
