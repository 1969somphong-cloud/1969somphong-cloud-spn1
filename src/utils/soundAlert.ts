/**
 * Audio Alert Synthesizer using Web Audio API
 * Generates emergency tone alerts (EAS 853Hz/960Hz dual frequency) and pulse warnings
 */

class SoundAlertController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentOscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play standard dual-tone emergency warning siren (853Hz + 960Hz)
   */
  public playEmergencyAlert(durationSeconds: number = 3.5) {
    try {
      this.stop();
      this.initContext();
      if (!this.ctx) return;

      this.isPlaying = true;
      const now = this.ctx.currentTime;

      // Master gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.1);
      this.gainNode.gain.setValueAtTime(0.25, now + durationSeconds - 0.2);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
      this.gainNode.connect(this.ctx.destination);

      // 853Hz & 960Hz Dual Tone (Standard Emergency Alert System)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(853, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(960, now);

      osc1.connect(this.gainNode);
      osc2.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSeconds);
      osc2.stop(now + durationSeconds);

      this.currentOscillators = [osc1, osc2];

      setTimeout(() => {
        this.isPlaying = false;
        this.currentOscillators = [];
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Audio alert could not play:', e);
    }
  }

  /**
   * Play pulsed chime for advisory / watch level
   */
  public playChimeAlert() {
    try {
      this.stop();
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      gain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc.connect(gain);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn('Chime alert error:', e);
    }
  }

  public stop() {
    if (this.currentOscillators.length > 0) {
      this.currentOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.currentOscillators = [];
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundAlert = new SoundAlertController();
