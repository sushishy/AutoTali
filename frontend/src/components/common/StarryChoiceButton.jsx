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

  const triggerBurst = () => {
    setIsClicked(true);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setIsClicked(false);
    }, 360);
  };

  const handleClick = (e) => {
    triggerBurst();
    if (onClick) {
      // Execute parent state update on next tick so button visual burst paints on frame 1 without delay
      setTimeout(() => onClick(e), 0);
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
      onPointerDown={triggerBurst}
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

export default memo(StarryChoiceButton);
