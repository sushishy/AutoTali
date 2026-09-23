import React, { useRef, useState, useEffect } from 'react';

const SCALE_COLS = [5, 4, 3, 2, 1];
const STRAND_LABELS = ['1. STEM', '2. TVL-ICT', '3. Non-Aligned'];

export default function ScannerViewfinder({
  section = { type: 'grid' },
  rotation = 0,
  autoScanEnabled = true,
  isAutoLocking = false,
  liveAnswers = null,
  livePreview = null,
}) {
  const isStrand = section.type === 'strand';
  const containerRef = useRef(null);
  const [parentDims, setParentDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current?.parentElement) {
        const rect = containerRef.current.parentElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setParentDims({ w: rect.width, h: rect.height });
        }
      }
    };
    updateDims();
    let ro;
    if (typeof window !== 'undefined' && window.ResizeObserver && containerRef.current?.parentElement) {
      ro = new ResizeObserver(updateDims);
      ro.observe(containerRef.current.parentElement);
    }
    window.addEventListener('resize', updateDims);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateDims);
    };
  }, []);

  const isSideways = rotation === 90 || rotation === 270;
  const pW = parentDims.w || (typeof window !== 'undefined' ? window.innerWidth : 360);
  const pH = parentDims.h || (typeof window !== 'undefined' ? window.innerHeight : 640);

  // Available viewing area reserving space for toolbar (~50px) and shutter (~90px)
  const availW = Math.max(220, pW * 0.90);
  const availH = Math.max(220, (pH - 130) * 0.95);

  const strandMaxH = 260;
  const gridMaxH = 520;
  const maxNormalH = isStrand ? strandMaxH : gridMaxH;

  const boxW = isSideways ? Math.min(availH, 480) : Math.min(availW, 460);
  const boxH = isSideways ? Math.min(availW, isStrand ? 240 : 380) : Math.min(availH, maxNormalH);

  return (
    <div
      ref={containerRef}
      className={isAutoLocking ? 'viewfinder-locked' : ''}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: boxW,
        height: boxH,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        border: isAutoLocking ? '2px solid #3b82f6' : '1.5px solid rgba(255, 255, 255, 0.35)',
        borderRadius: 8,
        pointerEvents: 'none',
        overflow: 'hidden',
        boxShadow: isAutoLocking ? '0 0 28px rgba(59, 130, 246, 0.75)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s ease, height 0.2s ease, border-color 0.15s ease',
      }}
    >
      {/* Laser Sweep Animation */}
      {autoScanEnabled && !isAutoLocking && <div className="scanner-laser-line" />}

      {/* Blue Corner Accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2.5px solid #3b82f6', borderLeft: '2.5px solid #3b82f6' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2.5px solid #3b82f6', borderRight: '2.5px solid #3b82f6' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2.5px solid #3b82f6', borderLeft: '2.5px solid #3b82f6' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2.5px solid #3b82f6', borderRight: '2.5px solid #3b82f6' }} />

      {/* Floating Status Pill when detection active */}
      {autoScanEnabled && (isAutoLocking || livePreview) && (
        <div className="scanner-status-pill">
          {isAutoLocking ? (
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              ✓ Locked!
            </span>
          ) : (
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <span className="pulse-dot" /> {livePreview}
            </span>
          )}
        </div>
      )}

      {/* =========================================================================
          STEADY FIXED SCANNING GUIDE (Likert 5x5 Grid OR 3-Choice Strand)
         ========================================================================= */}
      {isStrand ? (
        /* PART I STRAND: 3 Steady Target Boxes */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 20px', gap: 14 }}>
          {STRAND_LABELS.map((label, idx) => {
            const isSelected = liveAnswers === idx + 1;
            return (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  border: isSelected ? '1.5px solid #3b82f6' : '1px dashed rgba(255, 255, 255, 0.25)',
                  borderRadius: 6,
                }}
              >
                {/* Target Checkbox with Active Glowing Dot */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? '#1e3a8a' : 'transparent',
                  }}
                >
                  {isSelected ? (
                    <div className="guide-dot-active" />
                  ) : (
                    <div className="guide-dot-faint" />
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)' }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID SECTIONS: Steady 5x5 Grid Target Guide */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 10px', justifyContent: 'space-between' }}>
          {/* Header Row: Scale Columns (5, 4, 3, 2, 1) */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: 4 }}>
            <div style={{ width: '38%', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.04em' }}>
              ALIGN TABLE
            </div>
            <div style={{ width: '62%', display: 'flex', justifyContent: 'space-around' }}>
              {SCALE_COLS.map((colVal) => (
                <div
                  key={colVal}
                  style={{
                    width: '20%',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#60a5fa',
                  }}
                >
                  {colVal}
                </div>
              ))}
            </div>
          </div>

          {/* 5 Rows for Q1 to Q5 */}
          {[0, 1, 2, 3, 4].map((rowIdx) => {
            const rowAns = Array.isArray(liveAnswers) ? liveAnswers[rowIdx] : null;

            return (
              <div
                key={rowIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  borderBottom: rowIdx < 4 ? '1px dashed rgba(255, 255, 255, 0.1)' : 'none',
                }}
              >
                {/* Question Label */}
                <div style={{ width: '38%', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: rowAns ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                      padding: '2px 6px',
                      background: rowAns ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 4,
                      border: rowAns ? '1px solid #3b82f6' : '1px solid transparent',
                    }}
                  >
                    Q{rowIdx + 1}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />
                </div>

                {/* 5 Column Checkbox Targets for this Row */}
                <div style={{ width: '62%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
                  {SCALE_COLS.map((colScale) => {
                    const isSelected = rowAns === colScale;

                    return (
                      <div
                        key={colScale}
                        style={{
                          width: '18%',
                          height: '75%',
                          maxHeight: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '1.5px solid #3b82f6' : '1px dashed rgba(255, 255, 255, 0.22)',
                          borderRadius: 4,
                          background: isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected ? (
                          <div className="guide-dot-active" />
                        ) : (
                          <div className="guide-dot-faint" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
