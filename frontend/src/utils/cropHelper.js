/**
 * Crop Helper utilities for AutoTali scanner.
 * Computes Region-of-Interest (ROI) matching the on-screen viewfinder grid.
 */

export function getGridDimensions({
  parentWidth,
  parentHeight,
  isStrand = false,
  isSideways = false,
}) {
  const pW = parentWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
  const pH = parentHeight || (typeof window !== 'undefined' ? window.innerHeight : 640);

  const availW = Math.max(220, pW * 0.90);
  const availH = Math.max(220, (pH - 130) * 0.95);

  const strandMaxH = 260;
  const gridMaxH = 520;
  const maxNormalH = isStrand ? strandMaxH : gridMaxH;

  const boxW = isSideways ? Math.min(availH, 480) : Math.min(availW, 460);
  const boxH = isSideways ? Math.min(availW, isStrand ? 240 : 380) : Math.min(availH, maxNormalH);

  return { boxW, boxH };
}

export function calculateGridCropRect({
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight,
  boxW,
  boxH,
  isSideways = false,
  paddingRatio = 0.02,
}) {
  const cW = Math.max(1, containerWidth);
  const cH = Math.max(1, containerHeight);
  const vW = Math.max(1, videoWidth);
  const vH = Math.max(1, videoHeight);

  const visualW = isSideways ? boxH : boxW;
  const visualH = isSideways ? boxW : boxH;

  const vAR = vW / vH;
  const cAR = cW / cH;

  let renderedW, renderedH, offsetX, offsetY;
  if (cAR > vAR) {
    renderedH = cH;
    renderedW = cH * vAR;
    offsetX = (cW - renderedW) / 2;
    offsetY = 0;
  } else {
    renderedW = cW;
    renderedH = cW / vAR;
    offsetX = 0;
    offsetY = (cH - renderedH) / 2;
  }

  const boxLeft = (cW - visualW) / 2;
  const boxTop = (cH - visualH) / 2;

  const relX = boxLeft - offsetX;
  const relY = boxTop - offsetY;

  const scale = vW / renderedW;

  let cropX = Math.round(relX * scale);
  let cropY = Math.round(relY * scale);
  let cropW = Math.round(visualW * scale);
  let cropH = Math.round(visualH * scale);

  // Add slight padding so outer borders are never clipped
  const padX = Math.round(cropW * paddingRatio);
  const padY = Math.round(cropH * paddingRatio);

  cropX = Math.max(0, cropX - padX);
  cropY = Math.max(0, cropY - padY);
  cropW = Math.min(vW - cropX, cropW + padX * 2);
  cropH = Math.min(vH - cropY, cropH + padY * 2);

  return { x: cropX, y: cropY, width: cropW, height: cropH };
}

export function cropCanvasToRect(sourceCanvas, cropRect) {
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(10, Math.round(cropRect.width));
  cropCanvas.height = Math.max(10, Math.round(cropRect.height));
  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(
    sourceCanvas,
    cropRect.x, cropRect.y, cropRect.width, cropRect.height,
    0, 0, cropCanvas.width, cropCanvas.height
  );
  return cropCanvas;
}
