import type { SfxName } from "@/game/audio";
import {
  HEAL_FRACTION,
  POWERUPS,
  POWER_HIT_AT,
  POWER_INTERVAL,
  POWER_SECONDS,
  SPECIALS,
  SPECIAL_COST,
  SPECIAL_HIT_AT,
  SPECIAL_SECONDS,
} from "./specials";

/**
 * Pure simulation for "Hernán Rivas ES ABOGADO". Everything lives in logical
 * low-res pixels (W×H, ~100–210 px wide); the scene upscales it with nearest
 * neighbour so it stays crisp pixel art.
 */

export type Weapon = "punos" | "guantes" | "mazo" | "hacha" | "magnum";
export const WEAPON_IDS: Weapon[] = ["punos", "guantes", "mazo", "hacha", "magnum"];
/** Weapons the player must buy (each gets one free try per match). */
export const PAID_WEAPONS: Weapon[] = ["guantes", "mazo", "hacha", "magnum"];
export type Mood =
  | "idle"
  | "taunt"
  | "block"
  | "hurt"
  | "dizzy"
  | "dodge"
  | "throw"
  | "ko"
  | "getup"
  | "laugh"
  | "gut"
  | "jailed";
export type Zone = "head" | "body" | "arm";

/** Rounds por partida; "A la cárcel" solo se habilita en el último. */
export const ROUNDS = 6;
export const ROUND_SECONDS = 75;
export const GAME_SECONDS = ROUNDS * ROUND_SECONDS;
/** Vida del abogado por round: cada vez aguanta más golpes. */
export const hpForRound = (round: number) => 220 + 60 * (round - 1);

export const WEAPON_STATS: Record<
  Weapon,
  {
    label: string;
    cooldown: number;
    travel: number;
    dmg: number;
    pts: number;
    comboWindow: number;
    charge: number;
    sfx: SfxName;
  }
> = {
  punos: {
    label: "Puños",
    cooldown: 0.09,
    travel: 0.07,
    dmg: 1,
    pts: 1,
    comboWindow: 1.1,
    charge: 0.42,
    sfx: "punch",
  },
  guantes: {
    label: "Guantes pro",
    cooldown: 0.1,
    travel: 0.08,
    dmg: 1.5,
    pts: 1.5,
    comboWindow: 1.7,
    charge: 0.28,
    sfx: "glove",
  },
  mazo: {
    label: "Mazo",
    cooldown: 0.32,
    travel: 0.19,
    dmg: 3.1,
    pts: 2.6,
    comboWindow: 1.6,
    charge: 0.45,
    sfx: "hammer",
  },
  hacha: {
    label: "Hacha inflable",
    cooldown: 0.26,
    travel: 0.16,
    dmg: 2.6,
    pts: 2.3,
    comboWindow: 1.6,
    charge: 0.4,
    sfx: "squeak",
  },
  magnum: {
    label: "Magnum de Tereré",
    cooldown: 0.16,
    travel: 0.06,
    dmg: 1.7,
    pts: 2.2,
    comboWindow: 1.5,
    charge: 0.35,
    sfx: "squirt",
  },
};

const TAUNTS = [
  "¡Soy abogado!",
  "¡Tengo mi título!",
  "¡Juro que estudié!",
  "¡Te voy a demandar!",
  "¡Es todo legal!",
  "¡Soy doctor en derecho!",
  "¡Mi título es original!",
];
/** Signature lines, each with the arm gesture that sells it (see render armAngle). */
const SIGNATURE: { text: string; gesture: number }[] = [
  { text: "¡Cartes es mi amigo!", gesture: 0 },
  { text: "¡Santi me puso acá, callate!", gesture: 2 },
  { text: "¡La Sudamericana es la mejor!", gesture: 1 },
  { text: "¡Kattya es mala!", gesture: 3 },
];
const HURT = ["¡Ay!", "¡Mi título!", "¡Protesto!", "¡No vale!", "¡Auch!", "¡Mi traje!"];
const BLOCK = ["¡Objeción!", "¡No ha lugar!"];
/** Lo primero que dice: te reta apenas entrás. */
const OPENERS = [
  "¿Vos? ¿VOS me vas a pegar? ¡JAJAJA!",
  "Dale, probá. Ni título tenés vos.",
  "Seis rounds y no me vas a tocar. ¡JAJA!",
  "¿Con esas manitos? ¡Andá a estudiar!",
  "Pegame si podés, pobre. ¡JAJAJA!",
];
/** Provocación al arrancar cada round (índice = round). */
const ROUND_TAUNTS: Record<number, string> = {
  2: "¿Seguís acá? ¡Qué necio! ¡JAJA!",
  3: "Round 3 y yo sigo abogado. ¡JAJAJA!",
  4: "¡Ya me aburrís! ¡Pegá de verdad!",
  5: "¡Falta poco y no me tumbás! ¡JAJA!",
  6: "¡ROUND FINAL! ¡Nadie me mete preso!",
};
const BELL_MOCK = [
  "¡Salvado por la campana! ¡JAJAJA!",
  "¡Se te acabó el tiempo, lento! ¡JAJA!",
  "¡Ni un K.O.! ¡Qué papelón! ¡JAJAJA!",
];
const ACCURACY_MOCK = [
  "¡Ni a la pantalla le pegás! ¡JAJAJA!",
  "¡Pegale al aire, campeón! ¡JAJA!",
  "¿Cerrás los ojos para pegar? ¡JAJAJA!",
];
const HALF_MOCK = [
  "¡Mitad del round y tengo toda la vida! ¡JAJAJA!",
  "¡Ni la mitad me sacaste! ¡JAJA!",
  "¡Se te va el tiempo, campeón! ¡JAJAJA!",
];
const SURVIVE_MOCK = [
  "¿Eso es todo? ¡Sigo de pie! ¡JAJAJA!",
  "¡Ni con ayuda me tumbás! ¡JAJA!",
  "¡Traé a otra, dale! ¡JAJAJA!",
];
const MOCK = [
  "¡JAJAJA! ¡No me hacés nada!",
  "¡Pegás con la mano del título! ¡JAJA!",
  "¡Yo tengo amigos, vos no! ¡JAJAJA!",
  "¡Llorá en la Corte! ¡JAJA!",
  "¡Dale, que me hacés cosquillas! ¡JAJAJA!",
  "¡Tu mamá pega más fuerte! ¡JAJA!",
  "¡Sos más flojo que mi tesis! ¡JAJAJA!",
  "¡Ni con seis rounds! ¡JAJA!",
  "¿Te cansaste ya? ¡JAJAJA!",
  "¡Pegás como mi abuela! ¡JAJAJA!",
  "¡Soy intocable! ¡JAJAJA!",
  "¡JAJAJA, qué flojo!",
  "¡Ni con título me ganás! ¡JAJA!",
  "¿Eso es todo? ¡JAJAJA!",
  "¡Andá a estudiar! ¡JAJA!",
  "¡Llorá, llorá! ¡JAJAJA!",
  "¡Pagá la Magnum, pobre! ¡JAJA!",
  "¡Te gané en la Corte! ¡JAJAJA!",
  "¡Ni me despeinaste! ¡JIJIJI!",
];
const DODGE_MOCK = [
  "¡JA! ¡Muy lento!",
  "¡Ni me tocaste! ¡JAJA!",
  "¡Olé! ¡JAJAJA!",
  "¡Por acá no! ¡JIJI!",
];
const ARM_LINES = ["¡Mi brazo!", "¡Con ese juro!", "¡Auch, el codo!", "¡Mi mano de jurar!"];
const GUT_LINES = ["¡Uff, mi panza!", "¡El asado!", "¡Uhhh!", "¡Mi chipa!"];
const LAUGH_WORDS = ["¡JA!", "JAJA", "¡JAJAJA!", "JA JA", "¡JIJI!"];
/** Seconds of the arrest cinematic before the results screen. */
export const JAIL_SECONDS = 4.4;
const GETUP = ["¡Apelo!", "¡Recurso de amparo!", "¡Nulidad!", "¡A la Corte!"];
const THROW = ["¡Demanda!", "¡Citación!"];
const HEAD_WORDS = ["POW", "PAF", "BAM", "CRACK", "TUC"];
const HAMMER_WORDS = ["BONK", "TOC TOC", "CATAPLUM"];
const AXE_WORDS = ["¡PIIIP!", "BOING", "¡PUIC!"];
const WATER_WORDS = ["¡SPLASH!", "¡CHAPUZÓN!", "¡SPLISH!"];
const WET = ["¡Mi peinado!", "¡Está frío!", "¡Mi traje nuevo!", "¡Tereré no!"];
const MILESTONES: Record<number, string> = {
  10: "¡UPEI!",
  25: "¡IMPARABLE!",
  50: "¡JUSTICIA!",
  75: "¡BESTIA!",
  100: "¡LEYENDA!",
  150: "¡SIN TÍTULO!",
  200: "¡DIOS DEL RING!",
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  kind: "dot" | "star" | "tooth" | "paper" | "sweat" | "confetti" | "water" | "button" | "blood";
};
export type FloatText = {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
  scale: number;
  vy: number;
  /** Running total for merged "+points" popups. */
  sum?: number;
};
export type Burst = { x: number; y: number; life: number; text: string; color: string };
export type Fist = {
  side: -1 | 1;
  tx: number;
  ty: number;
  t0: number;
  travel: number;
  charged: boolean;
  resolved: boolean;
  weapon: Weapon;
};
export type Paper = { x0: number; y0: number; tx: number; ty: number; t0: number; dur: number };
export type Spring = { v: number; vel: number };

export type GameEvent =
  | { type: "sfx"; name: SfxName }
  | { type: "say"; text: string }
  | { type: "vibrate"; ms: number }
  | { type: "snap"; fallback?: boolean }
  | { type: "trial"; weapon: Weapon }
  | { type: "end" };

export type World = {
  W: number;
  H: number;
  t: number;
  demo: boolean;
  timeLeft: number;
  ended: boolean;
  endAt: number;
  endSent: boolean;
  weapon: Weapon;
  goldTitle: boolean;
  bonusMazoUntil: number;
  bonusMazoGiven: boolean;
  /** One-shot free try of a weapon the player doesn't own. */
  trial: Weapon | null;
  trialsLeft: Partial<Record<Weapon, number>>;
  owned: Weapon[];
  /** Arm gesture while taunting: 0 wave, 1 fist pump, 2 finger wag, 3 arm up. */
  gesture: number;
  signatureIndex: number;
  missStreak: number;
  laughs: number;
  /** Ya dijo la provocación inicial. */
  opened: boolean;
  /** K.O. conseguidos en el round actual (el finisher pide uno en el round final). */
  roundKos: number;
  /** Round en el que ya se burló de la puntería (una vez por round). */
  accuracyMockRound: number;
  /** Medidor de arma especial, 0..1. */
  special: number;
  /** Cartas cargadas esperando dispararse. */
  specialQueue: number;
  specialIndex: number;
  specialsFired: number;
  specialActive: { index: number; t0: number; hit: boolean } | null;
  /** Cámara lenta (tiempo de mundo) tras un K.O. o una carta. */
  slowUntil: number;
  /** Refuerzo de Hernán en pantalla. */
  powerActive: { index: number; t0: number; hit: boolean } | null;
  powerIndex: number;
  powersUsed: number;
  nextPowerAt: number;
  /** "Título blindado": recibe menos daño. */
  shieldUntil: number;
  /** "Tereré energético": esquiva más y demanda el doble. */
  hypeUntil: number;
  /** Round en el que ya se burló a mitad de tiempo. */
  halfMockRound: number;
  jailAt: number;
  jailClang: boolean;
  armKick: Spring;
  armDamage: number;
  bodyDamage: number;
  zoom: Spring;
  speedUntil: number;
  rings: { x: number; y: number; t0: number; heavy: boolean }[];
  wet: number;
  score: number;
  combo: number;
  maxCombo: number;
  lastHitAt: number;
  hits: number;
  throws: number;
  kos: number;
  round: number;
  swats: number;
  sued: number;
  hp: number;
  maxHp: number;
  damage: number;
  mood: Mood;
  moodUntil: number;
  nextAiAt: number;
  koAt: number;
  lean: Spring;
  leanTarget: number;
  headX: Spring;
  headY: Spring;
  headR: Spring;
  squash: Spring;
  bodyDip: Spring;
  recentHits: number[];
  speech: { text: string; until: number } | null;
  fists: Fist[];
  lastThrowAt: number;
  papers: Paper[];
  nextPaperAt: number;
  particles: Particle[];
  texts: FloatText[];
  bursts: Burst[];
  shake: number;
  flash: number;
  hitStop: number;
  suedUntil: number;
  charging: { side: -1 | 1; start: number } | null;
  events: GameEvent[];
  blinkAt: number;
};

const spring = (): Spring => ({ v: 0, vel: 0 });
const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

export function createWorld(opts: {
  weapon: Weapon;
  goldTitle: boolean;
  demo?: boolean;
  owned?: Weapon[];
}): World {
  const owned = opts.owned ?? ["punos"];
  return {
    W: 160,
    H: 160,
    t: 0,
    demo: Boolean(opts.demo),
    timeLeft: ROUND_SECONDS,
    ended: false,
    endAt: 0,
    endSent: false,
    weapon: opts.weapon,
    goldTitle: opts.goldTitle,
    bonusMazoUntil: 0,
    bonusMazoGiven: false,
    trial: null,
    trialsLeft: Object.fromEntries(
      PAID_WEAPONS.filter((id) => !owned.includes(id)).map((id) => [id, 1]),
    ),
    owned,
    gesture: 0,
    signatureIndex: 0,
    missStreak: 0,
    laughs: 0,
    opened: false,
    roundKos: 0,
    accuracyMockRound: 0,
    special: 0,
    specialQueue: 0,
    specialIndex: 0,
    specialsFired: 0,
    specialActive: null,
    slowUntil: 0,
    powerActive: null,
    powerIndex: 0,
    powersUsed: 0,
    nextPowerAt: 14 + Math.random() * 6,
    shieldUntil: 0,
    hypeUntil: 0,
    halfMockRound: 0,
    jailAt: 0,
    jailClang: false,
    armKick: spring(),
    armDamage: 0,
    bodyDamage: 0,
    zoom: spring(),
    speedUntil: 0,
    rings: [],
    wet: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lastHitAt: -9,
    hits: 0,
    throws: 0,
    kos: 0,
    round: 1,
    swats: 0,
    sued: 0,
    hp: hpForRound(1),
    maxHp: hpForRound(1),
    damage: 0,
    mood: "idle",
    moodUntil: 0,
    nextAiAt: opts.demo ? 1.6 : 3.2,
    koAt: 0,
    lean: spring(),
    leanTarget: 0,
    headX: spring(),
    headY: spring(),
    headR: spring(),
    squash: spring(),
    bodyDip: spring(),
    recentHits: [],
    speech: null,
    fists: [],
    lastThrowAt: -9,
    papers: [],
    nextPaperAt: 7,
    particles: [],
    texts: [],
    bursts: [],
    shake: 0,
    flash: 0,
    hitStop: 0,
    suedUntil: 0,
    charging: null,
    events: [],
    blinkAt: 2,
  };
}

export function resize(w: World, W: number, H: number) {
  w.W = W;
  w.H = H;
}

/** Where the character stands this frame (logical px). */
/** Resting head height: lower in play, higher on the title screen (menu covers the bottom). */
export function baseHeadY(w: World) {
  return Math.min(w.H - 88, w.H * (w.demo ? 0.33 : 0.55));
}

export function layout(w: World) {
  const baseHead = baseHeadY(w);
  const fall = fallAmount(w);
  // The photo's torso sits to the right of his face (3/4 pose), so shift the anchor left.
  const cx = w.W / 2 - 8 + w.lean.v;
  const headY = baseHead + w.bodyDip.v + fall * Math.min(60, w.H * 0.34);
  return {
    cx,
    headY,
    headCx: cx + w.headX.v,
    headCy: headY + w.headY.v,
    neckY: headY + 21,
    fall,
  };
}

export function fallAmount(w: World) {
  if (w.mood === "ko") {
    const k = Math.min(1, (w.t - w.koAt) / 0.55);
    return k * k;
  }
  if (w.mood === "getup") return Math.max(0, 1 - (w.t - (w.moodUntil - 0.8)) / 0.8);
  return 0;
}

export function activeWeapon(w: World): Weapon {
  if (w.bonusMazoUntil > w.t) return "mazo";
  return w.trial ?? w.weapon;
}

/** Switch to an owned weapon, or arm a one-shot free try of a locked one. */
export function selectWeapon(w: World, id: Weapon) {
  if (w.owned.includes(id)) {
    w.weapon = id;
    w.trial = null;
    return "owned" as const;
  }
  if ((w.trialsLeft[id] ?? 0) > 0) {
    w.trial = id;
    return "trial" as const;
  }
  return "locked" as const;
}

/** Which hand / side the weapon comes from. */
export function weaponSide(weapon: Weapon, side: -1 | 1): -1 | 1 {
  if (weapon === "mazo" || weapon === "magnum") return 1;
  if (weapon === "hacha") return -1;
  return side;
}

/** Oath-arm angle in radians (+ = raised), shared by hit-testing and drawing. */
export function armPose(w: World, mood: Mood = w.mood) {
  const t = w.t;
  let a: number;
  switch (mood) {
    case "taunt":
      a =
        w.gesture === 1
          ? 0.95 + Math.abs(Math.sin(t * 9)) * 0.35
          : w.gesture === 2
            ? 0.12 + Math.sin(t * 14) * 0.22
            : w.gesture === 3
              ? 1.45 + Math.sin(t * 5) * 0.08
              : 0.42 + Math.sin(t * 10) * 0.18;
      break;
    case "block":
      a = 1.25;
      break;
    case "throw":
      a = 0.75;
      break;
    case "hurt":
      a = -0.25 + Math.sin(t * 40) * 0.12;
      break;
    case "gut":
      a = -0.9;
      break;
    case "dodge":
      a = 0.2;
      break;
    case "dizzy":
      a = -0.7 + Math.sin(t * 4) * 0.18;
      break;
    case "ko":
      a = 1.35 + Math.sin(t * 20) * 0.05;
      break;
    case "getup":
      a = 0.5;
      break;
    case "laugh":
      a = -0.12 + Math.sin(t * 26) * 0.07;
      break;
    case "jailed":
      a = 1.2 + Math.sin(t * 7) * 0.06;
      break;
    default:
      a = Math.sin(t * 1.6) * 0.05;
  }
  // A badly beaten arm hangs lower; the hit spring makes it flail.
  const droop = mood === "jailed" ? 0 : Math.max(0, w.armDamage - 0.5) * 0.9;
  return a - droop + w.armKick.v;
}

/** Shoulder → hand segment of the oath arm in logical px. */
export function armSegment(w: World) {
  const L = layout(w);
  const sx = L.cx - 24;
  const sy = L.headY + 35;
  const a = armPose(w);
  const len = 86;
  return { sx, sy, ex: sx - Math.cos(a) * len, ey: sy - Math.sin(a) * len };
}

function hitZone(w: World, x: number, y: number): Zone | null {
  const L = layout(w);
  const dx = (x - L.headCx - 3) / 18;
  const dy = (y - L.headCy + 1) / 23;
  if (dx * dx + dy * dy <= 1) return "head";
  const A = armSegment(w);
  const vx = A.ex - A.sx;
  const vy = A.ey - A.sy;
  const k = Math.max(0, Math.min(1, ((x - A.sx) * vx + (y - A.sy) * vy) / (vx * vx + vy * vy)));
  if (k > 0.06 && Math.hypot(x - (A.sx + vx * k), y - (A.sy + vy * k)) < 7.5) return "arm";
  if (x >= L.cx - 30 && x <= L.cx + 56 && y >= L.neckY + 2 && y <= w.H) return "body";
  return null;
}

function say(w: World, text: string, seconds = 1.6) {
  if (!text) return;
  w.speech = { text, until: w.t + seconds };
  w.events.push({ type: "say", text });
}

function setMood(w: World, mood: Mood, seconds: number) {
  w.mood = mood;
  w.moodUntil = w.t + seconds;
}

function float(w: World, x: number, y: number, text: string, color: string, scale = 1) {
  w.texts.push({ x, y, text, color, scale, life: 0.9, max: 0.9, vy: -26 });
}

function spray(
  w: World,
  x: number,
  y: number,
  n: number,
  kind: Particle["kind"],
  color: string,
  speed = 60,
) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random() * 0.8);
    const life = 0.45 + Math.random() * 0.5;
    w.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - speed * 0.4,
      life,
      max: life,
      color,
      size: kind === "paper" ? 2 : 1,
      kind,
    });
  }
  if (w.particles.length > 260) w.particles.splice(0, w.particles.length - 260);
}

function canPunch(w: World) {
  return !w.ended && w.suedUntil <= w.t;
}

/** Tap / click at a logical point: swat a flying lawsuit first, else punch there. */
export function tapAt(w: World, x: number, y: number, charged = false) {
  if (w.ended) return;
  for (let i = w.papers.length - 1; i >= 0; i--) {
    const p = paperState(w, w.papers[i]);
    if (Math.abs(x - p.x) <= p.half * 1.2 + 4 && Math.abs(y - p.y) <= p.half + 4) {
      w.papers.splice(i, 1);
      w.swats++;
      const pts = 300 * w.round;
      if (!w.demo) {
        w.score += pts;
        chargeSpecial(w, pts);
      }
      spray(w, p.x, p.y, 16, "paper", "#f4efe2", 90);
      float(w, p.x, p.y - 6, "¡RECHAZADA!", "#7ee0ff");
      float(w, p.x, p.y + 4, `+${pts}`, "#ffe066");
      w.events.push({ type: "sfx", name: "swat" });
      return;
    }
  }
  const side: -1 | 1 = x < w.W / 2 ? -1 : 1;
  throwPunch(w, x, y, side, charged);
}

export function throwPunch(w: World, x: number, y: number, side: -1 | 1, charged = false) {
  if (!canPunch(w)) return;
  const weapon = activeWeapon(w);
  const stats = WEAPON_STATS[weapon];
  if (w.t - w.lastThrowAt < stats.cooldown && !charged) return;
  w.lastThrowAt = w.t;
  w.throws++;
  const useSide = weaponSide(weapon, side);
  if (w.trial && weapon === w.trial) {
    w.trialsLeft[weapon] = Math.max(0, (w.trialsLeft[weapon] ?? 1) - 1);
    w.trial = null;
    w.events.push({ type: "trial", weapon });
  }
  w.fists = w.fists.filter((f) => f.side !== useSide || !f.resolved || w.t - f.t0 < f.travel);
  w.fists.push({
    side: useSide,
    tx: x,
    ty: y,
    t0: w.t,
    travel: stats.travel * (charged ? 1.15 : 1),
    charged,
    resolved: false,
    weapon,
  });
  w.events.push({ type: "sfx", name: "whiff" });
  // He tries to slip the first punch of a flurry, never while stunned.
  const calm = w.mood === "idle" || w.mood === "taunt";
  const hype = w.hypeUntil > w.t ? 0.28 : 0;
  const dodgeChance = Math.min(0.62, 0.12 + (w.round - 1) * 0.06 + hype);
  if (calm && w.t - w.lastHitAt > 0.5 && Math.random() < dodgeChance && !w.demo) {
    const L = layout(w);
    setMood(w, "dodge", 0.42);
    w.leanTarget = x < L.cx ? 22 : -22;
  }
}

function resolveFist(w: World, f: Fist) {
  f.resolved = true;
  if (w.mood === "ko" || w.mood === "getup") return;
  const zone = hitZone(w, f.tx, f.ty);
  const stats = WEAPON_STATS[f.weapon];
  if (!zone || w.mood === "dodge") {
    if (w.combo > 0) float(w, f.tx, f.ty, "¡FALLÓ!", "#ff8a8a");
    else if (w.mood === "dodge") float(w, f.tx, f.ty, "¡ESQUIVÓ!", "#ff8a8a");
    w.combo = 0;
    w.missStreak++;
    const sloppy = w.throws >= 12 && w.hits / w.throws < 0.4 && w.accuracyMockRound < w.round;
    if (sloppy && !w.demo) {
      w.accuracyMockRound = w.round;
      laugh(w, pick(ACCURACY_MOCK));
    } else if (w.mood === "dodge" && Math.random() < 0.5) laugh(w, pick(DODGE_MOCK));
    else if (w.missStreak >= 2 && w.mood !== "laugh") laugh(w);
    return;
  }
  w.missStreak = 0;
  if (zone === "head" && w.mood === "block") {
    const pts = 20;
    if (!w.demo) w.score += pts;
    w.hp = Math.max(1, w.hp - 1.2 * stats.dmg);
    w.headX.vel += -f.side * 40;
    spray(w, f.tx, f.ty, 6, "paper", "#efe6cf", 50);
    float(w, f.tx, f.ty - 4, "BLOQUEÓ", "#c9d4ff");
    w.events.push({ type: "sfx", name: "hit" });
    if (Math.random() < 0.25) say(w, pick(BLOCK), 0.9);
    return;
  }

  let base = zone === "head" ? 100 : zone === "arm" ? 70 : 60;
  let dmg = (zone === "head" ? 6 : zone === "arm" ? 3.5 : 4.2) * stats.dmg;
  const tags: string[] = [];
  if (f.charged) {
    base *= 2.2;
    dmg *= 2.2;
    tags.push("¡CARGADO!");
  }
  if (w.mood === "laugh") {
    base *= 2.2;
    dmg *= 1.4;
    tags.push("¡CALLALO!");
  }
  if (w.mood === "taunt") {
    base *= 2;
    dmg *= 1.3;
    tags.push("¡CONTRAGOLPE!");
  }
  if (w.mood === "dizzy") {
    base *= 1.5;
    dmg *= 1.4;
  }
  if (zone === "body" && w.mood === "block") {
    base *= 1.6;
    tags.push("¡AL CUERPO!");
  } else if (zone === "body") tags.push("¡A LA PANZA!");
  else if (zone === "arm") tags.push("¡AL BRAZO!");
  if (w.shieldUntil > w.t) {
    dmg *= 0.45;
    tags.unshift("¡BLINDADO!");
  }
  const mult = 1 + Math.min(4, Math.floor(w.combo / 5) * 0.5);
  const pts = Math.round(base * stats.pts * mult);
  if (!w.demo) {
    w.score += pts;
    chargeSpecial(w, pts);
  }
  w.combo++;
  w.maxCombo = Math.max(w.maxCombo, w.combo);
  w.lastHitAt = w.t;
  w.hits++;
  w.hp -= w.demo ? dmg * 0.4 : dmg;
  w.damage = Math.min(1, w.damage + dmg / 900);

  const push = -f.side;
  const heavy = f.charged || f.weapon === "mazo" || f.weapon === "hacha";
  if (zone === "head") {
    w.headX.vel += push * (heavy ? 330 : 190);
    w.headR.vel += push * (heavy ? 9 : 5.5);
    w.headY.vel += f.ty < layout(w).headCy - 4 ? -60 : 70;
    if (f.weapon === "hacha") {
      w.squash.vel += 12;
      w.headR.vel += push * 6;
    }
    if (f.weapon === "mazo") {
      w.squash.vel -= 16;
      w.headY.vel += 160;
    }
  } else if (zone === "arm") {
    w.armKick.vel += (heavy ? 16 : 9) * (f.ty < armSegment(w).sy ? 1 : -1);
    w.armDamage = Math.min(1, w.armDamage + (heavy ? 0.12 : 0.06));
    w.headX.vel += push * 60;
    if (Math.random() < 0.35) say(w, pick(ARM_LINES), 0.9);
  } else {
    // Gut punch: he folds over, eyes pop, a jacket button flies off.
    w.bodyDip.vel += heavy ? 220 : 130;
    w.squash.vel += heavy ? 12 : 7;
    w.headY.vel += heavy ? 200 : 120;
    w.headR.vel += push * 2;
    w.bodyDamage = Math.min(1, w.bodyDamage + (heavy ? 0.1 : 0.05));
    if (Math.random() < (heavy ? 0.7 : 0.25)) {
      const L0 = layout(w);
      w.particles.push({
        x: L0.cx + 4,
        y: L0.neckY + 28,
        vx: push * (40 + Math.random() * 50),
        vy: -90 - Math.random() * 40,
        life: 1.2,
        max: 1.2,
        color: "#1a1a1a",
        size: 2.4,
        kind: "button",
      });
    }
    if (Math.random() < 0.35) say(w, pick(GUT_LINES), 0.9);
  }
  if (w.mood !== "dizzy") {
    if (zone === "body") setMood(w, "gut", heavy ? 0.6 : 0.42);
    else setMood(w, "hurt", heavy ? 0.42 : 0.26);
  }
  // Juice: shockwave ring on every hit, speed lines + camera punch-in on heavy ones.
  w.rings.push({ x: f.tx, y: f.ty, t0: w.t, heavy });
  if (w.rings.length > 6) w.rings.shift();
  if (heavy) {
    w.zoom.vel += f.weapon === "mazo" ? 60 : 38;
    w.speedUntil = w.t + 0.28;
  }

  w.recentHits.push(w.t);
  w.recentHits = w.recentHits.filter((t) => w.t - t < 1.3);
  if ((w.recentHits.length >= 7 || (heavy && Math.random() < 0.35)) && w.mood !== "dizzy") {
    setMood(w, "dizzy", 2.1);
    float(w, w.W / 2, Math.max(8, layout(w).headCy - 36), "¡MAREADO!", "#ffe066");
  }

  const words =
    f.weapon === "mazo"
      ? HAMMER_WORDS
      : f.weapon === "hacha"
        ? AXE_WORDS
        : f.weapon === "magnum"
          ? WATER_WORDS
          : HEAD_WORDS;
  if (f.weapon === "magnum") {
    w.wet = Math.min(1, w.wet + 0.14);
    spray(w, f.tx, f.ty, 14, "water", "#8fe3ff", 90);
    if (Math.random() < 0.18) say(w, pick(WET), 0.9);
  }
  // Keep the face readable: words only on big hits, numbers pushed off to the side.
  w.bursts.push({
    x: f.tx - push * 10,
    y: f.ty - (zone === "head" ? 6 : 0),
    life: heavy ? 0.36 : 0.16,
    text: heavy || w.combo % 4 === 0 ? pick(words) : "",
    color: heavy ? "#ffdd33" : "#ffffff",
  });
  if (w.bursts.length > 3) w.bursts.shift();
  const L = layout(w);
  const sideX = L.headCx + push * 30;
  // Rapid hits merge into one growing "+points" popup instead of a pile of numbers.
  const running = w.texts.find((t) => t.sum !== undefined && t.max - t.life < 0.45);
  if (running?.sum !== undefined) {
    running.sum += pts;
    running.text = `+${running.sum}`;
    running.life = running.max;
    running.x = sideX;
    running.y = L.headCy - 12;
    running.scale = Math.min(2, 1 + running.sum / 3000);
  } else {
    w.texts.push({
      x: sideX,
      y: L.headCy - 12,
      text: `+${pts}`,
      color: mult > 1 ? "#ffe066" : "#ffffff",
      scale: 1,
      life: 0.9,
      max: 0.9,
      vy: -20,
      sum: pts,
    });
  }
  tags.slice(0, 1).forEach((tag) => float(w, w.W / 2, Math.max(8, L.headCy - 44), tag, "#7ee0ff"));
  const small = w.texts.filter((t) => t.scale === 1);
  if (small.length > 5) w.texts.splice(w.texts.indexOf(small[0]), 1);
  spray(w, f.tx, f.ty, heavy ? 10 : 5, "sweat", "#bfe9ff", heavy ? 90 : 60);
  if (heavy) spray(w, f.tx, f.ty, 5, "star", "#ffe066", 70);
  if (zone === "head" && w.damage > 0.45 && Math.random() < (heavy ? 0.5 : 0.08))
    spray(w, f.tx, f.ty + 6, 1, "tooth", "#fffbe8", 80);
  // Máxima violencia: a partir de cierto castigo, los golpes a la cara salpican.
  if (zone === "head" && (heavy || w.damage > 0.3) && Math.random() < (heavy ? 0.85 : 0.4))
    spray(w, f.tx, f.ty + 2, heavy ? 10 : 4, "blood", "#c8102e", heavy ? 95 : 65);
  w.shake = Math.max(w.shake, f.weapon === "mazo" ? 7 : heavy ? 5 : 2.2);
  if (f.weapon === "hacha") w.events.push({ type: "sfx", name: "glove" });
  w.hitStop = heavy ? 0.075 : 0.03;
  w.events.push({ type: "sfx", name: stats.sfx });
  if (heavy) w.events.push({ type: "sfx", name: "boom" });
  w.events.push({ type: "vibrate", ms: heavy ? 35 : 12 });
  if (Math.random() < (heavy ? 0.4 : 0.1)) say(w, pick(HURT), 0.8);

  const milestone = MILESTONES[w.combo];
  if (milestone) {
    w.texts.push({
      x: w.W / 2,
      y: w.H * 0.2,
      text: milestone,
      color: "#ffe066",
      scale: 2,
      life: 1.2,
      max: 1.2,
      vy: -6,
    });
    w.events.push({ type: "sfx", name: "crowd" }, { type: "snap" });
  }
  if (w.combo === 25 && !w.bonusMazoGiven && w.weapon !== "mazo" && !w.demo) {
    w.bonusMazoGiven = true;
    w.bonusMazoUntil = w.t + 6;
    w.texts.push({
      x: w.W / 2,
      y: w.H * 0.3,
      text: "¡MAZO DORADO 6 S!",
      color: "#ffcc33",
      scale: 1,
      life: 1.6,
      max: 1.6,
      vy: -4,
    });
    w.events.push({ type: "sfx", name: "pickup" });
  }

  if (w.hp <= 0) knockout(w);
}

function knockout(w: World) {
  w.hp = 0;
  w.kos++;
  w.roundKos++;
  w.koAt = w.t;
  w.slowUntil = w.t + 0.4;
  spray(w, layout(w).headCx, layout(w).headCy, 14, "blood", "#c8102e", 110);
  setMood(w, "ko", 2.2);
  w.speech = null;
  w.papers = [];
  const bonus = 1500 * w.round;
  if (!w.demo) w.score += bonus;
  w.flash = 1;
  w.shake = 9;
  const colors = ["#d52b1e", "#ffffff", "#0038a8", "#ffd23f", "#ff4fd8"];
  for (let i = 0; i < 70; i++) {
    const life = 1.4 + Math.random() * 1.2;
    w.particles.push({
      x: Math.random() * w.W,
      y: -5 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 40,
      vy: 10 + Math.random() * 30,
      life,
      max: life,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 2,
      kind: "confetti",
    });
  }
  w.hitStop = 0.2;
  w.texts.push(
    {
      x: w.W / 2,
      y: w.H * 0.22,
      text: "K.O.!",
      color: "#ff3b3b",
      scale: 4,
      life: 1.8,
      max: 1.8,
      vy: 0,
    },
    {
      x: w.W / 2,
      y: w.H * 0.22 + 26,
      text: `+${bonus}`,
      color: "#ffe066",
      scale: 2,
      life: 1.8,
      max: 1.8,
      vy: -4,
    },
  );
  w.events.push({ type: "sfx", name: "bell" }, { type: "sfx", name: "crowd" }, { type: "snap" });
  w.events.push({ type: "vibrate", ms: 90 });
}

export function paperState(w: World, p: Paper) {
  const k = Math.min(1, (w.t - p.t0) / p.dur);
  const e = k * k;
  return {
    k,
    x: p.x0 + (p.tx - p.x0) * e,
    y: p.y0 + (p.ty - p.y0) * e - Math.sin(k * Math.PI) * 18,
    scale: 0.5 + e * 3.2,
    half: 7 * (0.5 + e * 3.2),
    rot: (w.t - p.t0) * 7,
  };
}

function stepSpring(s: Spring, target: number, k: number, damp: number, dt: number) {
  s.vel += (target - s.v) * k * dt;
  s.vel *= Math.exp(-damp * dt);
  s.v += s.vel * dt;
}

/** He cracks up at the player: head back, jaw flapping, tears, "JAJAJA" everywhere. */
export function laugh(w: World, line = pick(MOCK)) {
  if (w.mood === "ko" || w.mood === "getup" || w.mood === "jailed") return;
  setMood(w, "laugh", 2.3);
  w.laughs++;
  w.missStreak = 0;
  say(w, line, 2.3);
  w.events.push({ type: "sfx", name: "laugh" });
  const L = layout(w);
  for (let i = 0; i < 5; i++) {
    const side = i % 2 ? 1 : -1;
    w.texts.push({
      x: L.headCx + side * (18 + Math.random() * 16),
      y: L.headCy - 10 + (Math.random() - 0.5) * 30,
      text: pick(LAUGH_WORDS),
      color: ["#ffd23f", "#ff4fd8", "#7ee0ff", "#ffffff"][i % 4],
      scale: 1 + (i % 2),
      life: 1.4 + i * 0.12,
      max: 1.4 + i * 0.12,
      vy: -14 - Math.random() * 10,
    });
  }
}

/** Los puntos llenan el medidor; cada carga dispara una carta apenas se pueda. */
function chargeSpecial(w: World, pts: number) {
  w.special += pts / SPECIAL_COST;
  while (w.special >= 1) {
    w.special -= 1;
    w.specialQueue++;
  }
}

export function activeSpecial(w: World) {
  return w.specialActive ? SPECIALS[w.specialActive.index] : null;
}

/** La carta entra de golpe: flash, rayos, frase gritada; el impacto llega un poco después. */
function fireSpecial(w: World) {
  const index = w.specialIndex % SPECIALS.length;
  const card = SPECIALS[index];
  w.specialIndex++;
  w.specialQueue--;
  w.specialsFired++;
  w.specialActive = { index, t0: w.t, hit: false };
  w.hitStop = 0.06;
  w.flash = 0.9;
  w.shake = 8;
  w.slowUntil = w.t + 0.18;
  w.speech = null;
  w.events.push(
    { type: "sfx", name: "boom" },
    { type: "sfx", name: "crowd" },
    { type: "vibrate", ms: 80 },
    { type: "say", text: card.phrase },
  );
}

function specialImpact(w: World) {
  const card = activeSpecial(w);
  if (!card || !w.specialActive) return;
  w.specialActive.hit = true;
  if (w.mood === "ko" || w.mood === "getup" || w.mood === "jailed") return;
  const L = layout(w);
  const dmg = Math.max(70, w.maxHp * card.damage);
  const bonus = 1500 * w.round;
  w.hp -= dmg;
  w.damage = Math.min(1, w.damage + 0.12);
  w.score += bonus;
  w.combo += 5;
  w.maxCombo = Math.max(w.maxCombo, w.combo);
  w.lastHitAt = w.t;
  w.headX.vel += 380;
  w.headR.vel += 11;
  w.headY.vel += 120;
  w.squash.vel -= 18;
  w.bodyDip.vel += 200;
  w.zoom.vel += 75;
  w.speedUntil = w.t + 0.4;
  w.shake = 14;
  w.flash = Math.max(w.flash, 0.7);
  w.hitStop = 0.11;
  w.slowUntil = w.t + 0.22;
  w.rings.push({ x: L.headCx, y: L.headCy, t0: w.t, heavy: true });
  spray(w, L.headCx, L.headCy, 18, "star", "#ffe066", 120);
  spray(w, L.headCx, L.headCy + 4, 16, "blood", "#c8102e", 130);
  spray(w, L.headCx, L.headCy + 6, 3, "tooth", "#fffbe8", 100);
  for (let i = 0; i < 30; i++) {
    const life = 1.2 + Math.random();
    w.particles.push({
      x: L.headCx,
      y: L.headCy,
      vx: (Math.random() - 0.5) * 220,
      vy: -60 - Math.random() * 120,
      life,
      max: life,
      color: [card.color, "#ffffff", "#ffd23f"][i % 3],
      size: 2 + Math.random() * 2,
      kind: "confetti",
    });
  }
  w.texts.push({
    x: L.headCx + 30,
    y: L.headCy - 16,
    text: `+${bonus}`,
    color: "#ffe066",
    scale: 2,
    life: 1.3,
    max: 1.3,
    vy: -14,
  });
  w.events.push(
    { type: "sfx", name: "hammer" },
    { type: "sfx", name: "boom" },
    { type: "vibrate", ms: 120 },
    { type: "snap" },
  );
  w.shieldUntil = 0;
  w.hypeUntil = 0;
  if (w.hp <= 0) knockout(w);
  else {
    setMood(w, "dizzy", 2.4);
    say(w, card.reply, SPECIAL_SECONDS - (w.t - w.specialActive.t0) + 2.2);
    if (w.hp > w.maxHp * 0.5) {
      w.nextAiAt = Number.POSITIVE_INFINITY;
      w.texts.push({
        x: w.W / 2,
        y: w.H * 0.3,
        text: pick(SURVIVE_MOCK),
        color: "#ff8ec4",
        scale: 1.2,
        life: 2.2,
        max: 2.2,
        vy: -5,
      });
      w.nextAiAt = w.moodUntil + 0.2;
    }
  }
}

export function activePower(w: World) {
  return w.powerActive ? POWERUPS[w.powerActive.index] : null;
}

/** Le llega un refuerzo: la carta entra por su lado y él festeja a carcajadas. */
function firePower(w: World) {
  const index = w.powerIndex % POWERUPS.length;
  w.powerIndex++;
  w.powersUsed++;
  w.powerActive = { index, t0: w.t, hit: false };
  w.flash = Math.max(w.flash, 0.5);
  w.shake = Math.max(w.shake, 4);
  // Se ríe mientras entra la carta; la frase la grita cuando el refuerzo le llega.
  laugh(w, "");
  w.gesture = 1;
  w.events.push({ type: "sfx", name: "pickup" }, { type: "vibrate", ms: 40 });
  const [lo, hi] = POWER_INTERVAL;
  w.nextPowerAt = w.t + lo + Math.random() * (hi - lo);
}

function throwPaper(w: World, delay = 0.2) {
  const L = layout(w);
  const hype = w.hypeUntil > w.t;
  w.papers.push({
    x0: L.cx - 62,
    y0: L.neckY + 12,
    tx: w.W * (0.2 + Math.random() * 0.6),
    ty: w.H * (0.45 + Math.random() * 0.35),
    t0: w.t + delay,
    dur: Math.max(0.95, 1.7 - w.round * 0.12) * (hype ? 0.8 : 1),
  });
}

function applyPower(w: World) {
  const card = activePower(w);
  if (!card || !w.powerActive) return;
  w.powerActive.hit = true;
  if (w.mood === "ko" || w.mood === "getup" || w.mood === "jailed") return;
  const L = layout(w);
  w.shake = Math.max(w.shake, 6);
  w.flash = Math.max(w.flash, 0.4);
  w.zoom.vel += 30;
  // La burbuja recién se ve cuando la carta se va: que dure hasta entonces y un poco más.
  say(w, card.line, POWER_SECONDS - (w.t - w.powerActive.t0) + 2.6);
  spray(w, L.headCx, L.headCy - 10, 14, "star", card.color, 90);
  if (card.effect === "heal") {
    const heal = Math.round(w.maxHp * HEAL_FRACTION);
    w.hp = Math.min(w.maxHp, w.hp + heal);
    w.damage = Math.max(0, w.damage - 0.12);
    w.texts.push({
      x: L.headCx + 26,
      y: L.headCy - 18,
      text: `+${heal} VIDA`,
      color: "#5cff8a",
      scale: 1.8,
      life: 1.4,
      max: 1.4,
      vy: -12,
    });
    w.events.push({ type: "sfx", name: "crowd" });
  } else if (card.effect === "shield") {
    w.shieldUntil = w.t + card.seconds;
    float(w, w.W / 2, Math.max(8, L.headCy - 44), "¡BLINDADO!", card.color, 1.6);
    w.events.push({ type: "sfx", name: "clang" });
  } else {
    w.hypeUntil = w.t + card.seconds;
    throwPaper(w, 0.1);
    throwPaper(w, 0.7);
    w.nextPaperAt = w.t + 2.5;
    float(w, w.W / 2, Math.max(8, L.headCy - 44), "¡ENERGÍA!", card.color, 1.6);
    w.events.push({ type: "sfx", name: "squirt" });
  }
}

function stepPower(w: World) {
  if (w.powerActive) {
    const since = w.t - w.powerActive.t0;
    if (!w.powerActive.hit && since >= POWER_HIT_AT) applyPower(w);
    if (since >= POWER_SECONDS) w.powerActive = null;
    return;
  }
  const calm = w.mood === "idle" || w.mood === "taunt" || w.mood === "block";
  if (w.t >= w.nextPowerAt && calm && !w.ended && !w.specialActive && w.timeLeft > 6)
    firePower(w);
}

function stepSpecial(w: World) {
  if (w.specialActive) {
    const since = w.t - w.specialActive.t0;
    if (!w.specialActive.hit && since >= SPECIAL_HIT_AT) specialImpact(w);
    if (since >= SPECIAL_SECONDS) w.specialActive = null;
    return;
  }
  const busy = w.mood === "ko" || w.mood === "getup" || w.mood === "jailed";
  if (w.specialQueue > 0 && !w.ended && !busy) fireSpecial(w);
}

/** Round nuevo: más vida, campana, y una provocación de arranque. */
function nextRound(w: World, reason: "ko" | "bell") {
  w.round++;
  w.roundKos = 0;
  w.timeLeft = ROUND_SECONDS;
  w.maxHp = hpForRound(w.round);
  w.hp = reason === "ko" ? w.maxHp : Math.min(w.maxHp, w.hp + w.maxHp * 0.5);
  w.shieldUntil = 0;
  w.hypeUntil = 0;
  w.papers = [];
  w.suedUntil = 0;
  const final = w.round === ROUNDS;
  w.texts.push(
    {
      x: w.W / 2,
      y: w.H * 0.2,
      text: final ? "ROUND FINAL" : `ROUND ${w.round}`,
      color: final ? "#ff3b3b" : "#ffffff",
      scale: 3,
      life: 1.5,
      max: 1.5,
      vy: 0,
    },
    {
      x: w.W / 2,
      y: w.H * 0.2 + 22,
      text: final ? "¡MANDALO PRESO!" : "¡PELEÁ!",
      color: "#ffe066",
      scale: 1.6,
      life: 1.5,
      max: 1.5,
      vy: -4,
    },
  );
  w.events.push({ type: "sfx", name: "bell" });
  if (final) w.events.push({ type: "sfx", name: "crowd" });
}

export function canJail(w: World) {
  if (w.demo || w.ended || w.mood === "jailed" || w.round < ROUNDS) return false;
  return w.roundKos >= 1 || ROUND_SECONDS - w.timeLeft >= 25;
}

/** Finisher: police lights, bars slam down, mugshot, and the match ends with a bonus. */
export function sendToJail(w: World) {
  if (!canJail(w)) return false;
  w.mood = "jailed";
  w.moodUntil = Number.POSITIVE_INFINITY;
  w.jailAt = w.t;
  w.jailClang = false;
  w.ended = true;
  w.endAt = w.t + JAIL_SECONDS - 1.6;
  w.papers = [];
  w.fists = [];
  w.charging = null;
  w.speech = null;
  w.suedUntil = 0;
  const bonus = 5000 + Math.round(w.timeLeft) * 200 + w.kos * 1000;
  w.score += bonus;
  w.texts.push({
    x: w.W / 2,
    y: w.H * 0.3,
    text: `+${bonus.toLocaleString("es-PY")} BONUS`,
    color: "#ffd23f",
    scale: 2,
    life: 3.4,
    max: 3.4,
    vy: -3,
  });
  w.events.push({ type: "sfx", name: "siren" });
  return true;
}

function ai(w: World) {
  if (w.mood !== "idle" || w.t < w.nextAiAt) return;
  const r = Math.random();
  if (!w.demo && (r < 0.42 || w.t - w.lastHitAt > 2.8)) {
    laugh(w);
    w.nextAiAt = w.moodUntil + 1 + Math.random();
    return;
  }
  if (!w.demo && w.t > w.nextPaperAt && r > 0.72) {
    setMood(w, "throw", 0.35);
    say(w, pick(THROW), 1);
    w.nextPaperAt = w.t + Math.max(3.5, 7.5 - w.round) * (w.hypeUntil > w.t ? 0.5 : 1);
    throwPaper(w);
    if (w.hypeUntil > w.t) throwPaper(w, 0.6);
  } else if (r < 0.45 || w.demo) {
    setMood(w, "taunt", 2.1);
    // Cycle through the signature lines so every match hears all of them.
    if (Math.random() < 0.6) {
      const line = SIGNATURE[w.signatureIndex % SIGNATURE.length];
      w.signatureIndex++;
      w.gesture = line.gesture;
      say(w, line.text, 2.1);
    } else {
      w.gesture = Math.floor(Math.random() * 4);
      say(w, pick(TAUNTS), 2);
    }
  } else {
    setMood(w, "block", 1 + Math.random() * 0.7);
    if (Math.random() < 0.4) say(w, pick(BLOCK), 1);
  }
  w.nextAiAt = w.moodUntil + Math.max(0.6, 2 - w.round * 0.25) + Math.random() * 1.4;
}

export function step(w: World, dt: number) {
  if (w.hitStop > 0) {
    w.hitStop -= dt;
    return;
  }
  if (w.slowUntil > w.t) dt *= 0.35;
  w.t += dt;

  // Te reta apenas entrás al ring.
  if (!w.demo && !w.opened && w.t >= 0.45) {
    w.opened = true;
    w.gesture = 2;
    laugh(w, pick(OPENERS));
    w.texts.push(
      {
        x: w.W / 2,
        y: w.H * 0.2,
        text: "ROUND 1",
        color: "#ffffff",
        scale: 3,
        life: 1.5,
        max: 1.5,
        vy: 0,
      },
      {
        x: w.W / 2,
        y: w.H * 0.2 + 22,
        text: "¡PEGALE!",
        color: "#ffe066",
        scale: 1.6,
        life: 1.5,
        max: 1.5,
        vy: -4,
      },
    );
    w.events.push({ type: "sfx", name: "bell" });
  }

  const cardOnScreen = Boolean(w.specialActive || w.powerActive);
  if (!w.demo && !w.ended && !cardOnScreen) {
    w.timeLeft -= dt;
    if (w.timeLeft <= 0) {
      if (w.round < ROUNDS && w.mood !== "ko") {
        // Campana: se salva, se burla, y arranca el round siguiente.
        nextRound(w, "bell");
        w.specialActive = null;
        w.powerActive = null;
        laugh(w, pick(BELL_MOCK));
        w.nextAiAt = w.moodUntil + 0.8;
      } else if (w.round < ROUNDS) {
        w.timeLeft = 0.01;
      } else {
        w.timeLeft = 0;
        w.ended = true;
        w.endAt = w.t;
        w.papers = [];
        w.charging = null;
        w.specialActive = null;
        w.texts.push({
          x: w.W / 2,
          y: w.H * 0.2,
          text: "¡TIEMPO!",
          color: "#ffffff",
          scale: 3,
          life: 1.8,
          max: 1.8,
          vy: 0,
        });
        w.events.push({ type: "sfx", name: "bell" }, { type: "snap", fallback: true });
        laugh(w, w.kos === 0 ? "¡JAJAJA! ¡Ni un K.O.!" : "¡JAJAJA! ¡Sigo libre, pobre!");
      }
    }
  }
  if (!w.demo) {
    stepSpecial(w);
    stepPower(w);
    if (
      !w.ended &&
      w.timeLeft < ROUND_SECONDS / 2 &&
      w.hp > w.maxHp * 0.55 &&
      w.halfMockRound < w.round &&
      w.mood === "idle"
    ) {
      w.halfMockRound = w.round;
      laugh(w, pick(HALF_MOCK));
    }
  }
  if (w.mood === "jailed") {
    const since = w.t - w.jailAt;
    if (!w.jailClang && since >= 0.62) {
      w.jailClang = true;
      w.shake = 12;
      w.flash = 0.6;
      w.events.push({ type: "sfx", name: "clang" }, { type: "vibrate", ms: 120 });
      w.texts.push({
        x: w.W / 2,
        y: w.H * 0.16,
        text: "¡A LA CÁRCEL!",
        color: "#ff3b3b",
        scale: 4,
        life: 3.2,
        max: 3.2,
        vy: 0,
      });
      say(w, "¡Nooo! ¡Soy abogado! ¡Llamen a Cartes!", 2.6);
    }
    if (since >= 1.6 && since - 1.6 < 0.034) w.events.push({ type: "snap" });
  }
  if (w.ended && !w.endSent && w.t - w.endAt > 1.6) {
    w.endSent = true;
    w.events.push({ type: "end" });
  }

  // Mood timeline
  if (w.mood === "ko" && w.t >= w.moodUntil) {
    if (w.round < ROUNDS) {
      nextRound(w, "ko");
      setMood(w, "getup", 0.8);
      say(w, ROUND_TAUNTS[w.round] ?? pick(GETUP), 2.2);
    } else {
      // Round final: se levanta con toda la vida, pero ya podés mandarlo preso.
      w.hp = w.maxHp;
      setMood(w, "getup", 0.8);
      say(w, pick(GETUP), 1.4);
      w.texts.push({
        x: w.W / 2,
        y: w.H * 0.2,
        text: "¡A LA CÁRCEL!",
        color: "#ff3b3b",
        scale: 2.2,
        life: 1.6,
        max: 1.6,
        vy: -3,
      });
      w.events.push({ type: "sfx", name: "siren" });
    }
    w.nextAiAt = w.t + 1.5;
  } else if (w.mood !== "ko" && w.mood !== "idle" && w.t >= w.moodUntil) {
    w.mood = "idle";
  }
  // He never stands still: a slow roam across the ring, a little dance while he talks.
  if (w.mood === "idle") w.leanTarget = Math.sin(w.t * 0.8) * 9 + Math.sin(w.t * 2.1) * 2;
  if (w.mood === "taunt") w.leanTarget = Math.sin(w.t * 0.8) * 9 + Math.sin(w.t * 6) * 4;
  if (w.mood === "hurt" || w.mood === "dizzy" || w.mood === "block") w.leanTarget = 0;
  if (w.mood === "laugh") w.leanTarget = Math.sin(w.t * 9) * 3;
  if (w.mood === "jailed") w.leanTarget = 0;
  if (w.mood === "dizzy") w.leanTarget = Math.sin(w.t * 5) * 6;
  if (!w.ended && !cardOnScreen) ai(w);

  // Combo timeout
  const window = WEAPON_STATS[activeWeapon(w)].comboWindow;
  if (w.combo > 0 && w.t - w.lastHitAt > window) w.combo = 0;

  // Fists
  for (const f of w.fists) if (!f.resolved && w.t - f.t0 >= f.travel) resolveFist(w, f);
  w.fists = w.fists.filter((f) => w.t - f.t0 < f.travel + 0.16);

  // Lawsuits flying at the camera
  for (let i = w.papers.length - 1; i >= 0; i--) {
    const p = w.papers[i];
    if (w.t - p.t0 >= p.dur) {
      w.papers.splice(i, 1);
      w.sued++;
      w.combo = 0;
      w.suedUntil = w.t + 1.2;
      laugh(w, "¡JAJAJA! ¡Demandado!");
      w.shake = Math.max(w.shake, 6);
      w.events.push({ type: "sfx", name: "stamp" }, { type: "vibrate", ms: 60 });
    }
  }

  // Springs
  stepSpring(w.lean, w.leanTarget, 90, 10, dt);
  stepSpring(w.headX, 0, 170, 11, dt);
  stepSpring(w.headY, 0, 170, 12, dt);
  stepSpring(w.headR, w.mood === "dizzy" ? Math.sin(w.t * 6) * 0.18 : 0, 150, 10, dt);
  stepSpring(w.squash, 0, 260, 13, dt);
  stepSpring(w.bodyDip, 0, 120, 11, dt);
  stepSpring(w.armKick, 0, 110, 6, dt);
  stepSpring(w.zoom, 0, 140, 12, dt);
  w.rings = w.rings.filter((r) => w.t - r.t0 < 0.5);

  // Particles & text
  for (const p of w.particles) {
    p.life -= dt;
    p.vy += (p.kind === "confetti" ? 25 : 160) * dt;
    if (p.kind === "confetti") p.vx += Math.sin((w.t + p.max) * 6) * 20 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  w.particles = w.particles.filter((p) => p.life > 0);
  for (const t of w.texts) {
    t.life -= dt;
    t.y += t.vy * dt;
  }
  w.texts = w.texts.filter((t) => t.life > 0);
  for (const b of w.bursts) b.life -= dt;
  w.bursts = w.bursts.filter((b) => b.life > 0);
  if (w.speech && w.t > w.speech.until) w.speech = null;

  // Ambient sweat when beaten up
  if (w.damage > 0.3 && Math.random() < dt * 1.5 * w.damage) {
    const L = layout(w);
    spray(w, L.headCx + (Math.random() < 0.5 ? -9 : 9), L.headCy - 8, 1, "sweat", "#bfe9ff", 25);
  }
  if (w.t > w.blinkAt + 0.12) w.blinkAt = w.t + 2 + Math.random() * 3;

  w.shake = Math.max(0, w.shake - dt * 30);
  w.flash = Math.max(0, w.flash - dt * 3);
  w.wet = Math.max(0, w.wet - dt * 0.03);
}

export function drainEvents(w: World) {
  const out = w.events;
  w.events = [];
  return out;
}

export type Snapshot = {
  score: number;
  combo: number;
  timeLeft: number;
  hp: number;
  maxHp: number;
  round: number;
  rounds: number;
  finalRound: boolean;
  kos: number;
  special: number;
  specialQueue: number;
  specialName: string | null;
  specialColor: string | null;
  powerName: string | null;
  powerColor: string | null;
  /** Cartel del HUD mientras hay una carta: quién es y qué hace. */
  cardBanner: { kind: "special" | "power"; title: string; explain: string; color: string } | null;
  shield: boolean;
  hype: boolean;
  weapon: Weapon;
  bonusMazo: number;
  sued: boolean;
  canJail: boolean;
  jailed: boolean;
  trial: Weapon | null;
  trialsLeft: Partial<Record<Weapon, number>>;
};

export function snapshot(w: World): Snapshot {
  return {
    score: w.score,
    combo: w.combo,
    timeLeft: w.timeLeft,
    hp: Math.max(0, w.hp),
    maxHp: w.maxHp,
    round: w.round,
    rounds: ROUNDS,
    finalRound: w.round === ROUNDS,
    kos: w.kos,
    special: Math.min(1, w.special),
    specialQueue: w.specialQueue,
    specialName: activeSpecial(w)?.name ?? null,
    specialColor: activeSpecial(w)?.color ?? null,
    powerName: activePower(w)?.name ?? null,
    powerColor: activePower(w)?.color ?? null,
    cardBanner: activeSpecial(w)
      ? {
          kind: "special",
          title: `TU ARMA ESPECIAL · ${activeSpecial(w)!.name}`,
          explain: activeSpecial(w)!.explain,
          color: activeSpecial(w)!.color,
        }
      : activePower(w)
        ? {
            kind: "power",
            title: `REFUERZO DE HERNÁN · ${activePower(w)!.name}`,
            explain: activePower(w)!.explain,
            color: activePower(w)!.color,
          }
        : null,
    shield: w.shieldUntil > w.t,
    hype: w.hypeUntil > w.t,
    weapon: activeWeapon(w),
    bonusMazo: Math.max(0, w.bonusMazoUntil - w.t),
    sued: w.suedUntil > w.t,
    canJail: canJail(w),
    jailed: w.mood === "jailed",
    trial: w.trial,
    trialsLeft: { ...w.trialsLeft },
  };
}

export type RunResult = {
  score: number;
  kos: number;
  maxCombo: number;
  hits: number;
  accuracy: number;
  swats: number;
  sued: number;
  round: number;
  weapon: Weapon;
  jailed: boolean;
  laughs: number;
  specials: number;
  powers: number;
  rounds: number;
};

export function result(w: World): RunResult {
  return {
    score: w.score,
    kos: w.kos,
    maxCombo: w.maxCombo,
    hits: w.hits,
    accuracy: w.throws ? Math.round((w.hits / w.throws) * 100) : 0,
    swats: w.swats,
    sued: w.sued,
    round: w.round,
    weapon: w.weapon,
    jailed: w.mood === "jailed",
    laughs: w.laughs,
    specials: w.specialsFired,
    powers: w.powersUsed,
    rounds: ROUNDS,
  };
}
