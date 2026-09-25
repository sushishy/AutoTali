import React from 'react';
import StarryChoiceButton from '../common/StarryChoiceButton';

const SCALE_VALUES = [5, 4, 3, 2, 1];

export default function LikertQuestionList({ values = [], onSelectLikert }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'visible' }}>
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
            overflow: 'visible',
          }}
        >
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Question {qIdx + 1}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, overflow: 'visible' }}>
            {SCALE_VALUES.map((scaleVal) => {
              const sel = v === scaleVal;
              return (
                <StarryChoiceButton
                  key={scaleVal}
                  variant="likert"
                  isSelected={sel}
                  onClick={() => onSelectLikert(qIdx, scaleVal)}
                >
                  {scaleVal}
                </StarryChoiceButton>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
