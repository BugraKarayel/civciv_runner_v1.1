export class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('civciv_muted');
      }
    } catch (e) {}
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) { this.enabled = false; return; }
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      this.enabled = false;
    }
  }

  update(dtMs) {}
  drawToast(ctx, w, h) {}

  playTone(freq, type, duration, endFreq = null) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), t + duration);
      }
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  }

  jump() { this.playTone(350, 'sine', 0.15, 600); }
  flap() { this.playTone(450, 'triangle', 0.12, 750); }
  rampLaunch() { this.playTone(200, 'sawtooth', 0.45, 900); }
  collectSeed() { this.playTone(800, 'square', 0.08, 1200); }
  milestone() {
    this.playTone(600, 'square', 0.08);
    setTimeout(() => this.playTone(850, 'square', 0.12), 100);
  }
  hit() { this.playTone(180, 'sawtooth', 0.35, 40); }
}

export const sounds = new SoundManager();
