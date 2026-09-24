import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X, RotateCcw, Crop } from 'lucide-react';

export default function ScannerCropAdjuster({
  fullImage,
  onApplyCrop,
  onCancel,
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop, setCrop] = useState({ x: 0.1, y: 0.15, w: 0.8, h: 0.7 });
  const dragRef = useRef(null);

  // Initialize crop centered
  useEffect(() => {
    setCrop({ x: 0.08, y: 0.12, w: 0.84, h: 0.76 });
  }, [fullImage]);

  const handlePointerDown = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      type,
      startX: clientX,
      startY: clientY,
      initCrop: { ...crop },
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current || !containerRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (clientX - dragRef.current.startX) / rect.width;
    const dy = (clientY - dragRef.current.startY) / rect.height;

    const { type, initCrop } = dragRef.current;
    let next = { ...initCrop };

    if (type === 'move') {
      next.x = Math.max(0, Math.min(1 - next.w, initCrop.x + dx));
      next.y = Math.max(0, Math.min(1 - next.h, initCrop.y + dy));
    } else {
      if (type.includes('left')) {
        const maxX = initCrop.x + initCrop.w - 0.15;
        next.x = Math.max(0, Math.min(maxX, initCrop.x + dx));
        next.w = initCrop.w - (next.x - initCrop.x);
      }
      if (type.includes('right')) {
        next.w = Math.max(0.15, Math.min(1 - initCrop.x, initCrop.w + dx));
      }
      if (type.includes('top')) {
        const maxY = initCrop.y + initCrop.h - 0.15;
        next.y = Math.max(0, Math.min(maxY, initCrop.y + dy));
        next.h = initCrop.h - (next.y - initCrop.y);
      }
      if (type.includes('bottom')) {
        next.h = Math.max(0.15, Math.min(1 - initCrop.y, initCrop.h + dy));
      }
    }
    setCrop(next);
  }, [crop]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const confirmCrop = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const natW = img.naturalWidth || 1280;
    const natH = img.naturalHeight || 720;

    const sx = Math.round(crop.x * natW);
    const sy = Math.round(crop.y * natH);
    const sw = Math.round(crop.w * natW);
    const sh = Math.round(crop.h * natH);

    canvas.width = Math.max(10, sw);
    canvas.height = Math.max(10, sh);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onApplyCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0, 0, 0, 0.92)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(20, 20, 20, 0.95)', borderBottom: '1px solid #333' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Crop size={15} /> Adjust Table Crop Area
        </span>
        <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Main Crop Viewport */}
      <div ref={containerRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
        <img
          ref={imageRef}
          src={fullImage}
          alt="Full Crop Target"
          onLoad={() => setImgLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
        />

        {imgLoaded && (
          <div
            onMouseDown={(e) => handlePointerDown('move', e)}
            onTouchStart={(e) => handlePointerDown('move', e)}
            style={{
              position: 'absolute',
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
              border: '2px solid #3b82f6',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
              cursor: 'move',
              boxSizing: 'border-box',
            }}
          >
            {/* Guide Grid Lines (5x5 Faint Guidelines) */}
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', pointerEvents: 'none' }}>
              {[...Array(25)].map((_, i) => (
                <div key={i} style={{ borderRight: (i % 5 < 4) ? '1px dashed rgba(59, 130, 246, 0.25)' : 'none', borderBottom: (i < 20) ? '1px dashed rgba(59, 130, 246, 0.25)' : 'none' }} />
              ))}
            </div>

            {/* 4 Corner Handles */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
              const [v, h] = pos.split('-');
              return (
                <div
                  key={pos}
                  onMouseDown={(e) => handlePointerDown(pos, e)}
                  onTouchStart={(e) => handlePointerDown(pos, e)}
                  style={{
                    position: 'absolute',
                    [v]: -9,
                    [h]: -9,
                    width: 20,
                    height: 20,
                    background: '#3b82f6',
                    borderRadius: 4,
                    border: '2px solid #ffffff',
                    cursor: `${pos}-resize`,
                    zIndex: 2,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(15, 15, 15, 0.95)', borderTop: '1px solid #333', gap: 10 }}>
        <button
          onClick={() => setCrop({ x: 0.08, y: 0.12, w: 0.84, h: 0.76 })}
          style={{ padding: '8px 12px', background: '#262626', color: '#fff', border: '1px solid #404040', borderRadius: 6, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <RotateCcw size={14} /> Reset
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 14px', background: 'transparent', color: '#a3a3a3', border: '1px solid #404040', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={confirmCrop}
            style={{ padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.4)' }}
          >
            <Check size={15} /> Scan Crop
          </button>
        </div>
      </div>
    </div>
  );
}
