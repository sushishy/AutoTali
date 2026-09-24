import React from 'react';

const SCALE_VALUES = [5, 4, 3, 2, 1];

export default function LikertQuestionList({ values = [], onSelectLikert }) {
  return (
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
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Question {qIdx + 1}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {SCALE_VALUES.map((scaleVal) => {
              const sel = v === scaleVal;
              return (
                <button
                  key={scaleVal}
                  type="button"
                  className="likert-scale-btn"
                  onClick={() => onSelectLikert(qIdx, scaleVal)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-xs)',
                    background: sel ? 'var(--text-primary)' : 'transparent',
                    color: sel ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${sel ? 'var(--text-primary)' : 'var(--border-primary)'}`,
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
  );
}
