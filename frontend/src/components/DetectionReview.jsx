import React, { useRef, useState } from 'react';
import { RotateCcw, ArrowRight, Save, Check, ChevronLeft, ChevronDown, Dices } from 'lucide-react';
import { generateRandomSectionAnswer } from '../utils/randomizer';

export default function DetectionReview({
  section,
  detectedVal,
  onChange,
  onRetake,
  onConfirm,
  onPrevious,
  onDismiss,
  canGoBack,
  isLastStep,
  isProcessing,
}) {
  const isStrand = section.type === 'strand';
  const touchStartY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 75) {
      if (onDismiss) onDismiss();
    }
    setDragOffset(0);
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        padding: '10px 16px 16px 16px',
        borderRadius: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid var(--border-primary)',
        transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : 'none',
        transition: dragOffset > 0 ? 'none' : 'transform 0.2s ease',
      }}
    >
      {/* Mobile Swipe-Down Handle Bar */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onDismiss}
        style={{
          width: '100%',
          padding: '4px 0 10px 0',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
        title="Swipe down or tap to close card"
      >
        <div style={{ width: 42, height: 5, background: 'var(--border-primary)', borderRadius: 3 }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Swipe down to view camera
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            {section.name}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Detected answers &bull; Tap to adjust</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onRetake}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
            }}
          >
            Retake
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              title="Close card"
              style={{
                padding: '4px 6px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
              }}
            >
              <ChevronDown size={14} />
            </button>
          )}
        </div>
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
                    background: active ? 'var(--text-primary)' : 'var(--bg-elevated)',
                    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-primary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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
                            background: sel ? 'var(--text-primary)' : 'transparent',
                            color: sel ? 'var(--bg-primary)' : 'var(--text-primary)',
                            border: sel ? '1px solid var(--text-primary)' : '1px solid var(--border-primary)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
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
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={15} /> Back
          </button>
        )}

        <button
          onClick={onRetake}
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: 10,
            fontSize: '0.85rem',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
        >
          <RotateCcw size={14} /> Retake
        </button>

        <button
          onClick={() => onChange(generateRandomSectionAnswer(section))}
          disabled={isProcessing}
          title="Randomize section answers (best possible rating)"
          style={{
            padding: '10px 14px',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Dices size={16} />
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
                background: isComplete ? 'var(--text-primary)' : 'var(--bg-subtle)',
                color: isComplete ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: isComplete ? '1px solid var(--text-primary)' : '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                cursor: isComplete && !isProcessing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
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
