import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Camera, AlertCircle } from 'lucide-react';

export default function CameraScanner({ onCapture, frozenImage, isProcessing }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (fallbackErr) {
        setCameraError('Camera access denied or unavailable.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (zoomLevel > 1.0) {
      const cropW = canvas.width / zoomLevel;
      const cropH = canvas.height / zoomLevel;
      const sx = (canvas.width - cropW) / 2;
      const sy = (canvas.height - cropH) / 2;
      ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {frozenImage ? (
        <img src={frozenImage} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease-out' }}
        />
      )}

      {/* Viewfinder Target */}
      {!frozenImage && (
        <div style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', border: '1px dashed #ffffff', opacity: 0.5, borderRadius: 4, pointerEvents: 'none' }} />
      )}

      {/* Minimalist Zoom Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.8)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
        <button onClick={() => setZoomLevel((z) => Math.max(1.0, +(z - 0.2).toFixed(1)))} style={{ padding: '4px 6px', background: 'transparent', border: 'none' }}>
          <ZoomOut size={14} />
        </button>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, alignSelf: 'center', minWidth: 28, textAlign: 'center' }}>
          {zoomLevel}x
        </span>
        <button onClick={() => setZoomLevel((z) => Math.min(3.0, +(z + 0.2).toFixed(1)))} style={{ padding: '4px 6px', background: 'transparent', border: 'none' }}>
          <ZoomIn size={14} />
        </button>
        <button onClick={() => setZoomLevel(1.0)} style={{ padding: '4px 6px', background: 'transparent', border: 'none' }} title="Reset Zoom">
          <RotateCcw size={13} />
        </button>
      </div>

      {cameraError && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 6, background: '#171717', border: '1px solid #404040', color: '#fff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <AlertCircle size={15} /> {cameraError}
        </div>
      )}

      {/* Minimalist Shutter Button */}
      {!frozenImage && (
        <div style={{ position: 'absolute', bottom: 18, zIndex: 10 }}>
          <button
            onClick={captureFrame}
            disabled={isProcessing}
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
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff' }} />
          </button>
        </div>
      )}
    </div>
  );
}
