// Synthesized sounds via WebAudio. One clear job: every beep the game makes.
// No audio files: short oscillator envelopes, created on first user gesture.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, startAt, dur, type, vol) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + dur);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(ac.currentTime + startAt);
    osc.stop(ac.currentTime + startAt + dur + 0.05);
  }

  function found() { tone(880, 0, 0.18, 'sine', 0.25); tone(1318, 0.08, 0.22, 'sine', 0.22); }
  function wrong() { tone(160, 0, 0.2, 'square', 0.12); }
  function hint() { tone(660, 0, 0.12, 'triangle', 0.2); tone(660, 0.14, 0.12, 'triangle', 0.2); }
  function roundClear() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle', 0.22)); }
  function win() { [523, 659, 784, 1047, 1318, 1568].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.2)); }
  function tick() { tone(1200, 0, 0.05, 'sine', 0.08); }

  return {
    unlock() { ensure(); },
    found, wrong, hint, roundClear, win, tick,
    toggleMute() { muted = !muted; return muted; },
  };
}
