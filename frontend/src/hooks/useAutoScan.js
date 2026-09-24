import { useState, useEffect, useRef } from 'react';
import { playScanChirp, triggerHaptic } from '../utils/feedback';
import { calculateGridCropRect, cropCanvasToRect, getGridDimensions } from '../utils/cropHelper';

export function useAutoScan({
  videoRef,
  sectionId,
  frozenImage,
  isProcessing,
  zoomLevel = 1.0,
  rotation = 0,
  onAutoLock,
}) {
  const [autoScanEnabled, setAutoScanEnabled] = useState(() => {
    const saved = localStorage.getItem('autotali_autoscan');
    return saved !== null ? saved === 'true' : true;
  });
  const [livePreview, setLivePreview] = useState(null);
  const [liveOverlay, setLiveOverlay] = useState(null);
  const [liveAnswers, setLiveAnswers] = useState(null);
  const [isAutoLocking, setIsAutoLocking] = useState(false);

  const isLoopRunningRef = useRef(false);
  const consecutiveMatchRef = useRef({ valStr: null, count: 0, overlay: null, data: null });
  const cooldownUntilRef = useRef(0);

  // Reset state on step change or retake
  useEffect(() => {
    if (!frozenImage) {
      cooldownUntilRef.current = Date.now() + 800;
      consecutiveMatchRef.current = { valStr: null, count: 0, overlay: null, data: null };
      setLivePreview(null);
      setLiveOverlay(null);
      setLiveAnswers(null);
      setIsAutoLocking(false);
    }
  }, [frozenImage, sectionId]);

  // Live Auto-Detection Loop (Only runs when autoScanEnabled is TRUE)
  useEffect(() => {
    if (!autoScanEnabled || frozenImage || isProcessing) {
      setLiveAnswers(null);
      setLivePreview(null);
      setLiveOverlay(null);
      setIsAutoLocking(false);
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      if (!isMounted || !autoScanEnabled || frozenImage || isProcessing || isLoopRunningRef.current) {
        return;
      }
      if (Date.now() < cooldownUntilRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }

      const video = videoRef.current;
      const targetW = 640;
      const scale = targetW / (video.videoWidth || 1280);
      const rawW = targetW;
      const rawH = Math.round((video.videoHeight || 720) * scale);

      const canvas = document.createElement('canvas');
      const isSideways = rotation === 90 || rotation === 270;
      canvas.width = isSideways ? rawH : rawW;
      canvas.height = isSideways ? rawW : rawH;
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      if (zoomLevel > 1.0) {
        ctx.scale(zoomLevel, zoomLevel);
      }
      ctx.drawImage(video, -rawW / 2, -rawH / 2, rawW, rawH);
      ctx.restore();

      let sampleDataUrl = canvas.toDataURL('image/jpeg', 0.72);
      const parentEl = video.parentElement;
      if (parentEl) {
        const rect = parentEl.getBoundingClientRect();
        const isStrand = sectionId === 1;
        const { boxW, boxH } = getGridDimensions({
          parentWidth: rect.width,
          parentHeight: rect.height,
          isStrand,
          isSideways,
        });
        const cropRect = calculateGridCropRect({
          containerWidth: rect.width,
          containerHeight: rect.height,
          videoWidth: canvas.width,
          videoHeight: canvas.height,
          boxW,
          boxH,
          isSideways,
        });
        const cropped = cropCanvasToRect(canvas, cropRect);
        sampleDataUrl = cropped.toDataURL('image/jpeg', 0.72);
      }

      isLoopRunningRef.current = true;
      try {
        const res = await fetch('/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_id: sectionId,
            image_base64: sampleDataUrl,
            return_overlay: true,
          }),
        });
        const data = await res.json();

        if (isMounted && data.success && !frozenImage) {
          if (data.overlay_base64 && (data.table_found || data.is_valid)) {
            setLiveOverlay(data.overlay_base64);
          } else {
            setLiveOverlay(null);
          }

          if (data.is_valid && data.detected_value !== null) {
            setLiveAnswers(data.detected_value);
            const valStr = JSON.stringify(data.detected_value);
            const previewText = Array.isArray(data.detected_value)
              ? `[${data.detected_value.join(', ')}]`
              : `Strand #${data.detected_value}`;
            setLivePreview(previewText);

            // Require 3 consecutive matching samples (~1s steady hold) before auto-capturing
            if (consecutiveMatchRef.current.valStr === valStr) {
              consecutiveMatchRef.current.count += 1;
              consecutiveMatchRef.current.overlay = data.overlay_base64;
              consecutiveMatchRef.current.data = data.detected_value;
            } else {
              consecutiveMatchRef.current = {
                valStr,
                count: 1,
                overlay: data.overlay_base64,
                data: data.detected_value,
              };
            }

            if (autoScanEnabled && consecutiveMatchRef.current.count >= 3) {
              // Stayed still and verified: LOCK IN!
              setIsAutoLocking(true);
              playScanChirp();
              triggerHaptic();
              cooldownUntilRef.current = Date.now() + 2500;
              const lockedOverlay = consecutiveMatchRef.current.overlay || data.overlay_base64;
              const lockedData = consecutiveMatchRef.current.data || data.detected_value;
              consecutiveMatchRef.current = { valStr: null, count: 0, overlay: null, data: null };

              setTimeout(() => {
                if (isMounted) {
                  setIsAutoLocking(false);
                  onAutoLock?.({ overlayBase64: lockedOverlay, detectedValue: lockedData });
                }
              }, 120);
            }
          } else {
            consecutiveMatchRef.current = { valStr: null, count: 0, overlay: null, data: null };
            setLivePreview(null);
            setLiveAnswers(null);
          }
        }
      } catch {
        // Ignored during stream sampling
      } finally {
        isLoopRunningRef.current = false;
      }
    }, 320);

    return () => {
      isMounted = false;
      clearInterval(interval);
      isLoopRunningRef.current = false;
    };
  }, [autoScanEnabled, frozenImage, isProcessing, sectionId, zoomLevel, rotation, onAutoLock]);

  const toggleAutoScan = () => {
    setAutoScanEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('autotali_autoscan', String(next));
      if (!next) {
        setLiveAnswers(null);
        setLivePreview(null);
        setLiveOverlay(null);
        setIsAutoLocking(false);
      }
      return next;
    });
  };

  return {
    autoScanEnabled,
    toggleAutoScan,
    livePreview,
    liveOverlay,
    liveAnswers,
    isAutoLocking,
  };
}
