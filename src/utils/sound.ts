// OPay Field Simulator — Web Audio SFX + multi-track background music engine
// All audio is synthesized (no external files) so the single-file build stays portable.

export type MusicTrackId =
  | 'market_pulse'
  | 'field_storm'
  | 'gold_tier_groove'
  | 'compliance_calm'
  | 'victory_cashout';

export interface MusicTrackMeta {
  id: MusicTrackId;
  title: string;
  mood: string;
  bpm: number;
  color: string;
}

export const MUSIC_PLAYLIST: MusicTrackMeta[] = [
  {
    id: 'market_pulse',
    title: 'Market Pulse',
    mood: 'Upbeat field ops — perfect for active runs',
    bpm: 108,
    color: '#10B981',
  },
  {
    id: 'field_storm',
    title: 'Field Storming',
    mood: 'Driving market-to-market energy',
    bpm: 118,
    color: '#06B6D4',
  },
  {
    id: 'gold_tier_groove',
    title: 'Gold Tier Groove',
    mood: 'Confident high-performance cadence',
    bpm: 100,
    color: '#F59E0B',
  },
  {
    id: 'compliance_calm',
    title: 'Compliance Calm',
    mood: 'Focused study / policy exam mode',
    bpm: 84,
    color: '#8B5CF6',
  },
  {
    id: 'victory_cashout',
    title: 'Victory Cashout',
    mood: 'Celebration after big disbursements',
    bpm: 112,
    color: '#EC4899',
  },
];

type OscType = OscillatorType;

class SoundFX {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  public sfxEnabled = true;
  public musicEnabled = true;
  public sfxVolume = 0.55;
  public musicVolume = 0.28;

  // Music sequencer state
  private musicPlaying = false;
  private musicTrackId: MusicTrackId = 'market_pulse';
  private musicTimer: number | null = null;
  private musicStep = 0;
  private activeMusicNodes: AudioNode[] = [];
  private musicListeners: Array<(state: MusicPlaybackState) => void> = [];

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.musicGain.gain.value = this.musicVolume;
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlock() {
    try {
      this.initCtx();
    } catch {
      // ignore
    }
  }

  public setSfxEnabled(on: boolean) {
    this.sfxEnabled = on;
  }

  public setMusicEnabled(on: boolean) {
    this.musicEnabled = on;
    if (!on) this.stopMusic(false);
    else if (this.musicPlaying) this.startMusic(this.musicTrackId);
    this.emitMusicState();
  }

  public setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  public setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  // ─── helpers ─────────────────────────────────────────────
  private tone(
    freq: number,
    duration: number,
    type: OscType = 'sine',
    volume = 0.2,
    when = 0,
    slideTo?: number
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private noiseBurst(duration: number, volume = 0.15, when = 0, filterFreq = 800) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime + when;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // ─── UI / Navigation SFX ─────────────────────────────────
  public playUiTap() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(880, 0.05, 'sine', 0.08);
      this.tone(1320, 0.04, 'triangle', 0.05, 0.02);
    } catch {
      // ignore
    }
  }

  public playUiOpen() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(392, 0.08, 'sine', 0.1);
      this.tone(523.25, 0.1, 'triangle', 0.1, 0.05);
      this.tone(659.25, 0.12, 'sine', 0.08, 0.1);
    } catch {
      // ignore
    }
  }

  public playUiClose() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(659.25, 0.06, 'sine', 0.07);
      this.tone(392, 0.1, 'triangle', 0.07, 0.05);
    } catch {
      // ignore
    }
  }

  public playTabSwitch() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(740, 0.04, 'square', 0.04);
      this.tone(988, 0.05, 'sine', 0.06, 0.03);
    } catch {
      // ignore
    }
  }

  public playHoverSoft() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(1200, 0.03, 'sine', 0.03);
    } catch {
      // ignore
    }
  }

  public playLoginSuccess() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        this.tone(f, 0.18, 'sine', 0.12, i * 0.07);
      });
    } catch {
      // ignore
    }
  }

  public playLoginFail() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(220, 0.18, 'sawtooth', 0.1);
      this.tone(165, 0.22, 'square', 0.08, 0.1);
    } catch {
      // ignore
    }
  }

  public playSubmit() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(600, 0.06, 'triangle', 0.08);
      this.tone(900, 0.1, 'sine', 0.1, 0.05);
    } catch {
      // ignore
    }
  }

  public playCopy() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(1000, 0.05, 'sine', 0.07);
      this.tone(1400, 0.08, 'triangle', 0.06, 0.04);
    } catch {
      // ignore
    }
  }

  // ─── Gameplay SFX ────────────────────────────────────────
  public playCollect(pitchMultiplier = 1) {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(587.33 * pitchMultiplier, 0.08, 'triangle', 0.14);
      this.tone(880 * pitchMultiplier, 0.1, 'sine', 0.12, 0.04);
      this.tone(1174.66 * pitchMultiplier, 0.12, 'triangle', 0.08, 0.08);
    } catch {
      // ignore
    }
  }

  public playDisbursementCash() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      // Cash register-ish cascade
      [784, 988, 1175, 1319, 1568].forEach((f, i) => {
        this.tone(f, 0.14, i % 2 === 0 ? 'sine' : 'triangle', 0.12, i * 0.05);
      });
      this.noiseBurst(0.08, 0.06, 0.02, 2400);
    } catch {
      // ignore
    }
  }

  public playBoost() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(180, 0.22, 'sawtooth', 0.1, 0, 720);
      this.tone(240, 0.18, 'square', 0.05, 0.02, 900);
      this.noiseBurst(0.15, 0.08, 0, 1200);
    } catch {
      // ignore
    }
  }

  public playHit() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.noiseBurst(0.2, 0.22, 0, 500);
      this.tone(140, 0.18, 'sawtooth', 0.12, 0, 70);
    } catch {
      // ignore
    }
  }

  public playShieldBreak() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(900, 0.18, 'sine', 0.14, 0, 280);
      this.tone(640, 0.15, 'triangle', 0.08, 0.05, 200);
      this.noiseBurst(0.12, 0.1, 0.02, 1800);
    } catch {
      // ignore
    }
  }

  public playShieldPickup() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [440, 554, 659, 880].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.1, i * 0.05));
    } catch {
      // ignore
    }
  }

  public playWrongApproach() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(320, 0.12, 'square', 0.1);
      this.tone(240, 0.16, 'sawtooth', 0.1, 0.08);
      this.tone(160, 0.2, 'square', 0.08, 0.16);
    } catch {
      // ignore
    }
  }

  public playRightApproach() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.11, i * 0.06));
    } catch {
      // ignore
    }
  }

  public playTierUp() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [392, 494, 587, 740, 880, 1047].forEach((f, i) => {
        this.tone(f, 0.2, 'sine', 0.12, i * 0.07);
      });
    } catch {
      // ignore
    }
  }

  public playTierDown() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [600, 480, 360, 240].forEach((f, i) => this.tone(f, 0.16, 'sawtooth', 0.1, i * 0.09));
    } catch {
      // ignore
    }
  }

  public playTacticsLevelUp() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
      fanfare.forEach((f, i) => this.tone(f, 0.22, i % 2 ? 'triangle' : 'sine', 0.13, i * 0.08));
    } catch {
      // ignore
    }
  }

  public playGameOver() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [350, 310, 270, 220, 160].forEach((f, i) => {
        this.tone(f, 0.22, 'sawtooth', 0.12, i * 0.12);
      });
    } catch {
      // ignore
    }
  }

  public playVictory() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5, 1568];
      notes.forEach((f, i) => this.tone(f, 0.25, 'sine', 0.14, i * 0.09));
    } catch {
      // ignore
    }
  }

  public playCombo(level: number) {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      const base = 500 + Math.min(level, 12) * 40;
      this.tone(base, 0.06, 'square', 0.06);
      this.tone(base * 1.5, 0.08, 'triangle', 0.07, 0.03);
    } catch {
      // ignore
    }
  }

  public playQuizCorrect() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(660, 0.1, 'sine', 0.12);
      this.tone(880, 0.14, 'triangle', 0.12, 0.07);
      this.tone(1100, 0.16, 'sine', 0.1, 0.14);
    } catch {
      // ignore
    }
  }

  public playQuizWrong() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(280, 0.14, 'square', 0.1);
      this.tone(200, 0.18, 'sawtooth', 0.09, 0.1);
    } catch {
      // ignore
    }
  }

  public playPosDeploy() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.noiseBurst(0.08, 0.08, 0, 2000);
      this.tone(440, 0.1, 'triangle', 0.1, 0.02);
      this.tone(660, 0.12, 'sine', 0.1, 0.08);
      this.tone(880, 0.14, 'triangle', 0.08, 0.14);
    } catch {
      // ignore
    }
  }

  public playPasswordReset() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.1, i * 0.06));
    } catch {
      // ignore
    }
  }

  public playPause() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(480, 0.1, 'triangle', 0.08);
      this.tone(360, 0.12, 'sine', 0.07, 0.06);
    } catch {
      // ignore
    }
  }

  public playResume() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      this.tone(360, 0.08, 'sine', 0.07);
      this.tone(540, 0.1, 'triangle', 0.08, 0.05);
    } catch {
      // ignore
    }
  }

  // Back-compat aliases used by older components
  public get enabled() {
    return this.sfxEnabled;
  }
  public set enabled(v: boolean) {
    this.sfxEnabled = v;
  }

  // ─── Background Music Engine ─────────────────────────────
  public getMusicState(): MusicPlaybackState {
    return {
      playing: this.musicPlaying && this.musicEnabled,
      trackId: this.musicTrackId,
      track: MUSIC_PLAYLIST.find((t) => t.id === this.musicTrackId) || MUSIC_PLAYLIST[0],
      musicEnabled: this.musicEnabled,
      musicVolume: this.musicVolume,
      sfxEnabled: this.sfxEnabled,
      sfxVolume: this.sfxVolume,
    };
  }

  public onMusicState(cb: (state: MusicPlaybackState) => void) {
    this.musicListeners.push(cb);
    return () => {
      this.musicListeners = this.musicListeners.filter((x) => x !== cb);
    };
  }

  private emitMusicState() {
    const state = this.getMusicState();
    this.musicListeners.forEach((cb) => cb(state));
  }

  public startMusic(trackId?: MusicTrackId) {
    this.initCtx();
    if (trackId) this.musicTrackId = trackId;
    this.musicEnabled = true;
    this.stopMusic(false);
    this.musicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicLoop();
    this.emitMusicState();
  }

  public stopMusic(emit = true) {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.activeMusicNodes.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
          (n as OscillatorNode).stop();
        }
        n.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeMusicNodes = [];
    if (emit) this.emitMusicState();
  }

  public toggleMusic() {
    if (this.musicPlaying && this.musicEnabled) {
      this.setMusicEnabled(false);
    } else {
      this.startMusic(this.musicTrackId);
    }
  }

  public nextTrack() {
    const idx = MUSIC_PLAYLIST.findIndex((t) => t.id === this.musicTrackId);
    const next = MUSIC_PLAYLIST[(idx + 1) % MUSIC_PLAYLIST.length];
    this.startMusic(next.id);
  }

  public prevTrack() {
    const idx = MUSIC_PLAYLIST.findIndex((t) => t.id === this.musicTrackId);
    const prev = MUSIC_PLAYLIST[(idx - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length];
    this.startMusic(prev.id);
  }

  public selectTrack(id: MusicTrackId) {
    this.startMusic(id);
  }

  private scheduleMusicLoop() {
    if (!this.musicPlaying || !this.musicEnabled || !this.ctx || !this.musicGain) return;

    const track = MUSIC_PLAYLIST.find((t) => t.id === this.musicTrackId) || MUSIC_PLAYLIST[0];
    const beat = 60 / track.bpm;
    const stepDur = beat / 2; // 8th notes
    const stepsPerBar = 8;
    const now = this.ctx.currentTime;

    // Schedule a few bars ahead
    for (let bar = 0; bar < 2; bar++) {
      for (let step = 0; step < stepsPerBar; step++) {
        const absStep = this.musicStep + bar * stepsPerBar + step;
        const t = now + (bar * stepsPerBar + step) * stepDur + 0.02;
        this.playMusicStep(track.id, absStep % stepsPerBar, t, stepDur);
      }
    }

    this.musicStep = (this.musicStep + stepsPerBar * 2) % (stepsPerBar * 16);

    const waitMs = stepsPerBar * 2 * stepDur * 1000 - 40;
    this.musicTimer = window.setTimeout(() => this.scheduleMusicLoop(), Math.max(120, waitMs));
  }

  private playMusicStep(trackId: MusicTrackId, step: number, when: number, stepDur: number) {
    if (!this.ctx || !this.musicGain) return;

    const mkOsc = (freq: number, dur: number, type: OscType, vol: number, w = when) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, w);
      gain.gain.setValueAtTime(0.0001, w);
      gain.gain.exponentialRampToValueAtTime(vol, w + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, w + dur);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(w);
      osc.stop(w + dur + 0.02);
      this.activeMusicNodes.push(osc, gain);
    };

    const mkNoise = (dur: number, vol: number, w = when, lp = 1200) => {
      if (!this.ctx || !this.musicGain) return;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = lp;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, w);
      gain.gain.exponentialRampToValueAtTime(0.0001, w + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      src.start(w);
      src.stop(w + dur + 0.02);
      this.activeMusicNodes.push(src, filter, gain);
    };

    // Kick on 0, 4
    if (step === 0 || step === 4) {
      mkOsc(90, stepDur * 1.2, 'sine', 0.18, when);
      mkOsc(55, stepDur * 1.1, 'triangle', 0.1, when);
    }
    // Snare on 2, 6
    if (step === 2 || step === 6) {
      mkNoise(0.12, 0.1, when, 2500);
      mkOsc(180, 0.08, 'triangle', 0.05, when);
    }
    // Hats every step lightly
    if (step % 2 === 1) {
      mkNoise(0.04, 0.035, when, 6000);
    } else {
      mkNoise(0.03, 0.02, when, 5000);
    }

    // Melodic layers per track
    const scales: Record<MusicTrackId, number[]> = {
      market_pulse: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23],
      field_storm: [220.0, 261.63, 329.63, 440.0, 392.0, 329.63, 293.66, 246.94],
      gold_tier_groove: [246.94, 311.13, 369.99, 493.88, 415.3, 369.99, 311.13, 277.18],
      compliance_calm: [196.0, 246.94, 293.66, 392.0, 349.23, 293.66, 246.94, 220.0],
      victory_cashout: [293.66, 369.99, 440.0, 587.33, 523.25, 440.0, 392.0, 349.23],
    };

    const scale = scales[trackId];
    const note = scale[step % scale.length];

    // Bass line every 2 steps
    if (step % 2 === 0) {
      mkOsc(note / 2, stepDur * 1.6, 'triangle', 0.07, when);
    }

    // Lead arpeggio
    if (trackId === 'compliance_calm') {
      if (step % 2 === 0) mkOsc(note, stepDur * 1.8, 'sine', 0.05, when);
    } else if (trackId === 'victory_cashout') {
      mkOsc(note, stepDur * 0.9, 'sine', 0.055, when);
      if (step === 7) mkOsc(note * 1.5, stepDur * 1.5, 'triangle', 0.05, when);
    } else if (trackId === 'gold_tier_groove') {
      if (step === 0 || step === 3 || step === 5) mkOsc(note, stepDur * 1.2, 'triangle', 0.05, when);
    } else if (trackId === 'field_storm') {
      if (step % 2 === 0) mkOsc(note, stepDur * 0.85, 'square', 0.03, when);
    } else {
      // market_pulse default
      if (step === 0 || step === 2 || step === 5 || step === 7) {
        mkOsc(note, stepDur * 1.1, 'sine', 0.05, when);
      }
    }

    // Pad chord on bar start
    if (step === 0) {
      mkOsc(note, stepDur * 6, 'sine', 0.025, when);
      mkOsc(note * 1.25, stepDur * 6, 'sine', 0.018, when);
      mkOsc(note * 1.5, stepDur * 6, 'triangle', 0.015, when);
    }
  }
}

export interface MusicPlaybackState {
  playing: boolean;
  trackId: MusicTrackId;
  track: MusicTrackMeta;
  musicEnabled: boolean;
  musicVolume: number;
  sfxEnabled: boolean;
  sfxVolume: number;
}

export const soundManager = new SoundFX();
