import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  GraduationCap,
  Search,
  Building2,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Heart,
  Sparkles,
  Laptop,
  Loader2,
  Award,
  Users,
  BookOpen,
  Target,
} from 'lucide-react';
import { api } from '@/services/api/client';
import { toast } from 'sonner';

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
}

export function PublicEmpowermentPage() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs from backend - always use public endpoint
  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      try {
        console.log('Fetching jobs from /job-portal/public...');
        setLoading(true);
        // Always use public endpoint - no authentication required
        const response = await api.get('/job-portal/public');
        console.log('Jobs response:', response.data);
        if (isMounted) {
          setJobs(response.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        console.error('Error details:', error.response?.data || error.message);
        if (isMounted) {
          toast.error('Failed to load job opportunities');
          setJobs([]); // Set empty array on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // Get icon and color based on category
  const getCategoryStyle = (category: string, tags: string[]) => {
    if (tags.includes('REMOTE')) {
      return { icon: Laptop, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
    if (category.toLowerCase().includes('social')) {
      return { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
    if (category.toLowerCase().includes('tech')) {
      return { icon: Laptop, color: 'text-amber-600', bg: 'bg-amber-500/10' };
    }
    return { icon: Briefcase, color: 'text-rose-500', bg: 'bg-rose-500/10' };
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

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate real statistics from job data
  const stats = {
    totalJobs: jobs.length,
    verifiedJobs: jobs.filter(job => job.isVerified).length,
    uniqueCompanies: new Set(jobs.map(job => job.company)).size,
    remoteJobs: jobs.filter(job => job.tags.includes('REMOTE')).length,
    categories: new Set(jobs.map(job => job.category)).size,
    recentJobs: jobs.filter(job => {
      const createdAt = new Date(job.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length
  };

  return (
    <div className="hero-minimal-calm min-h-screen bg-gradient-to-br from-[var(--color-background)] via-white to-[var(--color-surface)]">
      {/* Hero Header with Modern Design */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Moroccan Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l2.5 7.5L40 10l-7.5 2.5L30 20l-2.5-7.5L20 10l7.5-2.5z' fill='%23C15B3E' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 container mx-auto px-4 max-w-7xl pt-24 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 px-6 py-3 border border-[var(--color-primary)]/20 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                <Award className="text-white h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider uppercase">
                Growth & Recovery
              </span>
            </div>
            
            {/* Main Title */}
            <h1 className="mb-6 text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight">
              <span className="block mb-2">Empowerment</span>
              <span className="block bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                & Career Portal
              </span>
            </h1>
            
            {/* Description */}
            <p className="mb-10 text-xl md:text-2xl leading-relaxed text-[var(--color-text-secondary)] font-light max-w-4xl mx-auto">
              Discover curated opportunities, training programs, and resources designed to support
              your journey toward long-term resilience and independence.
            </p>
            
            {/* Public Access Badge */}
            <div className="mb-12 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-4 border border-green-200 shadow-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                <CheckCircle2 className="text-white h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-green-800">
                🌍 Public Access - No sign in required
              </span>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                <div className="relative flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <Input
                      placeholder="Search your dream job, training, or opportunity..."
                      className="h-16 rounded-2xl border-2 border-[var(--color-border)] bg-white/80 backdrop-blur-sm pl-14 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 shadow-lg text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="btn-primary h-16 px-8 font-bold text-xl shadow-xl hover:shadow-2xl rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary)] transition-all transform hover:scale-105"
                    onClick={() => {
                      // Handle search - could filter or navigate
                      console.log('Search clicked:', searchQuery);
                      // Optional: You could implement search functionality here
                    }}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Find Opportunity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Stats Bar - Real Data */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              icon: Briefcase, 
              label: 'Active Jobs', 
              value: jobs.length, 
              color: 'var(--color-primary)' 
            },
            { 
              icon: Users, 
              label: 'Verified Companies', 
              value: new Set(jobs.map(job => job.company)).size, 
              color: 'var(--color-success)' 
            },
            { 
              icon: GraduationCap, 
              label: 'Categories', 
              value: new Set(jobs.map(job => job.category)).size, 
              color: 'var(--color-secondary)' 
            },
            { 
              icon: CheckCircle2, 
              label: 'Remote Jobs', 
              value: jobs.filter(job => job.tags.includes('REMOTE')).length, 
              color: 'var(--color-accent)' 
            },
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white to-[var(--color-surface)] rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"></div>
              <div className="relative p-6 rounded-2xl border border-[var(--color-border)]/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md">
                    <stat.icon className="h-6 w-6" style={{ color: `var(${stat.color})` }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs
          defaultValue="opportunities"
          className="space-y-16"
        >
          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <TabsList className="h-20 rounded-3xl bg-white/80 backdrop-blur-sm p-2 shadow-xl border border-[var(--color-border)]/50">
              <TabsTrigger
                value="opportunities"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg h-full rounded-2xl px-8 transition-all font-bold text-[var(--color-text-secondary)] text-lg group relative z-10"
              >
                <Briefcase className="mr-3 h-6 w-6" />
                Jobs & Volunteer
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg h-full rounded-2xl px-8 transition-all font-bold text-[var(--color-text-secondary)] text-lg group relative z-10"
              >
                <GraduationCap className="mr-3 h-6 w-6" />
                Training (Coming Soon)
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-8 text-base text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-3 font-medium bg-white/60 px-4 py-2 rounded-full border border-[var(--color-border)]/50">
                <Sparkles className="h-5 w-5 text-[var(--color-accent)] animate-pulse" />
                <span>{jobs.length} Opportunities Available</span>
              </div>
              <div className="flex items-center gap-3 font-medium bg-white/60 px-4 py-2 rounded-full border border-[var(--color-border)]/50">
                <CheckCircle2 className="text-[var(--color-success)] h-5 w-5" />
                <span>Verified Partners Only</span>
              </div>
            </div>
          </div>

          <TabsContent value="opportunities" className="mt-0 space-y-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-full blur-2xl animate-pulse"></div>
                  <Loader2 className="relative h-16 w-16 animate-spin text-[var(--color-primary)]" />
                </div>
                <p className="mt-6 text-lg text-[var(--color-text-secondary)]">Loading amazing opportunities...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full blur-2xl"></div>
                  <Briefcase className="relative h-24 w-24 text-gray-400" />
                </div>
                <h3 className="mt-8 text-3xl font-bold text-[var(--color-text-primary)]">
                  No opportunities found
                </h3>
                <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for new listings'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job, index) => {
                  const style = getCategoryStyle(job.category, job.tags);
                  const IconComponent = style.icon;
                  
                  return (
                    <div
                      key={job.id}
                      className="group relative"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {/* Glow Effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-accent)]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Card */}
                      <Card className="relative h-full border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:transform group-hover:scale-105">
                        {/* Header Gradient */}
                        <div className="h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]"></div>
                        
                        <div className="p-8">
                          {/* Top Section */}
                          <div className="mb-6 flex items-start justify-between">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                              <div
                                className={`relative h-16 w-16 rounded-2xl ${style.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}
                              >
                                <IconComponent className={`h-8 w-8 ${style.color}`} />
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className="rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]/50 shadow-sm">
                                {getTimeAgo(job.createdAt)}
                              </Badge>
                              {job.isVerified && (
                                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Verified
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] line-clamp-2 mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                                <Building2 className="h-4 w-4 text-[var(--color-primary)]" />
                                {job.company}
                              </div>
                            </div>

                            <p className="text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="rounded-full bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 text-[var(--color-primary)] border-0 text-xs font-semibold px-3 py-1">
                                {job.category}
                              </Badge>
                              {job.tags.includes('REMOTE') && (
                                <Badge className="rounded-full bg-blue-50 text-blue-700 border-0 text-xs font-semibold px-3 py-1">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  Remote
                                </Badge>
                              )}
                              {job.tags.includes('LOW_STRESS') && (
                                <Badge className="rounded-full bg-green-50 text-green-700 border-0 text-xs font-semibold px-3 py-1">
                                  Low Stress
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                              <span className="font-medium">Source:</span>
                              <span className="bg-[var(--color-surface)] px-2 py-1 rounded">{job.source}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-8 flex gap-3">
                            <Button 
                              className="flex-1 h-14 font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary)] text-white border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-2xl"
                              onClick={() => window.open(job.sourceUrl, '_blank')}
                            >
                              View Details
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-14 w-14 rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all"
                            >
                              <Heart className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredJobs.length > 0 && (
              <div className="flex justify-center pt-12">
                <Button
                  variant="outline"
                  className="h-16 px-8 rounded-2xl border-2 border-[var(--color-primary)]/30 bg-white/80 backdrop-blur-sm text-[var(--color-primary)] font-bold text-lg hover:bg-[var(--color-primary)] hover:text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  View All Opportunities
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="training" className="mt-0">
            <div className="text-center py-32">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)]/20 to-[var(--color-accent)]/20 rounded-full blur-2xl"></div>
                <GraduationCap className="relative h-24 w-24 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-6">Training Programs Coming Soon</h2>
              <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-8">
                We're currently curating the best training programs and educational resources to support your journey. 
                Check back soon for skill-building workshops, certification courses, and professional development opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-accent-dark)] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={() => {
                    console.log('Get Notified clicked');
                    // Could implement notification system
                  }}
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Get Notified
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 px-8 rounded-2xl border-2 border-[var(--color-secondary)]/30 bg-white/80 backdrop-blur-sm hover:bg-[var(--color-secondary)]/10 font-bold text-lg"
                  onClick={() => {
                    console.log('Suggest a Program clicked');
                    // Could open suggestion form
                  }}
                >
                  <Target className="mr-2 h-5 w-5" />
                  Suggest a Program
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer CTA */}
      <div className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-secondary)]/10 to-[var(--color-accent)]/10"></div>
        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8">
            Join thousands of survivors who have found new opportunities through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-primary h-16 px-8 text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-dark)] shadow-xl hover:shadow-2xl transform hover:scale-105">
              Get Started Today
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-16 px-8 text-lg font-bold border-2 border-[var(--color-primary)]/30 bg-white/80 backdrop-blur-sm hover:bg-[var(--color-primary)]/10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
