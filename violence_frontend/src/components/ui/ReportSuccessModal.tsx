import {
  CheckCircle,
  Shield,
  MapPin,
  AlertTriangle,
  Clock,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ReporterBehavioralData {
  safetyConcern: 'high' | 'medium' | 'low';
  timeToDisclosure: number;
  reporterLocationConfidence: 'high' | 'medium' | 'low';
}

interface ReportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: () => void;
  onTrackCase?: () => void;
  reportId?: string;
  trackingNumber?: string;
  reporterData?: ReporterBehavioralData;
  supportTrack?: 'MEDICAL' | 'LEGAL' | 'BOTH';
  isAnonymous?: boolean;
  reportsRemaining?: number;
  dailyLimit?: number;
}

export function ReportSuccessModal({
  isOpen,
  onClose,
  onSignUp,
  onTrackCase,
  reportId = `SH-${Date.now().toString(36).toUpperCase()}`,
  trackingNumber,
  reporterData,
  supportTrack,
  isAnonymous = true,
  reportsRemaining,
  dailyLimit = 3,
}: ReportSuccessModalProps) {
  const { t } = useTranslation();

  const getLocationSensitivityLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return { text: t('reportSuccessModal.preciseLocation'), color: 'text-emerald-600' };
      case 'medium':
        return { text: t('reportSuccessModal.regionLocation'), color: 'text-amber-600' };
      default:
        return { text: t('reportSuccessModal.locationNotSpecified'), color: 'text-slate-500' };
    }
  };

  const getSafetyConcernLabel = (level: string) => {
    switch (level) {
      case 'high':
        return {
          text: t('reportSuccessModal.highPriority'),
          color: 'text-red-600',
          icon: AlertTriangle,
        };
      case 'medium':
        return { text: t('reportSuccessModal.mediumPriority'), color: 'text-amber-600' };
      default:
        return { text: t('reportSuccessModal.standardReview'), color: 'text-slate-500' };
    }
  };

  const locationInfo = reporterData
    ? getLocationSensitivityLabel(reporterData.reporterLocationConfidence)
    : null;
  const safetyInfo = reporterData
    ? getSafetyConcernLabel(reporterData.safetyConcern)
    : null;
  const SafetyIcon = safetyInfo?.icon || AlertTriangle;
  const supportLabel =
    supportTrack === 'MEDICAL'
      ? t('reportSuccessModal.medicalSupport')
      : supportTrack === 'LEGAL'
        ? t('reportSuccessModal.legalSupport')
        : supportTrack === 'BOTH'
          ? t('reportSuccessModal.bothSupport')
          : null;

  const formatTimeToDisclosure = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-[32px] border border-[#E8E7E0] bg-[#FDFDF5] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 my-auto max-h-[90vh] overflow-y-auto">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>

        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-[#4A4D42]">
            {t('reportSuccessModal.title')}
          </h2>
          <p className="mb-2 text-lg text-[#3D4035]">
            {isAnonymous
              ? t('reportSuccessModal.anonymousMessage')
              : t('reportSuccessModal.verifiedMessage')}
          </p>
          <div className="flex flex-col items-center gap-2">
            {isAnonymous && trackingNumber ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
                  {t('reportSuccessModal.trackingReference')}
                </p>
                <p className="font-mono text-lg font-bold text-amber-800 tracking-wider">
                  {trackingNumber}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {t('reportSuccessModal.saveToTrack')}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 font-mono text-sm text-[#6B705C]">
                <Shield className="h-4 w-4" />
                <span>{t('reportSuccessModal.reportId', { id: reportId })}</span>
              </div>
            )}
          </div>
        </div>

        {reporterData && (
          <div className="mb-6 rounded-[24px] border border-[#E8E7E0] bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-[#4A4D42]">
                {t('reportSuccessModal.locationAssessment')}
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-[#6B705C]">{t('reportSuccessModal.locationPrecision')}</span>
                </div>
                {locationInfo && (
                  <span className={`text-xs font-bold ${locationInfo.color}`}>
                    {locationInfo.text}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SafetyIcon className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-[#6B705C]">{t('reportSuccessModal.safetyAssessment')}</span>
                </div>
                {safetyInfo && (
                  <span className={`text-xs font-bold ${safetyInfo.color}`}>
                    {safetyInfo.text}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-[#6B705C]">{t('reportSuccessModal.timeToReport')}</span>
                </div>
                <span className="text-xs font-bold text-[#6B705C]">
                  {formatTimeToDisclosure(reporterData.timeToDisclosure)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-[24px] border border-[#E8E7E0] bg-[#F3EDD7] p-4">
          <h3 className="mb-2 text-sm font-bold text-[#4A4D42]">{t('reportSuccessModal.whatHappensNext')}</h3>
          <ul className="space-y-1 text-sm text-[#3D4035]">
            <li>{t('reportSuccessModal.nextSteps.review')}</li>
            {supportLabel ? <li>{t('reportSuccessModal.nextSteps.triage', { support: supportLabel })}</li> : null}
            {isAnonymous ? (
              <li className="font-semibold text-amber-700" dangerouslySetInnerHTML={{ __html: t('reportSuccessModal.nextSteps.anonymousTrack') }} />
            ) : (
              <li>{t('reportSuccessModal.nextSteps.verifiedDashboard')}</li>
            )}
            <li>{t('reportSuccessModal.nextSteps.confidential')}</li>
          </ul>
        </div>

        {isAnonymous && typeof reportsRemaining === 'number' && (
          <div className="mb-4 text-center">
            <p className={`text-xs font-semibold uppercase tracking-wide ${reportsRemaining === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {t('reportSuccessModal.reportsRemaining', { remaining: reportsRemaining, daily: dailyLimit })}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isAnonymous && onTrackCase && (
            <Button
              onClick={() => onTrackCase?.()}
              className="h-14 w-full rounded-[24px] bg-[#4A90A4] font-bold text-white transition-colors hover:bg-[#3A7A8E] text-base"
            >
              {t('reportSuccessModal.trackCase')}
            </Button>
          )}
          {isAnonymous && onSignUp && (
            <Button
              onClick={() => onSignUp?.()}
              variant="outline"
              className="h-12 w-full rounded-[24px] border-[#C15B3E] text-[#C15B3E] font-bold transition-colors hover:bg-[#C15B3E] hover:text-white"
            >
              {t('reportSuccessModal.signUpAccount')}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="h-12 w-full rounded-[24px] bg-[#6B705C] font-bold text-white transition-colors hover:bg-[#5D624F]"
          >
            {isAnonymous ? t('reportSuccessModal.continueHome') : t('reportSuccessModal.goToDashboard')}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B705C]/60">
            <Shield className="mr-1 inline h-3 w-3" />
            {t('reportSuccessModal.encryptionProtected')}
          </p>
        </div>
      </div>
    </div>
  );
}
