import React from 'react';
import { Zap } from 'lucide-react';

export default function ScannerViewfinder({
  autoScanEnabled,
  isAutoLocking,
  livePreview,
  sectionName,
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
          border: isAutoLocking ? '2px solid #22c55e' : '1px dashed rgba(255, 255, 255, 0.45)',
          borderRadius: 6,
          pointerEvents: 'none',
          overflow: 'hidden',
          boxShadow: isAutoLocking ? '0 0 25px rgba(34, 197, 94, 0.7)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Laser Sweep Animation when Auto-Scan is Active */}
        {autoScanEnabled && !isAutoLocking && <div className="scanner-laser-line" />}

        {/* Corner Guides */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTop: '2px solid #22c55e', borderLeft: '2px solid #22c55e' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTop: '2px solid #22c55e', borderRight: '2px solid #22c55e' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottom: '2px solid #22c55e', borderLeft: '2px solid #22c55e' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottom: '2px solid #22c55e', borderRight: '2px solid #22c55e' }} />
      </div>

      {/* Floating Status Pill */}
      {autoScanEnabled && (
        <div className="scanner-status-pill">
          {isAutoLocking ? (
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
              ✓ Captured!
            </span>
          ) : livePreview ? (
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot" /> Detecting: {livePreview}
            </span>
          ) : (
            <span style={{ color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} color="#22c55e" fill="#22c55e" />
              <span>Aim at {sectionName || 'Questionnaire'}</span>
            </span>
          )}
        </div>
      )}
    </>
  );
}
