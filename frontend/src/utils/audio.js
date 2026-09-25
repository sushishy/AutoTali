/**
 * Audio utility for AutoTali sound effects.
 * Dedicated sounds placed in /public/sounds/:
 *  - /sounds/success.mp3: Popup update card success notification
 *  - /sounds/error.mp3: Popup update card error notification
 *  - /sounds/section-success.mp3: Global button click sound (Minecraft-like click)
 *  - /sounds/loader-screen.mp3: Opening splash screen sound
 */

let isMutedState = (() => {
  try {
    return localStorage.getItem('autotali_sound_muted') === 'true';
  } catch {
    return false;
  }
})();

export function isSoundMuted() {
  return isMutedState;
}

export function setSoundMuted(muted) {
  isMutedState = Boolean(muted);
  try {
    localStorage.setItem('autotali_sound_muted', isMutedState ? 'true' : 'false');
  } catch {}
  if (isMutedState) {
    stopPopupSound();
  }
  return isMutedState;
}

export function toggleSoundMuted() {
  return setSoundMuted(!isMutedState);
}

const AUDIO_CACHE_BUSTER = Date.now();

// ── Web Audio API Engine for ZERO Latency Button Sounds ─────────────────────────
let audioCtx = null;
let clickBuffer = null;
let cachedArrayBuffer = null;
let isAudioPreloading = false;
let lastPlayTime = 0;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Preload and decode button sound into RAM immediately for 0ms startup delay
async function preloadClickAudio() {
  if (isAudioPreloading || clickBuffer || typeof window === 'undefined') return;
  isAudioPreloading = true;
  try {
    const res = await fetch(`/sounds/section-success.mp3?v=${AUDIO_CACHE_BUSTER}`);
    cachedArrayBuffer = await res.arrayBuffer();
    const ctx = getAudioContext();
    if (ctx && cachedArrayBuffer) {
      ctx.decodeAudioData(
        cachedArrayBuffer.slice(0),
        (decoded) => {
          clickBuffer = decoded;
        },
        () => {}
      );
    }
  } catch (e) {
    // Ignore fetch errors
  } finally {
    isAudioPreloading = false;
  }
}

// Fallback HTML Audio pool in case AudioContext is blocked
let audioPool = [];
function getPooledAudio() {
  if (audioPool.length === 0) {
    for (let i = 0; i < 4; i++) {
      const a = new Audio(`/sounds/section-success.mp3?v=${AUDIO_CACHE_BUSTER}`);
      a.preload = 'auto';
      audioPool.push(a);
    }
  }
  const el = audioPool.find((a) => a.paused || a.ended) || audioPool[0];
  try {
    el.currentTime = 0;
  } catch (e) {}
  return el;
}

// Start preloading immediately on load
if (typeof window !== 'undefined') {
  preloadClickAudio();
  getPooledAudio();
}

/**
 * Play instant button click sound (Minecraft-like click) with ZERO latency.
 */
export function playClickSound() {
  if (isMutedState) return;

  const now = performance.now();
  if (now - lastPlayTime < 200) return; // Prevent any double-trigger within 200ms
  lastPlayTime = now;

  const ctx = getAudioContext();
  if (ctx) {
    // If not decoded yet but raw buffer is ready, decode & play
    if (!clickBuffer && cachedArrayBuffer) {
      ctx.decodeAudioData(
        cachedArrayBuffer.slice(0),
        (decoded) => {
          clickBuffer = decoded;
          try {
            const srcNode = ctx.createBufferSource();
            srcNode.buffer = clickBuffer;
            srcNode.connect(ctx.destination);
            srcNode.start(0);
          } catch (e) {}
        },
        () => {}
      );
      return;
    }

    // Instant zero-latency memory playback
    if (clickBuffer) {
      try {
        const srcNode = ctx.createBufferSource();
        srcNode.buffer = clickBuffer;
        srcNode.connect(ctx.destination);
        srcNode.start(0);
        return;
      } catch (e) {}
    }
  }

  // Fallback to pooled HTMLAudioElement
  try {
    const audio = getPooledAudio();
    audio.play().catch(() => {});
  } catch (e) {}
}

export function playSectionSuccess() {
  // Handled automatically by the universal button pointerdown listener
}

export function playDropdownSound() {
  // Handled automatically by the universal button pointerdown listener
}

// ── Global Listener for ALL Buttons (Minecraft click for all buttons, X icon, cancel) ──
let isGlobalListenerAttached = false;

export function initGlobalButtonSounds() {
  if (typeof window === 'undefined' || isGlobalListenerAttached) return;
  isGlobalListenerAttached = true;

  const handlePointerDown = (event) => {
    // Only trigger for primary left click or touch
    if (event.button !== undefined && event.button !== 0) return;

    // Resume audio context on user gesture
    getAudioContext();

    const target = event.target;
    if (!target) return;

    // Check if clicked element is a button, inside a button, or marked button-like
    const btn = target.closest(
      'button, [role="button"], input[type="button"], input[type="submit"], [data-sound="click"]'
    );
    if (!btn) return;

    // Skip if button is disabled
    if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;

    playClickSound();
  };

  // Capture phase on pointerdown for true instant tactile response (0ms latency)
  window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
}

// Auto-initialize global button sounds
if (typeof window !== 'undefined') {
  initGlobalButtonSounds();
}

// ── Dedicated Popup Notification Sounds ──────────────────────────────────────────
let activePopupAudio = null;

export function playPopupSound(type = 'info') {
  if (isMutedState) return;
  stopPopupSound();
  try {
    const file = type === 'error' ? 'error.mp3' : 'success.mp3';
    const src = `/sounds/${file}?v=${AUDIO_CACHE_BUSTER}`;
    activePopupAudio = new Audio(src);
    activePopupAudio.play().catch(() => {});
  } catch (e) {}
}

export function stopPopupSound() {
  if (activePopupAudio) {
    try {
      activePopupAudio.pause();
      activePopupAudio.currentTime = 0;
    } catch (e) {}
    activePopupAudio = null;
  }
}
