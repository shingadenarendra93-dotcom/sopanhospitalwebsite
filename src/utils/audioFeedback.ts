/**
 * Plays a pleasant, subtle click/tap sound effect using Web Audio API.
 * Synthesized dynamically with zero latency and no external audio asset dependencies.
 */
let sharedAudioCtx: AudioContext | null = null;

export const playSubtleClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Crisp, subtle wooden-style UI click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    // Fast decay envelope for a soft tactile tap
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    // Graceful fallback if audio is restricted
  }
};
