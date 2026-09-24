import type { SfxName } from "@/game/audio";

/**
 * Pure simulation for "Hernán Rivas ES ABOGADO". Everything lives in logical
 * low-res pixels (W×H, ~100–210 px wide); the scene upscales it with nearest
 * neighbour so it stays crisp pixel art.
 */

export type Weapon = "punos" | "guantes" | "mazo";
export type Mood =
  "idle" | "taunt" | "block" | "hurt" | "dizzy" | "dodge" | "throw" | "ko" | "getup";
export type Zone = "head" | "body";

export const GAME_SECONDS = 60;

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
const HURT = ["¡Ay!", "¡Mi título!", "¡Protesto!", "¡No vale!", "¡Auch!", "¡Mi traje!"];
const BLOCK = ["¡Objeción!", "¡No ha lugar!"];
const GETUP = ["¡Apelo!", "¡Recurso de amparo!", "¡Nulidad!", "¡A la Corte!"];
const THROW = ["¡Demanda!", "¡Citación!"];
const HEAD_WORDS = ["POW", "PAF", "BAM", "CRACK", "TUC"];
const HAMMER_WORDS = ["BONK", "TOC TOC", "CATAPLUM"];
const MILESTONES: Record<number, string> = {
  10: "¡UPEI!",
  25: "¡IMPARABLE!",
  50: "¡JUSTICIA!",
  100: "¡LEYENDA!",
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
  kind: "dot" | "star" | "tooth" | "paper" | "sweat";
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

export function createWorld(opts: { weapon: Weapon; goldTitle: boolean; demo?: boolean }): World {
  return {
    W: 160,
    H: 160,
    t: 0,
    demo: Boolean(opts.demo),
    timeLeft: GAME_SECONDS,
    ended: false,
    endAt: 0,
    endSent: false,
    weapon: opts.weapon,
    goldTitle: opts.goldTitle,
    bonusMazoUntil: 0,
    bonusMazoGiven: false,
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
    hp: 100,
    maxHp: 100,
    damage: 0,
    mood: "idle",
    moodUntil: 0,
    nextAiAt: 1.6,
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
  return Math.round(Math.min(w.H - 86, w.H * (w.demo ? 0.3 : 0.56)));
}

export function layout(w: World) {
  const baseHead = baseHeadY(w);
  const fall = fallAmount(w);
  const cx = Math.round(w.W / 2 + w.lean.v);
  const headY = Math.round(baseHead + w.bodyDip.v + fall * Math.min(60, w.H * 0.34));
  return {
    cx,
    headY,
    headCx: Math.round(cx + w.headX.v),
    headCy: Math.round(headY + w.headY.v),
    neckY: headY + 14,
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
  return w.bonusMazoUntil > w.t ? "mazo" : w.weapon;
}

function hitZone(w: World, x: number, y: number): Zone | null {
  const L = layout(w);
  const dx = (x - L.headCx) / 14;
  const dy = (y - L.headCy) / 17;
  if (dx * dx + dy * dy <= 1) return "head";
  if (Math.abs(x - L.cx) <= 32 && y >= L.neckY + 2 && y <= w.H) return "body";
  return null;
}

function say(w: World, text: string, seconds = 1.6) {
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
  if (w.particles.length > 220) w.particles.splice(0, w.particles.length - 220);
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
      if (!w.demo) w.score += pts;
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
  const useSide: -1 | 1 = weapon === "mazo" ? 1 : side;
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
  const dodgeChance = Math.min(0.38, 0.1 + (w.round - 1) * 0.06);
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
    return;
  }
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

  let base = zone === "head" ? 100 : 60;
  let dmg = (zone === "head" ? 6 : 4.2) * stats.dmg;
  const tags: string[] = [];
  if (f.charged) {
    base *= 2.2;
    dmg *= 2.2;
    tags.push("¡CARGADO!");
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
  }
  const mult = 1 + Math.min(4, Math.floor(w.combo / 5) * 0.5);
  const pts = Math.round(base * stats.pts * mult);
  if (!w.demo) w.score += pts;
  w.combo++;
  w.maxCombo = Math.max(w.maxCombo, w.combo);
  w.lastHitAt = w.t;
  w.hits++;
  w.hp -= w.demo ? dmg * 0.4 : dmg;
  w.damage = Math.min(1, w.damage + dmg / 950);

  const push = -f.side;
  const heavy = f.charged || f.weapon === "mazo";
  if (zone === "head") {
    w.headX.vel += push * (heavy ? 330 : 190);
    w.headR.vel += push * (heavy ? 9 : 5.5);
    w.headY.vel += f.ty < layout(w).headCy - 4 ? -60 : 70;
    if (f.weapon === "mazo") {
      w.squash.vel -= 16;
      w.headY.vel += 160;
    }
  } else {
    w.bodyDip.vel += heavy ? 150 : 90;
    w.squash.vel += 6;
    w.headY.vel += 90;
  }
  if (w.mood !== "dizzy") setMood(w, "hurt", heavy ? 0.42 : 0.26);

  w.recentHits.push(w.t);
  w.recentHits = w.recentHits.filter((t) => w.t - t < 1.3);
  if ((w.recentHits.length >= 7 || (heavy && Math.random() < 0.35)) && w.mood !== "dizzy") {
    setMood(w, "dizzy", 2.1);
    float(w, w.W / 2, Math.max(8, layout(w).headCy - 36), "¡MAREADO!", "#ffe066");
  }

  const words = f.weapon === "mazo" ? HAMMER_WORDS : HEAD_WORDS;
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
  const sideX = L.headCx + push * 26;
  float(
    w,
    sideX + Math.round((Math.random() - 0.5) * 10),
    L.headCy - 10,
    `+${pts}`,
    mult > 1 ? "#ffe066" : "#ffffff",
  );
  tags.slice(0, 1).forEach((tag) => float(w, w.W / 2, Math.max(8, L.headCy - 44), tag, "#7ee0ff"));
  const small = w.texts.filter((t) => t.scale === 1);
  if (small.length > 5) w.texts.splice(w.texts.indexOf(small[0]), 1);
  spray(w, f.tx, f.ty, heavy ? 10 : 5, "sweat", "#bfe9ff", heavy ? 90 : 60);
  if (heavy) spray(w, f.tx, f.ty, 5, "star", "#ffe066", 70);
  if (zone === "head" && w.damage > 0.45 && Math.random() < (heavy ? 0.5 : 0.08))
    spray(w, f.tx, f.ty + 6, 1, "tooth", "#fffbe8", 80);
  w.shake = Math.max(w.shake, f.weapon === "mazo" ? 7 : heavy ? 5 : 2.2);
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
  w.koAt = w.t;
  setMood(w, "ko", 2.2);
  w.speech = null;
  w.papers = [];
  const bonus = 1500 * w.round;
  if (!w.demo) w.score += bonus;
  w.flash = 1;
  w.shake = 9;
  w.hitStop = 0.14;
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

function ai(w: World) {
  if (w.mood !== "idle" || w.t < w.nextAiAt) return;
  const r = Math.random();
  const L = layout(w);
  if (!w.demo && w.t > w.nextPaperAt && r > 0.72) {
    setMood(w, "throw", 0.35);
    say(w, pick(THROW), 1);
    w.nextPaperAt = w.t + Math.max(4.5, 9 - w.round);
    const tx = w.W * (0.2 + Math.random() * 0.6);
    const ty = w.H * (0.45 + Math.random() * 0.35);
    w.papers.push({
      x0: L.cx - 24,
      y0: L.neckY + 4,
      tx,
      ty,
      t0: w.t + 0.2,
      dur: Math.max(1.15, 1.9 - w.round * 0.12),
    });
  } else if (r < 0.45) {
    setMood(w, "taunt", 1.7);
    say(w, pick(TAUNTS), 1.7);
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
  w.t += dt;

  if (!w.demo && !w.ended) {
    w.timeLeft -= dt;
    if (w.timeLeft <= 0) {
      w.timeLeft = 0;
      w.ended = true;
      w.endAt = w.t;
      w.papers = [];
      w.charging = null;
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
    }
  }
  if (w.ended && !w.endSent && w.t - w.endAt > 1.6) {
    w.endSent = true;
    w.events.push({ type: "end" });
  }

  // Mood timeline
  if (w.mood === "ko" && w.t >= w.moodUntil) {
    w.round++;
    w.maxHp = 100 + 35 * (w.round - 1);
    w.hp = w.maxHp;
    setMood(w, "getup", 0.8);
    say(w, pick(GETUP), 1.4);
    w.texts.push({
      x: w.W / 2,
      y: w.H * 0.2,
      text: `ROUND ${w.round}`,
      color: "#ffffff",
      scale: 2,
      life: 1.3,
      max: 1.3,
      vy: 0,
    });
    w.events.push({ type: "sfx", name: "bell" });
    w.nextAiAt = w.t + 1.5;
  } else if (w.mood !== "ko" && w.mood !== "idle" && w.t >= w.moodUntil) {
    w.mood = "idle";
  }
  if (w.mood === "idle" || w.mood === "taunt") w.leanTarget = Math.sin(w.t * 1.4) * 3;
  if (w.mood === "hurt" || w.mood === "dizzy" || w.mood === "block") w.leanTarget = 0;
  if (w.mood === "dizzy") w.leanTarget = Math.sin(w.t * 5) * 6;
  if (!w.ended) ai(w);

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

  // Particles & text
  for (const p of w.particles) {
    p.life -= dt;
    p.vy += 160 * dt;
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
  kos: number;
  weapon: Weapon;
  bonusMazo: number;
  sued: boolean;
};

export function snapshot(w: World): Snapshot {
  return {
    score: w.score,
    combo: w.combo,
    timeLeft: w.timeLeft,
    hp: Math.max(0, w.hp),
    maxHp: w.maxHp,
    round: w.round,
    kos: w.kos,
    weapon: activeWeapon(w),
    bonusMazo: Math.max(0, w.bonusMazoUntil - w.t),
    sued: w.suedUntil > w.t,
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
  };
}
