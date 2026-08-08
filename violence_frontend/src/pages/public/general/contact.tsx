import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Send,
  CheckCircle2,
  Users,
  FileText,
  HeadphonesIcon,
  Loader2,
  Heart,
  MessageSquare,
  Zap,
  Star,
  Sparkles,
  Smile,
  Calendar,
  Globe,
  Building,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Contact Method Card with Hover Effects
const COLOR_MAP = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const ContactMethodCard = ({ icon: Icon, title, description, contact, responseTime, index, color = "blue" }: {
  icon: any;
  title: string;
  description: string;
  contact: string;
  responseTime: string;
  index: number;
  color?: string;
}) => {
  const colorClasses = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <motion.div
          className={`w-14 h-14 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-4`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`h-7 w-7 ${colorClasses.text}`} />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        <div className="space-y-2">
          <p className="font-semibold text-[var(--color-primary)] text-lg">{contact}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{responseTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Department Contact Card
const DepartmentCard = ({ icon: Icon, department, email, phone, description, index }: {
  icon: any;
  department: string;
  email: string;
  phone: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <motion.div
          className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl flex items-center justify-center flex-shrink-0"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{department}</h3>
          <p className="text-gray-600 mb-3">{description}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--color-primary)]" />
              <a href={`mailto:${email}`} className="text-[var(--color-primary)] hover:underline font-medium">
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[var(--color-primary)]" />
              <a href={`tel:${phone}`} className="text-[var(--color-primary)] hover:underline font-medium">
                {phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    subject: '',
    message: '',
    urgency: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      const result = await response.json();
      
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '', email: '', phone: '', company: '', inquiryType: '', subject: '', message: '', urgency: 'normal'
        });
      }, 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      // TODO: Show error message to user
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const key = e.target.name === 'inquiry' ? 'inquiryType' : e.target.name;
    let value = e.target.value;
    
    // Map frontend inquiry values to backend enum values
    if (key === 'inquiryType') {
      const inquiryMap: Record<string, string> = {
        'General Inquiry': 'general',
        'Privacy Concerns': 'privacy',
        'Technical Support': 'technical',
        'Legal Questions': 'legal',
        'Accessibility Issues': 'accessibility',
        'Partnership Opportunities': 'partnership',
        'Billing Questions': 'billing',
        'Media Inquiries': 'media',
      };
      value = inquiryMap[value] || 'general';
    }
    
    // Map frontend urgency values to backend enum values
    if (key === 'urgency') {
      const urgencyMap: Record<string, string> = {
        'Low - General question': 'low',
        'Normal - Standard inquiry': 'normal',
        'High - Need quick response': 'high',
        'Urgent - Immediate attention needed': 'urgent',
      };
      value = urgencyMap[value] || 'normal';
    }
    
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contactPage.form.successTitle')}</h3>
        <p className="text-gray-600 mb-4">
          {t('contactPage.form.successDesc')}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{t('contactPage.form.successExpected')}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contactPage.form.title')}</h3>
        <p className="text-gray-600">
          {t('contactPage.form.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder={t('contactPage.form.namePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder={t('contactPage.form.emailPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.phone')}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder={t('contactPage.form.phonePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.company')}</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder={t('contactPage.form.companyPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.subject')}</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder={t('contactPage.form.subjectPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.inquiryType')}</label>
          <select
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          >
            <option value="">{t('contactPage.form.inquirySelect')}</option>
            <option value="general">{t('contactPage.form.inquiryGeneral')}</option>
            <option value="privacy">{t('contactPage.form.inquiryPrivacy')}</option>
            <option value="technical">{t('contactPage.form.inquiryTech')}</option>
            <option value="legal">{t('contactPage.form.inquiryLegal')}</option>
            <option value="accessibility">{t('contactPage.form.inquiryAccess')}</option>
            <option value="partnership">{t('contactPage.form.inquiryPartner')}</option>
            <option value="billing">{t('contactPage.form.inquiryBilling')}</option>
            <option value="media">{t('contactPage.form.inquiryMedia')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.urgency')}</label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          title="Select urgency level of your inquiry"
        >
          <option value="low">{t('contactPage.form.urgencyLow')}</option>
          <option value="normal">{t('contactPage.form.urgencyNormal')}</option>
          <option value="high">{t('contactPage.form.urgencyHigh')}</option>
          <option value="urgent">{t('contactPage.form.urgencyUrgent')}</option>
        </select>
      </div>

      <div className="space-y-2 mb-8">
        <label className="block text-sm font-semibold text-gray-700">{t('contactPage.form.message')}</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
          placeholder={t('contactPage.form.messagePlaceholder')}
        />
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('contactPage.form.sending')}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Send className="h-5 w-5" />
            {t('contactPage.form.submit')}
          </div>
        )}
      </motion.button>
    </motion.form>
  );
};

// Contact Information Card
const ContactInfoCard = ({ icon: Icon, title, details, color = "blue" }: {
  icon: any;
  title: string;
  details: string[];
  color?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <div className="space-y-2">
            {details.map((detail, index) => (
              <p key={index} className="text-gray-600">{detail}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Office Location Card
const OfficeCard = ({ title, address, phone, email, hours }: {
  title: string;
  address: string;
  phone: string;
  email: string;
  hours: string[];
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-start gap-4 mb-4">
        <Building className="h-8 w-8 text-[var(--color-primary)] flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="space-y-2 text-gray-600 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a href={`tel:${phone}`} className="text-[var(--color-primary)] hover:underline font-medium">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <a href={`mailto:${email}`} className="text-[var(--color-primary)] hover:underline font-medium">
                {email}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Office Hours
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          {hours.map((hour, index) => (
            <div key={index}>{hour}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main Contact Page Component
export function ContactPage() {
  const { t } = useTranslation();
  const departments = [
    {
      icon: Shield,
      department: t('contactPage.departments.privacy.title'),
      email: 'privacy@safehaven.org',
      phone: '+1 (555) 123-0101',
      description: t('contactPage.departments.privacy.desc'),
    },
    {
      icon: FileText,
      department: t('contactPage.departments.legal.title'),
      email: 'legal@safehaven.org',
      phone: '+1 (555) 123-0102',
      description: t('contactPage.departments.legal.desc'),
    },
    {
      icon: Users,
      department: t('contactPage.departments.support.title'),
      email: 'support@safehaven.org',
      phone: '+1 (555) 123-0103',
      description: t('contactPage.departments.support.desc'),
    },
    {
      icon: Globe,
      department: t('contactPage.departments.media.title'),
      email: 'partnerships@safehaven.org',
      phone: '+1 (555) 123-0104',
      description: t('contactPage.departments.media.desc'),
    },
  ];

  const offices = [
    {
      title: 'Main Headquarters',
      address: '123 SafeHaven Plaza, Suite 1000, San Francisco, CA 94105, USA',
      phone: '+1 (555) 123-0000',
      email: 'info@safehaven.org',
      hours: [
        'Monday - Friday: 9:00 AM - 6:00 PM PST',
        'Saturday: 10:00 AM - 4:00 PM PST',
        'Sunday: Closed',
        'Emergency: 24/7',
      ],
    },
    {
      title: 'East Coast Office',
      address: '456 Justice Avenue, Floor 15, New York, NY 10001, USA',
      phone: '+1 (555) 123-0001',
      email: 'east@safehaven.org',
      hours: [
        'Monday - Friday: 9:00 AM - 6:00 PM EST',
        'Saturday: 10:00 AM - 4:00 PM EST',
        'Sunday: Closed',
        'Emergency: 24/7',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.05) 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <MessageSquare className="h-6 w-6 text-[var(--color-primary)]" />
              <span className="text-lg font-semibold text-gray-800">{t('contactPage.hero.badge')}</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t('contactPage.hero.titleStart')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] block">
              {t('contactPage.hero.titleHighlight')}
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {t('contactPage.hero.description')}
          </motion.p>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('contactPage.departments.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contactPage.departments.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {departments.map((dept, index) => (
              <DepartmentCard key={index} {...dept} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('contactPage.form.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contactPage.form.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('contactPage.faq.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contactPage.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: t('contactPage.faq.q1'),
                answer: t('contactPage.faq.a1')
              },
              {
                question: t('contactPage.faq.q2'),
                answer: t('contactPage.faq.a2')
              },
              {
                question: t('contactPage.faq.q3'),
                answer: t('contactPage.faq.a3')
              },
              {
                question: t('contactPage.faq.q4'),
                answer: t('contactPage.faq.a4')
              },
              {
                question: t('contactPage.faq.q5'),
                answer: t('contactPage.faq.a5')
              },
              {
                question: t('contactPage.faq.q6'),
                answer: t('contactPage.faq.a6')
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
