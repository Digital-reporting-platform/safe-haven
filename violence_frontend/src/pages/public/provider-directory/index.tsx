import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Shield,
  Heart,
  ChevronDown,
  Globe,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { providerService, Provider, ServiceProviderType } from '../../../services/providerService';
import { Button } from '../../../components/ui/button';

const SERVICE_TYPES = [
  { label: 'providerDirectory.allServices', value: '' },
  { label: 'providerDirectory.counseling', value: ServiceProviderType.COUNSELOR },
  { label: 'providerDirectory.medical', value: ServiceProviderType.MEDICAL_PROFESSIONAL },
  { label: 'providerDirectory.legalAid', value: ServiceProviderType.LEGAL_ADVISOR },
  { label: 'providerDirectory.ngos', value: ServiceProviderType.NGO },
  { label: 'providerDirectory.govAgencies', value: ServiceProviderType.GOVERNMENT_AGENCY },
  { label: 'providerDirectory.shelters', value: ServiceProviderType.SHELTER },
];

const LOCATIONS = [
  'providerDirectory.allLocations',
  'Addis Ababa',
  'Dire Dawa',
  'Adama',
  'Bahir Dar',
  'Mekelle',
  'Hawassa',
  'Jimma',
  'Remote/Online',
];

export function SupportDirectoryPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    city: '',
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await providerService.getProviders({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        type: filters.type || undefined,
        city: filters.city === 'All Locations' ? undefined : filters.city || undefined,
        verified: true,
      });
      setProviders(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages,
      }));
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProviders]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      city: '',
    });
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-linear-to-br from-[var(--color-primary)]/10 via-transparent to-[var(--color-secondary)]/5 py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--color-secondary)]/10 blur-[80px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-6 py-3 font-[Inter] text-sm font-bold text-[var(--color-primary)]">
              <Shield className="h-4 w-4" />
              {t('providerDirectory.badge')}
            </div>
            <h1 className="mb-6 font-[Inter] text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              {t('providerDirectory.title')} <br />
              <span className="text-[var(--color-primary)]">{t('providerDirectory.titleHighlight')}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[var(--color-foreground)]/70">
              {t('providerDirectory.description')}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Search & Filters */}
        <section className="sticky top-20 z-30 mb-12">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)]/80 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-foreground)]/40" />
                  <input
                    type="text"
                    placeholder={t('providerDirectory.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] pr-4 pl-12 font-medium transition-all focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className="h-14 gap-2 rounded-2xl px-8 font-bold transition-all"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-[var(--color-foreground)]/40 uppercase">
                          Service Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SERVICE_TYPES.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => handleFilterChange('type', type.value)}
                              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                filters.type === type.value
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                              }`}
                            >
                              {t(type.label)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-[var(--color-foreground)]/40 uppercase">
                          City / Region
                        </label>
                        <select
                          value={filters.city}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                          className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 font-medium"
                        >
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc.startsWith('providerDirectory.') ? t(loc) : loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                      <span className="text-sm font-medium text-[var(--color-foreground)]/60">
                        {pagination.total} results found
                      </span>
                      <button
                        onClick={clearFilters}
                        className="text-sm font-bold text-[var(--color-primary)] hover:underline"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Safety Alert */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-5xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-amber-800">{t('providerDirectory.safetyFirst.title')}</p>
                <p className="text-sm text-amber-800/80">
                  {t('providerDirectory.safetyFirst.description')}{' '}
                  <Link to="/resources" className="mx-1 font-bold underline">{t('providerDirectory.safetyFirst.safetyPlanning')}</Link>{' '}
                  {t('providerDirectory.safetyFirst.toolsBefore')}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Providers Grid */}
        <section className="relative min-h-[400px]">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/5">
                <Users className="h-10 w-10 text-[var(--color-primary)]/40" />
              </div>
              <h3 className="text-2xl font-bold">{t('providerDirectory.noResultsFound.title')}</h3>
              <p className="mb-8 text-[var(--color-foreground)]/60">
                {t('providerDirectory.noResultsFound.description')}
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-xl">
                {t('providerDirectory.noResultsFound.clearAllFilters')}
              </Button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  variants={cardVariants}
                  className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10"
                >
                  {/* Card Header Overlay */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {provider.isVerified && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-md">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-md transition-colors hover:bg-white hover:text-red-500">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-8">
                    {/* Badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[var(--color-primary)] uppercase">
                      <Sparkles className="h-3 w-3" />
                      {provider.type.replace(/_/g, ' ')}
                    </div>

                    <h3 className="mb-4 font-[Inter] text-2xl font-bold leading-tight transition-colors group-hover:text-[var(--color-primary)]">
                      {provider.name}
                    </h3>

                    {/* Stats */}
                    <div className="mb-6 flex items-center gap-4 text-sm font-bold text-[var(--color-foreground)]/60">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {provider.city || 'Remote'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        {provider.languages.slice(0, 2).join(', ')}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-[var(--color-foreground)]/70">
                      {provider.description || "Committed to providing compassionate and professional support to survivors of violence and trauma."}
                    </p>

                    {/* Contact Pills */}
                    <div className="mb-8 space-y-3">
                      {provider.phone && (
                        <a href={`tel:${provider.phone}`} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 transition-colors hover:border-[var(--color-primary)]/50">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold">{provider.phone}</span>
                        </a>
                      )}
                      {provider.email && (
                        <a href={`mailto:${provider.email}`} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 transition-colors hover:border-[var(--color-primary)]/50">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span className="truncate text-sm font-bold">{provider.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <Link to={`/public-support-directory/${provider.id}`} className="w-full">
                        <Button variant="outline" className="w-full rounded-2xl border-[var(--color-border)] font-bold transition-all hover:bg-[var(--color-primary)] hover:text-white">
                          View Profile
                        </Button>
                      </Link>
                      <Button className="w-full gap-2 rounded-2xl bg-[var(--color-primary)] font-bold text-white shadow-[var(--color-primary)]/20 shadow-lg transition-all hover:scale-105 active:scale-95">
                        Contact
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
            <div className="mt-16 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold transition-all ${
                    pagination.page === i + 1
                      ? 'bg-[var(--color-primary)] text-white shadow-lg'
                      : 'bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Call to Action Section */}
      <section className="bg-[var(--color-card)] py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 p-12 text-center text-white shadow-2xl md:p-20">
            <div className="absolute inset-0 z-0">
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/10 blur-[80px]" />
            </div>
            
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-6 font-[Inter] text-4xl font-bold leading-tight md:text-5xl">
                {t('providerDirectory.providerCTA.title')}
              </h2>
              <p className="mb-12 text-xl text-white/80">
                {t('providerDirectory.providerCTA.description')}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/auth/register">
                  <Button className="h-16 w-full rounded-2xl bg-white px-10 text-lg font-bold text-[var(--color-primary)] transition-all hover:scale-105 hover:bg-white/90 sm:w-auto">
                    {t('providerDirectory.providerCTA.registerAsProvider')}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" className="h-16 w-full rounded-2xl border-white/30 bg-transparent px-10 text-lg font-bold text-white transition-all hover:bg-white/10 sm:w-auto">
                    {t('providerDirectory.providerCTA.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-2xl text-sm text-[var(--color-foreground)]/50">
            {t('providerDirectory.footer.disclaimer')}{' '}
            <Link to="/support-services" className="font-bold underline">{t('providerDirectory.footer.emergencyHotlines')}</Link>{' '}
            {t('providerDirectory.footer.listedOnPlatform')}
          </p>
          <p className="mt-4 text-xs text-[var(--color-foreground)]/40">
            {t('providerDirectory.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
