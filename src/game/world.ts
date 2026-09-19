import {
  CHAPTERS,
  HAZARDS,
  HAZARD_BY_ID,
  HERO_BY_ID,
  NAMES,
  TALKS,
  TEAM,
  WEAPONS,
  WEAPON_ORDER,
  chapterOf,
  npcHome,
  worldWidth,
  type Choice,
  type Crate,
  type GunId,
  type HazardId,
  type HeroId,
  type Line,
  type Pickup,
  type Platform,
  type TalkKey,
  type WeaponId,
} from "./content";
import { TUNING, type Difficulty, type Tuning } from "./settings";
import type { SfxName } from "./audio";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Input = {
  moveX: number;
  jump: boolean;
  attack: boolean;
  attackHeld: boolean;
  interact: boolean;
  swap: boolean;
  dash: boolean;
  crouch: boolean;
  grenade: boolean;
};

export type WorldEvent =
  | { t: "toast"; msg: string }
  | { t: "talk"; key: TalkKey }
  | { t: "sfx"; name: SfxName }
  | { t: "vibrate"; ms: number }
  | { t: "hud" }
  | { t: "ko" }
  | { t: "win" }
  | { t: "zone"; name: string }
  | { t: "boss"; title: string | null };

export type Hurt = "" | "gun" | "slash" | "fist" | "bat" | "ally" | "boom";

export type Enemy = {
  id: HazardId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  hp: number;
  maxHp: number;
  fly: boolean;
  down: boolean;
  downAt: number;
  chasing: boolean;
  caught: boolean;
  hit: number;
  exploding: boolean;
  explodeAt: number;
  gone: boolean;
  respawnAt: number;
  headless: boolean;
  calm: boolean;
  cry: boolean;
  cryUntil: number;
  lastThrow: number;
  hurt: Hurt;
  torn: boolean;
  flash: number;
  isBoss: boolean;
  bark: string;
  barkUntil: number;
  nextBarkAt: number;
  chargeUntil: number;
  nextChargeAt: number;
  windupUntil: number;
  hitPlayerAt: number;
  noLeashUntil: number;
};

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  speed: number;
  invUntil: number;
  slowUntil: number;
  attackUntil: number;
  attackKind: WeaponId;
  weapon: WeaponId;
  weapons: WeaponId[];
  ammo: Record<GunId, number>;
  grounded: boolean;
  onPlatform: boolean;
  jumpBuffer: number;
  coyote: number;
  lastAttack: number;
  hurtAt: number;
  walking: boolean;
  dashUntil: number;
  dashReadyAt: number;
  dashDir: 1 | -1;
  crouching: boolean;
  comboStep: number;
  comboUntil: number;
  finisher: boolean;
  stomping: boolean;
  dropThroughUntil: number;
  lastGrenade: number;
  prevX: number;
  prevY: number;
};

export type Blood = { x: number; y: number; w: number; h: number; rot: number; born: number };
export type Gib = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  src: number;
};
export type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  dmg: number;
  range: number;
  kind: GunId;
};
export type Book = { x: number; y: number; vx: number; rot: number };
export type Slime = { x: number; y: number; vx: number };
export type Grenade = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  bounces: number;
};
export type Drop = {
  kind: "coin" | "ammo" | "heal";
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
};
export type Trail = { x: number; y: number; face: 1 | -1; born: number };
export type FxKind = "slash" | "muzzle" | "impact" | "boom" | "tracer" | "pop" | "heal" | "cry";
export type Fx = { x: number; y: number; kind: FxKind; born: number; face: 1 | -1; text?: string };

export type World = {
  chapter: 1 | 2 | 3;
  hero: HeroId;
  difficulty: Difficulty;
  tune: Tuning;
  width: number;
  t: number;
  timer: number;
  player: Player;
  enemies: Record<HazardId, Enemy>;
  npcX: Record<HeroId, number>;
  recruited: string[];
  items: string[];
  flags: string[];
  coins: number;
  fire: boolean;
  examScore: number;
  blood: Blood[];
  gibs: Gib[];
  shots: Shot[];
  books: Book[];
  slimes: Slime[];
  grenades: Grenade[];
  drops: Drop[];
  trail: Trail[];
  fx: Fx[];
  shakeUntil: number;
  shakePower: number;
  slimedUntil: number;
  camX: number;
  kills: number;
  falls: number;
  score: number;
  combo: number;
  comboUntil: number;
  talkLockUntil: number;
  ended: boolean;
  zoneSeen: boolean[];
  boss: { active: boolean; done: boolean; introAt: number };
  allyHitAt: number[];
};

export const GRAVITY = 215;
export const JUMP_V = 82;
const BASE_SPEED = 60;
const GROUND_LINE = 8; // vh above the bottom of the screen where feet stand
const STAND_H = 26;
const CROUCH_H = 13;

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

function enemyAt(id: HazardId, x: number, hpMul: number): Enemy {
  const def = HAZARD_BY_ID[id];
  const hp = Math.max(1, Math.round(def.hp * hpMul));
  return {
    id,
    x,
    y: 0,
    vx: 0,
    vy: 0,
    rot: 0,
    spin: 0,
    hp,
    maxHp: hp,
    fly: false,
    down: false,
    downAt: 0,
    chasing: false,
    caught: false,
    hit: -10,
    exploding: false,
    explodeAt: 0,
    gone: false,
    respawnAt: 0,
    headless: false,
    calm: false,
    cry: false,
    cryUntil: 0,
    lastThrow: -10,
    hurt: "",
    torn: false,
    flash: 0,
    isBoss: false,
    bark: "",
    barkUntil: 0,
    nextBarkAt: 0,
    chargeUntil: 0,
    nextChargeAt: 0,
    windupUntil: 0,
    hitPlayerAt: -10,
    noLeashUntil: 0,
  };
}

export function createWorld(chapter: 1 | 2 | 3, hero: HeroId, difficulty: Difficulty): World {
  const ch = chapterOf(chapter);
  const tune = TUNING[difficulty];
  const perk = HERO_BY_ID[hero].perk;
  const home = ch.hazardHome;
  const enemies = {
    masivo: enemyAt("masivo", home.masivo, tune.enemyHp),
    pablito: enemyAt("pablito", home.pablito, tune.enemyHp),
    marcos: enemyAt("marcos", home.marcos, tune.enemyHp),
    gallaguer: enemyAt("gallaguer", home.gallaguer, tune.enemyHp),
    onichan: enemyAt("onichan", home.onichan, tune.enemyHp),
  };
  const maxHp = perk.hp;
  return {
    chapter,
    hero,
    difficulty,
    tune,
    width: worldWidth(chapter),
    t: 0,
    timer: 0,
    player: {
      x: ch.startX,
      y: 0,
      vx: 0,
      vy: 0,
      facing: 1,
      hp: maxHp,
      maxHp,
      speed: BASE_SPEED * perk.speed,
      invUntil: 0,
      slowUntil: 0,
      attackUntil: 0,
      attackKind: "pistol",
      weapon: "pistol",
      weapons: ["fist", "pistol"],
      ammo: {
        pistol: Math.round(tune.startAmmo * (perk.ammo / 12)),
        shotgun: 0,
        smg: 0,
        grenade: 0,
      },
      grounded: true,
      onPlatform: false,
      jumpBuffer: 0,
      coyote: 0,
      lastAttack: -10,
      hurtAt: -10,
      walking: false,
      dashUntil: 0,
      dashReadyAt: 0,
      dashDir: 1,
      crouching: false,
      comboStep: 0,
      comboUntil: 0,
      finisher: false,
      stomping: false,
      dropThroughUntil: 0,
      lastGrenade: -10,
      prevX: ch.startX,
      prevY: 0,
    },
    enemies,
    npcX: npcHome(chapter),
    recruited: chapter === 1 ? [hero] : ["rafa", "juan", "richard", "hector"],
    items: [],
    flags: [],
    coins: 0,
    fire: chapter !== 1,
    examScore: 0,
    blood: [],
    gibs: [],
    shots: [],
    books: [],
    slimes: [],
    grenades: [],
    drops: [],
    trail: [],
    fx: [],
    shakeUntil: 0,
    shakePower: 0,
    slimedUntil: 0,
    camX: Math.max(0, ch.startX - 38),
    kills: 0,
    falls: 0,
    score: 0,
    combo: 0,
    comboUntil: 0,
    talkLockUntil: 3, // grace period: nobody aggroes while the player reads the HUD
    ended: false,
    zoneSeen: [true],
    boss: { active: false, done: false, introAt: 0 },
    allyHitAt: [0, 0, 0],
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shake(w: World, power: number) {
  w.shakeUntil = w.t + 0.35;
  w.shakePower = Math.max(w.shakePower * (w.shakeUntil > w.t ? 0.5 : 0), power);
}

function splat(w: World, x: number, y: number, n: number) {
  for (let i = 0; i < n; i++) {
    w.blood.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + Math.random() * 8,
      w: 14 + Math.random() * 28,
      h: 10 + Math.random() * 22,
      rot: Math.random() * 360,
      born: w.t,
    });
  }
  if (w.blood.length > 48) w.blood.splice(0, w.blood.length - 48);
}

function rip(w: World, x: number, dir: number, n: number) {
  for (let i = 0; i < n; i++) {
    w.gibs.push({
      x: x + (Math.random() - 0.5) * 8,
      y: 8 + Math.random() * 16,
      vx: dir * (28 + Math.random() * 90) + (Math.random() - 0.5) * 36,
      vy: 48 + Math.random() * 78,
      rot: Math.random() * 360,
      spin: (Math.random() - 0.5) * 980,
      src: i % 3,
    });
  }
  if (w.gibs.length > 36) w.gibs.splice(0, w.gibs.length - 36);
}

function fx(w: World, x: number, y: number, kind: FxKind, face: 1 | -1 = 1, text?: string) {
  w.fx.push({ x, y, kind, born: w.t, face, text });
  if (w.fx.length > 28) w.fx.splice(0, w.fx.length - 28);
}

function addScore(w: World, n: number) {
  w.score = Math.max(0, w.score + n);
}

function setFlag(w: World, flag: string) {
  if (!w.flags.includes(flag)) w.flags.push(flag);
}

export function isAlive(e: Enemy) {
  return !e.gone && !e.exploding && e.x < 900;
}
export function canTalk(e: Enemy) {
  return isAlive(e) && !e.fly && !e.down && !e.calm && !e.cry && !e.isBoss;
}
export function isGun(id: WeaponId): id is GunId {
  return WEAPONS[id].kind !== "melee";
}

function spawnDrops(w: World, x: number, n: number) {
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    w.drops.push({
      kind: r < 0.45 ? "coin" : r < 0.78 ? "ammo" : "heal",
      x,
      y: 14,
      vx: (Math.random() - 0.5) * 60,
      vy: 40 + Math.random() * 30,
      born: w.t,
    });
  }
  if (w.drops.length > 24) w.drops.splice(0, w.drops.length - 24);
}

function giveAmmo(w: World, factor = 1, ev?: WorldEvent[]) {
  const p = w.player;
  let total = 0;
  for (const g of p.weapons) {
    if (!isGun(g) || g === "grenade") continue;
    const n = Math.max(1, Math.round((WEAPONS[g].pickup * w.tune.ammoPickup * factor) / 8));
    p.ammo[g] += n;
    total += n;
  }
  if (total === 0) {
    p.ammo.pistol += Math.round(w.tune.ammoPickup * factor);
    total = Math.round(w.tune.ammoPickup * factor);
  }
  ev?.push({ t: "toast", msg: `+${total} balas` });
  return total;
}

/* ------------------------------------------------------------------ */
/* Dialogue conditions                                                 */
/* ------------------------------------------------------------------ */

export function condOk(w: World, cond?: string): boolean {
  if (!cond) return true;
  return cond.split(",").every((raw) => {
    let c = raw.trim();
    if (!c) return true;
    const neg = c.startsWith("!");
    if (neg) c = c.slice(1);
    let ok = true;
    if (c.startsWith("flag:")) ok = w.flags.includes(c.slice(5));
    else if (c.startsWith("item:")) ok = w.items.includes(c.slice(5));
    else if (c.startsWith("recruited:")) ok = w.recruited.includes(c.slice(10));
    else if (c.startsWith("weapon:")) ok = w.player.weapon === c.slice(7);
    else if (c === "lowhp") ok = w.player.hp < w.player.maxHp * 0.35;
    else if (c.startsWith("kills>=")) ok = w.kills >= Number(c.slice(7));
    else if (c === "boss") ok = w.items.includes("boss");
    return neg ? !ok : ok;
  });
}

/** The lines of a script that apply right now, with their applicable choices. */
export function scriptFor(w: World, key: TalkKey): Line[] {
  const out: Line[] = [];
  for (const line of TALKS[key] ?? []) {
    if (!condOk(w, line.when)) continue;
    if (line.choices) {
      const choices = line.choices.filter((c) => condOk(w, c.when));
      if (choices.length) out.push({ ...line, choices });
      else out.push({ who: line.who, text: line.text });
    } else out.push(line);
  }
  return out;
}

export function markMet(w: World, key: TalkKey) {
  const who = TALKS[key]?.[0]?.who;
  if (who && who !== "narrator") setFlag(w, `met:${who}`);
}

/* ------------------------------------------------------------------ */
/* Interaction targets                                                 */
/* ------------------------------------------------------------------ */

export type Target =
  | { kind: "talk"; key: TalkKey; label: string; verb: string }
  | { kind: "pickup"; pickup: Pickup; label: string; verb: string };

export function interactTarget(w: World): Target | null {
  const ch = chapterOf(w.chapter);
  const px = w.player.x;
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (canTalk(e) && !e.chasing && Math.abs(px - e.x) < 16) {
      const key: TalkKey = w.chapter === 3 && def.id === "pablito" ? "pablito3" : def.id;
      return { kind: "talk", key, label: def.name, verb: "Hablar" };
    }
  }
  if (
    ch.examX &&
    ["apuntes", "cafe", "cedula", "fuerza", "boss"].every((i) => w.items.includes(i)) &&
    Math.abs(px - ch.examX) < 14
  )
    return { kind: "talk", key: "examen", label: "El examen", verb: "Rendir" };
  for (const n of ch.npcs) {
    const nx = w.npcX[n.id];
    if (nx > 900 || Math.abs(px - nx) >= 14) continue;
    const name = NAMES[n.id];
    if (w.chapter === 2 && n.id === "richard")
      return { kind: "talk", key: "richard2", label: name, verb: "Hablar" };
    if (w.chapter === 2 && n.id === "hector")
      return { kind: "talk", key: "fuerza", label: name, verb: "Hablar" };
    if (w.chapter === 3 && n.id === "juan")
      return {
        kind: "talk",
        key: w.items.includes("echar") ? "juan3" : "juanGo",
        label: name,
        verb: "Hablar",
      };
    if (!w.recruited.includes(n.id) || w.chapter === 3)
      return { kind: "talk", key: n.id, label: name, verb: "Hablar" };
  }
  for (const p of ch.pickups) {
    if (p.kind === "item" && p.talk && !w.items.includes(p.id) && Math.abs(px - p.x) < 10)
      return { kind: "pickup", pickup: p, label: p.label ?? p.id, verb: "Agarrar" };
  }
  if (ch.grillX && Math.abs(px - ch.grillX) < 14)
    return { kind: "talk", key: "grill", label: "El quincho", verb: "Asado" };
  return null;
}

export function npcVisible(w: World, id: HeroId) {
  const px = w.npcX[id];
  if (id === w.hero || px > 900) return false;
  if (w.chapter === 2 && (id === "richard" || id === "hector")) return true;
  if (w.chapter === 3 && (id === "juan" || id === "rafa")) return true;
  return !w.recruited.includes(id);
}

export function followers(w: World): HeroId[] {
  return w.recruited.filter(
    (id) =>
      !(
        id === w.hero ||
        (w.chapter === 2 && (id === "richard" || id === "hector")) ||
        (w.chapter === 3 && id === "juan")
      ),
  ) as HeroId[];
}

export function followerX(w: World, i: number) {
  return w.player.x - w.player.facing * (9 + i * 8);
}

/* ------------------------------------------------------------------ */
/* Damage                                                              */
/* ------------------------------------------------------------------ */

function hurtPlayer(w: World, amount: number, ev: WorldEvent[], why: string) {
  const p = w.player;
  if (w.t < p.invUntil || w.ended) return false;
  const dmg = Math.max(1, Math.round(amount * w.tune.damage));
  p.hp = Math.max(0, p.hp - dmg);
  p.invUntil = w.t + 0.75;
  p.hurtAt = w.t;
  ev.push({ t: "sfx", name: "hurt" }, { t: "vibrate", ms: 60 }, { t: "hud" });
  if (why) ev.push({ t: "toast", msg: why });
  shake(w, 5);
  if (p.hp <= 0) {
    w.ended = true;
    ev.push({ t: "ko" });
  }
  return true;
}

function killEnemy(w: World, e: Enemy, dir: 1 | -1, how: Hurt, ev: WorldEvent[]) {
  const def = HAZARD_BY_ID[e.id];
  const wasBoss = e.isBoss;
  e.hp = 0;
  e.hurt = how;
  e.exploding = true;
  e.explodeAt = w.t;
  e.fly = true;
  e.torn = how !== "fist" && how !== "ally";
  e.chasing = false;
  e.caught = false;
  e.headless = e.id === "gallaguer";
  e.vx = dir * 58;
  e.vy = 82;
  e.spin = dir * 820;
  e.hit = w.t;
  e.flash = 1;
  e.bark = "";
  splat(w, e.x, 16, 22);
  splat(w, e.x + dir * 6, 10, 10);
  rip(w, e.x, dir, 12);
  fx(w, e.x, 20, "boom");
  fx(w, e.x, 24, "impact");
  w.kills++;
  w.combo = w.t < w.comboUntil ? w.combo + 1 : 1;
  w.comboUntil = w.t + 4;
  const base = wasBoss ? 500 : e.id === "masivo" ? 80 : 50;
  addScore(w, base * w.combo);
  fx(w, e.x, 34, "pop", 1, w.combo > 1 ? `+${base * w.combo} · x${w.combo}` : `+${base}`);
  shake(w, wasBoss ? 14 : 9);
  spawnDrops(w, e.x, wasBoss ? 4 : Math.random() < 0.55 ? 1 : 0);
  ev.push({ t: "sfx", name: "boom" }, { t: "vibrate", ms: 120 }, { t: "hud" });
  if (wasBoss) {
    e.isBoss = false;
    e.respawnAt = 1e9;
    w.boss.active = false;
    w.boss.done = true;
    if (!w.items.includes("boss")) w.items.push("boss");
    ev.push({ t: "boss", title: null }, { t: "sfx", name: "recruit" });
    if (e.id === "pablito" && w.chapter === 3 && !w.items.includes("echar")) {
      w.items.push("echar");
      addScore(w, 100);
      ev.push({ t: "toast", msg: "¡Pablito voló del muelle! Volvé con Juan." });
      return;
    }
    ev.push({ t: "toast", msg: `¡${def.name} vencido! +500` });
    return;
  }
  if (e.id === "pablito" && w.chapter === 3 && !w.items.includes("echar")) {
    w.items.push("echar");
    addScore(w, 100);
    ev.push({ t: "toast", msg: "¡Pablito explota! Hablá con Juan." });
    return;
  }
  ev.push({ t: "toast", msg: def.killed });
}

function damageEnemy(
  w: World,
  e: Enemy,
  dmg: number,
  dir: 1 | -1,
  how: Hurt,
  ev: WorldEvent[],
  knock = 1,
) {
  const melee = how === "fist" || how === "slash" || how === "bat";
  if (!e.isBoss) {
    // Story gags: melee on Marcos makes him cry and explode, melee on Gallaguer pops his head.
    if (melee && e.id === "marcos" && !e.cry) {
      e.cry = true;
      e.cryUntil = w.t + 0.9;
      e.chasing = false;
      e.hit = w.t;
      e.hurt = how;
      e.flash = 1;
      splat(w, e.x, 12, how === "slash" ? 18 : 6);
      if (how === "slash") {
        fx(w, e.x, 20, "impact");
        rip(w, e.x, dir, 8);
      }
      shake(w, 6);
      ev.push({ t: "toast", msg: "¡Marcos llora!" }, { t: "sfx", name: "hit" });
      return;
    }
    if (melee && e.id === "gallaguer") {
      killEnemy(w, e, dir, how, ev);
      return;
    }
  }
  e.hp -= dmg;
  e.flash = 1;
  e.hit = w.t;
  e.hurt = how;
  if (e.hp <= 0) {
    killEnemy(w, e, dir, how, ev);
    return;
  }
  ev.push({ t: "sfx", name: "hit" }, { t: "vibrate", ms: 30 });
  splat(w, e.x, 12, melee ? 10 : 6);
  fx(w, e.x, 34, "pop", 1, `-${dmg}`);
  if (e.isBoss) {
    // Bosses only stagger; a heavy hit shoves them back.
    e.hit = w.t - 0.25;
    if (knock >= 1.4 || how === "boom") {
      e.fly = true;
      e.vx = dir * 45;
      e.vy = 34;
      e.spin = 0;
      e.torn = false;
    } else e.x = clamp(e.x + dir * 3, 4, w.width - 8);
    return;
  }
  if (!melee) {
    // Stagger: pushed back, keeps chasing after a beat.
    e.x = clamp(e.x + dir * (how === "boom" ? 9 : 5), 4, w.width - 8);
    fx(w, e.x, 22, "impact");
    if (how === "boom") {
      e.fly = true;
      e.chasing = false;
      e.vx = dir * 80;
      e.vy = 70;
      e.spin = dir * 600;
    }
    return;
  }
  // Melee knockback: they fly, land, lie down for a bit, then get up angrier.
  e.fly = true;
  e.down = false;
  e.chasing = false;
  e.caught = false;
  e.vx = dir * (how === "slash" ? 70 : 92 + Math.random() * 18) * knock;
  e.vy =
    (how === "slash" ? 62 + Math.random() * 20 : 78 + Math.random() * 22) * Math.min(1.3, knock);
  e.spin = dir * (how === "slash" ? 980 : 720 + Math.random() * 420);
  e.torn = false;
  if (how === "slash") {
    fx(w, e.x, 18, "impact");
    rip(w, e.x, dir, 5);
  }
  ev.push({
    t: "toast",
    msg: how === "slash" ? "¡Corte!" : how === "bat" ? "¡BATAZO!" : "¡SALE VOLANDO!",
  });
}

function explode(w: World, x: number, y: number, ev: WorldEvent[], selfHarm = true) {
  const p = w.player;
  fx(w, x, y + 6, "boom");
  fx(w, x + 6, y + 14, "boom");
  fx(w, x - 6, y + 2, "boom");
  splat(w, x, 10, 10);
  shake(w, 13);
  ev.push({ t: "sfx", name: "explode" }, { t: "vibrate", ms: 160 });
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (!isAlive(e) || Math.abs(e.x - x) > 18) continue;
    const dir: 1 | -1 = e.x >= x ? 1 : -1;
    damageEnemy(w, e, WEAPONS.grenade.dmg, dir, "boom", ev, 1.5);
  }
  if (selfHarm && Math.abs(p.x - x) < 11 && Math.abs(p.y - y) < 18) {
    hurtPlayer(w, 14, ev, "¡Te volaste vos también!");
  }
}

/* ------------------------------------------------------------------ */
/* Player actions                                                      */
/* ------------------------------------------------------------------ */

function fireGun(w: World, gun: GunId, ev: WorldEvent[]) {
  const p = w.player;
  const def = WEAPONS[gun];
  const dir = p.facing;
  p.ammo[gun]--;
  const y = (p.crouching ? 14 : 24) + p.y;
  const pellets = def.pellets ?? 1;
  for (let i = 0; i < pellets; i++) {
    const off = pellets > 1 ? i - (pellets - 1) / 2 : (Math.random() - 0.5) * 2;
    const vy = (def.spread ?? 0) * off * (pellets > 1 ? 14 : 5);
    w.shots.push({
      x: p.x + dir * 9,
      y,
      vx: dir * (def.speed ?? 260) * (0.94 + Math.random() * 0.12),
      vy,
      face: dir,
      dmg: def.dmg,
      range: def.range ?? 999,
      kind: gun,
    });
  }
  fx(w, p.x + dir * 8, y, "muzzle", dir);
  if (gun !== "smg") fx(w, p.x + dir * 22, y, "tracer", dir);
  shake(w, gun === "shotgun" ? 7 : gun === "smg" ? 1.5 : 3);
  if (gun === "shotgun") p.vx -= dir * 30;
  ev.push({ t: "sfx", name: gun === "pistol" ? "shot" : gun }, { t: "hud" });
}

function melee(w: World, weapon: WeaponId, ev: WorldEvent[]) {
  const p = w.player;
  const def = WEAPONS[weapon];
  const dir = p.facing;
  if (w.t < p.comboUntil) p.comboStep++;
  else p.comboStep = 1;
  p.comboUntil = w.t + 0.8;
  const finisher = p.comboStep >= 3;
  p.finisher = finisher;
  if (finisher) p.comboStep = 0;
  const reach = (def.reach ?? 14) + (finisher ? 4 : 0);
  const dmg = def.dmg * (finisher ? 2 : 1);
  const knock = (def.knock ?? 1) * (finisher ? 1.6 : 1);
  const how: Hurt = weapon === "knife" ? "slash" : weapon === "bat" ? "bat" : "fist";
  ev.push({ t: "sfx", name: weapon === "knife" ? "slash" : weapon === "bat" ? "bat" : "punch" });
  if (weapon === "knife") fx(w, p.x + dir * 10, 22 + p.y, "slash", dir);
  if (finisher) {
    fx(w, p.x + dir * 12, 26 + p.y, "impact", dir);
    fx(w, p.x, 40 + p.y, "pop", dir, "¡REMATE!");
    shake(w, 6);
  }
  let hit = false;
  for (const hdef of HAZARDS) {
    const e = w.enemies[hdef.id];
    if (!isAlive(e) || e.fly || e.down) continue;
    const inFront = (e.x - p.x) * dir > -4;
    if (inFront && Math.abs(e.x - p.x) < reach && Math.abs(e.y - p.y) < 20) {
      damageEnemy(w, e, dmg, dir, how, ev, knock);
      hit = true;
    }
  }
  for (const id of Object.keys(w.npcX) as HeroId[]) {
    if (!npcVisible(w, id)) continue;
    if (Math.abs(w.npcX[id] - p.x) < reach) {
      w.npcX[id] = clamp(w.npcX[id] + dir * 12, 8, w.width - 8);
      hit = true;
    }
  }
  if (hit) shake(w, 4);
}

function attack(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const weapon = p.weapon;
  const def = WEAPONS[weapon];
  if (w.t - p.lastAttack < def.cooldown || w.t < p.dashUntil) return;
  if (def.kind === "gun" && p.ammo[weapon as GunId] <= 0) {
    p.lastAttack = w.t;
    ev.push({ t: "sfx", name: "empty" }, { t: "toast", msg: "Sin balas. Q cambia de arma." });
    return;
  }
  p.lastAttack = w.t;
  p.attackKind = weapon;
  p.attackUntil = w.t + (def.kind === "gun" ? 0.16 : weapon === "bat" ? 0.36 : 0.28);
  if (def.kind === "gun") fireGun(w, weapon as GunId, ev);
  else melee(w, weapon, ev);
}

function throwGrenade(w: World, ev: WorldEvent[]) {
  const p = w.player;
  if (w.t - p.lastGrenade < WEAPONS.grenade.cooldown) return;
  if (p.ammo.grenade <= 0) {
    p.lastGrenade = w.t;
    ev.push({ t: "sfx", name: "empty" }, { t: "toast", msg: "Sin granadas." });
    return;
  }
  p.lastGrenade = w.t;
  p.ammo.grenade--;
  p.attackKind = "grenade";
  p.attackUntil = w.t + 0.24;
  w.grenades.push({
    x: p.x + p.facing * 4,
    y: p.y + 20,
    vx: p.facing * 72 + p.vx * 0.3,
    vy: 62,
    born: w.t,
    bounces: 0,
  });
  ev.push({ t: "sfx", name: "grenade" }, { t: "hud" });
}

function swapWeapon(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const owned = WEAPON_ORDER.filter((id) => p.weapons.includes(id));
  const i = owned.indexOf(p.weapon);
  p.weapon = owned[(i + 1) % owned.length];
  ev.push({ t: "sfx", name: "swap" }, { t: "hud" }, { t: "toast", msg: WEAPONS[p.weapon].hint });
}

function addWeapon(w: World, id: WeaponId, ev: WorldEvent[]) {
  const p = w.player;
  const def = WEAPONS[id];
  if (id === "grenade") {
    p.ammo.grenade += def.pickup;
    ev.push({ t: "toast", msg: `+${def.pickup} granadas (G / botón Granada).` });
    return;
  }
  if (!p.weapons.includes(id)) p.weapons.push(id);
  if (isGun(id)) p.ammo[id] += Math.max(1, Math.round(def.start * w.tune.startAmmoMul));
  p.weapon = id;
  addScore(w, 20);
  ev.push({ t: "toast", msg: `${def.name}. ${def.hint}` });
}

function grab(w: World, p: Pickup, ev: WorldEvent[]) {
  w.items.push(p.id);
  const pl = w.player;
  const y = (p.y ?? 0) + 10;
  if (p.kind === "coin") {
    w.coins++;
    addScore(w, 10);
    ev.push({ t: "sfx", name: "coin" });
    fx(w, p.x, y + 16, "pop", 1, "+1 Gs");
  } else if (p.kind === "ammo") {
    const n = giveAmmo(w, 1, ev);
    addScore(w, 5);
    ev.push({ t: "sfx", name: "pickup" });
    fx(w, p.x, y + 16, "pop", 1, `+${n}`);
  } else if (p.kind === "heal") {
    const before = pl.hp;
    pl.hp = Math.min(pl.maxHp, pl.hp + 30);
    addScore(w, 5);
    ev.push({ t: "sfx", name: "heal" }, { t: "toast", msg: "Tereré. Un respiro." });
    fx(w, p.x, y + 18, "heal", 1, `+${pl.hp - before}`);
  } else if (p.kind !== "item") {
    ev.push({ t: "sfx", name: "pickup" });
    addWeapon(w, p.kind, ev);
  }
  ev.push({ t: "hud" });
}

/* ------------------------------------------------------------------ */
/* Enemies                                                             */
/* ------------------------------------------------------------------ */

function respawnAllowed(w: World, e: Enemy) {
  if (e.id === "pablito" && w.chapter === 3 && w.items.includes("echar")) return false;
  if (w.boss.active && chapterOf(w.chapter).boss.id === e.id) return false;
  return true;
}

type StepWorld = World & { dt: number };

function bark(w: World, e: Enemy, force?: string) {
  const def = HAZARD_BY_ID[e.id];
  e.bark = force ?? pick(e.isBoss ? def.bossBarks : def.barks);
  e.barkUntil = w.t + 2;
  e.nextBarkAt = w.t + 3 + Math.random() * 3;
}

function stepEnemy(w: StepWorld, e: Enemy, ev: WorldEvent[]) {
  const def = HAZARD_BY_ID[e.id];
  const p = w.player;
  const t = w.t;
  const maxX = w.width - 8;
  const home = chapterOf(w.chapter).hazardHome[e.id];
  if (e.flash > 0) e.flash = Math.max(0, e.flash - 4 * w.dt);
  if (e.bark && t > e.barkUntil) e.bark = "";

  if (e.gone) {
    if (t >= e.respawnAt && respawnAllowed(w, e) && Math.abs(p.x - home) > 40) {
      Object.assign(e, enemyAt(e.id, home, w.tune.enemyHp));
      ev.push({ t: "toast", msg: `${def.name} volvió.` });
    }
    return;
  }
  if (e.exploding) {
    e.rot += 420 * w.dt;
    e.y += 40 * w.dt;
    e.x = clamp(e.x + e.vx * 0.4 * w.dt, 4, maxX);
    if (t - e.explodeAt > 0.8) {
      e.gone = true;
      e.respawnAt = e.respawnAt > 1e8 ? e.respawnAt : t + w.tune.respawnSeconds;
    }
    return;
  }
  if (e.cry) {
    if (t >= e.cryUntil) {
      e.cry = false;
      killEnemy(w, e, p.facing, e.hurt === "slash" ? "slash" : "fist", ev);
    }
    return;
  }
  if (e.calm) return;
  if (e.fly) {
    e.vy -= 210 * w.dt;
    e.x = clamp(e.x + e.vx * w.dt, 4, maxX);
    e.y += e.vy * w.dt;
    e.rot += e.spin * w.dt;
    if (e.y <= 0) {
      e.y = 0;
      if (e.isBoss) {
        e.fly = false;
        e.vx = 0;
        e.vy = 0;
        e.rot = 0;
        e.chasing = true;
        return;
      }
      if (Math.abs(e.vy) > 36) {
        e.vy = Math.abs(e.vy) * 0.38;
        e.vx *= 0.55;
        e.spin *= 0.6;
        splat(w, e.x, 8, 6);
        ev.push({ t: "sfx", name: "land" });
      } else {
        e.fly = false;
        e.down = true;
        e.downAt = t;
        e.vx = 0;
        e.vy = 0;
        e.rot = e.spin >= 0 ? 90 : -90;
        splat(w, e.x, 6, 5);
      }
    }
    return;
  }
  if (e.down) {
    const keepDown = e.id === "pablito" && w.chapter === 3 && w.items.includes("echar");
    if (!keepDown && t - e.downAt > 2.2) {
      e.down = false;
      e.rot = 0;
      e.chasing = true;
      e.noLeashUntil = t + 4;
    }
    return;
  }
  if (t - e.hit < 0.4) return;

  const dx = p.x - e.x;
  const dist = Math.abs(dx);
  const dir: 1 | -1 | 0 = dx === 0 ? 0 : dx > 0 ? 1 : -1;
  let speed = def.speed * w.tune.enemySpeed;

  if (!e.chasing) {
    if (e.id === "onichan") e.x = home + Math.sin(t * 1.54) * 18;
    if (dist < def.sight && t > w.talkLockUntil) {
      e.chasing = true;
      e.caught = false;
      e.nextBarkAt = t + 0.8;
      ev.push({ t: "toast", msg: def.alert }, { t: "sfx", name: "alert" }, { t: "hud" });
    }
    return;
  }

  if (t > e.nextBarkAt) bark(w, e);

  if (!e.isBoss && dist > def.leash && t > e.noLeashUntil) {
    e.chasing = false;
    e.caught = false;
    e.x = home;
    e.bark = "";
    ev.push({ t: "toast", msg: def.lost }, { t: "hud" });
    return;
  }

  if (e.isBoss) {
    speed *= 1.3;
    // Telegraphed charge: the boss plants its feet for half a second, then rushes.
    if (e.windupUntil === 0 && t > e.nextChargeAt) {
      e.windupUntil = t + 0.5;
      bark(w, e, "¡AHÍ VOY!");
      ev.push({ t: "sfx", name: "alert" });
    }
    if (e.windupUntil > 0) {
      if (t < e.windupUntil) speed = 0;
      else {
        e.windupUntil = 0;
        e.chargeUntil = t + 0.55;
        e.nextChargeAt = t + w.tune.chargeEvery * (e.id === "pablito" ? 0.75 : 1);
        ev.push({ t: "sfx", name: "dash" });
      }
    }
    if (t < e.chargeUntil) speed *= 3.4;
    if (dist > 6 && speed > 0) e.x = clamp(e.x + dir * speed * w.dt, 8, maxX);
    if (
      dist < 12 &&
      Math.abs(p.y - e.y) < 14 &&
      t > p.invUntil &&
      t > e.hitPlayerAt + 0.8 &&
      t > w.talkLockUntil
    ) {
      e.hitPlayerAt = t;
      if (hurtPlayer(w, 12, ev, pick(def.bossBarks))) {
        p.vx = dir * 120;
        p.vy = 48;
        p.grounded = false;
        p.onPlatform = false;
      }
    }
    if (e.id === "marcos" && t - e.lastThrow > 1.5 / w.tune.projectileRate) {
      for (const k of [-1, 0, 1])
        w.books.push({ x: e.x, y: 24 + k * 5, vx: dir * (52 + k * 10), rot: Math.random() * 360 });
      e.lastThrow = t;
    }
    if (e.id === "pablito" && t - e.lastThrow > 2.2 / w.tune.projectileRate && dist > 20) {
      w.slimes.push({ x: e.x + dir * 6, y: 11, vx: dir * 110 });
      e.lastThrow = t;
    }
    return;
  }

  if (e.id === "onichan") {
    if (dist < 20) e.x = clamp(e.x - dir * speed * w.dt, 8, maxX);
    else if (dist > 28) e.x = clamp(e.x + dir * speed * w.dt, 8, maxX);
    if (t - e.lastThrow > 0.6 / w.tune.projectileRate) {
      w.slimes.push({ x: e.x + (dir > 0 ? -12 : 12), y: 11, vx: dir * 95 });
      e.lastThrow = t;
    }
    return;
  }

  if (dist > 14) {
    e.x = clamp(e.x + dir * speed * w.dt, 8, maxX);
  } else if (p.y < 6 && t > p.invUntil && t > w.talkLockUntil) {
    e.x = p.x - dir * 14;
    if (!e.caught) {
      e.caught = true;
      const key: TalkKey = e.id === "pablito" && w.chapter === 3 ? "pablito3" : e.id;
      if (hurtPlayer(w, 5, ev, "")) {
        if (!w.ended) ev.push({ t: "talk", key });
      }
    }
  }
  if (e.id === "marcos" && t - e.lastThrow > 1.1 / w.tune.projectileRate) {
    w.books.push({ x: e.x, y: 24, vx: dir * 52, rot: Math.random() * 360 });
    e.lastThrow = t;
  }
}

function stepBossTrigger(w: World, ev: WorldEvent[]) {
  if (w.boss.active || w.boss.done) return;
  const ch = chapterOf(w.chapter);
  const bd = ch.boss;
  const p = w.player;
  if (Math.floor(p.x / 100) !== bd.zone || w.t < w.talkLockUntil) return;
  if (!bd.requires.every((i) => w.items.includes(i))) return;
  if (bd.team && !TEAM.every((id) => id === w.hero || w.recruited.includes(id))) return;
  const e = w.enemies[bd.id];
  Object.assign(e, enemyAt(bd.id, clamp(bd.zone * 100 + 72, 8, w.width - 8), 1));
  e.hp = e.maxHp = Math.max(4, Math.round(bd.hp * w.tune.enemyHp * w.tune.bossHp));
  e.isBoss = true;
  e.chasing = true;
  e.caught = false;
  e.noLeashUntil = 1e9;
  e.hit = w.t + 1.3;
  e.nextChargeAt = w.t + 3;
  e.nextBarkAt = w.t + 1.4;
  bark(w, e, pick(HAZARD_BY_ID[bd.id].bossBarks));
  w.boss.active = true;
  w.boss.introAt = w.t;
  w.talkLockUntil = w.t + 1.2;
  shake(w, 10);
  ev.push(
    { t: "boss", title: bd.title },
    { t: "toast", msg: bd.intro },
    { t: "sfx", name: "bossIntro" },
    { t: "vibrate", ms: 200 },
    { t: "hud" },
  );
}

function stepZones(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const ch = chapterOf(w.chapter);
  const zone = Math.max(0, Math.min(ch.zones.length - 1, Math.floor(p.x / 100)));
  if (w.zoneSeen[zone]) return;
  w.zoneSeen[zone] = true;
  ev.push({ t: "zone", name: ch.zones[zone].name });
  if (p.hp < p.maxHp) {
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + 10);
    fx(w, p.x, p.y + 38, "heal", 1, `+${p.hp - before}`);
  }
  const base = ch.ambush[zone];
  if (!base || w.t < w.talkLockUntil) return;
  let list: HazardId[] = base.slice(0, w.tune.ambush);
  if (w.tune.ambush > base.length) {
    // Hard mode: one more enemy joins the ambush, whoever is idle and alive.
    const extra = HAZARDS.map((h) => h.id).find((id) => {
      const e = w.enemies[id];
      return (
        !base.includes(id) && isAlive(e) && !e.chasing && !e.isBoss && !e.calm && id !== ch.boss.id
      );
    });
    if (extra) list = [...list, extra];
  }
  const names: string[] = [];
  list.forEach((id, i) => {
    const e = w.enemies[id];
    if (!isAlive(e) || e.chasing || e.isBoss || e.calm || e.cry || e.fly || e.down) return;
    e.x = clamp(w.camX + 106 + i * 10, 8, w.width - 8);
    e.chasing = true;
    e.caught = false;
    e.noLeashUntil = w.t + 8;
    e.nextBarkAt = w.t + 0.6 + i * 0.5;
    names.push(HAZARD_BY_ID[id].name);
  });
  if (names.length) {
    ev.push(
      { t: "toast", msg: `¡Emboscada! ${names.join(" y ")}` },
      { t: "sfx", name: "alert" },
      { t: "hud" },
    );
  }
}

/* ------------------------------------------------------------------ */
/* Solids                                                              */
/* ------------------------------------------------------------------ */

function solids(w: World): (Platform | Crate)[] {
  const ch = chapterOf(w.chapter);
  return [...ch.platforms, ...ch.crates];
}

function insideCrate(w: World, x: number, hAboveGround: number) {
  for (const c of chapterOf(w.chapter).crates) {
    if (Math.abs(x - c.x) < c.w / 2 && hAboveGround < c.h) return c;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Main step                                                           */
/* ------------------------------------------------------------------ */

export function stepWorld(world: World, input: Input, dtRaw: number, ev: WorldEvent[]) {
  const w = world as StepWorld;
  const dt = Math.min(0.05, Math.max(0.001, dtRaw));
  w.dt = dt;
  w.t += dt;
  if (w.ended) return;
  w.timer += dt;
  const p = w.player;
  const ch = chapterOf(w.chapter);
  const maxX = w.width - 8;
  const t = w.t;
  p.prevX = p.x;
  p.prevY = p.y;

  /* --- crouch / dash --- */
  p.crouching = input.crouch && p.grounded && t >= p.dashUntil;
  if (input.dash && t >= p.dashReadyAt && !p.crouching) {
    p.dashUntil = t + 0.22;
    p.dashReadyAt = t + 0.75;
    p.dashDir = input.moveX !== 0 ? (input.moveX < 0 ? -1 : 1) : p.facing;
    p.facing = p.dashDir;
    p.invUntil = Math.max(p.invUntil, t + 0.26);
    p.stomping = false;
    ev.push({ t: "sfx", name: "dash" }, { t: "vibrate", ms: 20 });
  }
  const dashing = t < p.dashUntil;

  /* --- horizontal movement --- */
  const slowed = t < p.slowUntil;
  if (dashing) {
    p.vx = p.dashDir * p.speed * 3;
    w.trail.push({ x: p.x, y: p.y, face: p.facing, born: t });
    if (w.trail.length > 10) w.trail.splice(0, w.trail.length - 10);
  } else {
    const mult = (slowed ? 0.48 : 1) * (p.crouching ? 0.5 : 1);
    const target = clamp(input.moveX, -1, 1) * p.speed * mult;
    p.vx += (target - p.vx) * Math.min(1, (p.grounded ? 18 : 8) * dt);
    if (Math.abs(p.vx) < 0.5 && input.moveX === 0) p.vx = 0;
    if (input.moveX !== 0) p.facing = input.moveX < 0 ? -1 : 1;
  }
  p.x = clamp(p.x + p.vx * dt, 6, maxX);
  // Crates block sideways movement unless you are above them.
  for (const c of ch.crates) {
    if (p.y < c.h - 0.5 && Math.abs(p.x - c.x) < c.w / 2 + 2) {
      const side = p.prevX <= c.x ? -1 : 1;
      p.x = c.x + side * (c.w / 2 + 2);
      if (!dashing) p.vx = 0;
    }
  }
  p.walking = Math.abs(p.vx) > 6 && p.grounded && !dashing;

  /* --- jump / gravity --- */
  if (input.jump) p.jumpBuffer = 0.12;
  else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  if (p.grounded) p.coyote = 0.1;
  else p.coyote = Math.max(0, p.coyote - dt);
  if (p.jumpBuffer > 0 && p.crouching && p.onPlatform && p.y > 0) {
    // Drop through the platform.
    p.dropThroughUntil = t + 0.3;
    p.grounded = false;
    p.onPlatform = false;
    p.jumpBuffer = 0;
    p.vy = -10;
  } else if (p.jumpBuffer > 0 && (p.grounded || p.coyote > 0) && !p.crouching) {
    p.vy = JUMP_V;
    p.grounded = false;
    p.onPlatform = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    ev.push({ t: "sfx", name: "jump" });
  }
  if (!p.grounded) {
    p.vy -= GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y <= 0) {
      p.y = 0;
      p.vy = 0;
      p.grounded = true;
      p.onPlatform = false;
      landed(w, ev);
    } else if (p.vy <= 0 && t > p.dropThroughUntil) {
      for (const s of solids(w)) {
        if (Math.abs(p.x - s.x) <= s.w / 2 + 1 && p.prevY >= s.h - 0.6 && p.y <= s.h) {
          p.y = s.h;
          p.vy = 0;
          p.grounded = true;
          p.onPlatform = true;
          landed(w, ev);
          break;
        }
      }
    }
  } else if (p.y > 0) {
    // Standing on something: still supported?
    const supported = solids(w).some(
      (s) => Math.abs(p.x - s.x) <= s.w / 2 + 1 && Math.abs(p.y - s.h) < 0.6,
    );
    if (!supported) {
      p.grounded = false;
      p.onPlatform = false;
      p.vy = 0;
    }
  }

  /* --- actions --- */
  if (input.swap) swapWeapon(w, ev);
  if (input.grenade) throwGrenade(w, ev);
  const meleeWeapon = WEAPONS[p.weapon].kind === "melee";
  if (input.attack && !p.grounded && meleeWeapon && !p.stomping && p.y > 4) {
    p.stomping = true;
    p.vy = Math.min(p.vy, -150);
    p.attackKind = p.weapon;
    p.attackUntil = t + 0.5;
    ev.push({ t: "sfx", name: "dash" });
  } else if (input.attack || (input.attackHeld && !meleeWeapon)) attack(w, ev);

  /* --- pickups --- */
  for (const pk of ch.pickups) {
    if (pk.kind === "item" || w.items.includes(pk.id)) continue;
    if (Math.abs(p.x - pk.x) < 6 && Math.abs(p.y - (pk.y ?? 0)) < 10) grab(w, pk, ev);
  }
  w.drops = w.drops.filter((d) => {
    d.vy -= GRAVITY * dt;
    d.x = clamp(d.x + d.vx * dt, 4, maxX);
    d.y += d.vy * dt;
    if (d.y <= 0) {
      d.y = 0;
      if (Math.abs(d.vy) > 12) {
        d.vy = Math.abs(d.vy) * 0.4;
        d.vx *= 0.6;
      } else {
        d.vy = 0;
        d.vx = 0;
      }
    }
    if (t - d.born > 25) return false;
    if (t - d.born > 0.4 && Math.abs(d.x - p.x) < 6 && Math.abs(d.y - p.y) < 12) {
      if (d.kind === "coin") {
        w.coins++;
        addScore(w, 10);
        fx(w, d.x, d.y + 24, "pop", 1, "+1 Gs");
        ev.push({ t: "sfx", name: "coin" });
      } else if (d.kind === "ammo") {
        const n = giveAmmo(w, 0.5);
        fx(w, d.x, d.y + 24, "pop", 1, `+${n}`);
        ev.push({ t: "sfx", name: "drop" });
      } else {
        const before = p.hp;
        p.hp = Math.min(p.maxHp, p.hp + 15);
        fx(w, d.x, d.y + 26, "heal", 1, `+${p.hp - before}`);
        ev.push({ t: "sfx", name: "heal" });
      }
      ev.push({ t: "hud" });
      return false;
    }
    return true;
  });

  /* --- interact --- */
  if (input.interact) {
    const tg = interactTarget(w);
    if (tg) {
      if (tg.kind === "talk") ev.push({ t: "talk", key: tg.key });
      else if (tg.pickup.talk) ev.push({ t: "talk", key: tg.pickup.talk });
    }
  }

  /* --- world triggers --- */
  stepZones(w, ev);
  stepBossTrigger(w, ev);

  /* --- enemies --- */
  for (const def of HAZARDS) stepEnemy(w, w.enemies[def.id], ev);

  /* --- allies fight back --- */
  const fl = followers(w);
  fl.forEach((id, i) => {
    if (t < (w.allyHitAt[i] ?? 0)) return;
    const ax = followerX(w, i);
    for (const def of HAZARDS) {
      const e = w.enemies[def.id];
      if (!isAlive(e) || !e.chasing || e.fly || e.down || e.calm || e.cry) continue;
      if (Math.abs(e.x - ax) < 11 && e.y < 8) {
        const dir: 1 | -1 = e.x >= ax ? 1 : -1;
        damageEnemy(w, e, 1, dir, "ally", ev);
        fx(w, ax, 38, "pop", 1, HERO_BY_ID[id].warcry);
        w.allyHitAt[i] = t + 1.7;
        ev.push({ t: "sfx", name: "ally" });
        break;
      }
    }
  });

  /* --- projectiles --- */
  const feet = p.y;
  const head = p.y + (p.crouching ? CROUCH_H : STAND_H);
  const dodging = t < p.dashUntil;
  w.books = w.books.filter((b) => {
    b.x += b.vx * dt;
    b.rot += 220 * dt;
    b.y += 6 * dt;
    const h = b.y - GROUND_LINE;
    if (insideCrate(w, b.x, h)) {
      fx(w, b.x, b.y, "impact");
      return false;
    }
    if (!dodging && Math.abs(b.x - p.x) < 7 && h < head && h > feet - 4) {
      hurtPlayer(w, 12, ev, "¡Un libro te pegó! Agachate (S).");
      return false;
    }
    return b.x > 0 && b.x < maxX && b.y < 40;
  });
  w.slimes = w.slimes.filter((s) => {
    s.x += s.vx * dt;
    s.y += 5 * dt;
    const h = s.y - GROUND_LINE;
    if (insideCrate(w, s.x, h)) return false;
    if (!dodging && Math.abs(s.x - p.x) < 7 && h < head && h > feet - 4) {
      if (hurtPlayer(w, 8, ev, "¡Slime! Saltá (W) para esquivarlo.")) {
        p.slowUntil = t + 0.8;
        w.slimedUntil = t + 0.5;
      }
      return false;
    }
    return s.x > 0 && s.x < maxX && s.y < 38;
  });
  if (w.slimes.length > 14) w.slimes.splice(0, w.slimes.length - 14);

  w.shots = w.shots.filter((shot) => {
    const nx = shot.x + shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.range -= Math.abs(shot.vx * dt);
    if (nx < 2 || nx > maxX || shot.range <= 0 || shot.y < 6 || shot.y > 60) return false;
    const h = shot.y - GROUND_LINE;
    if (insideCrate(w, nx, h)) {
      fx(w, nx, shot.y, "impact", shot.face);
      return false;
    }
    for (const def of HAZARDS) {
      const e = w.enemies[def.id];
      if (!isAlive(e) || e.fly) continue;
      const lo = Math.min(shot.x, nx) - 4;
      const hi = Math.max(shot.x, nx) + 4;
      if (e.x >= lo && e.x <= hi && h > e.y - 3 && h < e.y + 30) {
        damageEnemy(w, e, shot.dmg, shot.face, "gun", ev, shot.kind === "shotgun" ? 1.2 : 1);
        return false;
      }
    }
    shot.x = nx;
    return true;
  });

  w.grenades = w.grenades.filter((g) => {
    g.vy -= GRAVITY * dt;
    g.x = clamp(g.x + g.vx * dt, 4, maxX);
    g.y += g.vy * dt;
    const crate = insideCrate(w, g.x, g.y);
    if (g.y <= 0 || crate) {
      if (crate) g.x = crate.x + (g.vx >= 0 ? -1 : 1) * (crate.w / 2 + 1);
      if (g.y <= 0) g.y = 0;
      if (g.bounces < 1 && !crate) {
        g.bounces++;
        g.vy = Math.abs(g.vy) * 0.35;
        g.vx *= 0.55;
        ev.push({ t: "sfx", name: "land" });
      } else {
        explode(w, g.x, g.y, ev);
        return false;
      }
    }
    if (t - g.born > 1.5) {
      explode(w, g.x, g.y, ev);
      return false;
    }
    return true;
  });

  /* --- particles --- */
  w.gibs = w.gibs.filter((g) => {
    g.vy -= 210 * dt;
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    g.rot += g.spin * dt;
    return g.y > -20 && g.x > -10 && g.x < maxX + 10;
  });
  if (w.fx.length)
    w.fx = w.fx.filter((f) => t - f.born < (f.kind === "pop" || f.kind === "heal" ? 0.9 : 0.6));
  if (w.blood.length) w.blood = w.blood.filter((b) => t - b.born < 14);
  if (w.trail.length) w.trail = w.trail.filter((tr) => t - tr.born < 0.3);
  if (t > w.comboUntil) w.combo = 0;
  if (t > p.comboUntil + 0.2) p.finisher = false;

  /* --- camera --- */
  const camTarget = clamp(p.x - 38 + p.facing * 4 + p.vx * 0.08, 0, w.width - 100);
  w.camX += (camTarget - w.camX) * Math.min(1, 7 * dt);
}

function landed(w: World, ev: WorldEvent[]) {
  const p = w.player;
  if (!p.stomping) {
    ev.push({ t: "sfx", name: "land" });
    return;
  }
  p.stomping = false;
  p.attackUntil = w.t + 0.1;
  let hit = false;
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (!isAlive(e) || e.fly || e.down || Math.abs(e.x - p.x) > 13 || e.y > 10) continue;
    const dir: 1 | -1 = e.x >= p.x ? 1 : -1;
    damageEnemy(w, e, 2, dir, p.weapon === "knife" ? "slash" : "bat", ev, 1.4);
    hit = true;
  }
  fx(w, p.x - 8, p.y + 10, "impact", -1);
  fx(w, p.x + 8, p.y + 10, "impact", 1);
  shake(w, hit ? 9 : 5);
  ev.push({ t: "sfx", name: "stomp" }, { t: "vibrate", ms: 40 });
  if (hit) {
    addScore(w, 15);
    fx(w, p.x, p.y + 40, "pop", 1, "¡PISOTÓN!");
  }
}

/* ------------------------------------------------------------------ */
/* After KO                                                            */
/* ------------------------------------------------------------------ */

export function respawn(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const ch = chapterOf(w.chapter);
  const zoneStart = Math.floor(p.x / 100) * 100;
  p.x = clamp(zoneStart + 14, 6, w.width - 8);
  p.prevX = p.x;
  p.y = 0;
  p.vy = 0;
  p.vx = 0;
  p.grounded = true;
  p.onPlatform = false;
  p.hp = p.maxHp;
  p.invUntil = w.t + 2.5;
  p.slowUntil = 0;
  p.stomping = false;
  p.crouching = false;
  w.coins = Math.max(0, w.coins - 5);
  w.falls++;
  addScore(w, -100);
  w.books = [];
  w.slimes = [];
  w.shots = [];
  w.grenades = [];
  w.slimedUntil = 0;
  w.talkLockUntil = w.t + 2;
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (!isAlive(e)) continue;
    if (e.isBoss) {
      e.x = clamp(ch.boss.zone * 100 + 72, 8, w.width - 8);
      e.fly = false;
      e.y = 0;
      e.rot = 0;
      e.chasing = true;
      e.hit = w.t + 1.5;
      e.nextChargeAt = w.t + 3;
    } else if (e.chasing) {
      e.chasing = false;
      e.caught = false;
      e.x = ch.hazardHome[def.id];
    }
  }
  w.camX = clamp(p.x - 38, 0, w.width - 100);
  w.ended = false;
  ev.push({ t: "toast", msg: "Volvés al inicio de la zona. −5 Gs." }, { t: "hud" });
}

/* ------------------------------------------------------------------ */
/* Dialogue resolution                                                 */
/* ------------------------------------------------------------------ */

export type ChoiceResult =
  { next: "close" } | { next: "line" } | { next: "talk"; key: TalkKey } | { next: "win" };

export function closeTalk(w: World) {
  w.talkLockUntil = w.t + 1.2;
  w.player.invUntil = Math.max(w.player.invUntil, w.t + 1.5);
}

export function applyChoice(
  w: World,
  key: TalkKey,
  script: Line[],
  lineIdx: number,
  pick: Choice,
  ev: WorldEvent[],
): ChoiceResult {
  const maxX = w.width - 8;
  const p = w.player;
  if (pick.set) setFlag(w, pick.set);

  if (pick.join) {
    if (!w.recruited.includes(key)) {
      w.recruited.push(key);
      addScore(w, 100);
      ev.push(
        { t: "toast", msg: `${NAMES[key as HeroId] ?? key} se suma y pelea con vos.` },
        { t: "sfx", name: "recruit" },
        { t: "hud" },
      );
      return { next: "close" };
    }
  }
  if (pick.item && !w.items.includes(pick.item)) {
    const msg =
      pick.item === "aviso"
        ? "Paso 1. El chat está en el pasillo."
        : pick.item === "chat"
          ? "Paso 2. La foto está en el bosque."
          : pick.item === "foto"
            ? "Paso 3. Pablito espera en el muelle. Cargá balas."
            : pick.item === "fuerza"
              ? "Héctor te banca. Falta la cédula en el patio."
              : pick.item === "cedula"
                ? "Cédula lista. Marcos bloquea el aula."
                : pick.item === "terere"
                  ? "Tereré listo. Falta el carbón."
                  : pick.item === "carne"
                    ? "Carne lista. Falta el tereré."
                    : pick.item === "hielo"
                      ? "Hielo listo. Falta la carne."
                      : pick.item === "carbon"
                        ? "Carbón listo. Masivo te espera en el quincho."
                        : pick.item === "apuntes"
                          ? "Apuntes listos. Falta el café."
                          : pick.item === "cafe"
                            ? "Café listo. Hablá con Héctor."
                            : `${pick.item} listo.`;
    w.items.push(pick.item);
    addScore(w, 100);
    ev.push({ t: "toast", msg }, { t: "sfx", name: "pickup" }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.heal) {
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + pick.heal);
    fx(w, p.x, p.y + 38, "heal", 1, `+${p.hp - before}`);
    ev.push({ t: "sfx", name: "heal" }, { t: "toast", msg: "Un respiro." }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.ammo) {
    giveAmmo(w, 1.5, ev);
    ev.push({ t: "sfx", name: "pickup" }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.fight) {
    const e = w.enemies[key === "pablito3" ? "pablito" : (key as HazardId)];
    if (e) {
      e.chasing = true;
      e.caught = true;
      e.calm = false;
      e.hit = w.t + 0.3;
      e.noLeashUntil = w.t + 8;
      bark(w, e);
    }
    ev.push(
      { t: "toast", msg: "¡Se viene! Pegale o esquivá (Shift)." },
      { t: "sfx", name: "alert" },
    );
    return { next: "close" };
  }
  if (pick.calm) {
    const m = w.enemies.marcos;
    m.chasing = false;
    m.calm = true;
    m.caught = false;
    m.bark = "";
    addScore(w, 30);
    ev.push({ t: "toast", msg: "Marcos se calma. La panza es sagrada." }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.coins) {
    w.coins += pick.coins;
    addScore(w, pick.coins * 10);
    const e = w.enemies[key as HazardId];
    if (e) {
      e.chasing = true;
      e.caught = true;
    }
    p.x = clamp(p.x + (p.facing >= 0 ? 8 : -8), 6, maxX);
    ev.push(
      { t: "toast", msg: "Masivo te tira unos Gs. ¡CORRÉ!" },
      { t: "sfx", name: "coin" },
      { t: "hud" },
    );
    return { next: "close" };
  }
  if (pick.escape) {
    const e = w.enemies[key as HazardId];
    const bump = p.x >= (e?.x ?? p.x) ? 10 : -10;
    if (e) {
      e.chasing = true;
      e.caught = true;
      e.hit = w.t + 1.0; // gives the player a head start
      e.x = clamp(e.x - bump * 0.8, 4, maxX);
    }
    p.x = clamp(p.x + bump, 6, maxX);
    ev.push({ t: "toast", msg: "¡Corré! Esquivá con Shift o saltá." });
    return { next: "close" };
  }
  if (pick.chaseOff) {
    const e = w.enemies.pablito;
    e.x = 12;
    e.chasing = false;
    e.caught = true;
    e.hit = w.t;
    if (!w.items.includes("echar")) {
      w.items.push("echar");
      addScore(w, 100);
    }
    ev.push({ t: "toast", msg: "Pablito salió corriendo. Hablá con Juan." }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.honor) {
    if (!w.items.includes("echar") || !w.items.includes("foto")) {
      ev.push({ t: "toast", msg: "Falta la foto o echar a Pablito." });
      return { next: "close" };
    }
    w.items.push("honor");
    addScore(w, 300);
    return { next: "win" };
  }
  if (pick.exam) {
    if (key === "richard2") {
      if (!["apuntes", "cafe", "cedula", "fuerza"].every((i) => w.items.includes(i))) {
        ev.push({ t: "toast", msg: "Faltan apuntes, café, cédula o Héctor. Seguí a la derecha." });
        return { next: "close" };
      }
      if (!w.items.includes("boss")) {
        ev.push({ t: "toast", msg: "Marcos bloquea el aula. Sacalo primero." });
        return { next: "close" };
      }
      w.examScore = 0;
      return { next: "talk", key: "examen" };
    }
    const score = w.examScore + (pick.exam === "ok" ? 1 : 0);
    w.examScore = score;
    if (lineIdx + 1 < script.length) return { next: "line" };
    if (score >= 3) {
      if (!w.items.includes("exam")) w.items.push("exam");
      addScore(w, 200 + score * 50);
      return { next: "win" };
    }
    w.examScore = 0;
    ev.push({ t: "toast", msg: "Aplazado. Reintentá el examen." }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.fire) {
    const team = w.recruited.length >= 4;
    const stuff = ["carne", "hielo", "carbon", "terere"].every((id) => w.items.includes(id));
    if (team && stuff && !w.items.includes("boss")) {
      ev.push({ t: "toast", msg: "Masivo sigue en pie. Vencelo primero." });
      return { next: "close" };
    }
    if (team && stuff) {
      w.fire = true;
      addScore(w, 300);
      return { next: "win" };
    }
    ev.push({
      t: "toast",
      msg: team ? "Falta hielo, carbón, carne o tereré." : "Falta el equipo.",
    });
    return { next: "close" };
  }
  return { next: "close" };
}

export const TEAM_IDS = TEAM;
export { CHAPTERS };
