import React from 'react';

export default function SummaryView({
  respondentNo,
  sections,
  collectedData,
  currentStepIdx,
  onSelectStep,
}) {
  return (
    <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: 'var(--bg-secondary)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Respondent #{respondentNo} — Summary
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sections.map((sec, idx) => {
            const answer = collectedData[sec.id];
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={sec.id}
                onClick={() => onSelectStep(idx)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                  border: `1px solid ${isCurrent ? 'var(--text-primary)' : 'var(--border-primary)'}`,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {idx + 1}. {sec.name}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    color: answer ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                >
                  {answer
                    ? Array.isArray(answer)
                      ? `[ ${answer.join(', ')} ]`
                      : `Choice ${answer}`
                    : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
