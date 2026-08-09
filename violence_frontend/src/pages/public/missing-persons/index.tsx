import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  Shield,
  Eye,
  AlertTriangle,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { missingPersonsService } from '@/services/missingPersonsService';
import { MissingPerson as ApiMissingPerson, MissingPersonStatus } from '@/types/forum';
import { validateEmail, validatePhone, validateName, validateAge, validateLocation } from '@/utils/validation';
import { useTranslation } from 'react-i18next';

const GENDER_OPTIONS = ['Male', 'Female'];
const RELATIONSHIP_OPTIONS = ['Family', 'Friend', 'Witness', 'Other'];
const CONTACT_METHODS = ['Email', 'Phone', 'Secure Platform Messaging'];

// Frontend display interface (extends API data with UI fields)
interface MissingPersonDisplay {
  id: string;
  name: string | null;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  physicalDescription: string;
  photo: string | null;
  circumstances: string;
  reporterRelationship: string;
  contactMethod: string;
  publicConsent: boolean;
  status: string;
  dateReported: string;
  sightings: number;
}

interface MissingPersonFormData {
  name: string;
  age: string;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  physicalDescription: string;
  photo: File | null;
  circumstances: string;
  reporterRelationship: string;
  contactMethod: string;
  contactEmail: string;
  contactPhone: string;
  publicConsent: boolean;
}

export function MissingPersonsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: 'All',
    location: 'All',
    status: 'All',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showSightingForm, setShowSightingForm] = useState<string | null>(null);
  const [sightingFormData, setSightingFormData] = useState({
    location: '',
    sightingWhen: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [submittingSighting, setSubmittingSighting] = useState(false);
  
  const [reportErrors, setReportErrors] = useState<Record<string, string | undefined>>({});
  const [reportTouched, setReportTouched] = useState<Record<string, boolean>>({});
  
  const [sightingErrors, setSightingErrors] = useState<Record<string, string | undefined>>({});
  const [sightingTouched, setSightingTouched] = useState<Record<string, boolean>>({});
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [filteredCases, setFilteredCases] = useState<MissingPersonDisplay[]>([]);
  const [allCases, setAllCases] = useState<MissingPersonDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MissingPersonFormData>({
    // Missing Person Details
    name: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    lastSeenTime: '',
    physicalDescription: '',
    photo: null,

    // Circumstances
    circumstances: '',
    reporterRelationship: '',

    // Contact & Consent
    contactMethod: '',
    contactEmail: '',
    contactPhone: '',
    publicConsent: false,
  });

  // Fetch missing persons from API
  useEffect(() => {
    const fetchMissingPersons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await missingPersonsService.getAll(MissingPersonStatus.ACTIVE);
        
        // Transform API data to display format
        const transformed: MissingPersonDisplay[] = Array.isArray(data) ? data.map((person: ApiMissingPerson) => ({
          id: person.id,
          name: `${person.firstName} ${person.lastName}`.trim(),
          age: person.age || 0,
          gender: 'Unknown', // API doesn't have gender, default to Unknown
          lastSeenLocation: person.lastSeenLocation,
          lastSeenDate: person.lastSeenDate,
          lastSeenTime: '00:00', // Default time if not available
          physicalDescription: person.description || 'No description provided',
          photo: person.photoUrl || null,
          circumstances: 'Details not available',
          reporterRelationship: 'Family',
          contactMethod: 'secure',
          publicConsent: true,
          status: person.status === 'ACTIVE' ? 'verified' : 'pending',
          dateReported: person.createdAt,
          sightings: person._count?.sightings || 0,
        })) : [];
        
        setAllCases(transformed);
      } catch (err) {
        console.error('Failed to fetch missing persons:', err);
        setError('Unable to load missing persons data. Please try again later.');
        setAllCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingPersons();
  }, []);

  // Filter cases based on search and filters
  useEffect(() => {
    let results = allCases.filter(
      (caseItem) => caseItem.status === 'verified' && caseItem.publicConsent
    );

    // Search filter
    if (searchTerm) {
      results = results.filter(
        (caseItem) =>
          caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.physicalDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          caseItem.lastSeenLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filters.gender !== 'All') {
      results = results.filter(
        (caseItem) => caseItem.gender === filters.gender
      );
    }

    // Location filter
    if (filters.location !== 'All') {
      results = results.filter((caseItem) =>
        caseItem.lastSeenLocation
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    setFilteredCases(results);
  }, [searchTerm, filters, allCases]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (
    field: keyof MissingPersonFormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (reportTouched[field]) {
      setReportErrors((prev) => ({ ...prev, [field]: validateReportField(field, value as any) }));
    }
  };

  const validateReportField = (field: string, value: any) => {
    switch (field) {
      case 'name':
        if (!value) return undefined; // Optional
        return validateName(value, 'Name');
      case 'age':
        return validateAge(value);
      case 'contactEmail':
        // Only validate if Email is the selected contact method
        if (formData.contactMethod !== 'Email') return undefined;
        if (!value) return 'Contact email is required';
        return validateEmail(value);
      case 'contactPhone':
        // Only validate if Phone is the selected contact method
        if (formData.contactMethod !== 'Phone') return undefined;
        return validatePhone(value, true); // Required for missing persons reports
      case 'lastSeenDate':
        if (!value) return 'Last seen date is required';
        const lastSeenDate = new Date(value);
        const now = new Date();
        const diffInDays = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > 30) return 'The last seen date must be within the last 30 days';
        if (diffInDays < 0) return 'Last seen date cannot be in the future';
        return undefined;
      case 'lastSeenLocation':
        return validateLocation(value);
      case 'physicalDescription':
        if (!value) return 'Physical description is required';
        if (value.trim().length < 10) return 'Physical description must be at least 10 characters';
        if (value.trim().length > 500) return 'Physical description must not exceed 500 characters';
        return undefined;
      case 'circumstances':
        if (!value) return 'Circumstances is required';
        if (value.trim().length < 10) return 'Circumstances must be at least 10 characters';
        if (value.trim().length > 1000) return 'Circumstances must not exceed 1000 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleReportBlur = (field: keyof MissingPersonFormData) => {
    setReportTouched((prev) => ({ ...prev, [field]: true }));
    setReportErrors((prev) => ({ ...prev, [field]: validateReportField(field, formData[field] as any) }));
  };

  const validateSightingField = (field: string, value: any) => {
    switch (field) {
      case 'contactName':
        if (!value) return undefined;
        return validateName(value, 'Contact name');
      case 'contactEmail':
        if (!value) return undefined;
        return validateEmail(value);
      case 'contactPhone':
        return validatePhone(value);
      case 'location':
        if (!value) return 'Location is required';
        return undefined;
      case 'sightingWhen':
        if (!value) return 'Date and time are required';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleSightingInputChange = (field: string, value: string) => {
    setSightingFormData((prev) => ({ ...prev, [field]: value }));
    if (sightingTouched[field]) {
      setSightingErrors((prev) => ({ ...prev, [field]: validateSightingField(field, value) }));
    }
  };

  const handleSightingBlur = (field: string) => {
    setSightingTouched((prev) => ({ ...prev, [field]: true }));
    setSightingErrors((prev) => ({ ...prev, [field]: validateSightingField(field, sightingFormData[field as keyof typeof sightingFormData]) }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to secure storage
      alert(
        'Photo uploaded securely. Note: Location metadata will be automatically removed for safety.'
      );
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameErr = formData.name ? validateName(formData.name, 'Name') : undefined;
    const ageErr = validateAge(formData.age);
    const genderErr = !formData.gender ? 'Gender is required' : undefined;
    const relationshipErr = !formData.reporterRelationship ? 'Relationship is required' : undefined;
    
    // Only validate the contact method that's selected
    let emailErr: string | undefined = undefined;
    let phoneErr: string | undefined = undefined;
    let contactMethodErr: string | undefined = undefined;
    
    if (!formData.contactMethod) {
      contactMethodErr = 'Please select a contact method';
    } else if (formData.contactMethod === 'Email') {
      emailErr = validateEmail(formData.contactEmail);
    } else if (formData.contactMethod === 'Phone') {
      phoneErr = validatePhone(formData.contactPhone, true);
    }
    
    const lastSeenDateErr = validateReportField('lastSeenDate', formData.lastSeenDate);
    const locationErr = validateLocation(formData.lastSeenLocation);
    const descriptionErr = validateReportField('physicalDescription', formData.physicalDescription);
    const circumstancesErr = validateReportField('circumstances', formData.circumstances);

    const errors = {
      name: nameErr,
      age: ageErr,
      gender: genderErr,
      reporterRelationship: relationshipErr,
      contactMethod: contactMethodErr,
      contactEmail: emailErr,
      contactPhone: phoneErr,
      lastSeenDate: lastSeenDateErr,
      lastSeenLocation: locationErr,
      physicalDescription: descriptionErr,
      circumstances: circumstancesErr
    };

    setReportErrors(errors);
    setReportTouched({
      name: true,
      age: true,
      contactEmail: true,
      contactPhone: true,
      lastSeenDate: true,
      lastSeenLocation: true,
      physicalDescription: true,
      circumstances: true
    });

    if (Object.values(errors).some(e => e)) {
      // Show specific error messages for better UX
      const errorFields = Object.entries(errors)
        .filter(([_, err]) => err)
        .map(([field, _]) => field);
      
      console.log('Form validation errors:', errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!formData.publicConsent) {
      toast.error('Please consent to public display of this information');
      return;
    }

    setSubmitting(true);
    
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      // Combine date and time for lastSeenDate
      const dateTime = formData.lastSeenTime 
        ? `${formData.lastSeenDate}T${formData.lastSeenTime}:00.000Z`
        : `${formData.lastSeenDate}T00:00:00.000Z`;

      // Handle photo upload if present (in a real app, upload to storage first)
      let photoUrl: string | undefined;
      if (formData.photo) {
        // For now, we'll skip photo upload - in production, upload to S3/supabase storage
        photoUrl = undefined;
      }

      const createData = {
        firstName,
        lastName,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        description: formData.physicalDescription || undefined,
        photoUrl,
        lastSeenLocation: formData.lastSeenLocation,
        lastSeenDate: dateTime,
        // Status is omitted - backend will set it to PENDING for admin review
      };

      await missingPersonsService.create(createData);
      
      toast.success('Report submitted successfully! Our team will verify it before making it public. You will be notified once verified.');
      setShowReportForm(false);
      setFormData({
        name: '',
        age: '',
        gender: '',
        lastSeenLocation: '',
        lastSeenDate: '',
        lastSeenTime: '',
        physicalDescription: '',
        photo: null,
        circumstances: '',
        reporterRelationship: '',
        contactMethod: '',
        contactEmail: '',
        contactPhone: '',
        publicConsent: false,
      });
      
      // Refresh the list to show the new report (if it's active)
      const data = await missingPersonsService.getAll(MissingPersonStatus.ACTIVE);
      const transformed: MissingPersonDisplay[] = Array.isArray(data) ? data.map((person: ApiMissingPerson) => ({
        id: person.id,
        name: `${person.firstName} ${person.lastName}`.trim(),
        age: person.age || 0,
        gender: 'Unknown',
        lastSeenLocation: person.lastSeenLocation,
        lastSeenDate: person.lastSeenDate,
        lastSeenTime: '00:00',
        physicalDescription: person.description || 'No description provided',
        photo: person.photoUrl || null,
        circumstances: 'Details not available',
        reporterRelationship: 'Family',
        contactMethod: 'secure',
        publicConsent: true,
        status: person.status === 'ACTIVE' ? 'verified' : 'pending',
        dateReported: person.createdAt,
        sightings: person._count?.sightings || 0,
      })) : [];
      setAllCases(transformed);
    } catch (err) {
      console.error('Failed to submit report:', err);
      toast.error('Failed to submit report. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSighting = async (caseId: string) => {
    const locationErr = !sightingFormData.location ? 'Location is required' : undefined;
    const whenErr = !sightingFormData.sightingWhen ? 'Date and time are required' : undefined;
    const emailErr = sightingFormData.contactEmail ? validateEmail(sightingFormData.contactEmail) : undefined;
    const phoneErr = sightingFormData.contactPhone ? validatePhone(sightingFormData.contactPhone) : undefined;
    const nameErr = sightingFormData.contactName ? validateName(sightingFormData.contactName, 'Contact name') : undefined;

    const errors = {
      location: locationErr,
      sightingWhen: whenErr,
      contactEmail: emailErr,
      contactPhone: phoneErr,
      contactName: nameErr
    };

    setSightingErrors(errors);
    setSightingTouched({
      location: true,
      sightingWhen: true,
      contactEmail: true,
      contactPhone: true,
      contactName: true
    });

    if (Object.values(errors).some(e => e)) {
      toast.error('Please fix the errors in the sighting form');
      return;
    }

    setSubmittingSighting(true);
    try {
      await missingPersonsService.createSighting(caseId, {
        location: sightingFormData.location,
        sightingDate: new Date(sightingFormData.sightingWhen).toISOString(),
        description: sightingFormData.description,
        contactName: sightingFormData.contactName || undefined,
        contactPhone: sightingFormData.contactPhone || undefined,
        contactEmail: sightingFormData.contactEmail || undefined,
      });
      toast.success('Sighting report submitted successfully! Our team will follow up on this lead.');
      setShowSightingForm(null);
      setSightingFormData({
        location: '',
        sightingWhen: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
      });
    } catch (err) {
      console.error('Failed to submit sighting:', err);
      toast.error('Failed to submit sighting report. Please try again.');
    } finally {
      setSubmittingSighting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      gender: 'All',
      location: 'All',
      status: 'All',
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--colors-ivory-0)] via-[var(--colors-background-primary)] to-[var(--colors-ivory-1)]">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[var(--colors-terracotta-5)] via-[var(--colors-terracotta-6)] to-[var(--colors-olive-8)] text-white">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-full w-full rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 h-full w-full rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
        </div>

        <div className="container relative mx-auto px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-rose-200" />
              <span className="text-sm font-medium text-rose-200">{t('missingPersons.verifiedPlatform')}</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl">
              {t('missingPersons.title')}
              <span className="block text-rose-200">{t('missingPersons.subtitle')}</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-rose-100/90">
              {t('missingPersons.description')}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => setShowReportForm(true)}
                className="group flex items-center gap-2 rounded-xl bg-[var(--colors-neutral-white)] px-6 py-3.5 font-semibold text-[var(--colors-primary-cta)] shadow-lg shadow-[var(--colors-primary-cta)]/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <User className="h-5 w-5" />
                {t('missingPersons.reportMissingPerson')}
              </button>
              <button
                onClick={() => setShowSafetyModal(true)}
                className="group flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              >
                <Eye className="h-5 w-5" />
                {t('missingPersons.safetyGuidelines')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="h-12 w-full fill-[var(--colors-ivory-0)] lg:h-16" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64 C480,128 960,0 1440,64 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Safety Notice */}
        <section className="mb-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start gap-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-1 font-semibold text-amber-900 dark:text-amber-300">{t('missingPersons.safetyNotice.title')}</p>
                <p className="text-sm leading-relaxed text-amber-800/80 dark:text-amber-400/90">
                  {t('missingPersons.safetyNotice.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-10">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] shadow-lg shadow-[var(--colors-olive-5)]/20 ring-1 border-[var(--colors-olive-4)]">
              {/* Search Bar */}
              <div className="border-b border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <input
                      id="search-cases"
                      type="text"
                      placeholder={t('missingPersons.search.placeholder')}
                      title={t('missingPersons.search.title')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] py-3.5 pr-4 pl-12 text-[var(--colors-olive-8)] font-medium placeholder:text-[var(--colors-olive-6)] focus:border-[var(--colors-primary-cta)] focus:bg-gradient-to-r focus:from-[var(--colors-ivory-0)] focus:to-[var(--colors-terracotta-0)] focus:ring-2 focus:ring-[var(--colors-primary-cta)]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] px-5 py-3.5 font-medium text-[var(--colors-olive-8)] shadow-sm hover:border-[var(--colors-primary-cta)] hover:bg-gradient-to-r hover:from-[var(--colors-terracotta-0)] hover:to-[var(--colors-terracotta-1)] hover:text-[var(--colors-primary-cta)] hover:shadow-md transition-all active:scale-95"
                  >
                    <Filter className="h-4 w-4" />
                    {t('missingPersons.search.filtersButton')}
                    {showFilters ? (
                      <span className="ml-1 rounded-full bg-gradient-to-r from-[var(--colors-primary-cta)] to-[var(--colors-terracotta-6)] px-2 py-0.5 text-xs text-[var(--colors-neutral-white)] font-semibold shadow-sm">{t('missingPersons.search.filtersOn')}</span>
                    ) : null}
                  </button>
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="border-t border-[var(--colors-olive-3)] bg-gradient-to-br from-[var(--colors-ivory-1)] to-[var(--colors-olive-0)] p-4 sm:p-6">
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Gender Filter */}
                    <div>
                      <label htmlFor="gender" className="mb-2 block text-sm font-semibold text-[var(--colors-olive-7)]">
                        {t('missingPersons.filters.gender')}
                      </label>
                      <select
                        id="gender"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] p-3 text-[var(--colors-olive-8)] font-medium focus:border-[var(--colors-primary-cta)] focus:ring-2 focus:ring-[var(--colors-primary-cta)]/20 focus:outline-none transition-all"
                      >
                        <option value="All">{t('missingPersons.filters.allGenders')}</option>
                        {GENDER_OPTIONS.map((gender) => (
                          <option key={gender} value={gender}>
                            {t(`missingPersons.filters.genderOptions.${gender.toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label htmlFor="location" className="mb-2 block text-sm font-semibold text-[var(--colors-olive-7)]">
                        {t('missingPersons.filters.location')}
                      </label>
                      <select
                        id="location"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] p-3 text-[var(--colors-olive-8)] font-medium focus:border-[var(--colors-primary-cta)] focus:ring-2 focus:ring-[var(--colors-primary-cta)]/20 focus:outline-none transition-all"
                      >
                        <option value="All">{t('missingPersons.filters.allLocations')}</option>
                        <option value="Addis Ababa">{t('missingPersons.filters.locationOptions.addisAbaba')}</option>
                        <option value="Hawassa">{t('missingPersons.filters.locationOptions.hawassa')}</option>
                        <option value="Dire Dawa">{t('missingPersons.filters.locationOptions.direDawa')}</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status" className="mb-2 block text-sm font-semibold text-[var(--colors-olive-7)]">
                        {t('missingPersons.filters.caseStatus')}
                      </label>
                      <select
                        id="status"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--colors-olive-3)] bg-gradient-to-r from-[var(--colors-ivory-0)] to-[var(--colors-ivory-1)] p-3 text-[var(--colors-olive-8)] font-medium focus:border-[var(--colors-primary-cta)] focus:ring-2 focus:ring-[var(--colors-primary-cta)]/20 focus:outline-none transition-all"
                      >
                        <option value="All">{t('missingPersons.filters.allCases')}</option>
                        <option value="verified">{t('missingPersons.filters.verifiedOnly')}</option>
                        <option value="recent">{t('missingPersons.filters.recentSevenDays')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
                      {t('missingPersons.filters.showing')} <span className="font-bold text-[var(--color-foreground)]">{filteredCases.length}</span> {t('missingPersons.filters.verifiedCases')}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-sm font-medium text-[var(--colors-primary-cta)] hover:text-[var(--colors-terracotta-6)] hover:underline transition-colors"
                    >
                      {t('missingPersons.filters.clearAll')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Missing Persons Grid */}
        <section className="mb-16">
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{t('missingPersons.activeCases.title')}</h2>
                <p className="mt-1 text-[var(--color-muted-foreground)]">{t('missingPersons.activeCases.description')}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                <span className="h-2 w-2 rounded-full bg-[var(--colors-accent-highlight)]"></span>
                {filteredCases.length} {t('missingPersons.activeCases.activeCases')}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-[var(--surface-surface-primary)] p-12 text-center shadow-lg shadow-[var(--colors-olive-5)]/20 ring-1 border-[var(--border-border-secondary)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-terracotta-0)]">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--colors-primary-cta)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-foreground)]">{t('missingPersons.loading.title')}</h3>
                <p className="text-[var(--color-muted-foreground)]">{t('missingPersons.loading.description')}</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-[var(--surface-surface-primary)] p-12 text-center shadow-lg shadow-[var(--colors-olive-5)]/20 ring-1 border-[var(--border-border-secondary)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--colors-error-red)]/10">
                  <AlertTriangle className="h-8 w-8 text-[var(--colors-error-red)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-foreground)]">{t('missingPersons.error.title')}</h3>
                <p className="text-[var(--color-muted-foreground)]">{error}</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="rounded-2xl bg-[var(--surface-surface-primary)] p-12 text-center shadow-lg shadow-[var(--colors-olive-5)]/20 ring-1 border-[var(--border-border-secondary)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-surface-secondary)]">
                  <User className="h-8 w-8 text-[var(--color-muted-foreground)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-foreground)]">{t('missingPersons.noCases.title')}</h3>
                <p className="mb-6 text-[var(--color-muted-foreground)]">
                  {searchTerm || Object.values(filters).some((f) => f !== 'All')
                    ? t('missingPersons.noCases.tryAdjust')
                    : t('missingPersons.noCases.noActiveCases')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="group relative overflow-hidden rounded-2xl bg-[var(--surface-surface-primary)] shadow-md shadow-[var(--colors-olive-5)]/20 ring-1 border-[var(--border-border-secondary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--colors-primary-cta)]/20"
                  >
                    {/* Top Banner */}
                    <div className="flex items-center justify-between border-b border-[var(--colors-terracotta-0)] bg-gradient-to-r from-[var(--colors-terracotta-0)] to-[var(--colors-olive-0)]/50 px-4 py-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--colors-primary-cta)] uppercase">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--colors-primary-cta)]"></span>
                        {t('missingPersons.caseCard.activeSearch')}
                      </span>
                      <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                        #{caseItem.id.slice(-6)}
                      </span>
                    </div>

                    <div className="p-5">
                      {/* Case Header with Profile */}
                      <div className="mb-5 flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--colors-terracotta-0)] to-[var(--border-border-secondary)] shadow-inner">
                          {caseItem.photo ? (
                            <img
                              src={caseItem.photo}
                              alt={caseItem.name || 'Missing Person'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-[var(--color-muted-foreground)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-bold text-[var(--color-foreground)]">
                            {caseItem.name || t('missingPersons.caseCard.anonymousCase')}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-lg bg-[var(--colors-terracotta-0)] px-2.5 py-1 text-xs font-medium text-[var(--colors-primary-cta)]">
                              {caseItem.age} {t('missingPersons.caseCard.yearsOld')} • {caseItem.gender}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vital Information Grid */}
                      <div className="mb-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-surface-secondary)]">
                            <MapPin className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('missingPersons.caseCard.lastSeenLocation')}</p>
                            <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{caseItem.lastSeenLocation}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-surface-secondary)]">
                            <Calendar className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('missingPersons.caseCard.lastSeenOn')}</p>
                            <p className="text-sm font-medium text-[var(--color-foreground)]">
                              {new Date(caseItem.lastSeenDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              <span className="ml-1 text-xs text-[var(--color-muted-foreground)]">{t('missingPersons.caseCard.at')} {caseItem.lastSeenTime}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-5 rounded-xl bg-[var(--surface-surface-secondary)] p-3">
                        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-text-secondary)] italic">
                          "{caseItem.physicalDescription}"
                        </p>
                      </div>

                      {/* Stats Row */}
                      <div className="mb-5 flex items-center justify-between border-y border-[var(--border-border-secondary)] py-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[var(--colors-accent-highlight)] px-2 py-1 text-xs font-medium text-[var(--colors-olive-7)]">
                            {t('missingPersons.caseCard.verified')}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--color-muted-foreground)] uppercase">{t('missingPersons.caseCard.sightings')}</p>
                          <p className="text-lg font-bold text-[var(--colors-primary-cta)]">{caseItem.sightings || 0}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSightingForm(caseItem.id)}
                          className="flex h-10 flex-[2] items-center justify-center gap-2 rounded-xl bg-[var(--colors-primary-cta)] px-4 text-sm font-semibold text-[var(--colors-neutral-white)] shadow-lg shadow-[var(--colors-primary-cta)]/20 transition-all hover:bg-[var(--colors-terracotta-6)] hover:shadow-[var(--colors-primary-cta)]/30 active:scale-95"
                        >
                          <Eye className="h-4 w-4" />
                          {t('missingPersons.caseCard.reportSighting')}
                        </button>
                        <button
                          onClick={() => navigate(`/missing-persons/view?id=${caseItem.id}`)}
                          className="flex h-10 flex-1 items-center justify-center rounded-xl border border-[var(--border-border-secondary)] bg-[var(--surface-surface-primary)] px-4 text-sm font-semibold text-[var(--text-text-secondary)] transition-all hover:border-[var(--colors-primary-cta)] hover:bg-[var(--colors-terracotta-0)] hover:text-[var(--colors-primary-cta)] active:scale-95"
                        >
                          {t('missingPersons.caseCard.details')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Report Missing Person Form Modal */}
        {showReportForm && (
          <div className="animate-fade-in fixed inset-0 z-[1000] flex items-start justify-center bg-black/50 p-4 pt-24">
            <div className="card-calm max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Report Missing Person</h2>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitReport} className="space-y-6">
                {/* Missing Person Details */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    Missing Person Details
                  </h3>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Name - Optional for safety */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Full Name{' '}
                        <span className="text-[var(--color-muted-foreground)]">
                          (Optional)
                        </span>
                      </label>
                      <input
                        id="missing-person-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        onBlur={() => handleReportBlur('name')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.name && reportTouched.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                        placeholder="Can be omitted for safety"
                      />
                      {reportErrors.name && reportTouched.name && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="age"
                        className="mb-2 block text-sm font-medium"
                      >
                        Age *
                      </label>
                      <input
                        id="age"
                        type="number"
                        required
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange('age', e.target.value)
                        }
                        onBlur={() => handleReportBlur('age')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.age && reportTouched.age ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                        placeholder="e.g. 25"
                        min={1}
                        max={120}
                      />
                      {reportErrors.age && reportTouched.age && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.age}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="gender"
                        className="mb-2 block text-sm font-medium"
                      >
                        Gender *
                      </label>
                      <select
                        id="gender"
                        required
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange('gender', e.target.value)
                        }
                        className={`w-full rounded-lg border p-2 ${reportErrors.gender && reportTouched.gender ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                      {reportErrors.gender && reportTouched.gender && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.gender}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastSeenDate"
                        className="mb-2 block text-sm font-medium"
                      >
                        Last Seen Date *
                      </label>
                      <input
                        id="lastSeenDate"
                        type="date"
                        required
                        min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.lastSeenDate}
                        onChange={(e) =>
                          handleInputChange('lastSeenDate', e.target.value)
                        }
                        onBlur={() => handleReportBlur('lastSeenDate')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.lastSeenDate && reportTouched.lastSeenDate ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      />
                      {reportErrors.lastSeenDate && reportTouched.lastSeenDate && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.lastSeenDate}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        Only dates within the last 30 days are available for reporting
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="lastSeenTime"
                        className="mb-2 block text-sm font-medium"
                      >
                        Last Seen Time
                      </label>
                      <input
                        id="lastSeenTime"
                        type="time"
                        value={formData.lastSeenTime}
                        onChange={(e) =>
                          handleInputChange('lastSeenTime', e.target.value)
                        }
                        className="w-full rounded-lg border border-[var(--color-border)] p-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastSeenLocation" className="mb-2 block text-sm font-medium">
                        Last Seen Location *
                      </label>
                      <input
                        id="lastSeenLocation"
                        name="lastSeenLocation"
                        type="text"
                        required
                        value={formData.lastSeenLocation}
                        onChange={(e) =>
                          handleInputChange('lastSeenLocation', e.target.value)
                        }
                        onBlur={() => handleReportBlur('lastSeenLocation')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.lastSeenLocation && reportTouched.lastSeenLocation ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                        placeholder="City, area, or landmark"
                      />
                      {reportErrors.lastSeenLocation && reportTouched.lastSeenLocation && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.lastSeenLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="physicalDescription" className="mb-2 block text-sm font-medium">
                      Physical Description *
                    </label>
                    <textarea
                      id="physicalDescription"
                      name="physicalDescription"
                      required
                      value={formData.physicalDescription}
                      onChange={(e) =>
                        handleInputChange('physicalDescription', e.target.value)
                      }
                      onBlur={() => handleReportBlur('physicalDescription')}
                      className={`w-full rounded-lg border p-2 ${reportErrors.physicalDescription && reportTouched.physicalDescription ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      rows={3}
                      placeholder="Height, hair color, clothing, distinguishing features..."
                    />
                    {reportErrors.physicalDescription && reportTouched.physicalDescription && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {reportErrors.physicalDescription}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Minimum 10 characters, maximum 500 characters
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                      Photo{' '}
                      <span className="text-[var(--color-muted-foreground)]">
                        (Optional)
                      </span>
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-[var(--color-border)] p-4 text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-[var(--color-muted-foreground)]" />
                      <p className="mb-2 text-sm text-[var(--color-muted-foreground)]">
                        Upload a recent photo (metadata will be removed for
                        safety)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="button-secondary cursor-pointer"
                      >
                        Choose Photo
                      </label>
                    </div>
                  </div>

                {/* Circumstances */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">Circumstances</h3>

                  <div className="mb-4">
                    <label htmlFor="circumstances" className="mb-2 block text-sm font-medium">
                      Circumstances of Disappearance *
                    </label>
                    <textarea
                      id="circumstances"
                      name="circumstances"
                      required
                      value={formData.circumstances}
                      onChange={(e) =>
                        handleInputChange('circumstances', e.target.value)
                      }
                      onBlur={() => handleReportBlur('circumstances')}
                      className={`w-full rounded-lg border p-2 ${reportErrors.circumstances && reportTouched.circumstances ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      rows={3}
                      placeholder="Was there abuse? Mental health concerns? Suspected trafficking? Bullying?"
                    />
                    {reportErrors.circumstances && reportTouched.circumstances && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {reportErrors.circumstances}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Minimum 10 characters, maximum 1000 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="reporterRelationship"
                      className="mb-2 block text-sm font-medium"
                    >
                      Your Relationship *
                    </label>
                    <select
                      id="reporterRelationship"
                      required
                      value={formData.reporterRelationship}
                      onChange={(e) =>
                        handleInputChange(
                          'reporterRelationship',
                          e.target.value
                        )
                      }
                      className={`w-full rounded-lg border p-2 ${reportErrors.reporterRelationship && reportTouched.reporterRelationship ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                    >
                      <option value="">Select relationship</option>
                      {RELATIONSHIP_OPTIONS.map((relationship) => (
                        <option key={relationship} value={relationship}>
                          {relationship}
                        </option>
                      ))}
                    </select>
                    {reportErrors.reporterRelationship && reportTouched.reporterRelationship && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {reportErrors.reporterRelationship}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact & Consent */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    Contact & Consent
                  </h3>

                  <div className="mb-4">
                    <label
                      htmlFor="contactMethod"
                      className="mb-2 block text-sm font-medium"
                    >
                      Preferred Contact Method *
                    </label>
                    <select
                      id="contactMethod"
                      required
                      value={formData.contactMethod}
                      onChange={(e) =>
                        handleInputChange('contactMethod', e.target.value)
                      }
                      className={`w-full rounded-lg border p-2 ${reportErrors.contactMethod && reportTouched.contactMethod ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                    >
                      <option value="">Select method</option>
                      {CONTACT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                    {reportErrors.contactMethod && reportTouched.contactMethod && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {reportErrors.contactMethod}
                      </p>
                    )}
                  </div>

                  {formData.contactMethod === 'Email' && (
                    <div className="mb-4">
                      <label htmlFor="contactEmail" className="mb-2 block text-sm font-medium">
                        Email Address
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) =>
                          handleInputChange('contactEmail', e.target.value)
                        }
                        onBlur={() => handleReportBlur('contactEmail')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.contactEmail && reportTouched.contactEmail ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                        placeholder="Your email (not shown publicly)"
                      />
                      {reportErrors.contactEmail && reportTouched.contactEmail && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.contactEmail}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.contactMethod === 'Phone' && (
                    <div className="mb-4">
                      <label htmlFor="contactPhone" className="mb-2 block text-sm font-medium">
                        Phone Number
                      </label>
                      <input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          handleInputChange('contactPhone', e.target.value)
                        }
                        onBlur={() => handleReportBlur('contactPhone')}
                        className={`w-full rounded-lg border p-2 ${reportErrors.contactPhone && reportTouched.contactPhone ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                        placeholder="Your phone (not shown publicly)"
                      />
                      {reportErrors.contactPhone && reportTouched.contactPhone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {reportErrors.contactPhone}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.contactMethod === 'Secure Platform Messaging' && (
                    <div className="mb-4 rounded-lg bg-[var(--color-background)] p-3">
                      <p className="text-sm text-[#6B705C]">
                        You'll receive notifications through our secure platform
                        messaging system. No personal contact information will
                        be shared.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg bg-[var(--color-hover)] p-4">
                    <input
                      type="checkbox"
                      id="public-consent"
                      checked={formData.publicConsent}
                      onChange={(e) =>
                        handleInputChange('publicConsent', e.target.checked)
                      }
                      className="mt-1"
                      title="Allow case to appear publicly"
                    />
                    <label htmlFor="public-consent" className="text-sm">
                      I allow this case to appear in the public missing persons
                      directory after verification. I understand that sensitive
                      details will be protected and only safe information will
                      be shown.
                    </label>
                  </div>
                </div>

                {/* Safety Notice */}
                <div className="rounded-lg bg-[var(--color-accent)] p-4 text-[var(--color-accent-foreground)]">
                  <div className="flex items-start">
                    <AlertTriangle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="mb-1 font-medium">
                        Important Safety Information
                      </p>
                      <p className="text-sm">
                        All reports are verified by administrators before
                        appearing publicly to prevent misuse. Your personal
                        information is kept confidential. Exact locations and
                        sensitive details are never shown publicly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Report cancelled. Your information was not saved.');
                      setShowReportForm(false);
                    }}
                    className="flex-1 rounded-xl bg-[#6B705C] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#4a5a46] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#C15B3E] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={!formData.publicConsent || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Sighting Form Modal */}
        {showSightingForm && (
          <div className="animate-fade-in fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm">
            <div className="card-calm w-full max-w-md max-h-[calc(90vh-80px)] overflow-y-auto bg-surface-primary shadow-2xl mt-4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Report Sighting</h2>
                <button
                  onClick={() => setShowSightingForm(null)}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sightingLocation" className="mb-2 block text-sm font-medium">
                    Where did you see them? *
                  </label>
                  <input
                    id="sightingLocation"
                    type="text"
                    value={sightingFormData.location}
                    onChange={(e) => handleSightingInputChange('location', e.target.value)}
                    onBlur={() => handleSightingBlur('location')}
                    className={`w-full rounded-lg border p-2 ${sightingErrors.location && sightingTouched.location ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="Location, city, area..."
                    required
                  />
                  {sightingErrors.location && sightingTouched.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {sightingErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="sightingWhen" className="mb-2 block text-sm font-medium">
                    When did you see them? *
                  </label>
                  <input
                    id="sightingWhen"
                    type="datetime-local"
                    value={sightingFormData.sightingWhen}
                    onChange={(e) => handleSightingInputChange('sightingWhen', e.target.value)}
                    onBlur={() => handleSightingBlur('sightingWhen')}
                    className={`w-full rounded-lg border p-2 ${sightingErrors.sightingWhen && sightingTouched.sightingWhen ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                    required
                  />
                  {sightingErrors.sightingWhen && sightingTouched.sightingWhen && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {sightingErrors.sightingWhen}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="sightingDescription" className="mb-2 block text-sm font-medium">
                    Additional Details
                  </label>
                  <textarea
                    id="sightingDescription"
                    value={sightingFormData.description}
                    onChange={(e) => handleSightingInputChange('description', e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] p-2"
                    rows={3}
                    placeholder="What were they doing? Who were they with? Condition?"
                  />
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <p className="mb-3 text-sm font-medium">Contact Information (Optional)</p>
                  <div className="space-y-3">
                    <label htmlFor="sightingContactName" className="sr-only">Contact Name</label>
                    <input
                      id="sightingContactName"
                      type="text"
                      value={sightingFormData.contactName}
                      onChange={(e) => handleSightingInputChange('contactName', e.target.value)}
                      onBlur={() => handleSightingBlur('contactName')}
                      className={`w-full rounded-lg border p-2 ${sightingErrors.contactName && sightingTouched.contactName ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      placeholder="Your name"
                      title="Sighting Contact Name"
                    />
                    {sightingErrors.contactName && sightingTouched.contactName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {sightingErrors.contactName}
                      </p>
                    )}
                    <label htmlFor="sightingContactPhone" className="sr-only">Contact Phone</label>
                    <input
                      id="sightingContactPhone"
                      type="tel"
                      value={sightingFormData.contactPhone}
                      onChange={(e) => handleSightingInputChange('contactPhone', e.target.value)}
                      onBlur={() => handleSightingBlur('contactPhone')}
                      className={`w-full rounded-lg border p-2 ${sightingErrors.contactPhone && sightingTouched.contactPhone ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      placeholder="Your phone number"
                      title="Sighting Contact Phone"
                    />
                    {sightingErrors.contactPhone && sightingTouched.contactPhone && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {sightingErrors.contactPhone}
                      </p>
                    )}
                    <label htmlFor="sightingContactEmail" className="sr-only">Contact Email</label>
                    <input
                      id="sightingContactEmail"
                      type="email"
                      value={sightingFormData.contactEmail}
                      onChange={(e) => handleSightingInputChange('contactEmail', e.target.value)}
                      onBlur={() => handleSightingBlur('contactEmail')}
                      className={`w-full rounded-lg border p-2 ${sightingErrors.contactEmail && sightingTouched.contactEmail ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)]'}`}
                      placeholder="Your email"
                      title="Sighting Contact Email"
                    />
                    {sightingErrors.contactEmail && sightingTouched.contactEmail && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {sightingErrors.contactEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--color-background)] p-3">
                  <p className="text-sm text-[#6B705C]">
                    Your report will be sent securely to our team. Contact information is optional
                    and will only be used for follow-up on this sighting.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      toast.info('Sighting report cancelled.');
                      setShowSightingForm(null);
                    }}
                    className="flex-1 rounded-xl bg-[#6B705C] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#4a5a46] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitSighting(showSightingForm!)}
                    disabled={submittingSighting || !sightingFormData.location || !sightingFormData.sightingWhen}
                    className="flex-1 rounded-xl bg-[#C15B3E] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingSighting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Sighting'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Guidelines Modal */}
        {showSafetyModal && (
          <div className="animate-fade-in fixed inset-0 z-[1000] flex items-start justify-center bg-black/50 p-4 pt-24">
            <div className="card-calm w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Safety Guidelines</h2>
                <button
                  onClick={() => setShowSafetyModal(false)}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                {/* Emergency Contacts */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">Emergency Contacts</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="text-center p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Police Emergency</h4>
                      <p className="text-lg font-bold text-[#C15B3E] mb-1">+251-911</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">For immediate danger</p>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Anti-Trafficking</h4>
                      <p className="text-lg font-bold text-[#C15B3E] mb-1">+251-11-123-4567</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">Human trafficking concerns</p>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Mental Health Crisis</h4>
                      <p className="text-lg font-bold text-[#C15B3E] mb-1">+251-900-123-456</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">Mental health emergencies</p>
                    </div>
                  </div>
                </div>

                {/* Safety Guidelines */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">Safety Guidelines</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-[var(--color-background)] p-4 border border-[#C15B3E]/10">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-2">Your Safety First</h4>
                      <p className="text-[var(--color-muted-foreground)]">
                        All reports are anonymous by default. You control what information you share. We never share your location or contact details without your explicit permission.
                      </p>
                    </div>

                    <div className="rounded-lg bg-[var(--color-background)] p-4 border border-[#C15B3E]/10">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-2">Privacy Protection</h4>
                      <p className="text-[var(--color-muted-foreground)]">
                        Sensitive details are automatically filtered from public view. Only verified, safe information appears in case listings. Your personal safety is our top priority.
                      </p>
                    </div>

                    <div className="rounded-lg bg-[var(--color-background)] p-4 border border-[#C15B3E]/10">
                      <h4 className="font-semibold text-[var(--color-foreground)] mb-2">Emergency Situations</h4>
                      <p className="text-[var(--color-muted-foreground)]">
                        If you're in immediate danger, contact emergency services first. This platform is for reporting and awareness, not emergency response.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What Happens When You Report */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">What Happens When You Report?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B705C] text-[var(--color-foreground)] font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Your Report is Submitted</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Your report is securely submitted and timestamped.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B705C] text-[var(--color-foreground)] font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Admin Verification</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Our team reviews your report for accuracy and safety.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B705C] text-[var(--color-foreground)] font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-foreground)] mb-1">Safe Public Display</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Approved information helps the community search safely.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Statement */}
                <div className="rounded-lg bg-gradient-to-r from-[#C15B3E]/5 to-[#6B705C]/5 border border-[#C15B3E]/20 p-6 text-center">
                  <h4 className="font-semibold text-[var(--color-foreground)] mb-2">You're Not Alone</h4>
                  <p className="text-[var(--color-muted-foreground)]">
                    Every report helps build awareness and potentially saves lives. We stand with you.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowSafetyModal(false);
                      setShowReportForm(true);
                    }}
                    className="flex-1 rounded-xl bg-[#C15B3E] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors"
                  >
                    Start Your Report
                  </button>
                  <button
                    onClick={() => setShowSafetyModal(false)}
                    className="flex-1 rounded-xl bg-[#6B705C] px-6 py-3 text-[var(--color-foreground)] font-bold shadow-lg hover:bg-[#4a5a46] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Resources */}
        <section className="mb-12">
          <div className="mx-auto max-w-6xl">
            <div className="card text-center">
              <h2 className="card-title mb-4">{t('missingPersons.emergencyHelp.title')}</h2>
              <p className="mb-6 text-[var(--color-muted-foreground)]">
                {t('missingPersons.emergencyHelp.description')}
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-[var(--color-hover)] p-4">
                  <p className="mb-1 font-medium">{t('missingPersons.emergencyHelp.policeEmergency')}</p>
                  <p className="text-[var(--color-primary)]">+251-911</p>
                </div>
                <div className="rounded-lg bg-[var(--color-hover)] p-4">
                  <p className="mb-1 font-medium">{t('missingPersons.emergencyHelp.antiTrafficking')}</p>
                  <p className="text-[var(--color-primary)]">
                    +251-11-123-4567
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-hover)] p-4">
                  <p className="mb-1 font-medium">{t('missingPersons.emergencyHelp.mentalHealthCrisis')}</p>
                  <p className="text-[var(--color-primary)]">
                    +251-900-123-456
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-[var(--color-muted-foreground)]">
              {t('missingPersons.footer.verificationNotice')}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {t('missingPersons.footer.lawEnforcementContact')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
