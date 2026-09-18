import { getSprite, type Sprite } from "./assets";
import {
  HAZARDS,
  HAZARD_BY_ID,
  HERO_BY_ID,
  NAMES,
  chapterOf,
  pickupSprite,
  type HeroId,
} from "./content";
import {
  canTalk,
  followers,
  interactTarget,
  isAlive,
  npcVisible,
  type Enemy,
  type World,
} from "./world";

export type RenderOptions = {
  gore: boolean;
  shake: boolean;
  /** Where the current objective is (world x) for the edge arrow. */
  objectiveX: number | null;
  /** Draw the "E · Hablar" style prompts (hidden on touch, where a button shows instead). */
  prompts: boolean;
};

const GIBS = ["/sprites/gib1.png", "/sprites/gib2.png", "/sprites/spray.png"];
const GROUND = 0.92; // feet line as a fraction of the canvas height (8vh above the bottom)

let bloodBlob: HTMLCanvasElement | null = null;
function bloodSprite() {
  if (bloodBlob || typeof document === "undefined") return bloodBlob;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 48;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(22, 14, 2, 32, 24, 30);
  grad.addColorStop(0, "#ff2a3a");
  grad.addColorStop(0.55, "#9b0b18");
  grad.addColorStop(1, "#4a040800");
  g.fillStyle = grad;
  g.beginPath();
  g.ellipse(32, 24, 30, 22, 0, 0, Math.PI * 2);
  g.fill();
  bloodBlob = c;
  return c;
}

type Frame = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  cam: number;
  t: number;
};

const X = (f: Frame, x: number) => (x - f.cam) * (f.W / 100);
const VH = (f: Frame, v: number) => (v * f.H) / 100;
const groundY = (f: Frame) => f.H * GROUND;

function drawSprite(
  f: Frame,
  sp: Sprite | null,
  cx: number,
  baseY: number,
  hPx: number,
  o: {
    flip?: boolean;
    rot?: number;
    scale?: number;
    alpha?: number;
    clipTop?: number;
    clipBottom?: number;
    flash?: number;
    dx?: number;
    dy?: number;
  } = {},
) {
  if (!sp) return;
  const { ctx } = f;
  const w = (hPx * sp.w) / sp.h;
  ctx.save();
  ctx.translate(cx + (o.dx ?? 0), baseY + (o.dy ?? 0));
  if (o.rot) ctx.rotate((o.rot * Math.PI) / 180);
  const s = o.scale ?? 1;
  ctx.scale(o.flip ? -s : s, s);
  if (o.alpha !== undefined) ctx.globalAlpha = Math.max(0, Math.min(1, o.alpha));
  const top = o.clipTop ?? 0;
  const bottom = o.clipBottom ?? 0;
  const sy = sp.h * top;
  const sh = sp.h * (1 - top - bottom);
  const dh = hPx * (1 - top - bottom);
  const dy = -hPx * (1 - top);
  ctx.drawImage(sp.img, 0, sy, sp.w, sh, -w / 2, dy, w, dh);
  if (o.flash) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (o.alpha ?? 1) * o.flash * 0.9;
    ctx.drawImage(sp.img, 0, sy, sp.w, sh, -w / 2, dy, w, dh);
  }
  ctx.restore();
}

function drawTag(
  f: Frame,
  text: string,
  cx: number,
  cy: number,
  o: { bg?: string; fg?: string; size?: number; pad?: number } = {},
) {
  const { ctx } = f;
  const size = o.size ?? 10;
  ctx.save();
  ctx.font = `700 ${size}px Figtree, "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(text).width;
  const pad = o.pad ?? 7;
  const w = tw + pad * 2;
  const h = size + pad;
  ctx.fillStyle = o.bg ?? "rgba(0,0,0,0.72)";
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = o.fg ?? "#ebe4d6";
  ctx.fillText(text, cx, cy + 0.5);
  ctx.restore();
}

/* ---------------- actors ---------------- */

type ActorAnim = {
  walk?: boolean;
  idle?: boolean;
  attackKind?: "punch" | "slash" | "aim";
  attackT?: number; // 0..1 progress
  cry?: boolean;
  flash?: number;
  alpha?: number;
};

function actorFrame(f: Frame, sprite: string, steps: string[] | undefined, walk: boolean) {
  if (walk && steps && steps.length) {
    const i = Math.floor(f.t * 8.7) % steps.length;
    return getSprite(steps[i]) ?? getSprite(sprite);
  }
  return getSprite(sprite);
}

function drawActor(
  f: Frame,
  sprite: string,
  steps: string[] | undefined,
  x: number,
  yVh: number,
  hVh: number,
  face: 1 | -1,
  a: ActorAnim = {},
) {
  const sp = actorFrame(f, sprite, steps, !!a.walk);
  const cx = X(f, x);
  const base = groundY(f) - VH(f, yVh);
  let dy = 0;
  let dx = 0;
  let rot = 0;
  if (a.idle && !a.walk) dy = Math.sin(f.t * 2.9 + x) * VH(f, 0.35);
  if (a.attackKind && a.attackT !== undefined && a.attackT < 1) {
    const bell = Math.sin(a.attackT * Math.PI);
    if (a.attackKind === "aim") {
      dx = -face * bell * f.W * 0.008;
      rot = -face * bell * 5;
    } else if (a.attackKind === "punch") {
      dx = face * bell * f.W * 0.02;
      rot = face * bell * 14;
    } else {
      dx = face * bell * f.W * 0.016;
      rot = face * bell * 22;
    }
  }
  if (a.cry) rot = Math.sin(f.t * 9) * 7;
  drawSprite(f, sp, cx, base, VH(f, hVh), {
    flip: face === 1,
    rot,
    dx,
    dy,
    flash: a.flash,
    alpha: a.alpha,
  });
}

function drawEnemy(f: Frame, w: World, e: Enemy) {
  if (e.gone || e.x > 900) return;
  const def = HAZARD_BY_ID[e.id];
  const face: 1 | -1 = e.x < w.player.x ? 1 : -1;
  const cx = X(f, e.x);
  const base = groundY(f) - VH(f, e.y);
  const H = VH(f, 30);
  const body = getSprite(def.sprite);

  if (e.exploding) {
    const p = Math.min(1, (w.t - e.explodeAt) / 0.8);
    if (e.torn) {
      drawSprite(f, body, cx - f.W * 0.03, base - VH(f, 6), H * 0.6, {
        flip: face === 1,
        rot: e.rot * 0.45 - 18,
        alpha: 1 - p,
        clipBottom: 0.52,
        flash: 0.5,
      });
      drawSprite(f, body, cx + f.W * 0.04, base + VH(f, 2), H * 0.53, {
        flip: face === 1,
        rot: e.rot * 0.7 + 22,
        alpha: 1 - p,
        clipTop: 0.48,
        flash: 0.5,
      });
    } else {
      drawSprite(f, body, cx, base, H, {
        flip: face === 1,
        rot: e.rot * 0.2,
        scale: 1 + p * 0.8,
        alpha: 1 - p,
        clipTop: e.headless ? 0.22 : 0,
        flash: 0.6,
      });
    }
    return;
  }

  if (e.fly || e.down) {
    if (e.torn) {
      drawSprite(f, body, cx - f.W * 0.03, base - VH(f, 6), H * 0.6, {
        flip: face === 1,
        rot: e.rot * 0.45 - 18,
        clipBottom: 0.52,
        flash: e.flash,
      });
      drawSprite(f, body, cx + f.W * 0.04, base + VH(f, 2), H * 0.53, {
        flip: face === 1,
        rot: e.rot * 0.7 + 22,
        clipTop: 0.48,
        flash: e.flash,
      });
    } else {
      drawSprite(f, body, cx, base, H, {
        flip: face === 1,
        rot: e.rot,
        flash: e.flash,
        alpha: e.down ? 0.92 : 1,
      });
    }
    return;
  }

  const walking = e.chasing && !e.calm && !e.cry;
  drawActor(f, def.sprite, def.steps, e.x, e.y, 30, face, {
    walk: walking,
    idle: !walking,
    cry: e.cry,
    flash: e.flash,
  });
  // Label + health pips.
  const top = base - H;
  const label = e.chasing
    ? `${def.name} · ${def.chaseLabel}`
    : e.calm
      ? `${def.name} · calmado`
      : def.name;
  drawTag(f, label, cx, top - 16, {
    bg: e.chasing ? "rgba(194,65,59,0.92)" : "rgba(0,0,0,0.72)",
    fg: e.chasing ? "#fff" : "#ebe4d6",
  });
  if (e.maxHp > 1 && !e.calm) {
    const { ctx } = f;
    const pw = 10;
    const total = e.maxHp * (pw + 3) - 3;
    for (let i = 0; i < e.maxHp; i++) {
      ctx.fillStyle = i < e.hp ? "#ff3b4a" : "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect(cx - total / 2 + i * (pw + 3), top - 6, pw, 4, 2);
      ctx.fill();
    }
  }
}

/* ---------------- main ---------------- */

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  w: World,
  W: number,
  H: number,
  opts: RenderOptions,
) {
  const ch = chapterOf(w.chapter);
  const f: Frame = { ctx, W, H, cam: w.camX, t: w.t };
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  /* shake */
  if (opts.shake && w.t < w.shakeUntil) {
    const k = ((w.shakeUntil - w.t) / 0.35) * w.shakePower;
    ctx.translate((Math.random() - 0.5) * k * 2, (Math.random() - 0.5) * k * 1.4);
  }

  /* backgrounds: only zones overlapping the camera */
  const first = Math.max(0, Math.floor(w.camX / 100));
  const last = Math.min(ch.zones.length - 1, Math.floor((w.camX + 100) / 100));
  for (let i = first; i <= last; i++) {
    const z = ch.zones[i];
    const sp = getSprite(z.bg);
    const zx = X(f, i * 100);
    if (!sp) {
      ctx.fillStyle = "#101820";
      ctx.fillRect(zx, 0, W + 2, H);
      continue;
    }
    const s = Math.max(W / sp.w, H / sp.h);
    const sw = W / s;
    const sh = H / s;
    ctx.drawImage(sp.img, (sp.w - sw) / 2, (sp.h - sh) / 2, sw, sh, zx, 0, W + 2, H);
  }

  /* props */
  for (const p of ch.props) {
    if (p.x < w.camX - 20 || p.x > w.camX + 120) continue;
    drawSprite(f, getSprite(p.src), X(f, p.x), H * 0.9, VH(f, p.h), { flip: p.flip });
  }

  /* grill / exam markers */
  if (ch.grillX) {
    drawSprite(f, getSprite("/sprites/fire.png"), X(f, ch.grillX), H * 0.84, VH(f, 16), {
      alpha: w.fire ? 1 : 0.45,
    });
    drawTag(f, w.fire ? "¡Asado!" : "El quincho", X(f, ch.grillX), H * 0.84 - VH(f, 19));
  }
  if (ch.examX) {
    const ready = ["apuntes", "cafe", "cedula", "fuerza"].every((i) => w.items.includes(i));
    drawTag(f, ready ? "Examen listo" : "El aula", X(f, ch.examX), H * 0.6, {
      bg: ready ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.72)",
      fg: ready ? "#0b0f14" : "#ebe4d6",
      size: 11,
    });
  }

  /* pickups */
  for (const p of ch.pickups) {
    if (w.items.includes(p.id) || p.x < w.camX - 10 || p.x > w.camX + 110) continue;
    const bob = Math.sin(w.t * 3.6 + p.x) * VH(f, 0.6);
    const size =
      p.kind === "coin"
        ? 24
        : p.kind === "ammo"
          ? 26
          : p.kind === "heal"
            ? 34
            : p.kind === "knife"
              ? 10
              : 38;
    const base = H * 0.84 + bob;
    drawSprite(f, getSprite(pickupSprite(p)), X(f, p.x), base, size, {
      rot: p.kind === "knife" ? -30 : 0,
    });
    if (p.kind !== "coin" && p.label) {
      drawTag(f, p.label, X(f, p.x), base + 12, {
        size: 9,
        pad: 5,
        bg: p.kind === "item" ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.6)",
        fg: p.kind === "item" ? "#0b0f14" : "#ebe4d6",
      });
    }
  }

  /* blood */
  if (opts.gore && w.blood.length) {
    const blob = bloodSprite();
    if (blob) {
      for (const b of w.blood) {
        if (b.x < w.camX - 10 || b.x > w.camX + 110) continue;
        const age = w.t - b.born;
        ctx.save();
        ctx.globalAlpha = age > 10 ? Math.max(0, 0.9 * (1 - (age - 10) / 4)) : 0.9;
        ctx.translate(X(f, b.x), H - VH(f, b.y));
        ctx.rotate((b.rot * Math.PI) / 180);
        ctx.drawImage(blob, -b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
    }
  }

  /* npcs */
  for (const n of ch.npcs) {
    if (!npcVisible(w, n.id)) continue;
    const nx = w.npcX[n.id];
    if (nx < w.camX - 20 || nx > w.camX + 120) continue;
    const hero = HERO_BY_ID[n.id];
    const face: 1 | -1 = nx < w.player.x ? 1 : -1;
    drawActor(f, hero.sprite, hero.steps, nx, 0, 32, face, { idle: true });
    const near = Math.abs(nx - w.player.x) < 14;
    drawTag(
      f,
      near && opts.prompts ? `${NAMES[n.id]} · E` : NAMES[n.id],
      X(f, nx),
      groundY(f) - VH(f, 34),
      {
        bg: near ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.72)",
        fg: near ? "#0b0f14" : "#ebe4d6",
      },
    );
  }

  /* followers */
  const p = w.player;
  const fl = followers(w);
  fl.forEach((id, i) => {
    const hero = HERO_BY_ID[id as HeroId];
    const fx = p.x - p.facing * (9 + i * 8);
    drawActor(f, hero.sprite, hero.steps, fx, 0, 26, p.facing, { walk: p.walking, idle: true });
  });

  /* enemies */
  for (const def of HAZARDS) drawEnemy(f, w, w.enemies[def.id]);

  /* Capi, the slime dog, next to Onichan */
  const oni = w.enemies.onichan;
  if (isAlive(oni)) {
    const capi = getSprite("/sprites/capi.png");
    const side = oni.x < p.x ? -12 : 12;
    const hop = oni.chasing
      ? Math.abs(Math.sin(w.t * 11)) * VH(f, 2)
      : Math.sin(w.t * 4.5) * VH(f, 0.8);
    const spit = w.t - oni.lastThrow < 0.32 ? 1.3 : 1;
    drawSprite(f, capi, X(f, oni.x + side), groundY(f) - VH(f, oni.y) - hop, VH(f, 12), {
      flip: side < 0,
      scale: spit,
      rot: oni.fly ? oni.rot : 0,
    });
  }

  /* projectiles */
  for (const b of w.books)
    drawSprite(f, getSprite("/sprites/book.png"), X(f, b.x), H - VH(f, b.y), VH(f, 7), {
      rot: b.rot,
    });
  for (const s of w.slimes)
    drawSprite(f, getSprite("/sprites/slime.png"), X(f, s.x), H - VH(f, s.y), VH(f, 3.4), {
      rot: (w.t * 900 + s.x * 30) % 360,
    });
  for (const s of w.shots)
    drawSprite(f, getSprite("/sprites/bullet.png"), X(f, s.x), H - VH(f, s.y) + 9, 18, {
      flip: s.face === 1,
    });

  /* gibs */
  if (opts.gore)
    for (const g of w.gibs)
      drawSprite(f, getSprite(GIBS[g.src]), X(f, g.x), H - VH(f, g.y) + 19, 38, { rot: g.rot });

  /* player */
  const attackT =
    p.attackUntil > w.t ? 1 - (p.attackUntil - w.t) / (p.attackKind === "pistol" ? 0.16 : 0.28) : 1;
  const invisible = w.t < p.invUntil && Math.floor(w.t * 18) % 2 === 0;
  const hero = HERO_BY_ID[w.hero];
  drawActor(f, hero.sprite, hero.steps, p.x, p.y, 34, p.facing, {
    walk: p.walking && attackT >= 1,
    idle: true,
    attackKind: p.attackKind === "pistol" ? "aim" : p.attackKind === "knife" ? "slash" : "punch",
    attackT,
    alpha: invisible ? 0.45 : 1,
    flash: w.t - p.hurtAt < 0.2 ? 0.8 : 0,
  });
  /* held weapon */
  if (p.weapon !== "fist") {
    const wsp = getSprite(p.weapon === "pistol" ? "/sprites/pistol.png" : "/sprites/knife.png");
    const kick = attackT < 1 ? Math.sin(attackT * Math.PI) : 0;
    const rot =
      p.weapon === "pistol"
        ? -kick * 18 * p.facing
        : attackT < 1
          ? (-80 + attackT * 150) * p.facing
          : 12 * p.facing;
    drawSprite(
      f,
      wsp,
      X(f, p.x + p.facing * 3.4),
      groundY(f) - VH(f, p.y + 20) + (p.weapon === "pistol" ? 12 : 8),
      p.weapon === "pistol" ? 38 : 12,
      { flip: p.facing === 1, rot, alpha: invisible ? 0.45 : 1 },
    );
  }

  /* fx */
  for (const e of w.fx) {
    const age = w.t - e.born;
    const cx = X(f, e.x);
    const cy = H - VH(f, e.y);
    if (e.kind === "pop" || e.kind === "heal") {
      const pr = age / 0.9;
      ctx.save();
      ctx.globalAlpha = 1 - pr;
      ctx.font = `800 ${Math.round(Math.min(W, H) * 0.028)}px Figtree, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = e.kind === "heal" ? "#8fd46a" : "#ffd27a";
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 3;
      ctx.strokeText(e.text ?? "", cx, cy - pr * VH(f, 8));
      ctx.fillText(e.text ?? "", cx, cy - pr * VH(f, 8));
      ctx.restore();
      continue;
    }
    const life =
      e.kind === "tracer"
        ? 0.16
        : e.kind === "muzzle"
          ? 0.2
          : e.kind === "slash"
            ? 0.32
            : e.kind === "boom"
              ? 0.55
              : 0.4;
    const pr = Math.min(1, age / life);
    if (pr >= 1) continue;
    const src =
      e.kind === "slash"
        ? "/sprites/slash.png"
        : e.kind === "muzzle"
          ? "/sprites/muzzle.png"
          : e.kind === "boom"
            ? "/sprites/boom.png"
            : e.kind === "tracer"
              ? "/sprites/tracer.png"
              : "/sprites/impact.png";
    const sp = getSprite(src);
    if (!sp) continue;
    if (e.kind === "tracer") {
      ctx.save();
      ctx.globalAlpha = 1 - pr;
      const tw = W * 0.3;
      const th = 14;
      ctx.translate(cx, cy);
      ctx.scale(e.face === 1 ? -1 : 1, 1);
      ctx.drawImage(sp.img, -tw / 2, -th / 2, tw, th);
      ctx.restore();
      continue;
    }
    const size = e.kind === "boom" ? 160 : e.kind === "slash" ? 110 : e.kind === "muzzle" ? 86 : 90;
    const scale = pr < 0.35 ? 0.6 + (pr / 0.35) * 0.55 : 1.15 + ((pr - 0.35) / 0.65) * 0.25;
    drawSprite(f, sp, cx, cy + size / 2, size, {
      scale,
      alpha: pr < 0.35 ? 1 : 1 - (pr - 0.35) / 0.65,
      flip: e.face === 1,
    });
  }

  /* interaction prompt above the player */
  const target = opts.prompts ? interactTarget(w) : null;
  if (target) {
    drawTag(f, `${target.verb} · ${target.label}`, X(f, p.x), groundY(f) - VH(f, p.y + 38), {
      bg: "rgba(212,164,90,0.96)",
      fg: "#0b0f14",
      size: 12,
      pad: 9,
    });
  }

  ctx.restore();

  /* colour grade (cheap full-frame blend instead of a CSS filter on the DOM) */
  ctx.save();
  if (ch.grade === "warm") {
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255,170,90,0.12)";
    ctx.fillRect(0, 0, W, H);
  } else if (ch.grade === "night") {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(120,140,210,0.55)";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  /* damage / slime vignette */
  const hurtAge = w.t - p.hurtAt;
  if (hurtAge < 0.35) {
    ctx.save();
    ctx.globalAlpha = (1 - hurtAge / 0.35) * 0.55;
    const g = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.3,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.7,
    );
    g.addColorStop(0, "rgba(180,0,20,0)");
    g.addColorStop(1, "rgba(180,0,20,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (w.t < w.slimedUntil) {
    ctx.save();
    ctx.globalAlpha = ((w.slimedUntil - w.t) / 0.5) * 0.35;
    ctx.fillStyle = "#8fd46a";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (p.hp <= p.maxHp * 0.25 && p.hp > 0) {
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(w.t * 5) * 0.08;
    const g = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.75,
    );
    g.addColorStop(0, "rgba(180,0,20,0)");
    g.addColorStop(1, "rgba(180,0,20,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* objective arrow at the screen edge */
  if (opts.objectiveX !== null) {
    const ox = opts.objectiveX;
    const off = ox < w.camX + 4 ? -1 : ox > w.camX + 96 ? 1 : 0;
    if (off !== 0) {
      const dist = Math.round(Math.abs(ox - p.x));
      const ex = off > 0 ? W - 30 : 30;
      const ey = H * 0.5;
      ctx.save();
      ctx.fillStyle = "rgba(212,164,90,0.95)";
      ctx.beginPath();
      if (off > 0) {
        ctx.moveTo(ex + 12, ey);
        ctx.lineTo(ex - 6, ey - 12);
        ctx.lineTo(ex - 6, ey + 12);
      } else {
        ctx.moveTo(ex - 12, ey);
        ctx.lineTo(ex + 6, ey - 12);
        ctx.lineTo(ex + 6, ey + 12);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawTag(f, `${dist} m`, ex, ey + 22, { bg: "rgba(0,0,0,0.7)", fg: "#ffd27a", size: 10 });
    }
  }

  /* subtle marker for talkable enemies */
  for (const def of HAZARDS) {
    const e = w.enemies[def.id];
    if (opts.prompts && canTalk(e) && !e.chasing && Math.abs(e.x - p.x) < 16) {
      drawTag(f, "E · Hablar", X(f, e.x), groundY(f) - VH(f, 44), {
        bg: "rgba(0,0,0,0.6)",
        size: 9,
      });
    }
  }
}
