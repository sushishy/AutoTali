import React from 'react';

export default function StepHeader({ respondentNo, currentStep, totalSteps, sectionName, sections = [], onSelectStep, activeTab, onTabChange }) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <header style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              AUTOTALLY
            </h1>
            <span className="badge badge-sky">OMR Scanner</span>
            <span className="badge badge-emerald">Hotspot / Offline Ready</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Respondent #{respondentNo} &bull; Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* View mode tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 4 }}>
          <button
            onClick={() => onTabChange('scanner')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'scanner' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'scanner' ? '#0f172a' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            📷 Scanner
          </button>
          <button
            onClick={() => onTabChange('guide')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'guide' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'guide' ? '#0f172a' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            📋 Guide & Summary
          </button>
        </div>
      </div>

      {/* Quick Section Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
        {sections.map((sec, idx) => {
          const isCurrent = idx === currentStep - 1;
          const isDone = idx < currentStep - 1;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectStep(idx)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: isCurrent ? 'rgba(56, 189, 248, 0.25)' : isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-subtle)',
                border: `1px solid ${isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--accent-emerald)' : 'transparent'}`,
                color: isCurrent ? '#fff' : isDone ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: isCurrent ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {isDone ? '✓ ' : ''}{idx + 1}. {sec.name.split('—')[0].replace('Part ', 'P').trim()}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
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
