import React from 'react';
import { Camera, Crop } from 'lucide-react';

export default function ScannerShutter({
  frozenImage,
  isProcessing,
  hasResult,
  onViewAnswers,
  onCaptureFrame,
  onFileFallback,
  onAdjustCrop,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 18,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Top action pills (View Answers & Adjust Crop) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {frozenImage && onAdjustCrop && (
          <button
            onClick={onAdjustCrop}
            style={{
              padding: '7px 14px',
              fontSize: '0.75rem',
              background: 'var(--bg-elevated)',
              color: '#3b82f6',
              border: '1.5px solid #3b82f6',
              borderRadius: 20,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
            }}
          >
            <Crop size={13} /> Adjust Crop
          </button>
        )}

        {hasResult && onViewAnswers && (
          <button
            onClick={onViewAnswers}
            className="view-answers-pill"
            style={{
              padding: '8px 18px',
              fontSize: '0.8rem',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: '1px solid var(--text-primary)',
              borderRadius: 20,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <span>View Answers</span> &rarr;
          </button>
        )}
      </div>

      {/* Direct Camera Shutter */}
      <button
        onClick={onCaptureFrame}
        disabled={isProcessing}
        title={frozenImage ? 'Tap to retake / snap another photo' : 'Capture photo manually'}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: '#000000',
          border: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff' }} />
      </button>

      {/* Native Phone Camera Fallback */}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          fontSize: '0.7rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Camera size={12} /> Snap Photo (Phone Camera)
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  onFileFallback?.(event.target.result);
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
    </div>
  );
}
