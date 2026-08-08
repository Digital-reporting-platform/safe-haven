import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Phone,
  ShieldCheck,
  Filter,
  Globe,
  Scale,
  HeartPulse,
  Heart,
  ChevronRight,
  Info,
  Navigation as NavIcon,
} from 'lucide-react';

export function ResourcesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const regions = ['Addis Ababa', 'Oromia', 'Amhara', 'Sidama', 'Tigray'];
  const types = ['Medical', 'Legal', 'Counseling'];

  const services = [
    {
      id: 1,
      name: 'EWLA Legal Aid',
      hotline: '7711',
      type: 'Legal',
      region: 'Addis Ababa',
      languages: ['Amharic', 'English'],
      description:
        'Providing free legal advice and representation for women across Ethiopia, specialized in gender-based violence cases.',
    },
    {
      id: 2,
      name: 'Setaweet Counseling',
      hotline: '8161',
      type: 'Counseling',
      region: 'Addis Ababa',
      languages: ['Amharic', 'English', 'Oromo'],
      description:
        'A feminist collective offering trauma-informed therapy and support groups in a safe haven environment.',
    },
    {
      id: 3,
      name: 'Tikur Anbessa Specialist',
      hotline: '907',
      type: 'Medical',
      region: 'Addis Ababa',
      languages: ['Amharic', 'English'],
      description:
        'Dedicated medical forensic services and emergency care with a zero-tolerance policy for discrimination.',
    },
    {
      id: 4,
      name: "Oromia Women's Association",
      hotline: '6543',
      type: 'Counseling',
      region: 'Oromia',
      languages: ['Oromo', 'Amharic'],
      description:
        'Local community support providing immediate shelter referral and peer-to-peer healing circles.',
    },
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20 font-sans">
      {/* Header & Search Section */}
      <div className="border-b border-[#6B705C]/10 bg-[var(--color-background)] pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl space-y-6">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="rounded-full border-[#6B705C]/20 bg-[#6B705C]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#6B705C] uppercase"
              >
                {t('supportServices.badge')}
              </Badge>
              <h1 className="text-4xl leading-tight font-medium tracking-tight text-slate-900 md:text-5xl dark:text-[var(--color-foreground)]">
                {t('supportServices.title')}{' '}
                <span className="font-semibold text-[#6B705C]">{t('supportServices.titleHighlight')}</span>
              </h1>
              <p className="max-w-xl text-lg font-normal text-slate-500/80 dark:text-slate-400">
                {t('supportServices.description')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="group relative">
              <div className="absolute inset-0 scale-105 rounded-full bg-[#6B705C]/5 opacity-0 blur-xl transition-opacity group-focus-within:opacity-100"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 h-5 w-5 text-[#6B705C]/60" />
                <Input
                  className="h-16 w-full rounded-2xl border-[#6B705C]/10 bg-[var(--color-card)] pr-6 pl-14 text-lg shadow-xl shadow-[#6B705C]/5 placeholder:text-[var(--color-foreground)]/60 focus:ring-[#6B705C]/20"
                  placeholder={t('supportServices.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="animate-pulse-slow flex w-fit items-center gap-2 rounded-xl border border-[#6B705C]/10 bg-[#6B705C]/5 px-4 py-2.5 text-[#6B705C]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                All services are confidential
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pt-12 lg:grid-cols-12">
        {/* Left Side: Filters and List */}
        <div className="space-y-10 lg:col-span-8">
          {/* Filter Chips */}
          <div className="space-y-6">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              <Filter className="h-3 w-3" /> {t('supportServices.filterBy')}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="mr-2 py-2 text-xs font-bold text-slate-400">
                Region:
              </span>
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleFilter(region)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeFilters.includes(region)
                      ? 'bg-[#6B705C] text-[var(--color-foreground)] shadow-lg shadow-[#6B705C]/20'
                      : 'border border-[#6B705C]/10 bg-[var(--color-card)] text-[var(--color-foreground)]/60 hover:border-[#6B705C]/30'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="mr-2 py-2 text-xs font-bold text-slate-400">
                Type:
              </span>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeFilters.includes(type)
                      ? 'bg-[#DDA15E] text-[var(--color-foreground)] shadow-lg shadow-[#DDA15E]/20'
                      : 'border border-[#DDA15E]/10 bg-[var(--color-card)] text-[var(--color-foreground)]/60 hover:border-[#DDA15E]/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group overflow-hidden rounded-3xl border-none bg-[var(--color-card)] shadow-xl shadow-[#6B705C]/5 transition-all duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-0">
                  <div className="space-y-4 p-8">
                    <div className="flex items-start justify-between">
                      <div
                        className={`rounded-2xl p-3 ${
                          service.type === 'Medical'
                            ? 'bg-[var(--color-background)] text-[#C15B3E]'
                            : service.type === 'Legal'
                              ? 'bg-[var(--color-background)] text-[#6B705C]'
                              : 'bg-[var(--color-background)] text-[#DDA15E]'
                        }`}
                      >
                        {service.type === 'Medical' ? (
                          <HeartPulse className="h-6 w-6" />
                        ) : service.type === 'Legal' ? (
                          <Scale className="h-6 w-6" />
                        ) : (
                          <Heart className="h-6 w-6" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
                      >
                        {service.region}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-[#6B705C] dark:text-[var(--color-foreground)]">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm font-black text-[#6B705C]">
                        <Phone className="h-3.5 w-3.5" />
                        Hotline: {service.hotline}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed font-normal text-slate-500/80 dark:text-slate-400">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <Globe className="h-3.5 w-3.5 text-slate-300" />
                      {service.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button className="h-12 w-full rounded-2xl bg-[#C15B3E] font-bold text-[var(--color-foreground)] shadow-lg shadow-[#C15B3E]/20 transition-all hover:bg-[#8c3e2b] active:scale-95">
                        {t('supportServices.callNow')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Map Placeholder */}
        <div className="space-y-6 lg:col-span-4">
          <div className="mb-2 flex items-center gap-3 px-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#6B705C]"></div>
            <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
              Regional Coverage
            </h3>
          </div>

          <Card className="relative aspect-square overflow-hidden rounded-[2.5rem] border-none bg-[var(--color-card)] shadow-2xl shadow-[#6B705C]/5 lg:aspect-[3/4]">
            <CardContent className="flex h-full flex-col items-center justify-center space-y-6 p-8 text-center">
              {/* Stylized Ethiopia Outline Visual */}
              <div className="relative h-48 w-48 opacity-10 dark:opacity-20">
                <NavIcon className="animate-float h-full w-full text-[#6B705C]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 animate-ping rounded-full bg-[#6B705C] blur-xl"></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-800 dark:text-[var(--color-foreground)]">
                  Active Services View
                </h4>
                <p className="text-xs leading-relaxed font-normal text-slate-500">
                  Interactive mapping of verified facilities available in your
                  current region.
                </p>
              </div>

              <Button
                variant="ghost"
                className="mt-4 rounded-2xl font-bold text-[#6B705C] hover:bg-[#6B705C]/5"
              >
                View Full Map <ChevronRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Verified Badge */}
              <div className="absolute right-8 bottom-8 left-8 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-4 backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B705C]/10 text-[#6B705C]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase">
                    Status
                  </p>
                  <p className="text-xs font-bold text-[#6B705C]">
                    All Locations Verified
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-4 rounded-3xl border border-[#DDA15E]/10 bg-[#DDA15E]/5 p-6">
            <div className="flex items-center gap-2 text-[#DDA15E]">
              <Info className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                How we verify
              </span>
            </div>
            <p className="text-xs leading-relaxed font-normal text-slate-500/80">
              Every facility in this directory has been physically inspected and
              vetted by our ethical compliance team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
