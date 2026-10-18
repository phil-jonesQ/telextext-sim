/**
 * Web Audio API synthesizer for nostalgic CRT and Teletext remote effects
 */

class TeletextAudioSystem {
  private ctx: AudioContext | null = null;
  private humOscillator: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isHumming: boolean = false;
  private enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.isHumming) {
      this.stopCrtHum();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Remote control rubber button click
   */
  public playRemoteClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Audio might be blocked by browser policy until gesture
    }
  }

  /**
   * Sound when teletext header cycles scanning pages
   */
  public playPageScanPip() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(980, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {}
  }

  /**
   * Sound when requested page is acquired and displayed
   */
  public playPageFound() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, t); // C5
      osc1.frequency.setValueAtTime(659.25, t + 0.06); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, t + 0.06); // C6 overtone

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.26);
      osc2.start(t + 0.06);
      osc2.stop(t + 0.26);
    } catch {}
  }

  /**
   * Starts gentle 50Hz CRT cathode ray flyback hum
   */
  public startCrtHum() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx || this.isHumming) return;

      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.humOscillator.type = 'sawtooth';
      this.humOscillator.frequency.setValueAtTime(50, this.ctx.currentTime); // 50 Hz PAL line frequency

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.humGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // very subtle

      this.humOscillator.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOscillator.start();
      this.isHumming = true;
    } catch {}
  }

  public stopCrtHum() {
    if (this.humOscillator && this.isHumming) {
      try {
        this.humOscillator.stop();
        this.humOscillator.disconnect();
      } catch {}
      this.humOscillator = null;
      this.humGain = null;
      this.isHumming = false;
    }
  }

  public toggleCrtHum(start: boolean) {
    if (start) {
      this.startCrtHum();
    } else {
      this.stopCrtHum();
    }
  }
}

export const teletextAudio = new TeletextAudioSystem();
