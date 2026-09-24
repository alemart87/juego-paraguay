/**
 * Tiny synthesized sound bank on top of Web Audio. No audio files: every effect
 * is a couple of oscillators / noise bursts, so it loads instantly and works
 * offline. The context is created on the first user gesture (mobile autoplay
 * rules) and everything routes through one master gain.
 */

export type SfxName =
  | "shot"
  | "empty"
  | "punch"
  | "slash"
  | "hit"
  | "hurt"
  | "coin"
  | "pickup"
  | "heal"
  | "jump"
  | "land"
  | "boom"
  | "alert"
  | "blip"
  | "ui"
  | "win"
  | "ko"
  | "swap"
  | "recruit"
  | "dash"
  | "shotgun"
  | "smg"
  | "ak"
  | "bat"
  | "grenade"
  | "explode"
  | "stomp"
  | "bossIntro"
  | "drop"
  | "ally"
  | "rocket"
  | "flame"
  | "railgun"
  | "bell"
  | "glove"
  | "hammer"
  | "swat"
  | "stamp"
  | "crowd"
  | "whiff"
  | "squeak"
  | "squirt";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let enabled = true;
let volume = 0.8;
let warmed = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicStep = 0;
let musicLevel = 1;
const lastPlay: Partial<Record<SfxName, number>> = {};

type AudioSessionNavigator = Navigator & {
  audioSession?: { type: "auto" | "playback" | "transient" | "transient-solo" };
};

function configurePlaybackAudioSession() {
  if (typeof navigator === "undefined") return;
  try {
    const audioSession = (navigator as AudioSessionNavigator).audioSession;
    if (audioSession) audioSession.type = "playback";
  } catch {
    /* Older browsers do not expose AudioSession. */
  }
}

function discardAudioContext() {
  const previous = ctx;
  ctx = null;
  master = null;
  noiseBuf = null;
  warmed = false;
  if (previous && previous.state !== "closed") void previous.close().catch(() => undefined);
}

function resetClosedContext() {
  if (ctx?.state !== "closed") return;
  ctx = null;
  master = null;
  noiseBuf = null;
  warmed = false;
}

function ensure() {
  if (typeof window === "undefined") return null;
  configurePlaybackAudioSession();
  resetClosedContext();
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? volume : 0;
    // Several combat effects can overlap in the same frame. A compressor keeps
    // those peaks clean while making the quieter UI and movement sounds easier
    // to hear on phone speakers.
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;
    master.connect(compressor).connect(ctx.destination);
    const len = ctx.sampleRate * 0.6;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/** Call synchronously inside a user gesture. Safe to call many times. */
export function unlockAudio(): Promise<void> {
  configurePlaybackAudioSession();
  const c = ensure();
  if (!c) return Promise.resolve();
  // iOS Safari needs a real source node to start during the trusted gesture.
  // A one-sample silent buffer is sometimes optimised away, so use a very short
  // inaudible oscillator and keep it connected through the game's audio graph.
  const warm = () => {
    if (warmed || !master) return;
    const oscillator = c.createOscillator();
    const gain = c.createGain();
    gain.gain.value = 0.00001;
    oscillator.frequency.value = 220;
    oscillator.connect(gain).connect(master);
    oscillator.start(c.currentTime);
    oscillator.stop(c.currentTime + 0.035);
    warmed = true;
  };
  warm();
  if (c.state === "running") return Promise.resolve();
  // resume() is intentionally invoked synchronously from the touch handler.
  return c
    .resume()
    .then(() => {
      warm();
    })
    .catch(() => undefined);
}

/**
 * Keep mobile audio alive across tab switches, checkout returns and screen
 * locks. The capture listeners run before React handlers and therefore remain
 * inside Safari's trusted touch event.
 */
export function installMobileAudioUnlock(): () => void {
  if (typeof document === "undefined") return () => undefined;
  const wake = () => {
    if (enabled) void unlockAudio();
  };
  const visibilityChanged = () => {
    // Safari can report a running context while its output is permanently
    // silent after backgrounding. Effects are short-lived, so replacing the
    // context is safe and the next real touch starts a clean audio route.
    if (document.visibilityState === "hidden") discardAudioContext();
  };
  const pageHidden = () => discardAudioContext();
  document.addEventListener("touchstart", wake, { capture: true, passive: true });
  document.addEventListener("pointerdown", wake, { capture: true, passive: true });
  document.addEventListener("touchend", wake, { capture: true, passive: true });
  document.addEventListener("click", wake, { capture: true, passive: true });
  document.addEventListener("keydown", wake, { capture: true });
  document.addEventListener("visibilitychange", visibilityChanged);
  window.addEventListener("pagehide", pageHidden);
  window.addEventListener("pageshow", wake);
  return () => {
    document.removeEventListener("touchstart", wake, true);
    document.removeEventListener("pointerdown", wake, true);
    document.removeEventListener("touchend", wake, true);
    document.removeEventListener("click", wake, true);
    document.removeEventListener("keydown", wake, true);
    document.removeEventListener("visibilitychange", visibilityChanged);
    window.removeEventListener("pagehide", pageHidden);
    window.removeEventListener("pageshow", wake);
  };
}

export function configureAudio(on: boolean, vol: number) {
  enabled = on;
  volume = Math.max(0, Math.min(1, vol));
  if (master && ctx) master.gain.setTargetAtTime(on ? volume : 0, ctx.currentTime, 0.02);
}

function tone(
  freq: number,
  dur: number,
  opts: {
    type?: OscillatorType;
    gain?: number;
    slide?: number;
    attack?: number;
    delay?: number;
  } = {},
) {
  const c = ctx;
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "square";
  o.frequency.setValueAtTime(freq, t0);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + dur);
  const a = opts.attack ?? 0.004;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.2, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(
  dur: number,
  opts: { gain?: number; from?: number; to?: number; q?: number; delay?: number } = {},
) {
  const c = ctx;
  if (!c || !master || !noiseBuf) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = opts.q ?? 0.8;
  f.frequency.setValueAtTime(opts.from ?? 4000, t0);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to ?? 300), t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(opts.gain ?? 0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const MIN_GAP: Partial<Record<SfxName, number>> = {
  shot: 40,
  smg: 30,
  ak: 40,
  ally: 200,
  hit: 60,
  coin: 30,
  blip: 30,
  alert: 800,
  hurt: 120,
  glove: 50,
  crowd: 900,
  whiff: 60,
};

function playSfx(name: SfxName) {
  if (!enabled) return;
  const c = ctx;
  if (!c || c.state !== "running") return;
  const now = performance.now();
  const gap = MIN_GAP[name] ?? 0;
  if (gap && now - (lastPlay[name] ?? -1e9) < gap) return;
  lastPlay[name] = now;
  switch (name) {
    case "shot":
      noise(0.14, { gain: 0.5, from: 6000, to: 400 });
      tone(180, 0.1, { type: "sawtooth", gain: 0.25, slide: 40 });
      break;
    case "empty":
      tone(900, 0.04, { type: "square", gain: 0.12 });
      tone(600, 0.05, { type: "square", gain: 0.1, delay: 0.06 });
      break;
    case "punch":
      noise(0.09, { gain: 0.35, from: 1200, to: 200 });
      tone(120, 0.08, { type: "sine", gain: 0.3, slide: 50 });
      break;
    case "slash":
      noise(0.16, { gain: 0.3, from: 9000, to: 1500, q: 2 });
      break;
    case "hit":
      noise(0.12, { gain: 0.4, from: 2500, to: 200 });
      tone(90, 0.12, { type: "triangle", gain: 0.3, slide: 40 });
      break;
    case "hurt":
      tone(320, 0.18, { type: "sawtooth", gain: 0.22, slide: 120 });
      noise(0.1, { gain: 0.2, from: 1500, to: 300 });
      break;
    case "coin":
      tone(1046, 0.07, { type: "square", gain: 0.12 });
      tone(1568, 0.14, { type: "square", gain: 0.12, delay: 0.06 });
      break;
    case "pickup":
      tone(523, 0.08, { type: "triangle", gain: 0.2 });
      tone(784, 0.1, { type: "triangle", gain: 0.2, delay: 0.08 });
      tone(1046, 0.16, { type: "triangle", gain: 0.2, delay: 0.16 });
      break;
    case "heal":
      tone(660, 0.12, { type: "sine", gain: 0.2 });
      tone(880, 0.2, { type: "sine", gain: 0.2, delay: 0.1 });
      break;
    case "jump":
      tone(300, 0.16, { type: "square", gain: 0.12, slide: 700 });
      break;
    case "land":
      noise(0.06, { gain: 0.15, from: 900, to: 120 });
      break;
    case "boom":
      noise(0.5, { gain: 0.7, from: 3000, to: 60 });
      tone(70, 0.4, { type: "sine", gain: 0.5, slide: 30 });
      break;
    case "alert":
      tone(880, 0.08, { type: "square", gain: 0.15 });
      tone(660, 0.08, { type: "square", gain: 0.15, delay: 0.09 });
      tone(880, 0.12, { type: "square", gain: 0.15, delay: 0.18 });
      break;
    case "blip":
      tone(1200, 0.03, { type: "square", gain: 0.08 });
      break;
    case "ui":
      tone(700, 0.05, { type: "triangle", gain: 0.12 });
      break;
    case "swap":
      tone(500, 0.05, { type: "square", gain: 0.1 });
      tone(750, 0.07, { type: "square", gain: 0.1, delay: 0.05 });
      break;
    case "dash":
      noise(0.14, { gain: 0.25, from: 2500, to: 6000, q: 1.5 });
      tone(200, 0.12, { type: "sine", gain: 0.12, slide: 520 });
      break;
    case "shotgun":
      noise(0.3, { gain: 0.8, from: 5000, to: 200 });
      tone(90, 0.2, { type: "sawtooth", gain: 0.35, slide: 30 });
      break;
    case "ak":
      noise(0.09, { gain: 0.45, from: 6500, to: 500 });
      tone(160, 0.07, { type: "sawtooth", gain: 0.18, slide: 50 });
      break;
    case "smg":
      noise(0.06, { gain: 0.35, from: 7000, to: 700 });
      tone(260, 0.05, { type: "square", gain: 0.12, slide: 80 });
      break;
    case "bat":
      noise(0.12, { gain: 0.45, from: 900, to: 120 });
      tone(70, 0.16, { type: "sine", gain: 0.4, slide: 30 });
      break;
    case "grenade":
      tone(520, 0.08, { type: "triangle", gain: 0.12, slide: 300 });
      break;
    case "explode":
      noise(0.7, { gain: 0.9, from: 2000, to: 40 });
      tone(55, 0.6, { type: "sine", gain: 0.6, slide: 25 });
      break;
    case "stomp":
      noise(0.2, { gain: 0.5, from: 1500, to: 80 });
      tone(60, 0.25, { type: "sine", gain: 0.5, slide: 30 });
      break;
    case "bossIntro":
      [110, 110, 98, 82].forEach((f, i) =>
        tone(f, 0.35, { type: "sawtooth", gain: 0.25, delay: i * 0.22 }),
      );
      noise(0.5, { gain: 0.25, from: 400, to: 60, delay: 0.7 });
      break;
    case "drop":
      tone(880, 0.05, { type: "square", gain: 0.08 });
      tone(1320, 0.08, { type: "square", gain: 0.08, delay: 0.05 });
      break;
    case "ally":
      noise(0.07, { gain: 0.25, from: 1000, to: 200 });
      break;
    case "rocket":
      noise(0.42, { gain: 0.75, from: 5200, to: 120 });
      tone(115, 0.3, { type: "sawtooth", gain: 0.42, slide: 38 });
      break;
    case "flame":
      noise(0.1, { gain: 0.28, from: 4200, to: 650, q: 1.2 });
      tone(85, 0.09, { type: "sawtooth", gain: 0.08, slide: 45 });
      break;
    case "railgun":
      tone(1640, 0.16, { type: "sine", gain: 0.28, slide: 130 });
      tone(220, 0.3, { type: "sawtooth", gain: 0.22, slide: 70 });
      noise(0.18, { gain: 0.35, from: 9000, to: 900, q: 2.5 });
      break;
    case "recruit":
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(f, 0.16, { type: "triangle", gain: 0.18, delay: i * 0.08 }),
      );
      break;
    case "win":
      [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
        tone(f, 0.22, { type: "triangle", gain: 0.2, delay: i * 0.11 }),
      );
      break;
    case "ko":
      [440, 415, 392, 330].forEach((f, i) =>
        tone(f, 0.3, { type: "sawtooth", gain: 0.16, delay: i * 0.2 }),
      );
      break;
    case "bell":
      [0, 0.28, 0.56].forEach((delay) => {
        tone(1320, 0.9, { type: "sine", gain: 0.24, delay });
        tone(1985, 0.6, { type: "sine", gain: 0.08, delay });
      });
      break;
    case "glove":
      noise(0.12, { gain: 0.5, from: 900, to: 120 });
      tone(92, 0.13, { type: "sine", gain: 0.42, slide: 45 });
      break;
    case "hammer":
      noise(0.24, { gain: 0.65, from: 2600, to: 70 });
      tone(62, 0.32, { type: "sine", gain: 0.55, slide: 28 });
      tone(560, 0.14, { type: "triangle", gain: 0.22, slide: 170, delay: 0.02 });
      break;
    case "swat":
      noise(0.12, { gain: 0.38, from: 9000, to: 1800, q: 1.4 });
      tone(700, 0.06, { type: "square", gain: 0.08, slide: 1200 });
      break;
    case "stamp":
      noise(0.2, { gain: 0.55, from: 1400, to: 90 });
      tone(110, 0.22, { type: "square", gain: 0.2, slide: 55 });
      break;
    case "crowd":
      noise(1.3, { gain: 0.2, from: 2200, to: 700, q: 0.4 });
      noise(0.9, { gain: 0.12, from: 3200, to: 1200, q: 0.6, delay: 0.15 });
      break;
    case "whiff":
      noise(0.13, { gain: 0.22, from: 3200, to: 500, q: 1.2 });
      break;
    case "squeak":
      tone(1400, 0.16, { type: "square", gain: 0.12, slide: 2400 });
      tone(900, 0.2, { type: "triangle", gain: 0.2, slide: 1500, delay: 0.05 });
      break;
    case "squirt":
      noise(0.22, { gain: 0.4, from: 7000, to: 1200, q: 2 });
      noise(0.3, { gain: 0.25, from: 1200, to: 300, q: 0.7, delay: 0.06 });
      break;
  }
}

function musicTone(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = "triangle",
) {
  const c = ctx;
  if (!c || !master || c.state !== "running" || !enabled) return;
  const now = c.currentTime;
  const oscillator = c.createOscillator();
  const envelope = c.createGain();
  const filter = c.createBiquadFilter();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = type === "sawtooth" ? 850 : 2400;
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(gain, now + 0.018);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(filter).connect(envelope).connect(master);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

/** Procedural battle soundtrack: no downloads, loops cleanly and starts after the play gesture. */
export function startBattleMusic(level = 1) {
  musicLevel = level;
  if (musicTimer) return;
  musicStep = 0;
  const roots = [55, 65.41, 73.42, 49];
  const scales = [0, 3, 5, 7, 10, 12, 15, 17];
  musicTimer = setInterval(() => {
    if (!enabled || !ctx || ctx.state !== "running") return;
    const step = musicStep++;
    const root = roots[(musicLevel - 1) % roots.length];
    if (step % 4 === 0) musicTone(root * (step % 16 === 12 ? 1.5 : 1), 0.42, 0.055, "sawtooth");
    if (step % 2 === 0) {
      const semitone = scales[(step / 2 + musicLevel * 2) % scales.length];
      musicTone(root * 4 * 2 ** (semitone / 12), 0.14, 0.035, "square");
    }
    if (step % 4 === 2) noise(0.06, { gain: 0.055, from: 7600, to: 2500, q: 2 });
    if (step % 8 === 7) noise(0.15, { gain: 0.07, from: 3200, to: 180 });
  }, 145);
}

export function stopBattleMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  musicStep = 0;
}

const CRIES: Record<string, Record<"power" | "boss" | "streak", string>> = {
  masivo: { power: "¡Modo masivo!", boss: "¡Vení pues!", streak: "¡No me para nadie!" },
  onichan: { power: "¡Modo anime!", boss: "¡Esta es mi temporada!", streak: "¡Combo perfecto!" },
  anatomic: {
    power: "¡Mercado en verde!",
    boss: "¡Se viene la corrección!",
    streak: "¡Todo para arriba!",
  },
  comadre: {
    power: "¡Fuera de mi vivo!",
    boss: "¡Atendeme una cosa!",
    streak: "¡El rating es mío!",
  },
  papu: { power: "¡Subí el volumen!", boss: "¡Dale pues!", streak: "¡Remix total!" },
  secre: { power: "¡Falta fotocopia!", boss: "¡Vuelva mañana!", streak: "¡Siguiente número!" },
  pablito: { power: "¡Mirá bien!", boss: "¡Llegó la estrella!", streak: "¡Este escenario es mío!" },
  marito: {
    power: "¡Fuego presidencial!",
    boss: "¡Despliegue total!",
    streak: "¡Objetivo neutralizado!",
  },
  rose: {
    power: "¡Notebook lista!",
    boss: "¡Masivo, cubrime!",
    streak: "¡Familia imparable!",
  },
};
let lastCry = 0;
export function battleCry(fighter: string, cue: "power" | "boss" | "streak") {
  if (!enabled || typeof speechSynthesis === "undefined" || performance.now() - lastCry < 1300)
    return;
  lastCry = performance.now();
  const line = CRIES[fighter]?.[cue];
  if (!line) return;
  const utterance = new SpeechSynthesisUtterance(line);
  const spanish = speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith("es"));
  if (spanish) utterance.voice = spanish;
  utterance.lang = spanish?.lang ?? "es-PY";
  utterance.rate = fighter === "marito" ? 0.9 : 1.08;
  utterance.pitch = fighter === "pablito" ? 1.18 : fighter === "marito" ? 0.76 : 0.96;
  utterance.volume = Math.min(1, volume);
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

export function sfx(name: SfxName) {
  if (!enabled) return;
  const c = ensure();
  if (!c) return;
  if (c.state === "running") {
    playSfx(name);
    return;
  }
  // The first tap on iOS/Android often creates a suspended context. Resume it
  // from that gesture and keep the sound that triggered the unlock instead of
  // silently dropping the first shot or menu confirmation.
  void unlockAudio()
    .then(() => playSfx(name))
    .catch(() => undefined);
}

export function vibrate(ms: number) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(ms);
  } catch {
    /* unsupported */
  }
}
