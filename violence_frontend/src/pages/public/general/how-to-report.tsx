import React, { useState } from 'react';

export function HowToReportPage() {
  const [activeTab, setActiveTab] = useState('anonymous');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)]">
      {/* Header Section */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="heading-amharic mb-2 text-center">How to Report</h1>
          <div className="tibeb-divider mx-auto max-w-md"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Section 1: Welcome & Reassurance */}
        <section className="animate-fade-in-up mb-12">
          <div className="card mx-auto max-w-4xl text-center">
            <h2 className="card-title mb-4">Your Safety Matters</h2>
            <p className="mb-4 text-lg text-[var(--color-muted-foreground)]">
              You are not alone. Reporting abuse is brave and you are in control
              of how much you share.
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              We're here to help you through this process with empathy and
              respect for your privacy.
            </p>
          </div>
        </section>

        {/* Section 2: Is This Platform Right for You? */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              Is This Platform Right for You?
            </h2>

            <div className="card mb-6">
              <h3 className="mb-4 text-xl font-medium">You can report:</h3>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start">
                  <span className="mr-2 text-[var(--color-primary)]">•</span>
                  <span>
                    Physical, emotional, sexual, or psychological abuse
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-[var(--color-primary)]">•</span>
                  <span>Bullying (school, workplace, online)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-[var(--color-primary)]">•</span>
                  <span>Threats or stalking</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-[var(--color-primary)]">•</span>
                  <span>Missing persons linked to violence or crisis</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-[var(--color-primary)]">•</span>
                  <span>Human trafficking concerns</span>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--color-accent)] p-4 text-[var(--color-accent-foreground)]">
                <div className="flex items-start">
                  <span className="mr-2 font-bold">❗</span>
                  <div>
                    <p className="font-medium">Important Disclaimer</p>
                    <p className="mt-1">
                      This platform does not provide emergency services. If you
                      are in immediate danger, contact local authorities or
                      emergency services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Two Reporting Paths */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              Choose Your Reporting Path
            </h2>

            <div className="mb-6 flex border-b border-[var(--color-border)]">
              <button
                className={`flex-1 py-3 font-medium ${activeTab === 'anonymous' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}
                onClick={() => setActiveTab('anonymous')}
              >
                Anonymous Reporting
              </button>
              <button
                className={`flex-1 py-3 font-medium ${activeTab === 'verified' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}
                onClick={() => setActiveTab('verified')}
              >
                Verified Reporting
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className={`card hover-lift ${activeTab === 'anonymous' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                    <span className="font-bold">A</span>
                  </div>
                  <h3 className="text-xl font-medium">Anonymous Reporting</h3>
                </div>

                <ul className="mb-6 space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-primary)]">✓</span>
                    <span>No name, email, or ID required</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-primary)]">✓</span>
                    <span>Can't receive follow-ups</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-primary)]">✓</span>
                    <span>Can still upload evidence (photos, location)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-primary)]">✓</span>
                    <span>Ideal if you fear exposure</span>
                  </li>
                </ul>
              </div>

              <div
                className={`card hover-lift ${activeTab === 'verified' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
                    <span className="font-bold">V</span>
                  </div>
                  <h3 className="text-xl font-medium">Verified Reporting</h3>
                </div>

                <ul className="mb-6 space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-secondary)]">
                      ✓
                    </span>
                    <span>Create a secure account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-secondary)]">
                      ✓
                    </span>
                    <span>
                      Get updates, track your case, message counselors
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-secondary)]">
                      ✓
                    </span>
                    <span>Full access to support services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[var(--color-secondary)]">
                      ✓
                    </span>
                    <span>Ideal if you want ongoing help</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-[var(--color-muted-foreground)]">
                "You choose what feels safest for you."
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Step-by-Step Reporting Guide */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              How to Report Step-by-Step
            </h2>

            <div className="card">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    1
                  </div>
                  <h3 className="mb-2 font-medium">Go to Report Page</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Click the "Start Reporting Now" button
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    2
                  </div>
                  <h3 className="mb-2 font-medium">Select Incident Type</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Choose what best describes your situation
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    3
                  </div>
                  <h3 className="mb-2 font-medium">Add Details</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Share what happened, when, and where
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    4
                  </div>
                  <h3 className="mb-2 font-medium">Upload Evidence</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Optional: photos, screenshots, voice notes
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    5
                  </div>
                  <h3 className="mb-2 font-medium">Choose Reporting Type</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Anonymous or Verified
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                    6
                  </div>
                  <h3 className="mb-2 font-medium">Submit Securely</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Your data is encrypted and protected
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-[var(--color-hover)] p-4">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  <span className="font-medium">Note:</span> Photos may contain
                  location information. Remove it first if unsafe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: What Happens After You Report? */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              What Happens After You Report?
            </h2>

            <div className="card">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Review Process</h3>
                    <p className="text-[var(--color-muted-foreground)]">
                      Admins review the report within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">If Verified</h3>
                    <p className="text-[var(--color-muted-foreground)]">
                      You'll get a case ID and can log in to track progress
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Data Sharing</h3>
                    <p className="text-[var(--color-muted-foreground)]">
                      Your report may be shared only with relevant professionals
                      (counselor, legal aid) if you consent
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Privacy Protection</h3>
                    <p className="text-[var(--color-muted-foreground)]">
                      All data is anonymized for analytics (no personal details
                      shared publicly)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Safety Tips */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              Safety Tips While Reporting
            </h2>

            <div className="card bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>Use private/incognito browser mode</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>Don't save passwords</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>
                    After reporting, clear history or use the "Leave Site"
                    button
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>Avoid reporting on shared/monitored devices</span>
                </div>
                <div className="flex items-start md:col-span-2">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>
                    If possible, use a trusted friend's device or public library
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Need Help Deciding? */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              Need Help Deciding?
            </h2>

            <div className="card text-center">
              <p className="mb-6 text-lg">
                We're here to help you make the right choice for your situation.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button className="button-primary">
                  Explore Support Resources
                </button>
                <button className="button-secondary">
                  Chat with a Support Guide
                </button>
              </div>

              <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                <h3 className="mb-2 font-medium">National Helplines</h3>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="rounded bg-[var(--color-hover)] px-3 py-2">
                    <p className="font-medium">Domestic Violence Hotline</p>
                    <p className="text-[var(--color-muted-foreground)]">
                      1-800-799-7233
                    </p>
                  </div>
                  <div className="rounded bg-[var(--color-hover)] px-3 py-2">
                    <p className="font-medium">Crisis Text Line</p>
                    <p className="text-[var(--color-muted-foreground)]">
                      Text HOME to 741741
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Call to Action */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">Ready to Report?</h2>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="button-primary px-8 py-3 text-lg">
                Start Reporting Now
              </button>
              <button className="button-secondary px-8 py-3 text-lg">
                Explore Support Resources
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] py-6">
        <div className="container mx-auto px-4 text-center text-[var(--color-muted-foreground)]">
          <p>
            Your privacy and safety are our priority. All reports are handled
            with confidentiality and care.
          </p>
        </div>
      </footer>
    </div>
  );
}
