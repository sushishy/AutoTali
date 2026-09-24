/**
 * Audio utility for AutoTali sound effects.
 * Dedicated sounds placed in /public/sounds/:
 *  - /sounds/success.mp3: Popup update card success notification
 *  - /sounds/error.mp3: Popup update card error notification
 *  - /sounds/section-success.mp3: Next button advance sound
 *  - /sounds/loader-screen.mp3: Opening splash screen sound
 */

let isMutedState = (() => {
  try {
    return localStorage.getItem('autotali_sound_muted') === 'true';
  } catch {
    return false;
  }
})();

let activePopupAudio = null;

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

export function playPopupSound(type = 'info') {
  if (isMutedState) return;
  stopPopupSound();
  try {
    const src = type === 'error' ? '/sounds/error.mp3' : '/sounds/success.mp3';
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

export function playSectionSuccess() {
  if (isMutedState) return;
  try {
    const audio = new Audio('/sounds/section-success.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
}
