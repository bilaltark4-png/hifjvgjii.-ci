// Ambient Sound Synthesizer using Web Audio API
class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private rainNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalTimer: any = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      this.init();
      if (!this.ctx) return;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 2);
      this.gainNode.connect(this.ctx.destination);

      // Create gentle rain / pink noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.rainNode = whiteNoise;

      // Soft melancholic chimes
      this.playGentleChime();
      this.intervalTimer = setInterval(() => {
        if (this.isPlaying && Math.random() > 0.3) {
          this.playGentleChime();
        }
      }, 7000);

      this.isPlaying = true;
    } catch (e) {
      console.warn("Could not start ambient sound", e);
      this.isPlaying = false;
    }
  }

  private playGentleChime() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const frequencies = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25]; // Minor pentatonic melancholy scale
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.018, this.ctx.currentTime + 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 5);
    } catch (_) {}
  }

  public stop() {
    try {
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
      }
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.rainNode) {
            try { (this.rainNode as any).stop?.(); } catch (_) {}
            this.rainNode = null;
          }
        }, 900);
      }
    } catch (_) {}
    this.isPlaying = false;
  }
}

export const ambientSound = new AmbientSoundManager();
