/**
 * Audio utility for AutoTali sound effects.
 * Dedicated sounds placed in /public/sounds/:
 *  - /sounds/success.mp3: Popup update card success notification
 *  - /sounds/error.mp3: Popup update card error notification
 *  - /sounds/section-success.mp3: Next button advance sound
 *  - /sounds/loader-screen.mp3: Opening splash screen sound
 */

let activePopupAudio = null;

export function playPopupSound(type = 'info') {
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
  try {
    const audio = new Audio('/sounds/section-success.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
}
