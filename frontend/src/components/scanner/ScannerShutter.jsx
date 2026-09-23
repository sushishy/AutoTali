import React from 'react';
import { Camera } from 'lucide-react';

export default function ScannerShutter({
  frozenImage,
  isProcessing,
  hasResult,
  onViewAnswers,
  onCaptureFrame,
  onFileFallback,
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
        gap: 10,
      }}
    >
      {/* View Answers Pill Button (Mobile) */}
      {hasResult && onViewAnswers && (
        <button
          onClick={onViewAnswers}
          className="view-answers-pill"
          style={{
            padding: '8px 18px',
            fontSize: '0.8rem',
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #ffffff',
            borderRadius: 20,
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <span>View Answers</span> &rarr;
        </button>
      )}

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
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
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
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-sm)',
          color: '#a3a3a3',
          fontSize: '0.7rem',
          cursor: 'pointer',
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
