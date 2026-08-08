import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Briefcase,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useApp } from '../../../components/AppContext';

const slides = [
  {
    id: 'storytelling',
    type: 'large',
    icon: MessageSquare,
    title: 'Survivor Storytelling Space',
    subtitle: 'Community-led healing and connection',
    description:
      "Finding this forum made me realize I wasn't alone. Seeing others speak their truth gave me the strength to finally reclaim my own narrative...",
    tags: ['Moderated', 'Anonymous', 'Survivor-Only'],
    cta: 'Explore Moderated Forums',
    link: '/survivor/community-forum',
    gradient: 'from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5',
    iconBg: 'bg-[var(--color-card)]',
  },
  {
    id: 'empowerment',
    type: 'dark',
    icon: Briefcase,
    title: 'Empowerment Portal',
    subtitle: 'Rebuild your independence with verified opportunities',
    features: [
      { icon: GraduationCap, text: 'Skill Training & Certification' },
      { icon: Briefcase, text: 'Job Placement Assistance' },
      { icon: Sparkles, text: 'Volunteer Leadership Roles' },
    ],
    cta: 'Access Portal',
    link: '/survivor/empowerment',
    bg: 'bg-[var(--color-card)]',
    text: 'text-[var(--color-foreground)]',
  },
  {
    id: 'blog',
    type: 'wide',
    icon: BookOpen,
    title: 'Awareness & Advocacy Blog',
    subtitle: 'Education is the first step toward a zero-tolerance culture',
    description:
      'Learn to identify subtle signs of abuse, understand your legal rights, and stay informed on safety legislation.',
    posts: [
      { title: 'Understanding Legal Consent', category: 'Legal Rights' },
      { title: 'Identifying Emotional Abuse', category: 'Education' },
    ],
    cta: 'Read Latest Articles',
    link: '/blog',
    bg: 'bg-[var(--color-hover)]',
  },
];

export const RecoveryHub = () => {
  const {
    user,
    setCurrentPage,
  } = useApp();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [featuredStory, setFeaturedStory] = useState<any>(null);
  const [loadingStories, setLoadingStories] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [publicJobs, setPublicJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const slides = [
    {
      id: 'storytelling',
      type: 'large',
    },
    {
      id: 'empowerment',
      type: 'dark',
    },
    {
      id: 'blog',
      type: 'wide',
    },
  ];

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { api } = await import('../../../services/api/client');
        const response = await api.get('/forum/posts?category=STORYTELLING');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Sort by creation date if available, or just take the first one
          const sortedStories = response.data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setFeaturedStory(sortedStories[0]);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { api } = await import('../../../services/api/client');
        const response = await api.get('/job-portal/public');
        if (response.data && Array.isArray(response.data)) {
          // Get top 3 most recent jobs
          setPublicJobs(response.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_5550c56614de4db7a7298138db643e72';
        const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=trauma%20OR%20violence%20OR%20bullying&country=et&language=am,en`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.results) {
          setNews(data.results.slice(0, 2));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Auto-play with inactivity detection
  useEffect(() => {
    if (!isAutoPlaying) {
      // Check if enough time has passed since last interaction
      const checkInactivity = setInterval(() => {
        if (Date.now() - lastInteraction > 10000) { // 10 seconds
          setIsAutoPlaying(true);
        }
      }, 1000);
      return () => clearInterval(checkInactivity);
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, lastInteraction]);

  const handleInteraction = () => {
    setLastInteraction(Date.now());
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    handleInteraction();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    handleInteraction();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-card)] py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-6 py-3 font-[Inter] text-sm font-bold text-[var(--color-primary)]">
            <Sparkles className="h-4 w-4" />
            {t('recoveryHub.badge')}
          </div>
          <h2 className="mb-4 font-[Inter] text-4xl leading-tight font-bold text-[var(--color-foreground)] md:text-5xl lg:text-6xl">
            {t('recoveryHub.title')} <br />
            {t('recoveryHub.titleSubtitle')}
          </h2>
          <p className="mx-auto max-w-2xl font-[Inter] text-lg leading-relaxed text-[var(--color-foreground)]/80">
            {t('recoveryHub.description')}
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="relative min-h-[500px]"
            >
              {slides[currentSlide].id === 'storytelling' && (
                <div className="group relative h-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 p-8 md:p-12">
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg transition-transform duration-500 group-hover:scale-110">
                        <MessageSquare className="h-8 w-8 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="font-[Inter] text-3xl font-bold">
                          {t('recoveryHub.storytelling.title')}
                        </h3>
                        <p className="text-base text-[var(--color-foreground)]/60">
                          {t('recoveryHub.storytelling.subtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-12 flex-1 space-y-8">
                      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-8 shadow-sm backdrop-blur-sm">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-inner" />
                          <span className="text-xs font-bold tracking-widest text-[var(--color-foreground)]/40 uppercase">
                            {t('recoveryHub.storytelling.featured')}
                          </span>
                        </div>
                        <p className="text-xl leading-relaxed text-[var(--color-foreground)]/80 italic">
                          "{featuredStory ? (featuredStory.content?.length > 150 ? featuredStory.content.substring(0, 150) + '...' : featuredStory.content) : t('recoveryHub.storytelling.description')}"
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[
                          t('recoveryHub.storytelling.tags.moderated'),
                          t('recoveryHub.storytelling.tags.anonymous'),
                          t('recoveryHub.storytelling.tags.survivorOnly')
                        ].map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[var(--color-primary)] uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Link to={user ? "/survivor/community-forum" : "/auth/login"}>
                        <Button
                          variant="outline"
                          className="group/btn h-14 rounded-full border-[var(--color-primary)]/30 px-10 text-lg shadow-sm transition-all hover:bg-[var(--color-primary)] hover:text-[var(--color-foreground)]"
                        >
                          {user ? t('recoveryHub.storytelling.cta') : t('recoveryHub.storytelling.ctaGuest')}{' '}
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[var(--color-primary)]/10 blur-[120px] transition-transform duration-700 group-hover:scale-110" />
                </div>
              )}

              {slides[currentSlide].id === 'empowerment' && (
                <div className="group relative h-full overflow-hidden rounded-[40px] bg-[var(--color-card)] p-8 text-[var(--color-foreground)] shadow-[0_20px_50px_rgba(58,25,14,0.4)] md:p-14">
                  <div className="relative z-10 flex h-full flex-col items-center gap-12 lg:flex-row">
                    <div className="space-y-8 lg:w-1/2">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-[var(--color-card)]/10 shadow-xl backdrop-blur-lg transition-transform duration-500 group-hover:rotate-12">
                        <Briefcase className="h-10 w-10 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="font-[Inter] text-4xl font-bold">
                        {t('recoveryHub.empowerment.title')}
                      </h3>
                      <p className="text-xl leading-relaxed font-normal text-[var(--color-foreground)]/70">
                        {t('recoveryHub.empowerment.description')}
                      </p>
                      <Link to="/public/empowerment">
                        <Button className="h-16 rounded-2xl border-none bg-[var(--color-primary)] px-10 text-lg font-bold text-[var(--color-foreground)] shadow-[var(--color-primary)]/30 shadow-2xl transition-all hover:scale-105 hover:bg-[var(--color-primary)]/90">
                          {t('recoveryHub.empowerment.cta')}{' '}
                          <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid w-full gap-6 lg:w-1/2">
                      {loadingJobs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
                        </div>
                      ) : publicJobs.length > 0 ? (
                        publicJobs.slice(0, 3).map((job, i) => (
                          <div
                            key={job.id}
                            className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[var(--color-card)]/5 p-5 backdrop-blur-md transition-all group-hover:border-white/20 hover:bg-[var(--color-card)]/10"
                          >
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[var(--color-card)]/10 shadow-lg">
                              <Briefcase className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[var(--color-foreground)] line-clamp-1 mb-1">
                                {job.title}
                              </h4>
                              <p className="text-sm text-[var(--color-foreground)]/60 mb-2">
                                {job.company}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs rounded-full bg-[var(--color-primary)]/10 px-2 py-1 text-[var(--color-primary)]">
                                  {job.category}
                                </span>
                                {job.tags?.includes('REMOTE') && (
                                  <span className="text-xs rounded-full bg-blue-500/10 px-2 py-1 text-blue-600 dark:text-blue-400">
                                    Remote
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        [
                          { icon: GraduationCap, text: t('recoveryHub.empowerment.features.training') },
                          { icon: Briefcase, text: t('recoveryHub.empowerment.features.placement') },
                          { icon: Sparkles, text: t('recoveryHub.empowerment.features.leadership') },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[var(--color-card)]/5 p-6 backdrop-blur-md transition-all group-hover:border-white/20 hover:bg-[var(--color-card)]/10"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[var(--color-card)]/10 shadow-lg">
                              <item.icon className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <span className="text-lg font-medium">
                              {item.text}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {/* Decorative depth effects */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/20 blur-[100px]" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#C15B3E]/10 blur-[80px]" />
                </div>
              )}

              {slides[currentSlide].id === 'blog' && (
                <div className="relative h-full overflow-hidden rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-xl md:p-14">
                  <div className="relative z-10 flex flex-col items-stretch gap-12 md:flex-row">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                          <BookOpen className="h-8 w-8 text-[var(--color-primary)]" />
                        </div>
                        <h3 className="font-[Inter] text-3xl font-bold text-[var(--color-foreground)]">
                          {t('recoveryHub.blog.title')}
                        </h3>
                      </div>
                      <p className="text-xl leading-relaxed text-[var(--color-foreground)]">
                        {t('recoveryHub.blog.description')}
                      </p>
                      <Link to="/blog">
                        <Button
                          variant="outline"
                          className="group/blog h-14 rounded-full border-[var(--color-primary)]/30 px-8 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-foreground)]"
                        >
                          {t('recoveryHub.blog.cta')}{' '}
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/blog:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-4 md:w-1/3">
                      <p className="mb-4 text-xs font-bold tracking-widest text-[var(--color-foreground)]/60 uppercase">
                        {t('recoveryHub.blog.latest')}
                      </p>
                      {loadingNews ? (
                        <div className="space-y-4">
                          <div className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/50" />
                          <div className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/50" />
                        </div>
                      ) : news.length > 0 ? (
                        news.map((post, i) => (
                          <div
                            key={i}
                            className="group/post cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition-all hover:shadow-lg hover:border-[var(--color-primary)]/30"
                            onClick={() => post.link && window.open(post.link, '_blank')}
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <span className="text-[10px] font-bold tracking-widest text-[var(--color-primary)] uppercase">
                                {post.category?.[0]?.replace(/_/g, ' ') || 'NEWS'}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/post:opacity-100" />
                            </div>
                            <h4 className="font-[Inter] text-base font-bold transition-colors group-hover:text-[var(--color-primary)] line-clamp-2">
                              {post.title}
                            </h4>
                          </div>
                        ))
                      ) : (
                        slides[2].posts?.map((post, i) => (
                          <div
                            key={i}
                            className="group/post cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition-all hover:shadow-lg"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <span className="text-[10px] font-bold tracking-widest text-[var(--color-primary)] uppercase">
                                {post.category}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/post:opacity-100" />
                            </div>
                            <h4 className="font-[Inter] text-base font-bold transition-colors group-hover:text-[var(--color-primary)]">
                              {post.title}
                            </h4>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 md:-left-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/80 shadow-xl backdrop-blur-md transition-all hover:bg-[var(--color-primary)] hover:text-[var(--color-foreground)]"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 md:-right-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/80 shadow-xl backdrop-blur-md transition-all hover:bg-[var(--color-primary)] hover:text-[var(--color-foreground)]"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="mt-12 flex justify-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  handleInteraction();
                  setCurrentSlide(i);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentSlide === i
                    ? 'w-12 bg-[var(--color-primary)]'
                    : 'w-3 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/40'
                }`}
                title={`Go to slide ${i + 1}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
