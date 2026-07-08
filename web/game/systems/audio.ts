import { bus, BusEvents } from "../net/bus";

/**
 * Fully procedural WebAudio soundscape — no audio files, no copyright, tiny
 * footprint. Two layers, independently mutable:
 *
 *  - MUSIC: an endless generative lo-fi loop (soft filtered chords over a
 *    sine bass, occasional pentatonic plucks, vinyl crackle).
 *  - AMBIENCE: per-location room tone (rain wash, winter wind, city hum,
 *    café warmth, arcade blips, fireplace crackle) + a weather-driven rain
 *    layer that follows live room state (so world events that start rain
 *    are audible too).
 *
 * Created once per app; survives map travel so the music never restarts.
 * The AudioContext unlocks on the first user gesture per browser policy.
 */

type AmbienceId = "sunset" | "rain" | "winter" | "city" | "cafe" | "arcade" | "room";

const MUSIC_LEVEL = 0.5;
const AMBIENCE_LEVEL = 0.6;

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Gentle lo-fi progression: Fmaj7 → Am7 → Dm9 → Cmaj7
const PROGRESSION: number[][] = [
  [53, 57, 60, 64],
  [57, 60, 64, 67],
  [50, 53, 57, 64],
  [48, 52, 55, 62],
];
const PENTATONIC = [69, 72, 74, 76, 79, 81];

export class AudioSystem {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicGain?: GainNode;
  private ambGain?: GainNode;
  private weatherGain?: GainNode;
  private musicOn = true;
  private sfxOn = true;
  private disposed = false;
  private chordIndex = 0;
  private musicTimer?: ReturnType<typeof setTimeout>;
  private blipTimer?: ReturnType<typeof setTimeout>;
  private chirpTimer?: ReturnType<typeof setTimeout>;
  private ambNodes: AudioNode[] = [];
  private currentAmbience?: AmbienceId;
  private pendingAmbience?: AmbienceId;
  private pendingWeather = "clear";
  private unsubs: Array<() => void> = [];

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.musicOn = window.localStorage.getItem("lofi-music") !== "off";
      this.sfxOn = window.localStorage.getItem("lofi-sfx") !== "off";
    } catch {
      /* private mode */
    }
    const unlock = () => this.init();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    this.unsubs.push(
      bus.on(BusEvents.WorldEntered, (p: { ambience?: AmbienceId }) => {
        this.pendingAmbience = p.ambience;
        if (p.ambience) this.setAmbience(p.ambience);
      }),
      bus.on(BusEvents.AudioSettings, (p: { music: boolean; sfx: boolean }) => {
        this.musicOn = p.music;
        this.sfxOn = p.sfx;
        try {
          window.localStorage.setItem("lofi-music", p.music ? "on" : "off");
          window.localStorage.setItem("lofi-sfx", p.sfx ? "on" : "off");
        } catch {
          /* private mode */
        }
        this.applyLevels();
      }),
      bus.on("weather:changed", (p: { weather: string }) => {
        this.pendingWeather = p.weather;
        this.applyWeather(p.weather);
      })
    );
  }

  getSettings() {
    return { music: this.musicOn, sfx: this.sfxOn };
  }

  private init() {
    if (this.ctx || this.disposed) return;
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.master);
    this.ambGain = this.ctx.createGain();
    this.ambGain.connect(this.master);
    this.weatherGain = this.ctx.createGain();
    this.weatherGain.gain.value = 0;
    this.weatherGain.connect(this.master);
    this.applyLevels();

    this.startVinyl();
    this.scheduleChord();
    this.startWeatherLayer();
    if (this.pendingAmbience) this.setAmbience(this.pendingAmbience);
    this.applyWeather(this.pendingWeather);
  }

  private applyLevels() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicGain?.gain.linearRampToValueAtTime(this.musicOn ? MUSIC_LEVEL : 0, t + 0.4);
    this.ambGain?.gain.linearRampToValueAtTime(this.sfxOn ? AMBIENCE_LEVEL : 0, t + 0.4);
    if (this.weatherGain) {
      this.applyWeather(this.pendingWeather);
    }
  }

  // ---------------------------------------------------------------- music --

  private scheduleChord() {
    if (!this.ctx || this.disposed) return;
    const ctx = this.ctx;
    const chord = PROGRESSION[this.chordIndex % PROGRESSION.length];
    this.chordIndex++;
    const now = ctx.currentTime;
    const barLen = 4.2;

    // chord pad
    for (const note of chord) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = midi(note) * (1 + (Math.random() - 0.5) * 0.003);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 750;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.05, now + 1.1);
      g.gain.setValueAtTime(0.05, now + barLen - 1.4);
      g.gain.linearRampToValueAtTime(0, now + barLen);
      osc.connect(lp).connect(g).connect(this.musicGain!);
      osc.start(now);
      osc.stop(now + barLen + 0.1);
    }
    // bass (root, one octave down)
    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.value = midi(chord[0] - 12);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, now);
    bg.gain.linearRampToValueAtTime(0.075, now + 0.4);
    bg.gain.setValueAtTime(0.075, now + barLen - 1);
    bg.gain.linearRampToValueAtTime(0, now + barLen);
    bass.connect(bg).connect(this.musicGain!);
    bass.start(now);
    bass.stop(now + barLen + 0.1);

    // occasional soft pluck melody
    if (Math.random() < 0.7) {
      const when = now + 0.8 + Math.random() * 2.2;
      const pluck = ctx.createOscillator();
      pluck.type = "triangle";
      pluck.frequency.value = midi(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]);
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0, when);
      pg.gain.linearRampToValueAtTime(0.05, when + 0.03);
      pg.gain.exponentialRampToValueAtTime(0.0001, when + 1.4);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      pluck.connect(lp).connect(pg).connect(this.musicGain!);
      pluck.start(when);
      pluck.stop(when + 1.6);
    }

    this.musicTimer = setTimeout(() => this.scheduleChord(), barLen * 1000);
  }

  private noiseBuffer(seconds: number, shape: (i: number, n: number) => number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = shape(i, len);
    return buf;
  }

  private startVinyl() {
    const ctx = this.ctx!;
    // sparse dust pops over faint hiss
    const buf = this.noiseBuffer(3, () => {
      const hiss = (Math.random() * 2 - 1) * 0.012;
      return Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.5 : hiss;
    });
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    src.connect(hp).connect(g).connect(this.musicGain!);
    src.start();
  }

  // ------------------------------------------------------------- ambience --

  private stopAmbience() {
    for (const n of this.ambNodes) {
      try {
        (n as AudioBufferSourceNode).stop?.();
      } catch {
        /* already stopped */
      }
      n.disconnect();
    }
    this.ambNodes = [];
    if (this.blipTimer) clearTimeout(this.blipTimer);
    if (this.chirpTimer) clearTimeout(this.chirpTimer);
  }

  private setAmbience(id: AmbienceId) {
    if (!this.ctx || id === this.currentAmbience) {
      this.currentAmbience = id;
      return;
    }
    this.currentAmbience = id;
    this.stopAmbience();
    const ctx = this.ctx;

    const addNoise = (filterType: BiquadFilterType, freq: number, gain: number, lfo?: { rate: number; depth: number }) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(2.5, () => Math.random() * 2 - 1);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      if (lfo) {
        const l = ctx.createOscillator();
        l.frequency.value = lfo.rate;
        const lg = ctx.createGain();
        lg.gain.value = lfo.depth;
        l.connect(lg).connect(g.gain);
        l.start();
        this.ambNodes.push(l);
      }
      src.connect(f).connect(g).connect(this.ambGain!);
      src.start();
      this.ambNodes.push(src, g);
    };

    switch (id) {
      case "rain":
        addNoise("bandpass", 900, 0.14);
        addNoise("lowpass", 300, 0.06);
        break;
      case "winter":
        addNoise("lowpass", 420, 0.1, { rate: 0.13, depth: 0.06 });
        break;
      case "city":
        addNoise("lowpass", 220, 0.1);
        addNoise("bandpass", 1200, 0.02, { rate: 0.07, depth: 0.012 });
        break;
      case "cafe":
        addNoise("lowpass", 320, 0.05);
        break;
      case "arcade":
        addNoise("lowpass", 260, 0.05);
        this.scheduleBlips();
        break;
      case "room":
        this.startFireplace();
        break;
      case "sunset":
        addNoise("lowpass", 500, 0.035, { rate: 0.1, depth: 0.02 });
        this.scheduleChirps();
        break;
    }
  }

  private scheduleBlips() {
    if (!this.ctx || this.disposed || this.currentAmbience !== "arcade") return;
    const ctx = this.ctx;
    const when = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(midi(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] + 12), when);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.012, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    osc.connect(g).connect(this.ambGain!);
    osc.start(when);
    osc.stop(when + 0.2);
    this.blipTimer = setTimeout(() => this.scheduleBlips(), 2500 + Math.random() * 5000);
  }

  private scheduleChirps() {
    if (!this.ctx || this.disposed || this.currentAmbience !== "sunset") return;
    const ctx = this.ctx;
    // two quick descending whistles
    for (let i = 0; i < 2; i++) {
      const when = ctx.currentTime + 0.05 + i * 0.22;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2600 + Math.random() * 600, when);
      osc.frequency.exponentialRampToValueAtTime(1900, when + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.02, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
      osc.connect(g).connect(this.ambGain!);
      osc.start(when);
      osc.stop(when + 0.2);
    }
    this.chirpTimer = setTimeout(() => this.scheduleChirps(), 6000 + Math.random() * 12000);
  }

  private startFireplace() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    // sparse low pops = fire crackle
    src.buffer = this.noiseBuffer(3, () => {
      const bed = (Math.random() * 2 - 1) * 0.02;
      return Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.6 : bed;
    });
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(lp).connect(g).connect(this.ambGain!);
    src.start();
    this.ambNodes.push(src, g);
  }

  // -------------------------------------------------------------- weather --

  private startWeatherLayer() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(2.5, () => Math.random() * 2 - 1);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1000;
    src.connect(bp).connect(this.weatherGain!);
    src.start();
  }

  private applyWeather(weather: string) {
    if (!this.ctx || !this.weatherGain) return;
    // The dedicated rain ambience already carries rain; the weather layer
    // only fills in when rain starts somewhere else (world events).
    const wantsRain = weather === "rain" && this.currentAmbience !== "rain";
    const target = this.sfxOn && wantsRain ? 0.09 : 0;
    this.weatherGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 1.2);
  }

  destroy() {
    this.disposed = true;
    this.unsubs.forEach((u) => u());
    if (this.musicTimer) clearTimeout(this.musicTimer);
    if (this.blipTimer) clearTimeout(this.blipTimer);
    if (this.chirpTimer) clearTimeout(this.chirpTimer);
    this.stopAmbience();
    this.ctx?.close();
    this.ctx = undefined;
  }
}
