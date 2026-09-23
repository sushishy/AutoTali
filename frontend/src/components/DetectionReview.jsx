import React from 'react';

export default function DetectionReview({ section, detectedVal, onChange, onRetake, onConfirm, isLastStep, isProcessing }) {
  const isStrand = section.type === 'strand';

  return (
    <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Detection Review
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to adjust</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isStrand ? (
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Selected Strand:
            </label>
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
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 8,
                    textAlign: 'left',
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-main)',
                    border: `2px solid ${active ? 'var(--accent-primary)' : 'transparent'}`,
                    color: active ? '#fff' : 'var(--text-muted)',
                    fontWeight: active ? 700 : 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{label}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Scale (5 = Always, 1 = Never):
            </label>
            {Array.isArray(detectedVal) &&
              detectedVal.map((v, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Q{qIdx + 1}</span>
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
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-sm)',
                            background: sel ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                            color: sel ? '#0f172a' : '#fff',
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
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button
          onClick={onRetake}
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card-subtle)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          🔄 Retake
        </button>

        <button
          onClick={onConfirm}
          disabled={isProcessing}
          style={{
            flex: 2,
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            background: isLastStep ? 'var(--accent-emerald)' : 'var(--accent-primary)',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          {isProcessing ? 'Saving...' : isLastStep ? '💾 Save to Excel' : 'Next Section ➔'}
        </button>
      </div>
    </div>
  );
}
