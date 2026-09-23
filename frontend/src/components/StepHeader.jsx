import React from 'react';

export default function StepHeader({ respondentNo, currentStep, totalSteps, sectionName }) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <header style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              AUTOTALLY
            </h1>
            <span className="badge badge-sky">OMR Scanner</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Respondent #{respondentNo} &bull; Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-emerald">Offline Hotspot Ready</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #38bdf8, #10b981)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
          {sectionName}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {progressPercent}% Complete
        </span>
      </div>
    </header>
  );
}
