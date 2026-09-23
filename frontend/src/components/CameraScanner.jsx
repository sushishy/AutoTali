import React, { useRef, useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAutoScan } from '../hooks/useAutoScan';
import ScannerToolbar from './scanner/ScannerToolbar';
import ScannerViewfinder from './scanner/ScannerViewfinder';
import ScannerShutter from './scanner/ScannerShutter';

export default function CameraScanner({
  sectionId = 1,
  sectionName = '',
  onCapture,
  onAutoLock,
  frozenImage,
  isProcessing,
  onViewAnswers,
  hasResult,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [cameraError, setCameraError] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { autoScanEnabled, toggleAutoScan, livePreview, isAutoLocking } = useAutoScan({
    videoRef,
    sectionId,
    frozenImage,
    isProcessing,
    zoomLevel,
    onAutoLock,
  });

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

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const nextState = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setHasTorch(true);
      setCameraError(null);
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasTorch(true);
        setCameraError(null);
      } catch {
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
      ctx.drawImage(video, (canvas.width - cropW) / 2, (canvas.height - cropH) / 2, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    onCapture?.(canvas.toDataURL('image/jpeg', 0.9));
  };

  // Re-sync video playback on unfreeze
  useEffect(() => {
    if (!frozenImage) {
      const activeTracks = streamRef.current
        ? streamRef.current.getVideoTracks().filter((t) => t.readyState === 'live')
        : [];

      if (activeTracks.length === 0) {
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
        <img src={frozenImage} alt="Capture Overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 2, background: '#0a0a0a' }} />
      )}

      {/* Persistent Live Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease-out', display: frozenImage ? 'none' : 'block' }}
      />

      {/* Viewfinder Target Framing */}
      {!frozenImage && (
        <ScannerViewfinder
          autoScanEnabled={autoScanEnabled}
          isAutoLocking={isAutoLocking}
          livePreview={livePreview}
        />
      )}

      {/* Minimalist Controls Toolbar */}
      <ScannerToolbar
        autoScanEnabled={autoScanEnabled}
        onToggleAutoScan={toggleAutoScan}
        hasTorch={hasTorch}
        torchOn={torchOn}
        onToggleTorch={toggleTorch}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(3.0, +(z + 0.2).toFixed(1)))}
        onZoomOut={() => setZoomLevel((z) => Math.max(1.0, +(z - 0.2).toFixed(1)))}
        onResetZoom={() => setZoomLevel(1.0)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {cameraError && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 6, background: '#171717', border: '1px solid #404040', color: '#fff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <AlertCircle size={15} /> {cameraError}
        </div>
      )}

      {/* Shutter & Action Controls */}
      <ScannerShutter
        frozenImage={frozenImage}
        isProcessing={isProcessing}
        hasResult={hasResult}
        onViewAnswers={onViewAnswers}
        onCaptureFrame={captureFrame}
        onFileFallback={onCapture}
      />
    </div>
  );
}
