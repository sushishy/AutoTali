import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Zap, ZapOff, Maximize, Minimize } from 'lucide-react';

export default function ScannerToolbar({
  autoScanEnabled,
  onToggleAutoScan,
  hasTorch,
  torchOn,
  onToggleTorch,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isFullscreen,
  onToggleFullscreen,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        display: 'flex',
        gap: 4,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: 4,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-primary)',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      {/* Auto-Scan Toggle Button */}
      <button
        onClick={onToggleAutoScan}
        title={autoScanEnabled ? 'Auto-Scan ON' : 'Auto-Scan OFF'}
        style={{
          padding: '4px 7px',
          background: autoScanEnabled ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
          color: autoScanEnabled ? '#3b82f6' : '#737373',
          border: autoScanEnabled ? '1px solid #3b82f6' : '1px solid transparent',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.7rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        <Zap size={13} fill={autoScanEnabled ? '#3b82f6' : 'none'} />
        <span>{autoScanEnabled ? 'AUTO' : 'OFF'}</span>
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />

      {/* Torch Toggle */}
      {hasTorch && (
        <>
          <button
            onClick={onToggleTorch}
            title={torchOn ? 'Turn off flash' : 'Turn on flash'}
            style={{
              padding: '4px 6px',
              background: torchOn ? '#ffffff' : 'transparent',
              color: torchOn ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            {torchOn ? <Zap size={14} fill="#000000" /> : <ZapOff size={14} color="#a3a3a3" />}
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />
        </>
      )}

      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        title="Zoom out"
      >
        <ZoomOut size={14} />
      </button>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, alignSelf: 'center', minWidth: 26, textAlign: 'center' }}>
        {zoomLevel}x
      </span>
      <button
        onClick={onZoomIn}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        title="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={onResetZoom}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        title="Reset Zoom"
      >
        <RotateCcw size={13} />
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />

      {/* Fullscreen Button */}
      <button
        onClick={onToggleFullscreen}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Camera'}
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </button>
    </div>
  );
}
