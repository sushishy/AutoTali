import { useState, useEffect, useRef } from 'react';
import { playScanChirp, triggerHaptic } from '../utils/feedback';

export function useAutoScan({
  videoRef,
  sectionId,
  frozenImage,
  isProcessing,
  zoomLevel,
  onAutoLock,
}) {
  const [autoScanEnabled, setAutoScanEnabled] = useState(() => {
    const saved = localStorage.getItem('autotali_autoscan');
    return saved !== null ? saved === 'true' : true;
  });
  const [livePreview, setLivePreview] = useState(null);
  const [isAutoLocking, setIsAutoLocking] = useState(false);

  const isLoopRunningRef = useRef(false);
  const consecutiveMatchRef = useRef({ valStr: null, count: 0 });
  const cooldownUntilRef = useRef(0);

  // Reset state on step change or retake
  useEffect(() => {
    if (!frozenImage) {
      cooldownUntilRef.current = Date.now() + 700;
      consecutiveMatchRef.current = { valStr: null, count: 0 };
      setLivePreview(null);
      setIsAutoLocking(false);
    }
  }, [frozenImage, sectionId]);

  // Live Auto-Detection Loop
  useEffect(() => {
    if (!autoScanEnabled || frozenImage || isProcessing) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      if (!isMounted || !autoScanEnabled || frozenImage || isProcessing || isLoopRunningRef.current) return;
      if (Date.now() < cooldownUntilRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const targetW = 640;
      const scale = targetW / (video.videoWidth || 1280);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = Math.round((video.videoHeight || 720) * scale);
      const ctx = canvas.getContext('2d');

      if (zoomLevel > 1.0) {
        const cropW = canvas.width / zoomLevel;
        const cropH = canvas.height / zoomLevel;
        ctx.drawImage(video, (canvas.width - cropW) / 2, (canvas.height - cropH) / 2, cropW, cropH, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      isLoopRunningRef.current = true;
      try {
        const res = await fetch('/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section_id: sectionId, image_base64: canvas.toDataURL('image/jpeg', 0.72), return_overlay: true }),
        });
        const data = await res.json();

        if (isMounted && data.success && !frozenImage && data.is_valid && data.detected_value !== null) {
          const valStr = JSON.stringify(data.detected_value);
          const previewText = Array.isArray(data.detected_value) ? `[${data.detected_value.join(', ')}]` : `Strand #${data.detected_value}`;
          setLivePreview(previewText);

          if (data.confidence >= 0.65 || (consecutiveMatchRef.current.valStr === valStr && consecutiveMatchRef.current.count >= 1)) {
            setIsAutoLocking(true);
            playScanChirp();
            triggerHaptic();
            cooldownUntilRef.current = Date.now() + 2000;
            consecutiveMatchRef.current = { valStr: null, count: 0 };

            setTimeout(() => {
              if (isMounted) {
                setIsAutoLocking(false);
                onAutoLock?.({ overlayBase64: data.overlay_base64, detectedValue: data.detected_value });
              }
            }, 100);
          } else {
            consecutiveMatchRef.current = consecutiveMatchRef.current.valStr === valStr
              ? { ...consecutiveMatchRef.current, count: consecutiveMatchRef.current.count + 1 }
              : { valStr, count: 1 };
          }
        } else if (isMounted && !data.is_valid) {
          consecutiveMatchRef.current = { valStr: null, count: 0 };
          setLivePreview(null);
        }
      } catch {
        // Ignored during stream sampling
      } finally {
        isLoopRunningRef.current = false;
      }
    }, 340);

    return () => {
      isMounted = false;
      clearInterval(interval);
      isLoopRunningRef.current = false;
    };
  }, [autoScanEnabled, frozenImage, isProcessing, sectionId, zoomLevel, onAutoLock]);

  const toggleAutoScan = () => {
    const next = !autoScanEnabled;
    setAutoScanEnabled(next);
    localStorage.setItem('autotali_autoscan', String(next));
  };

  return {
    autoScanEnabled,
    toggleAutoScan,
    livePreview,
    isAutoLocking,
  };
}
