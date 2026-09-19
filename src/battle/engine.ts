import { WEAPONS as BASE_WEAPONS } from "../game/content";
import {
  fighter,
  episode,
  boss,
  rivalFor,
  LOADOUT,
  type FighterId,
  type EpisodeId,
  type WeaponId,
  type Difficulty,
} from "./content";
import type { SfxName } from "../game/audio";

export const STAGE_WIDTH = 1500;
export const WORLD_WIDTH = 4650;
export const CHECKPOINTS = [1320, 2820] as const;
export type Action = "jump" | "dash" | "power" | "swap" | "grenade" | "interact";
export interface Input {
  move: number;
  attack: boolean;
  actions: Set<Action>;
}
export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  hp: number;
  maxHp: number;
  inv: number;
  dash: number;
  dashReady: number;
  powerReady: number;
  super: number;
  attackReady: number;
  combo: number;
  comboAt: number;
  shield: number;
  jumpBuffer: number;
  coyote: number;
  attackPose: number;
  buff: number;
}
export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  hp: number;
  maxHp: number;
  kind: "minion" | "boss";
  fighter: FighterId;
  face: 1 | -1;
  windup: number;
  ready: number;
  hit: number;
  slow: number;
  phase: number;
  pattern: number;
  charge: number;
  chargeDir: number;
  lives: number;
  maxLives: number;
}
export interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  enemy: boolean;
  kind:
    | "bullet"
    | "grenade"
    | "usb"
    | "wave"
    | "paper"
    | "holy"
    | "can"
    | "word"
    | "cane"
    | "cigarette"
    | "sling";
  color: string;
  radius: number;
  age: number;
  origin: number;
  hitIds: Set<number>;
}
export interface Effect {
  x: number;
  y: number;
  life: number;
  max: number;
  kind: "ring" | "spark" | "text" | "trail";
  color: string;
  size: number;
  text?: string;
  vx: number;
  vy: number;
}
export interface Drop {
  x: number;
  y: number;
  kind: "health" | "ammo" | "hype";
  taken: boolean;
}
export interface Platform {
  x: number;
  w: number;
  y: number;
}
export type GameEvent =
  | { type: "sfx"; name: SfxName }
  | { type: "talk"; npc: FighterId }
  | { type: "win" | "lose" }
  | { type: "toast"; text: string };
export interface World {
  hero: FighterId;
  level: EpisodeId;
  difficulty: Difficulty;
  player: Player;
  enemies: Enemy[];
  shots: Shot[];
  effects: Effect[];
  drops: Drop[];
  platforms: Platform[];
  t: number;
  stage: 0 | 1 | 2;
  spawned: number;
  score: number;
  kills: number;
  bestCombo: number;
  streak: number;
  streakAt: number;
  damageTaken: number;
  weapon: WeaponId;
  ammo: Record<WeaponId, number>;
  grenades: number;
  camera: number;
  viewWidth: number;
  shake: number;
  hitstop: number;
  ended: boolean;
  paused: boolean;
  events: GameEvent[];
  nextId: number;
  rng: number;
  seed: number;
  telegraphs: { x: number; w: number; until: number; fired: boolean }[];
}
export interface Snapshot {
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  super: number;
  cooldown: number;
  dashCooldown: number;
  weapon: WeaponId;
  ammo: number;
  grenades: number;
  time: number;
  stage: number;
  objective: string;
  interact: string | null;
  boss: {
    name: string;
    hp: number;
    maxHp: number;
    phase: number;
    lives: number;
    maxLives: number;
  } | null;
  progress: number;
  enemies: number;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function random(w: World) {
  w.rng ^= w.rng << 13;
  w.rng ^= w.rng >>> 17;
  w.rng ^= w.rng << 5;
  return (w.rng >>> 0) / 4294967296;
}
function event(w: World, name: SfxName) {
  w.events.push({ type: "sfx", name });
}
function effect(
  w: World,
  x: number,
  y: number,
  kind: Effect["kind"],
  color: string,
  size: number,
  life = 0.4,
  text?: string,
) {
  if (w.effects.length >= 120) w.effects.shift();
  w.effects.push({
    x,
    y,
    kind,
    color,
    size,
    life,
    max: life,
    text,
    vx: kind === "spark" ? (random(w) - 0.5) * 200 : 0,
    vy: kind === "spark" ? 80 + random(w) * 170 : kind === "text" ? 34 : 0,
  });
}
export function createWorld(
  hero: FighterId,
  level: EpisodeId,
  difficulty: Difficulty,
  seed = 20260919,
): World {
  const f = fighter(hero);
  const w: World = {
    hero,
    level,
    difficulty,
    player: {
      x: 100,
      y: 0,
      vx: 0,
      vy: 0,
      face: 1,
      hp: f.hp,
      maxHp: f.hp,
      inv: 0,
      dash: 0,
      dashReady: 0,
      powerReady: 0,
      super: 0,
      attackReady: 0,
      combo: 0,
      comboAt: 0,
      shield: 0,
      jumpBuffer: 0,
      coyote: 0.1,
      attackPose: 0,
      buff: 0,
    },
    enemies: [],
    shots: [],
    effects: [],
    drops: [],
    platforms: [
      { x: 420, w: 180, y: 78 },
      { x: 770, w: 140, y: 110 },
      { x: 1390, w: 190, y: 86 },
      { x: 1820, w: 160, y: 110 },
      { x: 2570, w: 170, y: 85 },
      { x: 3340, w: 190, y: 95 },
      { x: 3970, w: 150, y: 118 },
    ],
    t: 0,
    stage: 0,
    spawned: 0,
    score: 0,
    kills: 0,
    bestCombo: 0,
    streak: 0,
    streakAt: 0,
    damageTaken: 0,
    weapon: "ak",
    ammo: {
      fist: Infinity,
      knife: Infinity,
      bat: Infinity,
      pistol: 120,
      ak: 160,
      shotgun: 30,
      smg: 160,
      grenade: 4,
    },
    grenades: 4,
    camera: 0,
    viewWidth: 960,
    shake: 0,
    hitstop: 0,
    ended: false,
    paused: false,
    events: [],
    nextId: 1,
    rng: seed || 1,
    seed,
    telegraphs: [],
  };
  spawnStage(w);
  return w;
}
function spawn(w: World, x: number, kind: Enemy["kind"], id: FighterId, hp: number) {
  w.enemies.push({
    id: w.nextId++,
    x,
    y: 0,
    vx: 0,
    hp,
    maxHp: hp,
    kind,
    fighter: id,
    face: -1,
    windup: 0,
    ready: w.t + 0.8 + random(w),
    hit: 0,
    slow: 0,
    phase: 1,
    pattern: 0,
    charge: 0,
    chargeDir: -1,
    lives: kind === "boss" && w.level === 4 ? 2 : 1,
    maxLives: kind === "boss" && w.level === 4 ? 2 : 1,
  });
}
function spawnStage(w: World) {
  const start = w.stage * STAGE_WIDTH;
  const count = w.stage === 2 ? 3 : 6 + (w.level > 1 ? 1 : 0);
  for (let i = 0; i < count; i++)
    spawn(w, start + 380 + i * 130, "minion", rivalFor(w.level, w.hero), 42 + w.level * 7);
  if (w.stage === 2) {
    spawn(w, 4200, "boss", rivalFor(w.level, w.hero), 760 + w.level * 170);
    w.events.push({
      type: "toast",
      text: `${boss(w.level).name} · JEFE FINAL`,
    });
    event(w, "bossIntro");
  }
  w.spawned++;
  w.drops.push(
    { x: start + 610, y: 88, kind: "ammo", taken: false },
    { x: start + 840, y: 0, kind: "health", taken: false },
  );
}
export function interactLabel(w: World): string | null {
  if (w.stage >= 2) return null;
  const target = w.stage === 0 ? CHECKPOINTS[0] : CHECKPOINTS[1];
  if (Math.abs(w.player.x - target) < 125 && w.enemies.every((e) => e.hp <= 0))
    return w.level === 1
      ? "Activar antena"
      : w.level === 2
        ? "Recuperar USB"
        : w.level === 3
          ? "Autorizar sello"
          : "Abrir acceso";
  return null;
}
export function snapshot(w: World): Snapshot {
  const p = w.player;
  const activeBoss = w.enemies.find((e) => e.kind === "boss" && e.hp > 0);
  const alive = w.enemies.filter((e) => e.hp > 0).length;
  return {
    hp: Math.ceil(p.hp),
    maxHp: p.maxHp,
    score: w.score,
    combo: w.streak,
    super: Math.floor(p.super),
    cooldown: Math.max(0, p.powerReady - w.t),
    dashCooldown: Math.max(0, p.dashReady - w.t),
    weapon: w.weapon,
    ammo: w.ammo[w.weapon],
    grenades: w.grenades,
    time: w.t,
    stage: w.stage,
    objective:
      w.stage === 2
        ? `Derrotá a ${boss(w.level).name}`
        : alive > 0
          ? `Despejá la zona · ${alive} enemigo${alive === 1 ? "" : "s"}`
          : episode(w.level).objectives[w.stage],
    interact: interactLabel(w),
    boss: activeBoss
      ? {
          name: boss(w.level).name,
          hp: Math.ceil(activeBoss.hp),
          maxHp: activeBoss.maxHp,
          phase: activeBoss.phase,
          lives: activeBoss.lives,
          maxLives: activeBoss.maxLives,
        }
      : null,
    progress: clamp(
      (w.stage +
        (alive === 0 ? 0.8 : Math.max(0, (p.x - w.stage * STAGE_WIDTH) / STAGE_WIDTH) * 0.7)) /
        3,
      0,
      1,
    ),
    enemies: alive,
  };
}
function hitEnemy(w: World, e: Enemy, damage: number, knock = 0) {
  if (e.hp <= 0) return;
  e.hp -= damage;
  e.hit = w.t + 0.12;
  e.x = clamp(e.x + knock, w.stage * STAGE_WIDTH + 30, WORLD_WIDTH - 80);
  w.player.super = clamp(w.player.super + (e.kind === "minion" ? 3 : 1.5), 0, 100);
  effect(w, e.x, e.y + 65, "spark", fighter(w.hero).color, 5, 0.25);
  if (damage >= 22)
    effect(w, e.x, e.y + 115, "text", "#fff3dc", 16, 0.55, String(Math.round(damage)));
  if (e.hp <= 0) {
    if (e.kind === "boss" && e.lives > 1) {
      e.lives--;
      e.hp = e.maxHp;
      e.phase = 3;
      e.hit = w.t + 1;
      e.ready = w.t + 1.4;
      e.pattern = 0;
      w.shots = [];
      w.shake = 0.45;
      effect(w, e.x, 90, "ring", "#ff3b30", 220, 1.1);
      w.events.push({ type: "toast", text: "EL DICTADOR · SEGUNDA VIDA" });
      event(w, "bossIntro");
      return;
    }
    e.hp = 0;
    w.kills++;
    w.streak = w.t - w.streakAt < 5 ? w.streak + 1 : 1;
    w.streakAt = w.t;
    w.bestCombo = Math.max(w.bestCombo, w.streak);
    w.score += (e.kind === "minion" ? 150 : 1500) * (1 + Math.min(4, w.streak - 1) * 0.25);
    w.player.super = clamp(w.player.super + 10, 0, 100);
    event(w, "ko");
    for (let i = 0; i < 8; i++) effect(w, e.x, e.y + 40, "spark", fighter(w.hero).color, 4, 0.6);
    if (e.kind === "minion" && random(w) < 0.45)
      w.drops.push({ x: e.x, y: 0, kind: random(w) < 0.45 ? "health" : "ammo", taken: false });
    if (e.kind === "boss" && w.stage === 2) {
      w.ended = true;
      w.score = Math.round(w.score + Math.max(0, 900 - w.t * 2) + w.player.hp * 5);
      w.events.push({ type: "win" });
      event(w, "win");
    }
  }
}
function hurt(w: World, amount: number, from: number) {
  const p = w.player;
  if (w.t < p.inv || w.ended) return;
  if (p.shield > w.t) {
    effect(w, p.x, p.y + 55, "ring", "#83caa8", 70, 0.35);
    p.inv = w.t + 0.18;
    event(w, "blip");
    return;
  }
  const damage = amount * (w.difficulty === "tranqui" ? 0.58 : 1);
  p.hp = Math.max(0, p.hp - damage);
  w.damageTaken += damage;
  p.inv = w.t + 0.72;
  p.vx = (p.x > from ? 1 : -1) * 180;
  w.streak = 0;
  w.shake = 0.18;
  effect(w, p.x, p.y + 85, "text", "#ff725f", 20, 0.5, `−${Math.ceil(damage)}`);
  event(w, "hurt");
  if (p.hp <= 0) {
    w.ended = true;
    w.events.push({ type: "lose" });
    event(w, "ko");
  }
}
function shoot(w: World, s: Omit<Shot, "age" | "origin" | "hitIds">) {
  if (w.shots.length < 80) w.shots.push({ ...s, age: 0, origin: s.x, hitIds: new Set() });
}
function attack(w: World) {
  const p = w.player;
  if (w.t < p.attackReady) return;
  const base = BASE_WEAPONS[w.weapon];
  if (w.ammo[w.weapon] <= 0) {
    p.attackReady = w.t + 0.25;
    const next = LOADOUT.find((id) => w.ammo[id] > 0)!;
    w.weapon = next;
    event(w, "empty");
    w.events.push({
      type: "toast",
      text: `Sin munición · ${next === "bat" ? "Bate listo" : "Arma cambiada"}`,
    });
    return;
  }
  p.attackReady = w.t + base.cooldown;
  p.attackPose = w.t + 0.15;
  const boosted = p.buff > w.t ? 1.5 : 1;
  if (base.kind === "melee") {
    p.combo = w.t - p.comboAt < 0.8 ? (p.combo % 3) + 1 : 1;
    p.comboAt = w.t;
    const dmg = base.dmg * 18 * (p.combo === 3 ? 1.7 : 1) * boosted;
    const reach = (base.reach ?? 14) * 5;
    for (const e of w.enemies)
      if (
        e.hp > 0 &&
        Math.abs(e.x - p.x) < reach &&
        Math.abs(e.y - p.y) < 95 &&
        (e.x - p.x) * p.face > -25
      )
        hitEnemy(w, e, dmg, p.face * (p.combo === 3 ? 36 : 12));
    effect(w, p.x + p.face * 45, p.y + 60, "ring", fighter(w.hero).color, reach * 0.6, 0.18);
    event(w, w.weapon === "bat" ? "bat" : w.weapon === "knife" ? "slash" : "punch");
  } else {
    w.ammo[w.weapon]--;
    const pellets = w.weapon === "shotgun" ? 5 : 1;
    for (let i = 0; i < pellets; i++) {
      const target = w.enemies
        .filter((e) => e.hp > 0 && (e.x - p.x) * p.face > 0 && Math.abs(e.x - p.x) < 660)
        .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
      const dx = target ? Math.abs(target.x - p.x) : 400;
      const aim = target ? clamp((target.y + 50 - (p.y + 60)) / Math.max(60, dx), -0.26, 0.26) : 0;
      shoot(w, {
        x: p.x + p.face * 32,
        y: p.y + 60,
        vx: p.face * (w.weapon === "shotgun" ? 760 : 960),
        vy: (aim + (w.weapon === "shotgun" ? (i - 2) * 0.1 : (random(w) - 0.5) * 0.025)) * 960,
        life: w.weapon === "shotgun" ? 0.48 : 0.85,
        damage:
          (w.weapon === "pistol"
            ? 20
            : w.weapon === "smg"
              ? 11
              : w.weapon === "shotgun"
                ? 13
                : 17) * boosted,
        enemy: false,
        kind: "bullet",
        color: "#ffe49a",
        radius: 3,
      });
    }
    effect(w, p.x + p.face * 45, p.y + 60, "spark", "#ffe49a", 9, 0.08);
    event(
      w,
      w.weapon === "shotgun"
        ? "shotgun"
        : w.weapon === "smg"
          ? "smg"
          : w.weapon === "ak"
            ? "ak"
            : "shot",
    );
  }
}
function grenade(w: World) {
  const p = w.player;
  if (w.grenades <= 0) return;
  w.grenades--;
  shoot(w, {
    x: p.x,
    y: p.y + 65,
    vx: p.face * 360,
    vy: 300,
    life: 1.1,
    damage: 90,
    enemy: false,
    kind: "grenade",
    color: "#f6e75a",
    radius: 8,
  });
  event(w, "grenade");
}
function blast(w: World, x: number, y: number, r: number, damage: number, color: string) {
  effect(w, x, y, "ring", color, r, 0.45);
  w.shake = 0.16;
  for (const e of w.enemies)
    if (e.hp > 0 && Math.hypot(e.x - x, e.y + 45 - y) < r)
      hitEnemy(w, e, damage, (e.x > x ? 1 : -1) * 25);
  for (let i = 0; i < 14; i++) effect(w, x, y, "spark", color, 5, 0.7);
}
export function activatePower(w: World) {
  const p = w.player;
  const f = fighter(w.hero);
  const ultimate = p.super >= 100;
  if (!ultimate && w.t < p.powerReady) return;
  if (ultimate) p.super = 0;
  else p.powerReady = w.t + f.cooldown;
  p.attackPose = w.t + 0.35;
  p.inv = Math.max(p.inv, w.t + 0.3);
  event(w, "stomp");
  effect(w, p.x, p.y + 155, "text", f.color, 22, 1, ultimate ? f.superName : f.power);
  if (ultimate) {
    p.buff = w.t + 5;
    p.shield = w.t + 1;
    switch (w.hero) {
      case "masivo":
        blast(w, p.x, 45, 430, 170, f.color);
        break;
      case "onichan":
        for (let i = 0; i < 3; i++)
          shoot(w, {
            x: p.x + i * 25,
            y: 40 + i * 35,
            vx: p.face * 580,
            vy: 0,
            life: 1.5,
            damage: 80,
            enemy: false,
            kind: "wave",
            color: f.color,
            radius: 28,
          });
        break;
      case "anatomic":
        for (const e of w.enemies)
          if (e.hp > 0) {
            blast(w, e.x, 55, 90, 95, f.color);
            e.slow = w.t + 3;
          }
        break;
      case "comadre":
        blast(w, p.x, 80, 650, 155, f.color);
        break;
      case "papu":
        shoot(w, {
          x: p.x,
          y: 35,
          vx: p.face * 650,
          vy: 0,
          life: 1.8,
          damage: 180,
          enemy: false,
          kind: "wave",
          color: f.color,
          radius: 50,
        });
        break;
      case "secre":
        for (const e of w.enemies) {
          e.slow = w.t + 5;
          e.ready = Math.max(e.ready, w.t + 2.2);
        }
        blast(w, p.x, 60, 600, 120, f.color);
        break;
    }
    return;
  }
  switch (w.hero) {
    case "masivo":
      p.dash = w.t + 0.3;
      p.inv = w.t + 0.4;
      blast(w, p.x + p.face * 115, 50, 170, 80, f.color);
      break;
    case "onichan":
      p.x = clamp(p.x + p.face * 155, w.stage * STAGE_WIDTH + 30, (w.stage + 1) * STAGE_WIDTH - 20);
      p.inv = w.t + 1;
      blast(w, p.x, 45, 140, 55, f.color);
      break;
    case "anatomic":
      p.shield = w.t + 3.5;
      blast(w, p.x, 50, 175, 40, f.color);
      break;
    case "comadre":
      blast(w, p.x + p.face * 125, 65, 250, 65, f.color);
      break;
    case "papu":
      shoot(w, {
        x: p.x,
        y: p.y + 65,
        vx: p.face * 570,
        vy: 0,
        life: 1.5,
        damage: 55,
        enemy: false,
        kind: "usb",
        color: f.color,
        radius: 14,
      });
      break;
    case "secre":
      for (const e of w.enemies)
        if (Math.abs(e.x - p.x) < 430) {
          e.slow = w.t + 4;
          hitEnemy(w, e, 40);
        }
      effect(w, p.x, 15, "ring", f.color, 430, 0.7);
      break;
  }
}
export function applyChoice(w: World, choice: number) {
  if (choice === 0) {
    w.player.shield = w.t + 8;
    for (const id of LOADOUT)
      if (Number.isFinite(w.ammo[id])) w.ammo[id] += id === "shotgun" ? 12 : 65;
    w.grenades = Math.min(6, w.grenades + 1);
  } else if (choice === 1) w.player.super = 100;
  else w.player.hp = Math.min(w.player.maxHp, w.player.hp + 65);
  w.paused = false;
  event(w, "pickup");
}
function advance(w: World) {
  if (!interactLabel(w)) return;
  w.stage = (w.stage + 1) as 1 | 2;
  w.score += 500;
  w.player.hp = Math.min(w.player.maxHp, w.player.hp + 22);
  w.player.inv = w.t + 2;
  w.shots = [];
  w.enemies = [];
  spawnStage(w);
  w.paused = true;
  const npc =
    episode(w.level).npc === w.hero
      ? w.hero === "secre"
        ? "comadre"
        : "secre"
      : episode(w.level).npc;
  w.events.push({ type: "talk", npc });
  event(w, "recruit");
}
function enemyStep(w: World, e: Enemy, dt: number) {
  if (e.hp <= 0) return;
  const p = w.player;
  const distance = Math.abs(e.x - p.x);
  e.face = e.x > p.x ? -1 : 1;
  e.phase =
    e.kind === "minion"
      ? 1
      : e.lives < e.maxLives
        ? 3
        : e.hp / e.maxHp > 0.66
          ? 1
          : e.hp / e.maxHp > 0.33
            ? 2
            : 3;
  const slow = e.slow > w.t ? 0.3 : 1;
  if (e.charge > w.t) {
    e.x += e.chargeDir * 470 * dt * slow;
    if (distance < 65 && Math.abs(p.y - e.y) < 90) hurt(w, 24, e.x);
    return;
  }
  if (e.windup > 0) {
    if (w.t >= e.windup) {
      e.windup = 0;
      e.ready = w.t + (e.kind === "minion" ? 1.65 : 1.55 - e.phase * 0.16) / slow;
      if (e.kind === "boss") {
        const pattern = e.pattern++ % 3;
        if (w.level === 1) {
          if (pattern === 0) {
            for (let i = 0; i < 2 + e.phase; i++)
              shoot(w, {
                x: e.x - 35,
                y: 42 + i * 34,
                vx: e.face * (330 + e.phase * 25),
                vy: 0,
                life: 3,
                damage: 14,
                enemy: true,
                kind: "holy",
                color: "#f6e75a",
                radius: 10,
              });
          } else if (pattern === 1) {
            if (w.enemies.filter((enemy) => enemy.kind === "minion" && enemy.hp > 0).length < 4) {
              spawn(
                w,
                clamp(e.x + e.face * 150, STAGE_WIDTH * 2 + 60, WORLD_WIDTH - 180),
                "minion",
                e.fighter,
                62,
              );
              effect(w, e.x + e.face * 140, 65, "ring", "#f6e75a", 75, 0.55);
              w.events.push({ type: "toast", text: "LUISON INVOCÓ OTRA CRIATURA" });
            }
          } else {
            for (let i = 0; i < e.phase + 1; i++)
              w.telegraphs.push({
                x: clamp(p.x + (i - 1) * 150, STAGE_WIDTH * 2 + 60, WORLD_WIDTH - 170),
                w: 62,
                until: w.t + 0.9,
                fired: false,
              });
          }
        } else if (w.level === 2) {
          if (pattern === 0) {
            for (let i = 0; i < 3 + e.phase; i++)
              shoot(w, {
                x: e.x,
                y: 45 + i * 25,
                vx: e.face * (285 + i * 18),
                vy: (i - 2) * 25,
                life: 3,
                damage: 13,
                enemy: true,
                kind: "can",
                color: "#efb764",
                radius: 10,
              });
          } else if (pattern === 1) {
            e.charge = w.t + 0.72;
            e.chargeDir = e.face;
          } else {
            for (let i = 0; i < e.phase + 2; i++)
              w.telegraphs.push({
                x: clamp(p.x + (i - 1.5) * 115, STAGE_WIDTH * 2 + 60, WORLD_WIDTH - 170),
                w: 48,
                until: w.t + 0.78,
                fired: false,
              });
          }
        } else if (w.level === 3 && pattern === 0) {
          for (let i = 0; i < 3 + e.phase; i++)
            shoot(w, {
              x: e.x - 30,
              y: 55 + i * 26,
              vx: e.face * (290 + e.phase * 24),
              vy: (i - 2) * 12,
              life: 3,
              damage: 15,
              enemy: true,
              kind: "word",
              color: "#b578ff",
              radius: 8,
            });
        } else if (w.level === 3 && pattern === 1) {
          shoot(w, {
            x: e.x,
            y: 24,
            vx: e.face * 390,
            vy: 0,
            life: 3,
            damage: 20,
            enemy: true,
            kind: "wave",
            color: "#b578ff",
            radius: 24,
          });
        } else if (
          w.level === 3 &&
          w.enemies.filter((enemy) => enemy.kind === "minion" && enemy.hp > 0).length < 5
        ) {
          for (let i = 0; i < Math.min(2, e.phase); i++)
            spawn(
              w,
              clamp(e.x + e.face * (130 + i * 85), STAGE_WIDTH * 2 + 60, WORLD_WIDTH - 180),
              "minion",
              e.fighter,
              68,
            );
          effect(w, e.x, 75, "ring", "#b578ff", 105, 0.55);
          w.events.push({ type: "toast", text: "EL CHAT POSEYÓ LOS MICRÓFONOS" });
        } else if (w.level === 4 && pattern === 0) {
          for (let i = 0; i < 2 + e.phase; i++)
            shoot(w, {
              x: e.x - 30,
              y: 58 + i * 24,
              vx: e.face * (330 + i * 22),
              vy: (i - 1.5) * 18,
              life: 3,
              damage: 17,
              enemy: true,
              kind: "sling",
              color: "#e8483f",
              radius: 9,
            });
        } else if (w.level === 4 && pattern === 1) {
          e.charge = w.t + (e.lives === 1 ? 1.05 : 0.72);
          e.chargeDir = e.face;
          w.events.push({ type: "toast", text: "¡CARGA DE TANQUETA!" });
        } else if (
          w.level === 4 &&
          w.enemies.filter((enemy) => enemy.kind === "minion" && enemy.hp > 0).length < 6
        ) {
          for (let i = 0; i < 2; i++)
            spawn(
              w,
              clamp(e.x + e.face * (150 + i * 100), STAGE_WIDTH * 2 + 60, WORLD_WIDTH - 180),
              "minion",
              e.fighter,
              78,
            );
          w.events.push({ type: "toast", text: "¡LLEGARON MÁS PYRAGUES!" });
        }
        event(w, "boom");
      } else if (w.level === 1 && distance < 92 && p.y < 100) {
        hurt(w, 15, e.x);
        e.charge = w.t + 0.22;
        e.chargeDir = e.face;
        event(w, "slash");
      } else {
        const minionKind =
          w.level === 2
            ? "can"
            : w.level === 3
              ? "word"
              : w.level === 4
                ? e.pattern++ % 2
                  ? "cigarette"
                  : "cane"
                : "holy";
        shoot(w, {
          x: e.x,
          y: 52,
          vx: e.face * (w.level === 1 ? 250 : 285),
          vy: 0,
          life: 2.4,
          damage: 10 + w.level,
          enemy: true,
          kind: minionKind,
          color: boss(w.level).color,
          radius: 7,
        });
        if (w.level === 4 && e.pattern % 3 === 0)
          effect(w, e.x, 145, "text", "#fff3dc", 15, 0.9, "¡VOTÁ POR LOS COLOO!");
        event(w, w.level === 1 ? "slash" : "shot");
      }
    }
    return;
  }
  if (e.kind === "minion" && distance > (w.level === 1 ? 70 : 170) && distance < 820)
    e.x += e.face * (75 + w.level * 8) * dt * slow;
  if (e.kind === "boss" && distance > 280 && distance < 900)
    e.x += e.face * (58 + e.phase * 8) * dt * slow;
  e.x = clamp(e.x, w.stage * STAGE_WIDTH + 35, WORLD_WIDTH - 70);
  if (distance < 780 && w.t > e.ready)
    e.windup = w.t + (e.kind === "minion" ? 0.62 : 0.92 - e.phase * 0.08) / slow;
}
export function step(w: World, input: Input, dt: number) {
  if (w.ended || w.paused) return;
  w.t += dt;
  const p = w.player;
  w.shake = Math.max(0, w.shake - dt);
  if (w.t - w.streakAt > 5) w.streak = 0;
  if (input.actions.has("swap")) {
    w.weapon = LOADOUT[(LOADOUT.indexOf(w.weapon) + 1) % LOADOUT.length];
    event(w, "swap");
  }
  if (input.actions.has("grenade")) grenade(w);
  if (input.actions.has("power")) activatePower(w);
  if (input.actions.has("interact")) {
    advance(w);
    if (w.paused) return;
  }
  if (input.actions.has("jump")) p.jumpBuffer = 0.12;
  else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  if (p.y <= 0.01) p.coyote = 0.1;
  else p.coyote = Math.max(0, p.coyote - dt);
  if (input.actions.has("dash") && w.t >= p.dashReady) {
    p.dash = w.t + 0.16;
    p.dashReady = w.t + 0.7;
    p.inv = w.t + 0.22;
    event(w, "dash");
  }
  if (input.move !== 0) p.face = input.move > 0 ? 1 : -1;
  const dashing = p.dash > w.t;
  const speed = fighter(w.hero).speed;
  if (dashing) {
    p.vx = p.face * speed * 2.6;
    effect(w, p.x, p.y, "trail", fighter(w.hero).color, 1, 0.17);
  } else p.vx += (input.move * speed - p.vx) * Math.min(1, (p.y === 0 ? 20 : 10) * dt);
  p.x = clamp(
    p.x + p.vx * dt,
    w.stage === 0 ? 35 : w.stage * STAGE_WIDTH - 220,
    w.stage === 2 ? WORLD_WIDTH - 40 : (w.stage + 1) * STAGE_WIDTH - 35,
  );
  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = 535;
    p.jumpBuffer = 0;
    p.coyote = 0;
    event(w, "jump");
  }
  const previousY = p.y;
  p.vy -= 1450 * dt;
  p.y += p.vy * dt;
  if (p.vy <= 0)
    for (const platform of w.platforms) {
      if (
        p.x > platform.x - 12 &&
        p.x < platform.x + platform.w + 12 &&
        previousY >= platform.y &&
        p.y <= platform.y
      ) {
        p.y = platform.y;
        p.vy = 0;
        p.coyote = 0.1;
      }
    }
  if (p.y <= 0) {
    p.y = 0;
    p.vy = 0;
  }
  if (input.attack) attack(w);
  for (const e of w.enemies) enemyStep(w, e, dt);
  for (const s of w.shots) {
    const oldX = s.x;
    s.age += dt;
    s.life -= dt;
    if (s.kind === "grenade") {
      s.vy -= 850 * dt;
      if (s.y <= 7) {
        s.y = 8;
        s.vy = Math.abs(s.vy) * 0.42;
        s.vx *= 0.75;
      }
    }
    if (s.kind === "usb" && s.age > 0.7 && Math.sign(s.vx) === Math.sign(s.x - s.origin)) {
      s.vx *= -1;
      s.hitIds.clear();
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.kind === "grenade" && s.life <= 0) {
      blast(w, s.x, Math.max(25, s.y), 190, s.damage, s.color);
      event(w, "explode");
    }
    if (s.life <= 0) continue;
    if (s.enemy) {
      if (Math.abs(s.x - p.x) < s.radius + 20 && Math.abs(s.y - (p.y + 45)) < s.radius + 43) {
        hurt(w, s.damage, s.x);
        s.life = 0;
      }
    } else if (s.kind !== "grenade") {
      for (const e of w.enemies) {
        if (e.hp <= 0 || s.hitIds.has(e.id)) continue;
        const low = Math.min(oldX, s.x) - s.radius - 22,
          high = Math.max(oldX, s.x) + s.radius + 22;
        if (
          e.x > low &&
          e.x < high &&
          Math.abs(s.y - (e.y + 50)) < s.radius + (e.kind === "boss" ? 100 : 47)
        ) {
          hitEnemy(w, e, s.damage, Math.sign(s.vx) * 3);
          s.hitIds.add(e.id);
          if (s.kind === "bullet") {
            s.life = 0;
            break;
          }
        }
      }
    }
  }
  w.shots = w.shots.filter((s) => s.life > 0 && s.x > 0 && s.x < WORLD_WIDTH + 100);
  for (const mark of w.telegraphs) {
    if (!mark.fired && w.t >= mark.until) {
      mark.fired = true;
      if (Math.abs(p.x - mark.x) < mark.w && p.y < 155) hurt(w, 25, mark.x);
      effect(w, mark.x, 60, "ring", "#ff725f", 95, 0.4);
    }
  }
  w.telegraphs = w.telegraphs.filter((m) => w.t < m.until + 0.4);
  for (const drop of w.drops) {
    if (drop.taken || Math.abs(drop.x - p.x) > 46 || Math.abs(drop.y - p.y) > 100) continue;
    drop.taken = true;
    w.score += 25;
    if (drop.kind === "health") {
      p.hp = Math.min(p.maxHp, p.hp + 30);
      effect(w, p.x, p.y + 110, "text", "#83caa8", 18, 0.7, "+30 VIDA");
      event(w, "heal");
    } else {
      for (const id of LOADOUT)
        if (Number.isFinite(w.ammo[id])) w.ammo[id] += id === "shotgun" ? 8 : 45;
      event(w, "pickup");
      effect(w, p.x, p.y + 110, "text", "#f6e75a", 18, 0.7, "MUNICIÓN");
    }
  }
  for (const fx of w.effects) {
    fx.life -= dt;
    fx.x += fx.vx * dt;
    fx.y += fx.vy * dt;
    if (fx.kind === "spark") fx.vy -= 400 * dt;
  }
  w.effects = w.effects.filter((fx) => fx.life > 0);
  const target = clamp(p.x - w.viewWidth * 0.38, 0, WORLD_WIDTH - w.viewWidth);
  w.camera += (target - w.camera) * Math.min(1, 8 * dt);
}
export function drainEvents(w: World) {
  const events = w.events;
  w.events = [];
  return events;
}
