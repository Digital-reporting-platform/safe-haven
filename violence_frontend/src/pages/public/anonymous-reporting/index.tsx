import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  ArrowLeft,
  Heart,
  ShieldX,
  Plus,
  Users,
  Skull,
  Ban,
  Zap,
  UserX,
  Home,
  Baby,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/components/AppContext';
import { useTranslation } from 'react-i18next';
import { IncidentCategory, INCIDENT_CATEGORY_LABELS } from '@/types/incident';
import { SecureBox } from '@/components/ui/SecureBox';
import { AnonymousToggle } from '@/components/ui/AnonymousToggle';
import { EvidenceUpload } from '@/components/ui/EvidenceUpload';
import { toast } from 'sonner';
import { reportService } from '@/services/report';
import { ReportSuccessModal } from '@/components/ui/ReportSuccessModal';
import { validateEmail, validatePhone, validateName, validateDescription, validateLocation } from '@/utils/validation';


const INCIDENT_TYPE_CONFIG: Record<
  IncidentCategory,
  { icon: any; color: string; bg: string }
> = {
  [IncidentCategory.PHYSICAL_VIOLENCE]: {
    icon: Skull,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.SEXUAL_ASSAULT]: {
    icon: ShieldX,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.EMOTIONAL_ABUSE]: {
    icon: Heart,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.PSYCHOLOGICAL_ABUSE]: {
    icon: AlertTriangle,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.NEGLECT]: {
    icon: UserX,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.CYBERBULLYING]: {
    icon: Zap,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.HARASSMENT]: {
    icon: Ban,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.DISCRIMINATION]: {
    icon: Users,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.WORKPLACE_ABUSE]: {
    icon: Shield,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.DOMESTIC_VIOLENCE]: {
    icon: Home,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.CHILD_ABUSE]: {
    icon: Baby,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.ELDER_ABUSE]: {
    icon: User,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
  [IncidentCategory.OTHER]: {
    icon: Plus,
    color: 'text-[#C15B3E]',
    bg: 'bg-[#C15B3E]/10',
  },
};

export function ReportPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [reportsCount, setReportsCount] = useState(0);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat?: number; lng?: number }>({});
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportId, setReportId] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string | undefined>(undefined);
  const [reporterData, setReporterData] = useState<any>(null);
  const [supportTrack, setSupportTrack] = useState<'MEDICAL' | 'LEGAL' | 'BOTH' | undefined>(undefined);
  const navigate = useNavigate();
  const { user, language } = useApp();
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const DAILY_LIMIT = 3;

  const [formData, setFormData] = useState({
    incidentType: '' as IncidentCategory | '',
    description: '',
    date: '',
    location: '',
    anonymous: !user, // Default to non-anonymous if user is logged in
    files: [] as File[],
    consentGeneral: false,
    // Personal info for verified reports
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Pre-fill user info when logged in and not anonymous
  useEffect(() => {
    if (user && !formData.anonymous) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const getOrCreateFingerprint = () => {
    let fingerprint = localStorage.getItem('sh_fingerprint');
    if (!fingerprint) {
      fingerprint = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sh_fingerprint', fingerprint);
    }
    return fingerprint;
  };

  useEffect(() => {
    document.title = t('reportPage.title');
    requestGeolocation();
  }, [t]);

  useEffect(() => {
    checkSubmissionLimit(formData.anonymous);
  }, [formData.anonymous, user?.id]);

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log('Geolocation permission denied or unavailable');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  };

  const getLimitStorageKey = (isAnonymous: boolean) => {
    if (!isAnonymous && user?.id) {
      return `report_history_user_${user.id}`;
    }
    return `report_history_anonymous_${getOrCreateFingerprint()}`;
  };

  const checkSubmissionLimit = (isAnonymous: boolean) => {
    const storageKey = getLimitStorageKey(isAnonymous);
    const today = new Date().toDateString();
    const history = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (history.date === today) {
      setReportsCount(history.count);
      return;
    }
    setReportsCount(0);
  };

  const incrementSubmissionLimit = (isAnonymous: boolean) => {
    const storageKey = getLimitStorageKey(isAnonymous);
    const today = new Date().toDateString();
    const newCount = reportsCount + 1;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ date: today, count: newCount })
    );
    setReportsCount(newCount);
  };

  const generateReporterBehavioralData = useCallback((): {
    locationPrecision: 'exact' | 'region' | 'unknown';
    safetyConcern: 'high' | 'medium' | 'low';
    disclosureWillingness: number;
    timeToDisclosure: number;
    reporterLocationConfidence: 'high' | 'medium' | 'low';
  } => {
    const timeToDisclosure = Math.floor((Date.now() - startTime) / 1000);
    
    let locationPrecision: 'exact' | 'region' | 'unknown' = 'unknown';
    let reporterLocationConfidence: 'high' | 'medium' | 'low' = 'low';
    
    if (formData.location) {
      if (gpsCoordinates.lat && gpsCoordinates.lng) {
        locationPrecision = 'exact';
        reporterLocationConfidence = 'high';
      } else {
        locationPrecision = 'region';
        reporterLocationConfidence = 'medium';
      }
    }

    let safetyConcern: 'high' | 'medium' | 'low' = 'medium';
    if (formData.incidentType === IncidentCategory.SEXUAL_ASSAULT || 
        formData.incidentType === IncidentCategory.PHYSICAL_VIOLENCE ||
        formData.incidentType === IncidentCategory.CHILD_ABUSE) {
      safetyConcern = 'high';
    } else if (formData.incidentType === IncidentCategory.EMOTIONAL_ABUSE ||
               formData.incidentType === IncidentCategory.CYBERBULLYING) {
      safetyConcern = 'low';
    }

    const disclosureWillingness = formData.anonymous ? 30 : 70;

    return {
      locationPrecision,
      safetyConcern,
      disclosureWillingness,
      timeToDisclosure,
      reporterLocationConfidence,
    };
  }, [startTime, formData, gpsCoordinates]);

  const validateField = (field: string, value: any) => {
    switch (field) {
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value, false); // Optional for anonymous reports
      case 'description':
        return validateDescription(value, 20, 5000);
      case 'location':
        return validateLocation(value);
      case 'date':
        if (!value) return undefined; // Optional field
        const incidentDate = new Date(value);
        const now = new Date();
        const diffInDays = (now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > 7) return 'The incident date must be within the last 7 days';
        if (diffInDays < 0) return 'Incident date cannot be in the future';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAndProceed = (field: string, value: any, nextStep: number) => {
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setTouched(prev => ({ ...prev, [field]: true }));
      return false;
    }
    setCurrentStep(nextStep);
    return true;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field as keyof typeof formData] as any) }));
  };

  const handleAnonymousToggle = (isAnonymous: boolean) => {
    if (!isAnonymous && !user) {
      toast.error(t('reportPage.errors.loginRequired'));
      navigate('/auth/login');
      return;
    }
    handleInputChange('anonymous', isAnonymous);
    setErrors({});
    setTouched({});
    
    // Pre-fill user info if switching to verified and user is logged in
    if (!isAnonymous && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportsCount >= DAILY_LIMIT) {
      return toast.error(t('reportPage.errors.dailyLimit'));
    }

    // Validate date if provided
    if (formData.date) {
      const dateErr = validateField('date', formData.date);
      if (dateErr) {
        toast.error(dateErr);
        return;
      }
    }

    setIsSubmitting(true);

    const behavioralData = {
      sessionDuration: Math.floor((Date.now() - startTime) / 1000),
      behavioralRiskScore: 0,
      ...generateReporterBehavioralData(),
    };

    try {
      const incidentLabel = formData.incidentType 
        ? t(`incidentCategories.${formData.incidentType}`) || 'Incident'
        : 'Incident';
      
      const submitData = {
        title: `Report: ${incidentLabel}`,
        description: formData.description,
        category: formData.incidentType ? formData.incidentType : 'OTHER',
        language: language === 'AMH' ? 'am' : 'en',
        isAnonymous: formData.anonymous,
        location: formData.location || undefined,
        occurredAt: formData.date || undefined,
        behavioralData,
        gpsLat: gpsCoordinates.lat,
        gpsLng: gpsCoordinates.lng,
        // Let backend run IP/GPS location validation so admin oversight can
        // accurately show verified vs mismatch reports.
        skipLocationValidation: false,
        // Personal info for verified reports
        ...(formData.anonymous ? {} : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
        }),
      };
      
      console.log('Submitting report:', submitData);
      
      const result = await reportService.createReport(submitData);
      
      // Store report data for success modal
      setReportId(result.id || `SH-${Date.now().toString(36).toUpperCase()}`);
      setTrackingNumber(result.trackingNumber);
      setReporterData(generateReporterBehavioralData());
      setSupportTrack(result.classification?.supportTrack);
      setReportSuccess(true);
      
      incrementSubmissionLimit(formData.anonymous);
    } catch (error: any) {
      console.error('Report submission failed:', error);
      toast.error(error?.message || t('reportPage.errors.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setReportSuccess(false);
    setSupportTrack(undefined);
    navigate('/');
  };

  const handleSuccessSignUp = () => {
    setReportSuccess(false);
    setSupportTrack(undefined);
    navigate('/auth/register');
  };

  const handleTrackCase = () => {
    setReportSuccess(false);
    setSupportTrack(undefined);
    // Navigate to tracking page with the tracking number pre-filled
    if (trackingNumber) {
      navigate(`/track?ref=${trackingNumber}`);
    } else {
      navigate('/track');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <div className="mb-16">
          <div className="mb-4 flex items-end justify-between">
            <span className="text-[10px] font-black tracking-[0.2em] text-stone-400 uppercase">
              {t('reportPage.stepProgress', { current: currentStep, total: formData.anonymous ? 5 : 6 })}
            </span>
            <span className="text-sm font-bold text-stone-800">
              {t('reportPage.complete', { percent: Math.round((currentStep / (formData.anonymous ? 5 : 6)) * 100) })}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-stone-100 p-1 shadow-inner">
            <div
              className="h-full rounded-full bg-[#C15B3E] transition-all duration-700"
              style={{ width: `${(currentStep / (formData.anonymous ? 5 : 6)) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#C15B3E] uppercase">
            <Clock size={12} /> {t('reportPage.reportsRemaining', { count: DAILY_LIMIT - reportsCount })}
          </div>
        </div>

        <SecureBox className="p-8 md:p-12">
          <div className="mb-8">
            <AnonymousToggle
              isAnonymous={formData.anonymous}
              onChange={handleAnonymousToggle}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-stone-800" dangerouslySetInnerHTML={{ __html: t('reportPage.step1.title') }} />
                  <p className="text-stone-600">
                    {t('reportPage.step1.description')}
                  </p>
                </div>
                  <label htmlFor="incidentDescription" className="sr-only">{t('reportPage.incidentDescriptionLabel')}</label>
                  <textarea
                    id="incidentDescription"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    className={`min-h-[250px] w-full rounded-lg border-2 p-6 text-lg transition-all outline-none bg-white ${
                      errors.description && touched.description ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                    }`}
                    placeholder={t('reportPage.incidentDescriptionPlaceholder')}
                    title={t('reportPage.incidentDescriptionTitle')}
                  />
                  {errors.description && touched.description && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle size={14} /> {errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-stone-500">
                    Minimum 20 characters, maximum 5000 characters
                  </p>
                <Button
                  type="button"
                  onClick={() => validateAndProceed('description', formData.description, 2)}
                  disabled={!formData.description || formData.description.length < 20}
                  className={`h-16 w-full rounded-lg text-lg font-bold relative z-50 transition-all ${
                    formData.description && formData.description.length >= 20 
                      ? 'bg-[#C15B3E] text-white hover:bg-[#A84D33]' 
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  {t('reportPage.step1.continue')}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold text-stone-800" dangerouslySetInnerHTML={{ __html: t('reportPage.step2.title') }} />
                <EvidenceUpload
                  onFilesChange={(files) => handleInputChange('files', files)}
                />
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="h-16 w-20 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="h-16 flex-1 rounded-lg bg-[#C15B3E] text-lg font-bold text-white hover:bg-[#A84D33] relative z-50"
                    style={{ position: 'relative', zIndex: 50 }}
                  >
                    {t('reportPage.step2.continue')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold text-stone-800" dangerouslySetInnerHTML={{ __html: t('reportPage.step3.title') }} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label htmlFor="incidentRegion" className="sr-only">{t('reportPage.step3.selectRegion')}</label>
                  <select
                    id="incidentRegion"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    onBlur={() => handleBlur('location')}
                    className={`h-14 rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                      errors.location && touched.location ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                    }`}
                    title={t('reportPage.step3.selectRegion')}
                  >
                    <option value="">{t('reportPage.step3.selectRegion')}</option>
                    {(t('reportPage.regions', { returnObjects: true }) as unknown as string[]).map((r: string) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.location && touched.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.location}
                    </p>
                  )}
                  <label htmlFor="incidentDate" className="sr-only">Incident Date</label>
                  <input
                    id="incidentDate"
                    type="datetime-local"
                    min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    max={new Date().toISOString().slice(0, 16)}
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    onBlur={() => handleBlur('date')}
                    className={`h-14 rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                      errors.date && touched.date ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                    }`}
                    title={t('reportPage.step3.incidentDate')}
                  />
                  {errors.date && touched.date && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.date}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-stone-500">
                    Only dates within the last 7 days are available for reporting
                  </p>
                </div>
                {formData.location && (
                  <div className="rounded-lg bg-[#C15B3E]/10 p-3 text-sm text-[#C15B3E]" dangerouslySetInnerHTML={{ 
                    __html: t('reportPage.step3.locationSelected', { location: formData.location }) 
                  }} />
                )}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="h-16 w-20 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => validateAndProceed('location', formData.location, 4)}
                    disabled={!formData.location}
                    className="h-16 flex-1 rounded-lg bg-[#C15B3E] text-lg font-bold text-white hover:bg-[#A84D33] relative z-50"
                    style={{ position: 'relative', zIndex: 50 }}
                  >
                    {t('reportPage.step3.continue')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && !formData.anonymous && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold text-stone-800" dangerouslySetInnerHTML={{ __html: t('reportPage.step4.title') }} />
                <p className="text-stone-600">
                  {t('reportPage.step4.description')}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="reporterFirstName" className="mb-2 block text-sm font-bold text-stone-700">{t('reportPage.step4.firstName')}</label>
                    <input
                      id="reporterFirstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={`h-14 w-full rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                        errors.firstName && touched.firstName ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                      }`}
                      placeholder={t('reportPage.step4.firstNamePlaceholder')}
                      required
                    />
                    {errors.firstName && touched.firstName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reporterLastName" className="mb-2 block text-sm font-bold text-stone-700">{t('reportPage.step4.lastName')}</label>
                    <input
                      id="reporterLastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={`h-14 w-full rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                        errors.lastName && touched.lastName ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                      }`}
                      placeholder={t('reportPage.step4.lastNamePlaceholder')}
                      required
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reporterEmail" className="mb-2 block text-sm font-bold text-stone-700">{t('reportPage.step4.email')}</label>
                    <input
                      id="reporterEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`h-14 w-full rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                        errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                      }`}
                      placeholder={t('reportPage.step4.emailPlaceholder')}
                      required
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reporterPhone" className="mb-2 block text-sm font-bold text-stone-700">{t('reportPage.step4.phone')}</label>
                    <input
                      id="reporterPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={`h-14 w-full rounded-lg border-2 p-3 bg-white outline-none transition-all ${
                        errors.phone && touched.phone ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#C15B3E]'
                      }`}
                      placeholder={t('reportPage.step4.phonePlaceholder')}
                    />
                    {errors.phone && touched.phone && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="h-16 w-20 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const firstNameErr = validateName(formData.firstName, 'First name');
                      const lastNameErr = validateName(formData.lastName, 'Last name');
                      const emailErr = validateEmail(formData.email);
                      const phoneErr = validatePhone(formData.phone);
                      
                      setErrors({
                        firstName: firstNameErr,
                        lastName: lastNameErr,
                        email: emailErr,
                        phone: phoneErr
                      });
                      
                      setTouched({
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                      });

                      if (!firstNameErr && !lastNameErr && !emailErr && !phoneErr) {
                        setCurrentStep(5);
                      }
                    }}
                    className="h-16 flex-1 rounded-lg bg-[#C15B3E] text-lg font-bold text-white hover:bg-[#A84D33] relative z-50"
                    style={{ position: 'relative', zIndex: 50 }}
                  >
                    {t('reportPage.step4.continue')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && formData.anonymous && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: t('reportPage.step4Anonymous.title') }} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Object.entries(IncidentCategory).map(([, value]) => {
                    const config = INCIDENT_TYPE_CONFIG[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleInputChange('incidentType', value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${formData.incidentType === value ? 'border-[#C15B3E] bg-[#C15B3E]/10' : 'border-stone-200 hover:border-stone-300'}`}
                      >
                        <config.icon className={config.color} />
                        <span className="text-[10px] font-bold">
                          {t(`incidentCategories.${value}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="h-16 w-20 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="h-16 flex-1 rounded-lg bg-[#C15B3E] text-lg font-bold text-white hover:bg-[#A84D33] relative z-50"
                    style={{ position: 'relative', zIndex: 50 }}
                  >
                    {t('reportPage.step4Anonymous.reviewSubmit')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && !formData.anonymous && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: t('reportPage.step5.title') }} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Object.entries(IncidentCategory).map(([, value]) => {
                    const config = INCIDENT_TYPE_CONFIG[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleInputChange('incidentType', value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${formData.incidentType === value ? 'border-[#C15B3E] bg-[#C15B3E]/10' : 'border-stone-200 hover:border-stone-300'}`}
                      >
                        <config.icon className={config.color} />
                        <span className="text-[10px] font-bold">
                          {t(`incidentCategories.${value}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="h-16 w-20 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="h-16 flex-1 rounded-lg bg-[#C15B3E] text-lg font-bold text-white hover:bg-[#A84D33] relative z-50"
                    style={{ position: 'relative', zIndex: 50 }}
                  >
                    {t('reportPage.step5.reviewSubmit')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && formData.anonymous && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: t('reportPage.step5Anonymous.title') }} />
                <div className="rounded-2xl border-2 border-dashed bg-slate-50 p-6">
                  <p className="mb-4 text-sm text-slate-600">
                    {t('reportPage.step5Anonymous.consentText', { 
                      type: formData.anonymous ? t('reportPage.anonymous') : t('reportPage.verified'), 
                      category: formData.incidentType ? t(`incidentCategories.${formData.incidentType}`) : t('reportPage.unspecifiedCategory') 
                    })}
                  </p>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.consentGeneral}
                      onChange={(e) => handleInputChange('consentGeneral', e.target.checked)}
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-bold">
                      {t('reportPage.step5Anonymous.consentCheckbox')}
                    </span>
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={!formData.consentGeneral || isSubmitting}
                  className="h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> {t('reportPage.step5Anonymous.encrypting')}
                    </span>
                  ) : (
                    t('reportPage.step5Anonymous.submit')
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="w-full text-xs font-bold text-slate-400 uppercase"
                >
                  {t('reportPage.step5Anonymous.editDetails')}
                </button>
              </div>
            )}

            {currentStep === 6 && !formData.anonymous && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: t('reportPage.step6.title') }} />
                <div className="rounded-2xl border-2 border-dashed bg-slate-50 p-6">
                  <p className="mb-4 text-sm text-slate-600">
                    {t('reportPage.step6.consentText', { 
                      type: formData.anonymous ? t('reportPage.anonymous') : t('reportPage.verified'), 
                      category: formData.incidentType ? t(`incidentCategories.${formData.incidentType}`) : t('reportPage.unspecifiedCategory') 
                    })}
                  </p>
                  <p className="mb-4 text-sm text-slate-600">
                    {t('reportPage.step6.contactInfo', { 
                      firstName: formData.firstName, 
                      lastName: formData.lastName, 
                      email: formData.email 
                    })}
                  </p>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.consentGeneral}
                      onChange={(e) => handleInputChange('consentGeneral', e.target.checked)}
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-bold">
                      {t('reportPage.step6.consentCheckbox')}
                    </span>
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={!formData.consentGeneral || isSubmitting}
                  className="h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> {t('reportPage.step6.encrypting')}
                    </span>
                  ) : (
                    t('reportPage.step6.submit')
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="w-full text-xs font-bold text-slate-400 uppercase"
                >
                  {t('reportPage.step6.editDetails')}
                </button>
              </div>
            )}
          </form>
        </SecureBox>
      </main>

      <ReportSuccessModal
        isOpen={reportSuccess}
        onClose={handleSuccessClose}
        onSignUp={handleSuccessSignUp}
        onTrackCase={handleTrackCase}
        reportId={reportId}
        trackingNumber={trackingNumber}
        reporterData={reporterData || undefined}
        supportTrack={supportTrack}
        isAnonymous={formData.anonymous}
        reportsRemaining={DAILY_LIMIT - reportsCount - 1}
        dailyLimit={DAILY_LIMIT}
      />
    </div>
  );
}
