import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Camera, AlertCircle, Zap, ZapOff, Maximize, Minimize } from 'lucide-react';

export default function CameraScanner({ onCapture, frozenImage, isProcessing }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [cameraError, setCameraError] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const checkTorchSupport = (stream) => {
    try {
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
          return;
        }
      }
    } catch (e) {
      // Capabilities not supported on some platforms
    }
    // Still allow attempting torch toggle on modern mobile browsers
    setHasTorch(true);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Torch not supported or failed to toggle:', err);
    }
  };

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
      checkTorchSupport(stream);
      setCameraError(null);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        checkTorchSupport(stream);
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

  useEffect(() => {
    // When unfreezing (retake, next step, etc.), re-ensure video is playing stream
    if (!frozenImage) {
      const activeTracks = streamRef.current
        ? streamRef.current.getVideoTracks().filter((t) => t.readyState === 'live')
        : [];

      if (activeTracks.length === 0) {
        // Stream ended or interrupted (e.g. mobile browser suspended track), restart camera
        startCamera();
      } else if (videoRef.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        videoRef.current.play().catch(() => {});
      }
    }
  }, [frozenImage]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Captured Frozen Image Overlay */}
      {frozenImage && (
        <img
          src={frozenImage}
          alt="Capture Overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 2,
            background: '#0a0a0a',
          }}
        />
      )}

      {/* Persistent Live Video Feed */}
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
          transition: 'transform 0.1s ease-out',
          display: frozenImage ? 'none' : 'block',
        }}
      />

      {/* Viewfinder Target */}
      {!frozenImage && (
        <div style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', border: '1px dashed #ffffff', opacity: 0.5, borderRadius: 4, pointerEvents: 'none' }} />
      )}

      {/* Minimalist Controls Toolbar (Flash & Zoom) */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.85)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)', alignItems: 'center' }}>
        {hasTorch && (
          <>
            <button
              onClick={toggleTorch}
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
        <button onClick={() => setZoomLevel((z) => Math.max(1.0, +(z - 0.2).toFixed(1)))} style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ZoomOut size={14} />
        </button>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, alignSelf: 'center', minWidth: 28, textAlign: 'center' }}>
          {zoomLevel}x
        </span>
        <button onClick={() => setZoomLevel((z) => Math.min(3.0, +(z + 0.2).toFixed(1)))} style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ZoomIn size={14} />
        </button>
        <button onClick={() => setZoomLevel(1.0)} style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Reset Zoom">
          <RotateCcw size={13} />
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border-primary)', margin: '0 2px' }} />
        <button
          onClick={toggleFullscreen}
          style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Camera'}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      {cameraError && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 6, background: '#171717', border: '1px solid #404040', color: '#fff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <AlertCircle size={15} /> {cameraError}
        </div>
      )}

      {/* Minimalist Shutter Button */}
      {!frozenImage && (
        <div style={{ position: 'absolute', bottom: 18, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Direct Camera Shutter */}
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

          {/* Native Phone Camera Fallback (Works on HTTP without SSL restrictions!) */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.8)',
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
                      onCapture(event.target.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
