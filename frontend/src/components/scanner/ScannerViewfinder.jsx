import React from 'react';

export default function ScannerViewfinder({
  autoScanEnabled,
  isAutoLocking,
  livePreview,
}) {
  return (
    <>
      {/* Target Framing Box */}
      <div
        className={isAutoLocking ? 'viewfinder-locked' : ''}
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          right: '8%',
          bottom: '16%',
          border: isAutoLocking ? '2px solid #3b82f6' : '1px dashed rgba(255, 255, 255, 0.45)',
          borderRadius: 6,
          pointerEvents: 'none',
          overflow: 'hidden',
          boxShadow: isAutoLocking ? '0 0 25px rgba(59, 130, 246, 0.7)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Blue Laser Sweep Animation when Auto-Scan is Active */}
        {autoScanEnabled && !isAutoLocking && <div className="scanner-laser-line" />}

        {/* Blue Corner Guides */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' }} />
      </div>

      {/* Floating Status Pill — shown only during detection/lock, without static description text */}
      {autoScanEnabled && (isAutoLocking || livePreview) && (
        <div className="scanner-status-pill">
          {isAutoLocking ? (
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              ✓ Captured!
            </span>
          ) : (
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <span className="pulse-dot" /> {livePreview}
            </span>
          )}
        </div>
      )}
    </>
  );
}
