import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  GraduationCap,
  ClipboardList,
  Search,
  Building2,
  MapPin,
  ChevronRight,
  Target,
  Users,
  Award,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Laptop,
  Loader2,
  Compass,
  ShieldCheck,
  Zap,
  Brain,
} from 'lucide-react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface JobOpportunity {
  id: string;
  externalId: string;
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  description: string;
  category: string;
  tags: string[];
  minRecoveryLevel: number;
  isVerified: boolean;
  createdAt: string;
  matchScore?: number;
  isSaved?: boolean;
}

interface JobApplication {
  id: string;
  jobOpportunity: JobOpportunity;
  status: string;
  appliedAt: string;
  notes?: string;
}

interface SurvivorPreferences {
  remoteWork?: boolean;
  locations?: string[];
}

interface SurvivorProfile {
  skills?: string[];
  experienceLevel?: 'entry' | 'intermediate' | 'senior' | 'executive';
  recoveryStage?: 'early' | 'middle' | 'advanced';
  recoveryLevel?: number;
  preferences?: SurvivorPreferences;
}

interface AuthUser {
  profile?: SurvivorProfile;
}

let jobsRequestInFlight: Promise<JobOpportunity[]> | null = null;

export function EmpowermentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setActiveTab] = useState('opportunities');
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Fetch jobs from backend (recommended first, public fallback)
  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      try {
        console.log('Fetching jobs from /job-portal/recommended...');
        setLoading(true);
        const jobsPromise =
          jobsRequestInFlight ??
          (async () => {
            let response;
            try {
              // Survivor experience: prefer personalized recommendations from backend.
              response = await api.get('/job-portal/recommended');
            } catch (recommendedError: any) {
              // If recommendation endpoint is unavailable, gracefully fall back.
              if ([401, 403, 404, 500, 502, 503, 504].includes(recommendedError?.response?.status)) {
                console.warn(
                  `Recommended endpoint failed (${recommendedError?.response?.status}), falling back to public jobs`
                );
                response = await api.get('/job-portal/public');
              } else {
                throw recommendedError;
              }
            }
            return response.data || [];
          })();

        jobsRequestInFlight = jobsPromise;
        const jobsData = await jobsPromise;
        console.log('Jobs response:', jobsData);
        if (isMounted) {
          setJobs(jobsData);
        }
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        console.error('Error details:', error.response?.data || error.message);
        if (isMounted) {
          toast.error(t('survivor.empowerment.failedToLoadJobs'));
          setJobs([]); // Set empty array on error
        }
      } finally {
        jobsRequestInFlight = null;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchSavedJobs = async () => {
      try {
        const response = await api.get('/job-portal/saved');
        if (isMounted) {
          const savedIds = new Set<string>(response.data.map((item: any) => item.jobOpportunity.id));
          setSavedJobs(savedIds);
        }
      } catch (error: any) {
        console.error('Error fetching saved jobs:', error);
        // Silently fail for saved jobs if user is not authenticated
        if (error.response?.status !== 401 && isMounted) {
          console.error('Saved jobs error:', error.response?.data || error.message);
        }
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await api.get('/job-portal/applications');
        if (isMounted) {
          setApplications(response.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        // Silently fail for applications if user is not authenticated
        if (error.response?.status !== 401 && isMounted) {
          console.error('Applications error:', error.response?.data || error.message);
        }
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        if (isMounted) {
          setUser(response.data || null);
        }
      } catch (error: any) {
        // Public page: keep working without personalization if unauthenticated.
        if (error.response?.status !== 401 && isMounted) {
          console.error('User profile error:', error.response?.data || error.message);
        }
        if (isMounted) {
          setUser(null);
        }
      }
    };

    // Fetch all data
    const fetchAllData = async () => {
      await fetchJobs();
      await fetchUserProfile();
      await fetchSavedJobs();
      await fetchApplications();
    };

    fetchAllData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle save job
  const handleToggleSave = async (jobId: string) => {
    try {
      if (savedJobs.has(jobId)) {
        await api.delete(`/job-portal/save/${jobId}`);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success(t('survivor.empowerment.jobRemovedFromSaved'));
      } else {
        await api.post(`/job-portal/save/${jobId}`);
        setSavedJobs(prev => new Set(prev).add(jobId));
        toast.success(t('survivor.empowerment.jobSavedSuccessfully'));
      }
    } catch (error: any) {
      // If authentication is required, show helpful message
      if (error.response?.status === 401) {
        toast.error(t('survivor.empowerment.pleaseSignInToSaveJobs'));
      } else {
        toast.error(error.message || t('survivor.empowerment.failedToSaveJob'));
      }
    }
  };

  // Apply to job
  const handleApply = async (jobId: string) => {
    try {
      await api.post(`/job-portal/apply/${jobId}`, {});
      toast.success(t('survivor.empowerment.applicationSubmittedSuccessfully'));
      // Refresh applications
      const response = await api.get('/job-portal/applications');
      setApplications(response.data);
    } catch (error: any) {
      // If authentication is required, show helpful message
      if (error.response?.status === 401) {
        toast.error(t('survivor.empowerment.pleaseSignInToApplyForJobs'));
      } else {
        toast.error(error.message || t('survivor.empowerment.failedToApply'));
      }
    }
  };

  // Get icon and color based on category
  const getCategoryStyle = (category: string, tags: string[]) => {
    if (tags.includes('REMOTE')) {
      return { icon: Laptop, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' };
    }
    if (category.toLowerCase().includes('social')) {
      return { icon: Users, color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary)]/10' };
    }
    if (category.toLowerCase().includes('tech')) {
      return { icon: Laptop, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent)]/10' };
    }
    return { icon: Briefcase, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' };
  };

  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1d ago';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  // ML-powered job recommendations
  const getRecommendationScore = (job: any) => {
    let score = 0;
    const userProfile = user?.profile || {};
    
    // Skill matching (40% weight)
    const userSkills = userProfile.skills || [];
    const jobSkills = job.requiredSkills || [];
    const skillMatch = jobSkills.filter((skill: string) => userSkills.includes(skill)).length;
    score += (skillMatch / Math.max(jobSkills.length, 1)) * 40;
    
    // Experience level matching (25% weight)
    if (userProfile.experienceLevel) {
      const expLevels = { 'entry': 0, 'intermediate': 1, 'senior': 2, 'executive': 3 };
      const userLevel = expLevels[userProfile.experienceLevel] || 1;
      const jobLevel = expLevels[job.experienceLevel] || 1;
      const levelMatch = 1 - Math.abs(userLevel - jobLevel) * 0.3;
      score += levelMatch * 25;
    }
    
    // Location preference (20% weight)
    if (job.tags?.includes('REMOTE') && userProfile.preferences?.remoteWork) {
      score += 20;
    }
    if (job.location && userProfile.preferences?.locations?.includes(job.location)) {
      score += 15;
    }
    
    // Recovery stage consideration (15% weight)
    if (userProfile.recoveryStage) {
      const recoveryScores: Record<string, Record<string, number>> = {
        'early': { 'counseling': 25, 'training': 20, 'volunteer': 15 },
        'middle': { 'counseling': 20, 'training': 25, 'volunteer': 20 },
        'advanced': { 'counseling': 15, 'training': 30, 'volunteer': 25 }
      };
      score += recoveryScores[userProfile.recoveryStage]?.[job.category.toLowerCase()] || 10;
    }
    
    return Math.min(score, 100);
  };

  // Get recommendation explanation
  const getRecommendationReason = (job: any, score: number) => {
    const reasons = [];
    const userProfile = user?.profile || {};
    
    if (score >= 80) reasons.push('Excellent match for your profile');
    else if (score >= 60) reasons.push('Strong alignment with your skills');
    else if (score >= 40) reasons.push('Good potential for growth');
    else reasons.push('Explore new opportunities');
    
    const userSkills = userProfile.skills || [];
    const jobSkills = job.requiredSkills || [];
    const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
    if (matchingSkills.length > 0) {
      reasons.push(`Matches ${matchingSkills.length} of your skills`);
    }
    
    if (job.tags?.includes('REMOTE') && userProfile.preferences?.remoteWork) {
      reasons.push('Offers remote work option');
    }
    
    return reasons;
  };

  // Enhanced filtering with recommendations
  const MIN_RECOMMENDATION_SCORE = 40;
  const filteredJobs = jobs
    .map(job => ({
      ...job,
      recommendationScore: getRecommendationScore(job),
      recommendationReasons: getRecommendationReason(job, getRecommendationScore(job))
    }))
    .filter(job => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const userRecoveryLevel = user?.profile?.recoveryLevel;
      if (typeof userRecoveryLevel === 'number') {
        if (job.minRecoveryLevel > userRecoveryLevel) {
          return false;
        }
      }

      // For logged-in survivors, hide weak ML matches.
      if (user?.profile && job.recommendationScore < MIN_RECOMMENDATION_SCORE) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // If personalized profile exists, prioritize ML recommendation score.
      if (user?.profile) {
        return b.recommendationScore - a.recommendationScore;
      }
      // Public/anonymous fallback: newest jobs first.
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const remoteJobsCount = jobs.filter(job => job.tags?.includes('REMOTE')).length;
  const verifiedJobsCount = jobs.filter(job => job.isVerified).length;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-700';
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-700';
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-700';
      default: return 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const trainingPrograms = [
    {
      id: 'TR-001',
      title: 'Digital Literacy & Office Essentials',
      provider: 'Global Skills Hub',
      duration: '6 Weeks',
      modality: 'Hybrid',
      spots: 12,
      icon: BookOpen,
      level: 'Beginner',
      rating: 4.9,
    },
    {
      id: 'TR-002',
      title: 'Resilience & Entrepreneurship Workshop',
      provider: 'Hope Venture Capital',
      duration: '4 Days',
      modality: 'In-person (Addis Ababa)',
      spots: 5,
      icon: Target,
      level: 'All Levels',
      rating: 4.8,
    },
    {
      id: 'TR-003',
      title: 'Micro-Business Management',
      provider: 'Ethio-Growth Lab',
      duration: '3 Months',
      modality: 'Online',
      spots: 25,
      icon: GraduationCap,
      level: 'Intermediate',
      rating: 4.7,
    },
  ];

  // Remove the hardcoded myApplications array - we're using the real applications state

  return (
    <div className="hero-minimal-calm min-h-screen bg-[var(--color-background)] pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[var(--color-border)] bg-white/20 pt-16 pb-12 backdrop-blur-md">
        {/* Animated floating Moroccan elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-20 right-20 w-40 h-40 bg-[var(--color-secondary)]/5 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-[var(--color-accent)]/5 rounded-full blur-2xl animate-pulse delay-2000" />
        </div>
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-[90px] animate-bounce" />
        <div className="pointer-events-none absolute -right-24 -bottom-16 h-80 w-80 rounded-full bg-[var(--color-secondary)]/10 blur-[110px] animate-bounce delay-500" />
        {/* Subtle Moroccan Pattern Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05] moroccan-pattern"
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-[var(--color-primary)]/10 rounded-lg p-2">
                <Award className="text-[var(--color-primary)] h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[10px] font-bold tracking-wider uppercase"
              >
                {t('survivor.empowerment.badge')}
              </Badge>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-5xl">
              {t('survivor.empowerment.title')} <span className="text-[var(--color-primary)]">& Career</span> Portal
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              {t('survivor.empowerment.description')}
            </p>
            <div className="mb-8 flex items-center gap-2 rounded-lg bg-[var(--color-success)]/10 px-4 py-3 text-[var(--color-success)] border border-[var(--color-success)]/20">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                {t('survivor.empowerment.publicAccess')}
              </span>
            </div>

            <div className="grid gap-4 rounded-3xl border border-[var(--color-border)] bg-white/70 p-4 shadow-xl backdrop-blur-sm md:grid-cols-[1fr_auto]">
              <div className="relative max-w-md flex-grow">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  placeholder={t('survivor.empowerment.searchPlaceholder')}
                  className="focus:ring-[var(--color-primary)] h-12 rounded-2xl border-[var(--color-border)] bg-[var(--color-surface)] pl-12 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 shadow-[var(--color-primary)]/20 h-12 rounded-2xl px-8 font-bold shadow-lg">
                {t('survivor.empowerment.findOpportunity')}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border-[var(--color-border)] bg-white/80 backdrop-blur-sm dark:bg-[var(--color-surface)]/70">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl p-2">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('survivor.empowerment.jobsVolunteer')}</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{jobs.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[var(--color-border)] bg-white/80 backdrop-blur-sm dark:bg-[var(--color-surface)]/70">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('survivor.empowerment.remote')}</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{remoteJobsCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[var(--color-border)] bg-white/80 backdrop-blur-sm dark:bg-[var(--color-surface)]/70">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('survivor.empowerment.verifiedPartnersOnly')}</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{verifiedJobsCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-accent)]/5 to-[var(--color-secondary)]/10 shadow-2xl backdrop-blur-md hover:backdrop-blur-lg transition-all duration-700">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] rounded-2xl p-3">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Momentum</p>
                <h3 className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">
                  New opportunities are updated continuously
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Discover verified jobs, save your favorites, and track your applications in one place.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-white/20 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-6">
              <p className="text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Your progress</p>
              <p className="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">{applications.length}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('survivor.empowerment.myApplications')}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="opportunities"
          className="space-y-8"
          onValueChange={setActiveTab}
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <TabsList className="h-14 rounded-2xl border border-[var(--color-border)] bg-white/20 p-1.5 shadow-lg backdrop-blur-md hover:backdrop-blur-lg transition-all duration-500">
              <TabsTrigger
                value="opportunities"
                className="data-[state=active]:bg-[var(--color-primary)] h-full rounded-xl px-8 shadow-none transition-all data-[state=active]:text-white"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                {t('survivor.empowerment.jobsVolunteer')}
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="data-[state=active]:bg-[var(--color-primary)] h-full rounded-xl px-8 shadow-none transition-all data-[state=active]:text-white"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                {t('survivor.empowerment.trainingPrograms')}
              </TabsTrigger>
              <TabsTrigger
                value="tracker"
                className="data-[state=active]:bg-[var(--color-primary)] h-full rounded-xl px-8 shadow-none transition-all data-[state=active]:text-white"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                {t('survivor.empowerment.myApplications')}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {jobs.length} {t('survivor.empowerment.listings', { count: jobs.length })}
              </span>
              <div className="h-4 w-px bg-[var(--color-border)]"></div>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="text-[var(--color-primary)] h-4 w-4" />
                {t('survivor.empowerment.verifiedPartnersOnly')}
              </span>
            </div>
          </div>

          <TabsContent value="opportunities" className="mt-0 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : filteredJobs.length === 0 && !loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <Brain className="h-16 w-16 text-[var(--color-primary)] mb-4 mx-auto animate-pulse" />
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                    {t('survivor.empowerment.noRecommendationsYet')}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {t('survivor.empowerment.completeProfileForRecommendations')}
                  </p>
                  <Button 
                    onClick={() => navigate('/survivor/profile')}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                  >
                    {t('survivor.empowerment.updateProfile')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {filteredJobs.map((job) => {
                  const style = getCategoryStyle(job.category, job.tags);
                  const IconComponent = style.icon;
                  const isHighlyRecommended = job.recommendationScore >= 80;
                  const isRecommended = job.recommendationScore >= 60;
                  
                  return (
                    <Card
                      key={job.id}
                      className={`group hover:border-[var(--color-primary)]/30 overflow-hidden border border-none border-transparent bg-white/10 shadow-2xl backdrop-blur-xl hover:backdrop-blur-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 ${
                        isHighlyRecommended ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : 
                        isRecommended ? 'ring-1 ring-[var(--color-primary)]/50 ring-offset-1' : ''
                      }`}
                    >
                      {/* Recommendation Badge */}
                      {isHighlyRecommended && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white border-none shadow-lg animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Top Match
                          </Badge>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="mb-6 flex items-start justify-between">
                          <div
                            className={`h-14 w-14 rounded-2xl ${style.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                          >
                            <IconComponent className={`h-7 w-7 ${style.color}`} />
                          </div>
                          <div className="text-right">
                            <Badge className={`rounded-full border-none px-3 py-1 text-[10px] ${
                              isHighlyRecommended ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white' :
                              isRecommended ? 'bg-[var(--color-primary)] text-white' :
                              'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                            }`}>
                              {isHighlyRecommended ? 'Top Match' : isRecommended ? 'Recommended' : getTimeAgo(job.createdAt)}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="text-xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] line-clamp-2">
                                {job.title}
                              </h3>
                              {job.isVerified && (
                                <CheckCircle2 className="text-[var(--color-primary)] h-4 w-4 flex-shrink-0" />
                              )}
                            </div>
                            <p className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </p>
                          </div>

                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-muted)] line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-full border-[var(--color-border)] text-xs font-medium"
                            >
                              {job.category}
                            </Badge>
                            {job.tags.includes('REMOTE') && (
                              <Badge
                                variant="outline"
                                className="rounded-full border-[var(--color-border)] text-xs font-medium"
                              >
                                <MapPin className="mr-1 h-3 w-3" />
                                {t('survivor.empowerment.remote')}
                              </Badge>
                            )}
                            {job.tags.includes('LOW_STRESS') && (
                              <Badge
                                variant="outline"
                                className="rounded-full border-[var(--color-border)] text-xs font-medium"
                              >
                                {t('survivor.empowerment.lowStress')}
                              </Badge>
                            )}
                            {job.recommendationScore && job.recommendationScore > 0 && (
                              <Badge className="rounded-full border-none bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                                {job.recommendationScore}% match
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Button
                              size="sm"
                              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                              onClick={() => handleApply(job.id)}
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-[var(--color-border)]"
                              onClick={() => handleToggleSave(job.id)}
                            >
                              {savedJobs.has(job.id) ? 'Saved' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
