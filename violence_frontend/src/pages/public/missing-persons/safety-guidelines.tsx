import { useNavigate } from 'react-router-dom';

export function SafetyGuidelinesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)] flex items-center justify-center">
      <div className="card-calm text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-6">
          Safety Guidelines
        </h1>
        <p className="text-xl text-[var(--color-muted-foreground)] mb-8">
          This is the safety guidelines page. If you can see this, the routing is working!
        </p>
        <button
          onClick={() => navigate('/missing-persons')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C15B3E] px-6 py-3 text-white font-bold shadow-lg hover:bg-[#8c3e2b] transition-colors"
        >
          Back to Missing Persons
        </button>
      </div>
    </div>
  );
}
