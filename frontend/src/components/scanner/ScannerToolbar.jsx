import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Zap, ZapOff, Maximize, Minimize } from 'lucide-react';

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
  rotation = 0,
  onRotate,
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
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        padding: 4,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-primary)',
        alignItems: 'center',
        zIndex: 30,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Auto / Manual Mode Toggle Button */}
      <button
        type="button"
        onClick={onToggleAutoScan}
        title={autoScanEnabled ? 'Auto Mode: ON (Scanning automatically)' : 'Manual Mode: ON (Tap shutter button to capture)'}
        style={{
          padding: '5px 9px',
          background: autoScanEnabled ? 'rgba(59, 130, 246, 0.22)' : 'var(--bg-subtle)',
          color: autoScanEnabled ? '#3b82f6' : 'var(--text-secondary)',
          border: autoScanEnabled ? '1px solid #3b82f6' : '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          touchAction: 'manipulation',
          userSelect: 'none',
        }}
      >
        <Zap size={13} fill={autoScanEnabled ? '#3b82f6' : 'none'} />
        <span>{autoScanEnabled ? 'AUTO' : 'MANUAL'}</span>
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />

      {/* Rotation Button (Portrait / Landscape flip) */}
      <button
        onClick={onRotate}
        title={`Rotate 90° for Portrait/Landscape (currently ${rotation}°)`}
        style={{
          padding: '4px 6px',
          background: rotation !== 0 ? 'rgba(59, 130, 246, 0.22)' : 'transparent',
          color: rotation !== 0 ? '#3b82f6' : 'var(--text-primary)',
          border: 'none',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
        }}
      >
        <RotateCw size={14} />
        {rotation !== 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{rotation}°</span>}
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
              background: torchOn ? '#f59e0b' : 'transparent',
              color: torchOn ? '#000000' : 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            {torchOn ? <Zap size={14} fill="#000000" /> : <ZapOff size={14} />}
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />
        </>
      )}

      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        title="Zoom out"
      >
        <ZoomOut size={14} />
      </button>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', alignSelf: 'center', minWidth: 26, textAlign: 'center' }}>
        {zoomLevel}x
      </span>
      <button
        onClick={onZoomIn}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        title="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={onResetZoom}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        title="Reset Zoom"
      >
        <RotateCcw size={13} />
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />

      {/* Fullscreen Button */}
      <button
        onClick={onToggleFullscreen}
        style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Camera'}
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </button>
    </div>
  );
}
