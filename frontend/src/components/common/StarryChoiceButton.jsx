import React, { useState, useRef, memo } from 'react';

const STAR_PATH =
  'M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z';

function StarSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 784.11 815.53"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <path className="fil0" d={STAR_PATH} />
    </svg>
  );
}

const StarList = memo(function StarList() {
  return (
    <>
      <div className="star-1" aria-hidden="true"><StarSvg /></div>
      <div className="star-2" aria-hidden="true"><StarSvg /></div>
      <div className="star-3" aria-hidden="true"><StarSvg /></div>
      <div className="star-4" aria-hidden="true"><StarSvg /></div>
      <div className="star-5" aria-hidden="true"><StarSvg /></div>
      <div className="star-6" aria-hidden="true"><StarSvg /></div>
    </>
  );
});

function StarryChoiceButton({
  children,
  onClick,
  isSelected = false,
  variant = 'likert', // 'likert' | 'strand' | 'review-mini'
  className = '',
  style = {},
  ...props
}) {
  const [isClicked, setIsClicked] = useState(false);
  const clickTimeoutRef = useRef(null);
  const pointerHandledRef = useRef(false);

  const triggerBurst = () => {
    setIsClicked(true);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setIsClicked(false);
    }, 350);
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerHandledRef.current = true;
    triggerBurst();
  };

  const handleClick = (e) => {
    // If not already triggered by pointerdown, trigger now
    if (!pointerHandledRef.current) {
      triggerBurst();
    }
    setTimeout(() => {
      pointerHandledRef.current = false;
    }, 150);

    if (onClick) {
      // Paint visual burst on frame 1 without blocking mobile main thread
      requestAnimationFrame(() => {
        onClick(e);
      });
    }
  };

  const variantClass =
    variant === 'strand'
      ? 'starry-strand'
      : variant === 'review-mini'
      ? 'starry-review-mini'
      : 'starry-likert';

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`starry-btn ${variantClass} ${isSelected && !isClicked ? 'is-selected' : ''} ${isClicked ? 'starry-active-visual' : ''} ${className}`}
      style={style}
      {...props}
    >
      <span
        style={{
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {children}
      </span>

      <StarList />
    </button>
  );
}

// Custom memo comparator: only re-render if selection state or visual content changes!
// This stops all other 24 buttons from re-rendering when one button is clicked on Android.
function arePropsEqual(prev, next) {
  return (
    prev.isSelected === next.isSelected &&
    prev.children === next.children &&
    prev.variant === next.variant &&
    prev.className === next.className
  );
}

export default memo(StarryChoiceButton, arePropsEqual);
