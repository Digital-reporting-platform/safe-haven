import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Eye, AlertTriangle } from 'lucide-react';

// Mock data - in a real app, this would come from an API based on the case ID
const MOCK_MISSING_PERSONS = [
  {
    id: 'MP-2025-0018',
    name: 'Sara M.',
    age: 24,
    gender: 'Female',
    lastSeenLocation: 'Addis Ababa, Bole Area',
    lastSeenDate: '2025-01-15',
    lastSeenTime: '14:30',
    physicalDescription:
      'Height: 165cm, long black hair, last seen wearing blue jacket and jeans. Speaks Amharic and English. Speaks Amharic and English with a distinctive accent. Has a small tattoo of a butterfly on her left wrist.',
    photo: null,
    circumstances: 'Mental health concerns, left home without medication. Was experiencing severe anxiety and depression. Last contacted family 3 days before disappearance.',
    reporterRelationship: 'Family',
    contactMethod: 'secure',
    publicConsent: true,
    status: 'verified',
    dateReported: '2025-01-16',
    sightings: 2,
  },
  {
    id: 'MP-2025-0017',
    name: null,
    age: 16,
    gender: 'Male',
    lastSeenLocation: 'Hawassa',
    lastSeenDate: '2025-01-10',
    lastSeenTime: '18:00',
    physicalDescription:
      'Height: 170cm, short curly hair, school uniform. Shy demeanor. Wearing school uniform with red and white colors. Has a birthmark on his right cheek.',
    photo: null,
    circumstances: 'Bullying-related disappearance from school. Had been complaining about being bullied by classmates for several weeks. Left school grounds during lunch break.',
    reporterRelationship: 'Family',
    contactMethod: 'email',
    publicConsent: true,
    status: 'verified',
    dateReported: '2025-01-11',
    sightings: 0,
  },
  {
    id: 'MP-2025-0016',
    name: 'Yordanos T.',
    age: 32,
    gender: 'Female',
    lastSeenLocation: 'Addis Ababa, Merkato',
    lastSeenDate: '2025-01-08',
    lastSeenTime: '11:00',
    physicalDescription:
      'Height: 160cm, braided hair, distinctive scar on left cheek. Last seen in traditional dress. Wearing traditional Ethiopian dress (habesha kemis) with colorful patterns.',
    photo: null,
    circumstances: 'Suspected trafficking situation. Was last seen speaking with unknown individuals in Merkato market. Had mentioned wanting to find work in another city.',
    reporterRelationship: 'Friend',
    contactMethod: 'secure',
    publicConsent: true,
    status: 'verified',
    dateReported: '2025-01-09',
    sightings: 1,
  },
];

export function MissingPersonsViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseId = searchParams.get('id');
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (caseId) {
      // In a real app, this would fetch data from an API
      const foundCase = MOCK_MISSING_PERSONS.find(c => c.id === caseId);
      setCaseData(foundCase || null);
    }
  }, [caseId]);

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)] flex items-center justify-center">
        <div className="card-calm text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-[var(--color-muted-foreground)]" />
          <h2 className="text-xl font-bold mb-2">Case Not Found</h2>
          <p className="text-[var(--color-muted-foreground)] mb-4">
            The requested case could not be found.
          </p>
          <button
            onClick={() => navigate('/missing-persons')}
            className="flex items-center gap-2 rounded-xl bg-[#C15B3E] px-6 py-3 text-white font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Missing Persons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/missing-persons')}
              className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[#DDA15E] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Missing Persons
            </button>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
              <span className="text-sm font-bold text-[var(--color-primary)] uppercase">
                Verified Report
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Case Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--color-primary)]/10 bg-gradient-to-br from-[#FDFDF5] to-[#6B705C]/30">
              {caseData.photo ? (
                <img
                  src={caseData.photo}
                  alt={caseData.name || 'Missing Person'}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-[var(--color-primary)]/40" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-2">
                {caseData.name || 'Anonymous Case'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="rounded-full border border-[var(--color-primary)]/10 bg-[#FDFDF5] px-4 py-2 text-lg font-semibold text-[var(--color-primary)]">
                  {caseData.age} Years • {caseData.gender}
                </span>
                <span className="text-sm text-[var(--color-muted-foreground)]">
                  Case ID: {caseData.id}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                <span>Reported: {new Date(caseData.dateReported).toLocaleDateString()}</span>
                <span>•</span>
                <span>{caseData.sightings} sightings reported</span>
              </div>
            </div>
          </div>

          {/* Last Seen Information */}
          <div className="card-calm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">Last Seen Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--colors-grey-1)]">
                  <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-1">Location</h3>
                  <p className="text-lg text-[var(--color-foreground)]">{caseData.lastSeenLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--colors-grey-1)]">
                  <Calendar className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-1">Date & Time</h3>
                  <p className="text-lg text-[var(--color-foreground)]">
                    {new Date(caseData.lastSeenDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {caseData.lastSeenTime && ` at ${caseData.lastSeenTime}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Description */}
          <div className="card-calm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">Physical Description</h2>
            <div className="rounded-xl border border-[var(--color-primary)]/5 bg-[#FDFDF5] p-6">
              <p className="text-lg leading-relaxed text-[var(--color-foreground)]">
                {caseData.physicalDescription}
              </p>
            </div>
          </div>

          {/* Circumstances */}
          <div className="card-calm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">Circumstances of Disappearance</h2>
            <div className="rounded-xl border border-[var(--color-primary)]/5 bg-[#FDFDF5] p-6">
              <p className="text-lg leading-relaxed text-[var(--color-foreground)]">
                {caseData.circumstances}
              </p>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="card-calm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">Reporter Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Relationship to Missing Person</h3>
                <p className="text-lg text-[var(--color-foreground)]">{caseData.reporterRelationship}</p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Contact Method</h3>
                <p className="text-lg text-[var(--color-foreground)]">{caseData.contactMethod}</p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="rounded-lg bg-[var(--color-accent)] p-6 text-[var(--color-accent-foreground)]">
            <div className="flex items-start">
              <AlertTriangle className="mt-1 mr-4 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Safety Information</h3>
                <p className="text-sm leading-relaxed">
                  All information on this page has been verified by our team. We protect everyone's privacy and only share safe, necessary information publicly.
                  If you have any information about this case, please report it securely through our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/missing-persons?id=${caseData.id}&report=sighting`)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#C15B3E] px-6 py-4 text-white font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors"
            >
              <Eye className="h-5 w-5" />
              Report a Sighting
            </button>
            <button
              onClick={() => navigate('/missing-persons')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#6B705C] px-6 py-4 text-white font-bold shadow-lg hover:bg-[#4a5a46] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to All Cases
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
