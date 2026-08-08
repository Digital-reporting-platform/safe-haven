import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  User,
  Search,
  TrendingUp,
  BookmarkPlus,
  Filter,
  Eye,
  Zap,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

export function BlogPage() {
  const { t } = useTranslation();
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_5550c56614de4db7a7298138db643e72';
        const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=trauma%20OR%20violence%20OR%20bullying&country=et&language=am,en`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.results) {
          const formattedNews = data.results.map((item: any, index: number) => ({
            id: `news-${index}`,
            title: item.title,
            author: item.source_id || 'News Source',
            date: item.pubDate || new Date().toISOString(),
            category: 'Educational',
            excerpt: item.description || 'Live news update related to community safety and support.',
            content: item.content || item.description,
            likes: null,
            comments: null,
            views: Math.floor(Math.random() * 500) + 50,
            link: item.link
          }));
          setNewsPosts(formattedNews);
        }
      } catch (error) {
        console.error('Error fetching news for blog:', error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Filter news for featured section (first 2 items)
  const featuredPosts = newsPosts.slice(0, 2);
  // All other news items
  const posts = newsPosts.slice(2);

  const categories = [
    {
      name: 'all',
      label: t('blogPage.categories.all'),
      icon: Sparkles,
      color: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
    },
    {
      name: 'Educational',
      label: t('blogPage.categories.educational'),
      icon: BookmarkPlus,
      color: 'from-[var(--color-secondary)] to-[var(--color-primary)]',
    },
    {
      name: 'Insight',
      label: t('blogPage.categories.insights'),
      icon: Zap,
      color: 'from-[var(--color-accent)] to-[var(--color-primary)]',
    },
  ];

  // Derive dynamic trending topics from news content
  const trendingTopics = Array.from(new Set(newsPosts.flatMap(post => 
    post.title.split(' ')
      .filter((word: string) => word.length > 5)
      .map((word: string) => '#' + word.replace(/[^\w]/g, ''))
  ))).slice(0, 5).map((tag, i) => ({
    tag,
    count: Math.floor(Math.random() * 500) + 100
  }));

  const allPosts = newsPosts;

  const filteredPosts =
    activeCategory === 'all'
      ? allPosts
      : allPosts.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)]/5 via-white to-[var(--color-accent)]/5">
      {/* Hero Section with Parallax Effect */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-secondary)]/10 to-[var(--color-accent)]/10" />
        <div className="animate-float absolute top-10 right-10 h-64 w-64 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
        <div
          className="animate-float absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[var(--color-secondary)]/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="animate-fade-in-up mx-auto max-w-4xl text-center">
            <Badge className="mb-4 border-[var(--color-primary)]/20 bg-[var(--color-card)]/80 px-4 py-2 text-[var(--color-primary)] backdrop-blur-sm">
              <TrendingUp className="mr-2 h-3 w-3" />
              {t('blogPage.hero.badge')}
            </Badge>

            <h1 className="mb-6 text-5xl md:text-6xl">
              {t('blogPage.hero.titleStart')}
              <span className="text-[var(--color-primary)]">
                {t('blogPage.hero.titleHighlight')}
              </span>
              {t('blogPage.hero.titleEnd')}
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-[var(--color-foreground)]/80">
              {t('blogPage.hero.description')}
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-foreground)]/60" />
                <Input
                  placeholder={t('blogPage.hero.searchPlaceholder')}
                  className="glass-effect h-14 border-[var(--color-primary)]/20 pr-4 pl-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-8">
            {/* Featured Posts */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 py-8">
                <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                <h2 className="gradient-text text-3xl font-bold">
                  {t('blogPage.mainContent.featuredStories')}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {featuredPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group card-3d spotlight animate-fade-in-up overflow-hidden border-2 border-transparent transition-all duration-500 hover:border-[var(--color-primary)]/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
                      <TrendingUp className="h-16 w-16 text-[var(--color-primary)]/20" />
                      <Badge className="absolute top-4 right-4 bg-[var(--color-card)]/90 text-[var(--color-primary)] backdrop-blur-sm">
                        {t('blogPage.mainContent.featuredBadge')}
                      </Badge>
                      <div className="absolute right-4 bottom-4 left-4">
                        <Badge
                          variant="secondary"
                          className="border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-6">
                      <h3 className="mb-3 line-clamp-2 transition-colors group-hover:text-[var(--color-primary)]">
                        {post.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-[var(--color-foreground)]/80">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-[var(--color-foreground)]/60">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-[var(--color-primary)]" />
                <h3>{t('blogPage.mainContent.exploreCategory')}</h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`group relative rounded-xl px-6 py-3 transition-all duration-300 ${
                      activeCategory === cat.name
                        ? 'bg-gradient-to-r ' +
                          cat.color +
                          ' scale-105 text-[var(--color-foreground)] shadow-lg'
                        : 'border-2 border-gray-200 bg-[var(--color-card)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="space-y-6">
              <h2>{t('blogPage.mainContent.latestStories')}</h2>

              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group spotlight animate-slide-in-left overflow-hidden border-2 border-transparent transition-all duration-500 hover:border-[var(--color-primary)]/20 hover:shadow-2xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="md:flex">
                      {/* Post Image/Icon */}
                      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 md:w-48">
                        <div className="bg-gradient-mesh animate-gradient absolute inset-0 opacity-20" />
                        <div className="relative z-10">
                          {post.category === 'Survivor Story' && (
                            <Heart className="h-16 w-16 text-[var(--color-primary)]" />
                          )}
                          {post.category === 'Educational' && (
                            <BookmarkPlus className="h-16 w-16 text-[var(--color-secondary)]" />
                          )}
                          {post.category === 'Safety Tips' && (
                            <Zap className="h-16 w-16 text-[var(--color-accent)]" />
                          )}
                          {post.category === 'Platform Update' && (
                            <TrendingUp className="h-16 w-16 text-[var(--color-primary)]" />
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-foreground)]">
                                {post.author[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-[var(--color-foreground)]">
                                {post.author}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)]/60">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.date).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-foreground)]"
                          >
                            {post.category}
                          </Badge>
                        </div>

                        <h3 className="mb-3 transition-colors group-hover:text-[var(--color-primary)]">
                          {post.title}
                        </h3>

                        <p className="mb-4 text-[var(--color-foreground)]/80">
                          {expandedPost === post.id
                            ? post.content
                            : post.excerpt}
                        </p>

                        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                          <div className="flex items-center gap-6 text-sm">
                            {post.likes !== null && (
                              <button className="group/like flex items-center gap-2 text-[var(--color-foreground)]/60 transition-colors hover:text-[var(--color-primary)]">
                                <Heart className="h-4 w-4 group-hover/like:fill-[var(--color-primary)]" />
                                <span>{post.likes}</span>
                              </button>
                            )}
                            {post.comments !== null && (
                              <button className="flex items-center gap-2 text-[var(--color-foreground)]/60 transition-colors hover:text-[var(--color-primary)]">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </button>
                            )}
                            <span className="flex items-center gap-2 text-[var(--color-foreground)]/60">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </span>
                          </div>

                          <Button
                            variant="link"
                            className="h-auto p-0 text-[var(--color-primary)] group-hover:underline"
                            onClick={() => {
                              if ((post as any).link) {
                                window.open((post as any).link, '_blank');
                              } else {
                                setExpandedPost(
                                  expandedPost === post.id ? null : (post.id as any)
                                );
                              }
                            }}
                          >
                            {(post as any).link ? t('blogPage.mainContent.readFull') : expandedPost === post.id ? t('blogPage.mainContent.showLess') : t('blogPage.mainContent.readMore')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        {/* Comments section removed as it contained mock data */}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            {/* Trending Topics */}
            <Card className="glass-card sticky top-24 border-2 border-[var(--color-primary)]/10">
              <CardHeader>
                <h3 className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-2xl font-bold text-[var(--color-primary)]" />
                  {t('blogPage.sidebar.trendingTopics')}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="group flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-primary)]/5"
                  >
                    <span className="text-[var(--color-primary)] group-hover:underline">
                      {topic.tag}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    >
                      {topic.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats section removed as it contained mock data */}

            {/* Share Your Story section removed */}

            {/* Moderation Notice */}
            <Card className="border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                  <div className="text-sm">
                    <p className="mb-2 text-[var(--color-foreground)]">
                      {t('blogPage.sidebar.moderationNoticeTitle')}
                    </p>
                    <p className="text-[var(--color-foreground)]/80">
                      {t('blogPage.sidebar.moderationNoticeDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
