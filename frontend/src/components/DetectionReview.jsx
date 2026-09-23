import React from 'react';
import { RotateCcw, ArrowRight, Save, Check, ChevronLeft } from 'lucide-react';

export default function DetectionReview({
  section,
  detectedVal,
  onChange,
  onRetake,
  onConfirm,
  onPrevious,
  canGoBack,
  isLastStep,
  isProcessing,
}) {
  const isStrand = section.type === 'strand';

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Review Answers
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to edit</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isStrand ? (
          <div>
            {[
              { val: 1, label: '1 — STEM' },
              { val: 2, label: '2 — TVL-ICT' },
              { val: 3, label: '3 — Non-Aligned' },
            ].map(({ val, label }) => {
              const active = detectedVal === val;
              return (
                <button
                  key={val}
                  onClick={() => onChange(val)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 6,
                    textAlign: 'left',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#000000' : 'var(--text-secondary)',
                    borderColor: active ? '#ffffff' : 'var(--border-primary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{label}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            {Array.isArray(detectedVal) &&
              detectedVal.map((v, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Q{qIdx + 1}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[5, 4, 3, 2, 1].map((scaleVal) => {
                      const sel = v === scaleVal;
                      return (
                        <button
                          key={scaleVal}
                          onClick={() => {
                            const updated = [...detectedVal];
                            updated[qIdx] = scaleVal;
                            onChange(updated);
                          }}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 'var(--radius-xs)',
                            background: sel ? '#ffffff' : 'transparent',
                            color: sel ? '#000000' : 'var(--text-secondary)',
                            borderColor: sel ? '#ffffff' : 'var(--border-primary)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
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
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {canGoBack && (
          <button
            onClick={onPrevious}
            disabled={isProcessing}
            title="Go back to previous section"
            style={{
              padding: '10px 12px',
              fontSize: '0.85rem',
              background: 'transparent',
              color: '#ffffff',
              borderColor: 'var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ChevronLeft size={15} /> Back
          </button>
        )}

        <button
          onClick={onRetake}
          disabled={isProcessing}
          style={{ flex: 1, padding: 10, fontSize: '0.85rem', background: 'transparent', color: '#ffffff' }}
        >
          <RotateCcw size={14} /> Retake
        </button>

        {(() => {
          const isComplete = isStrand
            ? detectedVal !== null && detectedVal !== undefined
            : Array.isArray(detectedVal) && detectedVal.length === 5 && detectedVal.every((v) => v >= 1 && v <= 5);

          return (
            <button
              onClick={onConfirm}
              disabled={isProcessing || !isComplete}
              style={{
                flex: 2,
                padding: 10,
                fontSize: '0.85rem',
                background: isComplete ? '#ffffff' : '#262626',
                color: isComplete ? '#000000' : '#737373',
                borderColor: isComplete ? '#ffffff' : '#262626',
                fontWeight: 700,
                cursor: isComplete ? 'pointer' : 'not-allowed',
              }}
              title={!isComplete ? 'Please complete this section before proceeding' : ''}
            >
              {isProcessing ? 'Saving...' : isLastStep ? <><Save size={14} /> Save to Excel</> : <>Next <ArrowRight size={14} /></>}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
