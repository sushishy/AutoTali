import React, { useRef, useEffect } from 'react';
import { ArrowRight, Save, ChevronLeft, Dices } from 'lucide-react';
import { generateRandomSectionAnswer } from '../utils/randomizer';
import StrandSelector from './manual/StrandSelector';
import LikertQuestionList from './manual/LikertQuestionList';

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
  const scrollRef = useRef(null);
  const isStrand = section.type === 'strand';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex]);

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
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="manual-entry-card"
        style={{
          maxWidth: 680,
          width: '100%',
          minHeight: 460,
          margin: 'auto',
          background: 'var(--bg-secondary)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Card Header */}
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
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
              color: isComplete ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        </div>

        {/* Input Body (Strand or Likert) */}
        {isStrand ? (
          <StrandSelector currentVal={currentVal} onChange={onChange} />
        ) : (
          <LikertQuestionList values={values} onSelectLikert={handleSelectLikert} />
        )}

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 10 }}>
          {canGoBack ? (
            <button
              type="button"
              onClick={onPrevious}
              disabled={isProcessing}
              style={{
                padding: '12px 18px',
                fontSize: '0.9rem',
                background: 'transparent',
                color: 'var(--text-primary)',
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
          ) : (
            <div style={{ width: 85 }} />
          )}

          {/* Randomizer Icon Button */}
          <button
            type="button"
            onClick={() => onChange(generateRandomSectionAnswer(section))}
            disabled={isProcessing}
            title="Randomize section answers (best-possible rating)"
            style={{
              padding: '12px 18px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Dices size={18} />
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing || !isComplete}
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              background: isComplete ? 'var(--text-primary)' : 'var(--bg-subtle)',
              color: isComplete ? 'var(--bg-primary)' : 'var(--text-muted)',
              borderColor: isComplete ? 'var(--text-primary)' : 'var(--border-primary)',
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
