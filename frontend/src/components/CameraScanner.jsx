import React, { useRef, useState, useEffect } from 'react';

export default function CameraScanner({ onCapture, frozenImage, isProcessing }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      // Request rear camera with high resolution
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
      setHasCamera(true);
      setCameraError(null);
    } catch (err) {
      console.warn('Environment camera failed, trying default camera:', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
        setCameraError(null);
      } catch (fallbackErr) {
        setHasCamera(false);
        setCameraError('Camera access denied or unavailable. Please grant camera permission.');
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

    // Apply digital zoom crop
    if (zoomLevel > 1.0) {
      const cropW = canvas.width / zoomLevel;
      const cropH = canvas.height / zoomLevel;
      const sx = (canvas.width - cropW) / 2;
      const sy = (canvas.height - cropH) / 2;
      ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const base64Data = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(base64Data);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {frozenImage ? (
        <img
          src={frozenImage}
          alt="Frozen Capture"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.15s ease-out',
          }}
        />
      )}

      {/* Camera guide boundary box */}
      {!frozenImage && (
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            right: '10%',
            bottom: '15%',
            border: '2px dashed rgba(56, 189, 248, 0.6)',
            borderRadius: 8,
            pointerEvents: 'none',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ position: 'absolute', top: 8, left: 10, fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
            Align Questionnaire Here
          </div>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, background: 'rgba(15, 23, 42, 0.75)', padding: '4px 8px', borderRadius: 9999, backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => setZoomLevel((z) => Math.max(1.0, +(z - 0.2).toFixed(1)))}
          style={{ background: 'transparent', color: '#fff', fontSize: '0.9rem', padding: '2px 6px' }}
        >
          ➖
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, alignSelf: 'center', minWidth: 32, textAlign: 'center' }}>
          {zoomLevel}x
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(3.0, +(z + 0.2).toFixed(1)))}
          style={{ background: 'transparent', color: '#fff', fontSize: '0.9rem', padding: '2px 6px' }}
        >
          ➕
        </button>
      </div>

      {cameraError && (
        <div style={{ position: 'absolute', background: 'rgba(244,63,94,0.9)', color: '#fff', padding: 12, borderRadius: 8, margin: 16, textAlign: 'center', fontSize: '0.85rem' }}>
          {cameraError}
        </div>
      )}

      {/* Floating Capture Shutter Button */}
      {!frozenImage && (
        <div style={{ position: 'absolute', bottom: 16, zIndex: 10 }}>
          <button
            onClick={captureFrame}
            disabled={isProcessing}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid #38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#38bdf8' }} />
          </button>
        </div>
      )}
    </div>
  );
}
