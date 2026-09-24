import React from 'react';

export default function SectionStrip({
  currentStep,
  totalSteps,
  sectionName,
  canGoBack,
  onPrevious,
}) {
  return (
    <div
      style={{
        padding: '6px 16px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Step {currentStep} / {totalSteps}
        </span>
        <span style={{ width: 1, height: 12, background: 'var(--border-primary)', flexShrink: 0 }} />
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {sectionName}
        </span>
      </div>

      {canGoBack && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={onPrevious}
            style={{
              padding: '2px 8px',
              fontSize: '0.7rem',
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
