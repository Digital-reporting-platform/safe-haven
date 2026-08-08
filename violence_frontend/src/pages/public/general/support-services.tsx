import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  MessageCircle,
  Shield,
  AlertCircle,
  Building2,
  ArrowRight,
  Heart,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Section wrapper for consistent spacing
const Section = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`py-12 md:py-16 lg:py-20 ${className}`}>
    {children}
  </section>
);

const emergencyContacts = [
  {
    icon: Phone,
    label: 'Police Emergency',
    value: '991',
    href: 'tel:991',
    buttonText: 'Call 991',
    bgColor: 'bg-red-500',
    hoverColor: 'text-red-500',
  },
  {
    icon: Building2,
    label: 'Red Cross Ambulance',
    value: '907',
    href: 'tel:907',
    buttonText: 'Call 907',
    bgColor: 'bg-[var(--color-primary)]',
    hoverColor: 'text-[var(--color-primary)]',
  },
  {
    icon: Heart,
    label: 'Mental Health Support',
    value: '8335',
    href: 'tel:8335',
    buttonText: 'Call 8335',
    bgColor: 'bg-[var(--color-secondary)]',
    hoverColor: 'text-[var(--color-secondary)]',
  },
];

export function SupportServicesPage() {
  const { t } = useTranslation();
  
  const emergencyContacts = [
    {
      icon: Phone,
      label: t('supportServicesPage.hotlines.policeEmergency'),
      value: '991',
      href: 'tel:991',
      buttonText: `${t('supportServicesPage.hotlines.call')} 991`,
      bgColor: 'bg-red-500',
      hoverColor: 'text-red-500',
    },
    {
      icon: Building2,
      label: t('supportServicesPage.hotlines.redCrossAmbulance'),
      value: '907',
      href: 'tel:907',
      buttonText: `${t('supportServicesPage.hotlines.call')} 907`,
      bgColor: 'bg-[var(--color-primary)]',
      hoverColor: 'text-[var(--color-primary)]',
    },
    {
      icon: Heart,
      label: t('supportServicesPage.hotlines.mentalHealthSupport'),
      value: '8335',
      href: 'tel:8335',
      buttonText: `${t('supportServicesPage.hotlines.call')} 8335`,
      bgColor: 'bg-[var(--color-secondary)]',
      hoverColor: 'text-[var(--color-secondary)]',
    },
  ];
  
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 py-20">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-4 py-2">
              <Shield className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold tracking-wider text-[var(--color-primary)] uppercase">
                {t('supportServicesPage.hero.badge')}
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold text-[var(--color-foreground)] md:text-6xl">
              {t('supportServicesPage.hero.title')}{' '}
              <span className="text-[var(--color-primary)]">{t('supportServicesPage.hero.titleHighlight')}</span>.
              <br />
              {t('supportServicesPage.hero.titleEnd')}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-[var(--color-foreground)]/80">
              {t('supportServicesPage.hero.description')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="#hotlines">
                <Button
                  size="lg"
                  className="min-w-[200px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                >
                  {t('supportServicesPage.hero.crisisHotlines')}
                </Button>
              </a>
              <Link to="/public-support-directory">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] border-[var(--color-primary)] text-[var(--color-primary)]"
                >
                  {t('supportServicesPage.hero.browseDirectory')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-0 h-full w-1/3 bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 -z-0 h-1/2 w-1/4 bg-gradient-to-tr from-[var(--color-secondary)]/5 to-transparent" />
      </section>

      {/* Immediate Assistance / Hotlines */}
      <Section id="hotlines" className="bg-[var(--color-background)]">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
                <AlertCircle className="h-3 w-3" />
                {t('supportServicesPage.hotlines.badge')}
              </div>
              <h2 className="mb-6 text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
                {t('supportServicesPage.hotlines.title')}
              </h2>
              <div className="mx-auto max-w-2xl rounded-xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
                <p className="text-sm leading-relaxed font-medium text-red-600/90">
                  <strong>Note:</strong> {t('supportServicesPage.hotlines.note')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {emergencyContacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group h-full overflow-hidden border border-[var(--color-primary)]/10 bg-[var(--color-background)]/50 backdrop-blur-md transition-all duration-300 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <CardContent className="relative z-10 flex h-full flex-col p-8">
                      <div className="mb-6 flex items-center gap-4">
                        <div
                          className={`h-14 w-14 ${contact.bgColor} flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110`}
                        >
                          <contact.icon className="h-7 w-7 text-white" />
                        </div>
                        <span className="font-[Inter] text-sm font-bold tracking-widest text-[var(--color-foreground)]/60 uppercase">
                          {contact.label}
                        </span>
                      </div>
                      <div className="mb-8 text-2xl font-bold text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                        {contact.value}
                      </div>
                      <div className="mt-auto">
                        <a href={contact.href}>
                          <Button
                            className={`h-12 w-full ${contact.bgColor} font-bold text-white hover:opacity-90`}
                          >
                            {contact.buttonText}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Institutional Resources */}
      <Section className="border-y border-[var(--color-primary)]/10 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                <Building2 className="h-3 w-3" />
                {t('supportServicesPage.institutional.badge')}
              </div>
              <h2 className="mb-4 font-[Inter] text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
                {t('supportServicesPage.institutional.title')}
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-foreground)]/80">
                {t('supportServicesPage.institutional.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Building2,
                  title: t('supportServicesPage.institutional.ngos'),
                  color: 'bg-purple-500/10 text-purple-600',
                  border: 'border-purple-500/20',
                  items: [
                    "Ethiopian Women Lawyers Association (EWLA)",
                    "Forum on Sustainable Child Empowerment (FSCE)",
                    "Action Aid Ethiopia",
                    "Women's Affairs Bureau (Regional offices)",
                  ],
                },
                {
                  icon: Shield,
                  title: t('supportServicesPage.institutional.government'),
                  color: 'bg-blue-500/10 text-blue-600',
                  border: 'border-blue-500/20',
                  items: [
                    "Ministry of Women & Social Affairs",
                    "Federal Police Commission (Child & Women Protection Unit)",
                    "Attorney General's Office",
                    "Ministry of Health – Mental Health Unit",
                  ],
                },
                {
                  icon: Heart,
                  title: t('supportServicesPage.institutional.health'),
                  color: 'bg-rose-500/10 text-rose-600',
                  border: 'border-rose-500/20',
                  items: [
                    "Amanuel Mental Specialized Hospital",
                    "St. Paul's Hospital Millennium Medical College",
                    "Tikur Anbessa Specialized Hospital",
                    "Red Cross Society of Ethiopia",
                  ],
                },
                {
                  icon: MessageCircle,
                  title: t('supportServicesPage.institutional.legal'),
                  color: 'bg-amber-500/10 text-amber-700',
                  border: 'border-amber-500/20',
                  items: [
                    "Ethiopian Legal Aid Services",
                    "Addis Ababa University Legal Aid Clinic",
                    "International Justice Mission (IJM) Ethiopia",
                    "Ethiopian Human Rights Commission",
                  ],
                },
              ].map((category, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border ${category.border} bg-[var(--color-card)] p-6 shadow-sm`}
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${category.color}`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-4 font-bold text-[var(--color-foreground)]">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]/70">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6 text-center">
              <p className="text-sm text-[var(--color-foreground)]/70">
                <strong className="text-[var(--color-foreground)]">{t('supportServicesPage.institutional.registerPrompt')}</strong>{' '}
                {t('supportServicesPage.institutional.registerDescription')}
              </p>
              <Link to="/public-support-directory" className="mt-4 inline-flex items-center gap-2 font-bold text-[var(--color-primary)] hover:underline">
                {t('supportServicesPage.institutional.browseFullDirectory')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>


      {/* Trust and Safety Section */}
      <Section>
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-6 font-[Inter] text-3xl font-bold">
              {t('supportServicesPage.trust.title')}
            </h2>
            <p className="text-lg text-[var(--color-foreground)]/70">
              {t('supportServicesPage.trust.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: t('supportServicesPage.trust.confidentiality.title'),
                desc: t('supportServicesPage.trust.confidentiality.description'),
              },
              {
                icon: CheckCircle2,
                title: t('supportServicesPage.trust.vetted.title'),
                desc: t('supportServicesPage.trust.vetted.description'),
              },
              {
                icon: Heart,
                title: t('supportServicesPage.trust.traumaInformed.title'),
                desc: t('supportServicesPage.trust.traumaInformed.description'),
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                  <feature.icon className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="leading-relaxed text-[var(--color-foreground)]/60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] py-20 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold md:text-5xl">
            {t('supportServicesPage.cta.title')}
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/public-support-directory">
              <Button
                size="lg"
                className="h-14 min-w-[220px] bg-[var(--color-card)] text-lg text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
              >
                {t('supportServicesPage.cta.viewDirectory')}
              </Button>
            </Link>
            <Link to="/report">
              <Button
                variant="outline"
                size="lg"
                className="h-14 min-w-[220px] border-2 border-[var(--color-card-foreground)] text-lg font-bold text-[var(--color-card-foreground)] hover:bg-[var(--color-card)]/10"
              >
                {t('supportServicesPage.cta.submitReport')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
