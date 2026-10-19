// Audio synthesizer with rich custom Sound Effects & procedural dynamic music tracks
// Designed for OPay CDL Simulation: Lagos Afrobeat, Energetic Arcade, Focus Lo-Fi, Victory Fanfare
export type MusicTrackId = 'afrobeat' | 'arcade' | 'lofi' | 'off';

export interface MusicTrackInfo {
  id: MusicTrackId;
  title: string;
  genre: string;
  tempo: number;
  description: string;
  icon: string;
}

export const MUSIC_TRACKS: MusicTrackInfo[] = [
  {
    id: 'afrobeat',
    title: 'Lagos Market Groove',
    genre: 'Afrobeat / Highlife',
    tempo: 112,
    description: 'Bouncy bass, upbeat chords & log drum groove for lively field storming',
    icon: '🥁',
  },
  {
    id: 'arcade',
    title: 'OPay Turbo Rush',
    genre: 'Synthwave / Chiptune',
    tempo: 128,
    description: 'Fast energetic synth arpeggios for peak performance & high combos',
    icon: '⚡',
  },
  {
    id: 'lofi',
    title: 'CDL Field Inspection',
    genre: 'Warm Lo-Fi Chill',
    tempo: 84,
    description: 'Smooth calming electric piano chords for thoughtful merchant screening',
    icon: '☕',
  },
  {
    id: 'off',
    title: 'Mute Music',
    genre: 'Silent',
    tempo: 0,
    description: 'Play with sound effects only (no background soundtrack)',
    icon: '🔇',
  },
];

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = true;
  public musicVolume: number = 0.35;
  public sfxVolume: number = 0.8;

  // Music engine state
  public currentTrackId: MusicTrackId = 'afrobeat';
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private stepCounter: number = 0;
  private musicMasterGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output setup with gentle compression to prevent clipping
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      compressor.connect(this.ctx.destination);

      // Music Master Bus
      this.musicMasterGain = this.ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicMasterGain.connect(compressor);

      // SFX Master Bus
      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxMasterGain.connect(compressor);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicMasterGain && this.ctx) {
      this.musicMasterGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxMasterGain && this.ctx) {
      this.sfxMasterGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // ==========================================
  // BACKGROUND MUSIC SYNTHESIZER
  // ==========================================
  public startMusic(trackId?: MusicTrackId) {
    if (trackId) {
      this.currentTrackId = trackId;
    }
    if (this.currentTrackId === 'off' || !this.musicEnabled || !this.enabled) {
      this.stopMusic();
      return;
    }

    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.stepCounter = 0;

    const track = MUSIC_TRACKS.find((t) => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
    const bpm = track.tempo;
    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th-note steps

    this.musicIntervalId = window.setInterval(() => {
      this.playMusicStep(this.currentTrackId, this.stepCounter);
      this.stepCounter = (this.stepCounter + 1) % 64; // 4-bar loop
    }, stepDurationMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public switchTrack(trackId: MusicTrackId) {
    this.currentTrackId = trackId;
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic(trackId);
    }
  }

  private playMusicStep(trackId: MusicTrackId, step: number) {
    if (!this.ctx || !this.musicMasterGain || !this.musicEnabled || !this.enabled) return;

    const now = this.ctx.currentTime;
    const beat = step % 16;
    const bar = Math.floor(step / 16);

    switch (trackId) {
      case 'afrobeat':
        this.renderAfrobeatStep(now, beat, bar);
        break;
      case 'arcade':
        this.renderArcadeStep(now, beat, bar);
        break;
      case 'lofi':
        this.renderLofiStep(now, beat, bar);
        break;
      default:
        break;
    }
  }

  // TRACK 1: AFROBEAT (Syncopated log drums, bassline, warm organ stabs)
  private renderAfrobeatStep(now: number, beat: number, bar: number) {
    if (!this.ctx || !this.musicMasterGain) return;

    // Bassline (syncopated pentatonic F minor / Ab major)
    // Notes: F1 (43.65), Ab1 (51.91), Bb1 (58.27), C2 (65.41), Eb2 (77.78)
    const bassPatterns: Record<number, number[]> = {
      0: [43.65, 0, 0, 43.65, 0, 0, 58.27, 0, 0, 65.41, 0, 0, 51.91, 0, 43.65, 0],
      1: [43.65, 0, 51.91, 0, 0, 58.27, 0, 65.41, 0, 0, 58.27, 0, 51.91, 0, 43.65, 0],
      2: [38.89, 0, 0, 38.89, 0, 0, 51.91, 0, 0, 58.27, 0, 0, 43.65, 0, 38.89, 0],
      3: [43.65, 0, 58.27, 0, 0, 65.41, 0, 77.78, 0, 65.41, 0, 58.27, 0, 51.91, 43.65, 0],
    };

    const note = bassPatterns[bar % 4]?.[beat];
    if (note && note > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicMasterGain);

      osc.start(now);
      osc.stop(now + 0.23);
    }

    // Afrobeat Shaker (continuous 16th notes with accents)
    if (beat % 2 === 0 || beat % 4 === 3) {
      this.playSynthNoiseHat(now, beat % 4 === 0 ? 0.04 : 0.02, 0.03, 3500);
    }

    // Woodblock / Clave / Rim (Afro-Cuban Clave: 1, 4, 7, 10, 12)
    if ([0, 4, 7, 10, 12].includes(beat)) {
      this.playSynthWoodblock(now, 880 + (beat % 2 === 0 ? 80 : 0), 0.05);
    }

    // Warm Organ Chords on specific syncopated beats (beats 2, 8, 14)
    if (beat === 2 || beat === 8 || beat === 14) {
      const chords = [
        [174.61, 207.65, 261.63], // Fm
        [207.65, 261.63, 311.13], // Ab
        [155.56, 196.0, 233.08],  // Eb
        [130.81, 174.61, 220.0],  // Dm7b5
      ];
      const chord = chords[bar % 4];
      chord.forEach((freq) => {
        if (!this.ctx || !this.musicMasterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.musicMasterGain);
        osc.start(now);
        osc.stop(now + 0.19);
      });
    }
  }

  // TRACK 2: ARCADE TURBO (Fast chiptune arpeggios, kick, 80s arcade feel)
  private renderArcadeStep(now: number, beat: number, bar: number) {
    if (!this.ctx || !this.musicMasterGain) return;

    // 4-on-the-floor Kick drum
    if (beat % 4 === 0) {
      this.playSynthKick(now, 0.18);
    }

    // Snare on 4 and 12
    if (beat === 4 || beat === 12) {
      this.playSynthSnare(now, 0.12);
    }

    // 16th Hi-hat
    this.playSynthNoiseHat(now, beat % 4 === 2 ? 0.06 : 0.02, 0.03, 6000);

    // Fast 8-bit Arpeggiator (Am, F, C, G)
    const arpChords: Record<number, number[]> = {
      0: [220, 261.63, 329.63, 440], // A3, C4, E4, A4
      1: [174.61, 220, 261.63, 349.23], // F3, A3, C4, F4
      2: [261.63, 329.63, 392, 523.25], // C4, E4, G4, C5
      3: [196, 246.94, 293.66, 392],    // G3, B3, D4, G4
    };

    const chord = arpChords[bar % 4] || arpChords[0];
    const noteFreq = chord[beat % 4];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteFreq, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // TRACK 3: LO-FI CHILL (Slow warm electric piano chords, soft vinyl dust, laid-back beat)
  private renderLofiStep(now: number, beat: number, bar: number) {
    if (!this.ctx || !this.musicMasterGain) return;

    // Soft kick on beat 0 and 10
    if (beat === 0 || beat === 10) {
      this.playSynthKick(now, 0.12);
    }

    // Soft snare on beat 8
    if (beat === 8) {
      this.playSynthSnare(now, 0.08);
    }

    // Warm chords on beats 0 and 6 (maj7 chords: Cmaj7, Am7, Dm7, G7)
    if (beat === 0 || beat === 6) {
      const lofiChords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [146.83, 174.61, 220.0, 261.63], // Dm7
        [196.0, 246.94, 293.66, 349.23], // G7
      ];
      const chord = lofiChords[bar % 4];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.musicMasterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);

        gain.gain.setValueAtTime(0.045, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicMasterGain);

        osc.start(now + idx * 0.02);
        osc.stop(now + 0.48);
      });
    }
  }

  // Helper synth drums
  private playSynthKick(time: number, vol = 0.15) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(time);
    osc.stop(time + 0.13);
  }

  private playSynthSnare(time: number, vol = 0.1) {
    this.playSynthNoiseHat(time, vol, 0.12, 1200);
  }

  private playSynthNoiseHat(time: number, vol: number, duration: number, filterFreq: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(filterFreq, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicMasterGain);

      noise.start(time);
      noise.stop(time + duration + 0.01);
    } catch {
      // Audio error safely ignored
    }
  }

  private playSynthWoodblock(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(time);
    osc.stop(time + duration + 0.01);
  }

  // ==========================================
  // SOUND EFFECTS (ENHANCED & DIVERSE)
  // ==========================================
  private getSfxDestination(): AudioNode | null {
    this.initCtx();
    return this.sfxMasterGain || this.ctx?.destination || null;
  }

  /**
   * Sound 1: Catching a Qualified Whitelisted FMCG merchant
   */
  public playWhitelistedCollect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Sparkly rising arpeggio (C6, E6, G6, C7)
      [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.2, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.19);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 2: Cash disbursement chime (OPay Money Drop)
   */
  public playDisbursementCash() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Realistic Coin Drop / Cash register tone
      [880, 1320, 1760, 2200].forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.22, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.29);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 3: VFO Verification Stamp of Approval (Thud + confirmation chime)
   */
  public playStampApproval() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Physical stamp thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(160, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      thudGain.gain.setValueAtTime(0.3, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      thud.connect(thudGain);
      thudGain.connect(dest);
      thud.start(now);
      thud.stop(now + 0.15);

      // Bright approval bell right after
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(1760, now + 0.08); // A6
      bellGain.gain.setValueAtTime(0.2, now + 0.08);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      bell.connect(bellGain);
      bellGain.connect(dest);
      bell.start(now + 0.08);
      bell.stop(now + 0.42);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 4: CDL Tier Upgrade Fanfare (Moving from Bronze to Silver to Gold)
   */
  public playTierUpgradeFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Regal brass-like major chord fanfare: F4, A4, C5, F5
      const notes = [349.23, 440.0, 523.25, 698.46, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        // Lowpass to give warm brass horn sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + idx * 0.07);

        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.46);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 5: Combo Streak Multiplier (x2, x3, x4...)
   */
  public playComboUp(comboLevel: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      const baseFreq = 440 + Math.min(600, comboLevel * 60);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 6: Policy violation hazard hit (warning buzzer)
   */
  public playPolicyBuzzer() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Dissonant tritone buzzer
      [140, 198].forEach((freq) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.29);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 7: Whistle/Dash Boost
   */
  public playBoost() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.2);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 8: Generic collect
   */
  public playCollect(pitchMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66 * pitchMultiplier, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 9: Physical Impact
   */
  public playHit() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(80, now + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.2);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 10: Shield Break
   */
  public playShieldBreak() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.22);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 11: CDLM Best Practice Step Mastered
   */
  public playTacticsLevelUp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 12: Game Over
   */
  public playGameOver() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;
      const freqs = [350, 310, 270, 220, 160];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Sound 13: UI Button Click / Tab Switch
   */
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getSfxDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio error ignored
    }
  }
}

export const soundManager = new SoundManagerClass();
