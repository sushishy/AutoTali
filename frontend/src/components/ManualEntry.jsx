import React from 'react';
import { ArrowRight, Save, Check, ChevronLeft } from 'lucide-react';

export default function ManualEntry({
  section,
  currentVal,
  onChange,
  onConfirm,
  onPrevious,
  canGoBack,
  isLastStep,
  isProcessing,
  totalSteps,
  currentStepIndex,
}) {
  const isStrand = section.type === 'strand';

  // Default values for Likert if uninitialized
  const values = Array.isArray(currentVal)
    ? currentVal
    : [null, null, null, null, null];

  const handleSelectLikert = (qIdx, scaleVal) => {
    const next = [...values];
    next[qIdx] = scaleVal;
    onChange(next);
  };

  const isComplete = isStrand
    ? currentVal !== null && currentVal !== undefined
    : values.length === 5 && values.every((v) => v !== null && v !== undefined && v >= 1 && v <= 5);

  return (
    <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          background: 'var(--bg-secondary)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              Step {currentStepIndex + 1} of {totalSteps} &bull; Manual Mode
            </span>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 4, color: '#ffffff' }}>
              {section.name}
            </h2>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-elevated)',
              color: isComplete ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        </div>

        {isStrand ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select Senior High School Strand:
            </p>
            {[
              { val: 1, label: '1 — STEM (Science, Technology, Engineering, Mathematics)' },
              { val: 2, label: '2 — TVL-ICT (Technical-Vocational-Livelihood ICT)' },
              { val: 3, label: '3 — Non-Aligned' },
            ].map(({ val, label }) => {
              const active = currentVal === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange(val)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    background: active ? '#ffffff' : 'var(--bg-elevated)',
                    color: active ? '#000000' : 'var(--text-primary)',
                    border: `1px solid ${active ? '#ffffff' : 'var(--border-primary)'}`,
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{label}</span>
                  {active && <Check size={18} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Likert Scale: 5 (Strongly Agree) &rarr; 1 (Strongly Disagree)
              </span>
            </div>

            {values.map((v, qIdx) => (
              <div
                key={qIdx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Question {qIdx + 1}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {[5, 4, 3, 2, 1].map((scaleVal) => {
                    const sel = v === scaleVal;
                    return (
                      <button
                        key={scaleVal}
                        type="button"
                        onClick={() => handleSelectLikert(qIdx, scaleVal)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-xs)',
                          background: sel ? '#ffffff' : 'transparent',
                          color: sel ? '#000000' : 'var(--text-secondary)',
                          border: `1px solid ${sel ? '#ffffff' : 'var(--border-primary)'}`,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {scaleVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          {canGoBack ? (
            <button
              type="button"
              onClick={onPrevious}
              disabled={isProcessing}
              style={{
                padding: '12px 18px',
                fontSize: '0.9rem',
                background: 'transparent',
                color: '#ffffff',
                border: '1px solid var(--border-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing || !isComplete}
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              background: isComplete ? '#ffffff' : '#262626',
              color: isComplete ? '#000000' : '#737373',
              borderColor: isComplete ? '#ffffff' : '#262626',
              fontWeight: 700,
              cursor: isComplete ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isProcessing ? (
              'Saving...'
            ) : isLastStep ? (
              <>
                <Save size={16} /> Save to Excel
              </>
            ) : (
              <>
                Next Section <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
