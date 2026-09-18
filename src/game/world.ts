import {
  CHAPTERS,
  HAZARDS,
  HAZARD_BY_ID,
  HERO_BY_ID,
  NAMES,
  TALKS,
  TEAM,
  chapterOf,
  npcHome,
  worldWidth,
  type Choice,
  type HazardId,
  type HeroId,
  type Pickup,
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
};

export type WorldEvent =
  | { t: "toast"; msg: string }
  | { t: "talk"; key: TalkKey }
  | { t: "sfx"; name: SfxName }
  | { t: "vibrate"; ms: number }
  | { t: "hud" }
  | { t: "ko" }
  | { t: "win" };

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
  hurt: "" | "gun" | "slash" | "fist";
  torn: boolean;
  flash: number;
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
  ammo: number;
  hasKnife: boolean;
  grounded: boolean;
  jumpBuffer: number;
  coyote: number;
  lastAttack: number;
  hurtAt: number;
  walking: boolean;
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
export type Shot = { x: number; y: number; vx: number; face: 1 | -1 };
export type Book = { x: number; y: number; vx: number; rot: number };
export type Slime = { x: number; y: number; vx: number };
export type FxKind = "slash" | "muzzle" | "impact" | "boom" | "tracer" | "pop" | "heal";
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
  coins: number;
  fire: boolean;
  examScore: number;
  blood: Blood[];
  gibs: Gib[];
  shots: Shot[];
  books: Book[];
  slimes: Slime[];
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
};

export const GRAVITY = 215;
export const JUMP_V = 82;
const BASE_SPEED = 60;
const GROUND_LINE = 8; // vh above the bottom of the screen where feet stand

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
      ammo: Math.round(tune.startAmmo * (perk.ammo / 12)),
      hasKnife: false,
      grounded: true,
      jumpBuffer: 0,
      coyote: 0,
      lastAttack: -10,
      hurtAt: -10,
      walking: false,
    },
    enemies,
    npcX: npcHome(chapter),
    recruited: chapter === 1 ? [hero] : ["rafa", "juan", "richard", "hector"],
    items: [],
    coins: 0,
    fire: chapter !== 1,
    examScore: 0,
    blood: [],
    gibs: [],
    shots: [],
    books: [],
    slimes: [],
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
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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
  if (w.fx.length > 24) w.fx.splice(0, w.fx.length - 24);
}

function addScore(w: World, n: number) {
  w.score = Math.max(0, w.score + n);
}

export function isAlive(e: Enemy) {
  return !e.gone && !e.exploding && e.x < 900;
}
export function canTalk(e: Enemy) {
  return isAlive(e) && !e.fly && !e.down && !e.calm && !e.cry;
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
    ["apuntes", "cafe", "cedula", "fuerza"].every((i) => w.items.includes(i)) &&
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

function killEnemy(
  w: World,
  e: Enemy,
  dir: 1 | -1,
  how: "gun" | "slash" | "fist",
  ev: WorldEvent[],
) {
  const def = HAZARD_BY_ID[e.id];
  e.hp = 0;
  e.hurt = how;
  e.exploding = true;
  e.explodeAt = w.t;
  e.fly = true;
  e.torn = how !== "fist";
  e.chasing = false;
  e.caught = false;
  e.headless = e.id === "gallaguer";
  e.vx = dir * 58;
  e.vy = 82;
  e.spin = dir * 820;
  e.hit = w.t;
  e.flash = 1;
  splat(w, e.x, 16, 22);
  splat(w, e.x + dir * 6, 10, 10);
  rip(w, e.x, dir, 12);
  fx(w, e.x, 20, "boom");
  fx(w, e.x, 24, "impact");
  w.kills++;
  w.combo = w.t < w.comboUntil ? w.combo + 1 : 1;
  w.comboUntil = w.t + 4;
  const base = e.id === "masivo" ? 80 : 50;
  addScore(w, base * w.combo);
  fx(w, e.x, 34, "pop", 1, w.combo > 1 ? `+${base * w.combo} · x${w.combo}` : `+${base}`);
  shake(w, 9);
  ev.push({ t: "sfx", name: "boom" }, { t: "vibrate", ms: 120 }, { t: "hud" });
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
  how: "gun" | "slash" | "fist",
  ev: WorldEvent[],
) {
  const def = HAZARD_BY_ID[e.id];
  // Story gags: melee on Marcos makes him cry and explode, melee on Gallaguer pops his head.
  if (how !== "gun" && e.id === "marcos" && !e.cry) {
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
  if (how !== "gun" && e.id === "gallaguer") {
    killEnemy(w, e, dir, how, ev);
    return;
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
  splat(w, e.x, 12, how === "gun" ? 6 : 10);
  if (how === "gun") {
    // Stagger: pushed back, keeps chasing after a beat.
    e.x = clamp(e.x + dir * 5, 4, w.width - 8);
    fx(w, e.x, 22, "impact");
    ev.push({ t: "toast", msg: `${def.name}: ${e.hp}/${e.maxHp}` });
    return;
  }
  // Melee knockback: they fly, land, lie down for a bit, then get up angrier.
  e.fly = true;
  e.down = false;
  e.chasing = false;
  e.caught = false;
  e.vx = dir * (how === "slash" ? 70 : 92 + Math.random() * 18);
  e.vy = how === "slash" ? 62 + Math.random() * 20 : 78 + Math.random() * 22;
  e.spin = dir * (how === "slash" ? 980 : 720 + Math.random() * 420);
  e.torn = false;
  if (how === "slash") {
    fx(w, e.x, 18, "impact");
    rip(w, e.x, dir, 5);
  }
  ev.push({ t: "toast", msg: how === "slash" ? "¡Corte!" : "¡SALE VOLANDO!" });
}

/* ------------------------------------------------------------------ */
/* Player actions                                                      */
/* ------------------------------------------------------------------ */

function attack(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const weapon = p.weapon;
  const cooldown = weapon === "pistol" ? 0.26 : weapon === "knife" ? 0.4 : 0.36;
  if (w.t - p.lastAttack < cooldown) return;
  if (weapon === "pistol" && p.ammo <= 0) {
    p.lastAttack = w.t;
    ev.push({ t: "sfx", name: "empty" }, { t: "toast", msg: "Sin balas. Cambiá de arma (Q)." });
    return;
  }
  p.lastAttack = w.t;
  p.attackKind = weapon;
  p.attackUntil = w.t + (weapon === "pistol" ? 0.16 : 0.28);
  const dir = p.facing;
  if (weapon === "pistol") {
    p.ammo--;
    w.shots.push({ x: p.x + dir * 9, y: 24 + p.y, vx: dir * 260, face: dir });
    fx(w, p.x + dir * 8, 24 + p.y, "muzzle", dir);
    fx(w, p.x + dir * 22, 24 + p.y, "tracer", dir);
    shake(w, 3);
    ev.push({ t: "sfx", name: "shot" }, { t: "hud" });
    return;
  }
  const isKnife = weapon === "knife";
  const reach = isKnife ? 20 : 14;
  const dmg = isKnife ? 2 : 1;
  const how = isKnife ? "slash" : "fist";
  ev.push({ t: "sfx", name: isKnife ? "slash" : "punch" });
  if (isKnife) {
    fx(w, p.x + dir * 10, 22 + p.y, "slash", dir);
  }
  let hit = false;
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (!isAlive(e) || e.fly || e.down) continue;
    const inFront = (e.x - p.x) * dir > -4;
    if (inFront && Math.abs(e.x - p.x) < reach) {
      damageEnemy(w, e, dmg, dir, how, ev);
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

function swapWeapon(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const owned: WeaponId[] = ["pistol", "fist"];
  if (p.hasKnife) owned.splice(1, 0, "knife");
  const i = owned.indexOf(p.weapon);
  p.weapon = owned[(i + 1) % owned.length];
  ev.push({ t: "sfx", name: "swap" }, { t: "hud" });
}

function grab(w: World, p: Pickup, ev: WorldEvent[]) {
  w.items.push(p.id);
  const pl = w.player;
  if (p.kind === "coin") {
    w.coins++;
    addScore(w, 10);
    ev.push({ t: "sfx", name: "coin" });
    fx(w, p.x, 26, "pop", 1, "+1 Gs");
  } else if (p.kind === "ammo") {
    pl.ammo += w.tune.ammoPickup;
    addScore(w, 5);
    ev.push({ t: "sfx", name: "pickup" }, { t: "toast", msg: `+${w.tune.ammoPickup} balas` });
    fx(w, p.x, 26, "pop", 1, `+${w.tune.ammoPickup}`);
  } else if (p.kind === "heal") {
    const before = pl.hp;
    pl.hp = Math.min(pl.maxHp, pl.hp + 30);
    addScore(w, 5);
    ev.push({ t: "sfx", name: "heal" }, { t: "toast", msg: "Tereré. Un respiro." });
    fx(w, p.x, 28, "heal", 1, `+${pl.hp - before}`);
  } else if (p.kind === "knife") {
    pl.hasKnife = true;
    pl.weapon = "knife";
    addScore(w, 20);
    ev.push(
      { t: "sfx", name: "pickup" },
      { t: "toast", msg: "Cuchillo. Cortá de cerca. Q cambia de arma." },
    );
  }
  ev.push({ t: "hud" });
}

/* ------------------------------------------------------------------ */
/* Enemies                                                             */
/* ------------------------------------------------------------------ */

function respawnAllowed(w: World, e: Enemy) {
  if (e.id === "pablito" && w.chapter === 3 && w.items.includes("echar")) return false;
  return true;
}

type StepWorld = World & { dt: number };

function stepEnemy(w: StepWorld, e: Enemy, ev: WorldEvent[]) {
  const def = HAZARD_BY_ID[e.id];
  const p = w.player;
  const t = w.t;
  const maxX = w.width - 8;
  const home = chapterOf(w.chapter).hazardHome[e.id];
  if (e.flash > 0) e.flash = Math.max(0, e.flash - 4 * w.dt);

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
      e.respawnAt = t + w.tune.respawnSeconds;
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
    }
    return;
  }
  if (t - e.hit < 0.4) return;

  const dx = p.x - e.x;
  const dist = Math.abs(dx);
  const dir: 1 | -1 | 0 = dx === 0 ? 0 : dx > 0 ? 1 : -1;
  const speed = def.speed * w.tune.enemySpeed;

  if (!e.chasing) {
    if (e.id === "onichan") e.x = home + Math.sin(t * 1.54) * 18;
    if (dist < def.sight && t > w.talkLockUntil) {
      e.chasing = true;
      e.caught = false;
      ev.push({ t: "toast", msg: def.alert }, { t: "sfx", name: "alert" }, { t: "hud" });
    }
    return;
  }

  if (dist > def.leash) {
    e.chasing = false;
    e.caught = false;
    e.x = home;
    ev.push({ t: "toast", msg: def.lost }, { t: "hud" });
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
  } else if (p.grounded && t > p.invUntil && t > w.talkLockUntil) {
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
    w.books.push({ x: e.x, y: 18, vx: dir * 52, rot: Math.random() * 360 });
    e.lastThrow = t;
  }
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

  /* --- player movement --- */
  const slowed = w.t < p.slowUntil;
  const target = clamp(input.moveX, -1, 1) * p.speed * (slowed ? 0.48 : 1);
  p.vx += (target - p.vx) * Math.min(1, 18 * dt);
  if (Math.abs(p.vx) < 0.5 && input.moveX === 0) p.vx = 0;
  p.x = clamp(p.x + p.vx * dt, 6, maxX);
  if (input.moveX !== 0) p.facing = input.moveX < 0 ? -1 : 1;
  p.walking = Math.abs(p.vx) > 6 && p.grounded;

  if (input.jump) p.jumpBuffer = 0.12;
  else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  if (p.grounded) p.coyote = 0.1;
  else p.coyote = Math.max(0, p.coyote - dt);
  if (p.jumpBuffer > 0 && (p.grounded || p.coyote > 0)) {
    p.vy = JUMP_V;
    p.grounded = false;
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
      ev.push({ t: "sfx", name: "land" });
    }
  }

  if (input.swap) swapWeapon(w, ev);
  if (input.attack || (input.attackHeld && p.weapon === "pistol")) attack(w, ev);

  /* --- auto pickups --- */
  for (const pk of ch.pickups) {
    if (pk.kind === "item" || w.items.includes(pk.id)) continue;
    if (Math.abs(p.x - pk.x) < 6 && p.y < 12) grab(w, pk, ev);
  }

  /* --- interact --- */
  if (input.interact) {
    const tg = interactTarget(w);
    if (tg) {
      if (tg.kind === "talk") ev.push({ t: "talk", key: tg.key });
      else if (tg.pickup.talk) ev.push({ t: "talk", key: tg.pickup.talk });
    }
  }

  /* --- enemies --- */
  for (const def of HAZARDS) stepEnemy(w, w.enemies[def.id], ev);

  /* --- projectiles --- */
  const feet = p.y;
  const head = p.y + 26;
  w.books = w.books.filter((b) => {
    b.x += b.vx * dt;
    b.rot += 220 * dt;
    b.y += 6 * dt;
    const h = b.y - GROUND_LINE;
    if (Math.abs(b.x - p.x) < 7 && h < head && h > feet - 4) {
      hurtPlayer(w, 12, ev, "¡Un libro te pegó!");
      return false;
    }
    return b.x > 0 && b.x < maxX && b.y < 40;
  });
  w.slimes = w.slimes.filter((s) => {
    s.x += s.vx * dt;
    s.y += 5 * dt;
    const h = s.y - GROUND_LINE;
    if (Math.abs(s.x - p.x) < 7 && h < head && h > feet - 4) {
      if (hurtPlayer(w, 8, ev, "¡Capi te llenó de slime!")) {
        p.slowUntil = w.t + 0.8;
        w.slimedUntil = w.t + 0.5;
      }
      return false;
    }
    return s.x > 0 && s.x < maxX && s.y < 38;
  });
  if (w.slimes.length > 14) w.slimes.splice(0, w.slimes.length - 14);

  w.shots = w.shots.filter((shot) => {
    const nx = shot.x + shot.vx * dt;
    if (nx < 2 || nx > maxX) return false;
    for (const def of HAZARDS) {
      const e = w.enemies[def.id];
      if (!isAlive(e) || e.fly) continue;
      const lo = Math.min(shot.x, nx) - 4;
      const hi = Math.max(shot.x, nx) + 4;
      if (e.x >= lo && e.x <= hi) {
        damageEnemy(w, e, 1, shot.face, "gun", ev);
        return false;
      }
    }
    shot.x = nx;
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
    w.fx = w.fx.filter((f) => w.t - f.born < (f.kind === "pop" || f.kind === "heal" ? 0.9 : 0.6));
  if (w.blood.length) w.blood = w.blood.filter((b) => w.t - b.born < 14);
  if (w.t > w.comboUntil) w.combo = 0;

  /* --- camera --- */
  const camTarget = clamp(p.x - 38 + p.facing * 4, 0, w.width - 100);
  w.camX += (camTarget - w.camX) * Math.min(1, 7 * dt);
}

/* ------------------------------------------------------------------ */
/* After KO                                                            */
/* ------------------------------------------------------------------ */

export function respawn(w: World, ev: WorldEvent[]) {
  const p = w.player;
  const zoneStart = Math.floor(p.x / 100) * 100;
  p.x = clamp(zoneStart + 14, 6, w.width - 8);
  p.y = 0;
  p.vy = 0;
  p.vx = 0;
  p.grounded = true;
  p.hp = p.maxHp;
  p.invUntil = w.t + 2.5;
  p.slowUntil = 0;
  w.coins = Math.max(0, w.coins - 5);
  w.falls++;
  addScore(w, -100);
  w.books = [];
  w.slimes = [];
  w.shots = [];
  w.slimedUntil = 0;
  w.talkLockUntil = w.t + 2;
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (e.chasing && isAlive(e)) {
      e.chasing = false;
      e.caught = false;
      e.x = chapterOf(w.chapter).hazardHome[def.id];
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
  lineIdx: number,
  pick: Choice,
  ev: WorldEvent[],
): ChoiceResult {
  const script = TALKS[key];
  const maxX = w.width - 8;
  const p = w.player;

  if (pick.join) {
    if (!w.recruited.includes(key)) {
      w.recruited.push(key);
      addScore(w, 100);
      ev.push(
        { t: "toast", msg: `${NAMES[key as HeroId] ?? key} se suma.` },
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
            ? "Paso 3. Disparale a Pablito en el muelle."
            : pick.item === "fuerza"
              ? "Héctor te banca. Falta la cédula en el patio."
              : pick.item === "cedula"
                ? "Cédula lista. Al aula."
                : pick.item === "terere"
                  ? "Tereré listo. Falta el carbón."
                  : pick.item === "carne"
                    ? "Carne lista. Falta el tereré."
                    : pick.item === "hielo"
                      ? "Hielo listo. Falta la carne."
                      : pick.item === "carbon"
                        ? "Carbón listo. ¡Al quincho!"
                        : pick.item === "apuntes"
                          ? "Apuntes listos. Falta el café."
                          : pick.item === "cafe"
                            ? "Café listo. Hablá con Héctor."
                            : pick.item === "chat"
                              ? "Paso 2. La foto está en el bosque."
                              : `${pick.item} listo.`;
    w.items.push(pick.item);
    addScore(w, 100);
    ev.push({ t: "toast", msg }, { t: "sfx", name: "pickup" }, { t: "hud" });
    return { next: "close" };
  }
  if (pick.calm) {
    const m = w.enemies.marcos;
    m.chasing = false;
    m.calm = true;
    m.caught = false;
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
    ev.push({ t: "toast", msg: "¡Corré! Saltá para esquivar." });
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
      w.examScore = 0;
      return { next: "talk", key: "examen" };
    }
    const score = w.examScore + (pick.exam === "ok" ? 1 : 0);
    w.examScore = score;
    if (lineIdx + 1 < script.length) return { next: "line" };
    if (score >= 2) {
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
