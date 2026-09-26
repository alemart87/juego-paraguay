/**
 * Sonido suave sintetizado (sin archivos): flauta al tocar la imagen, coro
 * de fondo y campana para la bendición. Todo bajo volumen.
 */
let context: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) {
    context = new Ctor();
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

export function setMuted(value: boolean) {
  muted = value;
  if (master) master.gain.value = value ? 0 : 0.5;
}

export function unlock() {
  ac();
}

const FLUTE_NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

/** Tres notas ascendentes de flauta dulce. */
export function flute() {
  const c = ac();
  if (!c || !master) return;
  const start = Math.floor(Math.random() * 3);
  const notes = [FLUTE_NOTES[start], FLUTE_NOTES[start + 1], FLUTE_NOTES[start + 3]];
  notes.forEach((freq, i) => {
    const t = c.currentTime + i * 0.16;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    const vibrato = c.createOscillator();
    vibrato.frequency.value = 5.5;
    const vibratoGain = c.createGain();
    vibratoGain.gain.value = 4;
    vibrato.connect(vibratoGain).connect(osc.frequency);
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(filter).connect(gain).connect(master!);
    osc.start(t);
    vibrato.start(t);
    osc.stop(t + 0.75);
    vibrato.stop(t + 0.75);
  });
}

/** Campana clara, para la bendición. */
export function bell() {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  for (const [freq, level] of [
    [880, 0.16],
    [1760, 0.06],
    [2637, 0.03],
  ] as const) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 2.7);
  }
}

let choirNodes: { stop: () => void } | null = null;

/** Coro de fondo (acorde suave, desafinado apenas). Llamar de nuevo lo reinicia. */
export function choir(seconds = 14) {
  const c = ac();
  if (!c || !master) return;
  choirNodes?.stop();
  const t = c.currentTime;
  const chord = [261.63, 329.63, 392, 523.25, 659.25];
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.09, t + 2.5);
  gain.gain.setValueAtTime(0.09, t + seconds - 3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  filter.connect(gain).connect(master);
  const oscillators = chord.flatMap((freq) =>
    [-4, 4].map((cents) => {
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + seconds + 0.1);
      return osc;
    }),
  );
  choirNodes = {
    stop: () => {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
      oscillators.forEach((osc) => osc.stop(c.currentTime + 1.5));
    },
  };
}

export function stopChoir() {
  choirNodes?.stop();
  choirNodes = null;
}
