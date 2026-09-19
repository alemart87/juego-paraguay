import { getSprite, type Sprite } from "./assets";
import {
  HAZARDS,
  HAZARD_BY_ID,
  HERO_BY_ID,
  NAMES,
  chapterOf,
  pickupSprite,
  type HeroId,
  type WeaponId,
} from "./content";
import {
  canTalk,
  followerX,
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
  /** Pixels per world unit. */
  unit: number;
  /** Pixels per "vh" of the reference 16:9 layout (keeps proportions on any screen). */
  unitY: number;
  /** Visible world units. */
  viewW: number;
  /** Feet line in pixels. */
  ground: number;
};

/** Visible world units for a canvas size: the full 100 in landscape, fewer in portrait so sprites stay readable. */
export function viewWidthFor(W: number, H: number) {
  if (H <= W * 1.1) return 100;
  // Portrait: phones show 50 world units so characters stay big; tablets 62.
  return W < 560 ? 50 : 62;
}

const X = (f: Frame, x: number) => (x - f.cam) * f.unit;
const VW = (f: Frame, v: number) => v * f.unit;
const VH = (f: Frame, v: number) => v * f.unitY;
const groundY = (f: Frame) => f.ground;
/** Screen y for a "vh above the screen bottom" coordinate (feet stand at 8). */
const Y = (f: Frame, v: number) => f.ground - f.unitY * (v - 8);

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
    scaleY?: number;
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
  ctx.scale(o.flip ? -s : s, s * (o.scaleY ?? 1));
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

function drawBubble(f: Frame, text: string, cx: number, cy: number, hot = false) {
  const { ctx } = f;
  ctx.save();
  ctx.font = `700 11px Figtree, "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(text).width;
  const w = tw + 18;
  const h = 22;
  const x = cx - w / 2;
  const y = cy - h;
  ctx.fillStyle = hot ? "#ffe8e8" : "#fff8ee";
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.moveTo(cx - 5, y + h);
  ctx.lineTo(cx, y + h + 7);
  ctx.lineTo(cx + 5, y + h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1b1410";
  ctx.fillText(text, cx, cy - h / 2 + 0.5);
  ctx.restore();
}

/* ---------------- procedural weapons ---------------- */

/** Draws a weapon centred at the origin, pointing to +x, about `len` px long. */
function drawWeaponShape(ctx: CanvasRenderingContext2D, id: WeaponId, len: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (id === "bat") {
    const g = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
    g.addColorStop(0, "#8a5a2b");
    g.addColorStop(1, "#d9a066");
    ctx.strokeStyle = g;
    ctx.lineWidth = len * 0.16;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len * 0.1, 0);
    ctx.stroke();
    ctx.lineWidth = len * 0.26;
    ctx.beginPath();
    ctx.moveTo(len * 0.05, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = "#2b1a0e";
    ctx.lineWidth = len * 0.05;
    ctx.beginPath();
    ctx.moveTo(-len / 2 + 2, 0);
    ctx.lineTo(-len / 2 + 8, 0);
    ctx.stroke();
  } else if (id === "shotgun") {
    ctx.fillStyle = "#5a3a1e";
    ctx.beginPath();
    ctx.roundRect(-len / 2, -len * 0.09, len * 0.38, len * 0.18, 3);
    ctx.fill();
    ctx.fillStyle = "#2f3237";
    ctx.beginPath();
    ctx.roundRect(-len * 0.15, -len * 0.07, len * 0.65, len * 0.09, 2);
    ctx.roundRect(-len * 0.15, 0.02 * len, len * 0.65, len * 0.08, 2);
    ctx.fill();
    ctx.fillStyle = "#8a6a3a";
    ctx.beginPath();
    ctx.roundRect(len * 0.05, -len * 0.1, len * 0.22, len * 0.2, 3);
    ctx.fill();
  } else if (id === "ak") {
    // Wooden stock and handguard, dark receiver, curved magazine.
    ctx.fillStyle = "#7a4a22";
    ctx.beginPath();
    ctx.roundRect(-len / 2, -len * 0.07, len * 0.28, len * 0.15, 3);
    ctx.fill();
    ctx.fillStyle = "#2a2d31";
    ctx.beginPath();
    ctx.roundRect(-len * 0.24, -len * 0.09, len * 0.42, len * 0.17, 2);
    ctx.fill();
    ctx.fillStyle = "#8a5a2a";
    ctx.beginPath();
    ctx.roundRect(len * 0.14, -len * 0.07, len * 0.2, len * 0.13, 2);
    ctx.fill();
    ctx.fillStyle = "#3a3f47";
    ctx.beginPath();
    ctx.roundRect(len * 0.3, -len * 0.035, len * 0.2, len * 0.07, 2);
    ctx.fill();
    ctx.fillStyle = "#1b1d21";
    ctx.beginPath();
    ctx.moveTo(-len * 0.06, len * 0.08);
    ctx.lineTo(len * 0.08, len * 0.08);
    ctx.lineTo(len * 0.03, len * 0.34);
    ctx.lineTo(-len * 0.11, len * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a3a1c";
    ctx.beginPath();
    ctx.roundRect(-len * 0.2, len * 0.06, len * 0.08, len * 0.16, 2);
    ctx.fill();
  } else if (id === "smg") {
    ctx.fillStyle = "#23262b";
    ctx.beginPath();
    ctx.roundRect(-len * 0.4, -len * 0.12, len * 0.7, len * 0.22, 3);
    ctx.fill();
    ctx.fillStyle = "#3a3f47";
    ctx.beginPath();
    ctx.roundRect(len * 0.25, -len * 0.06, len * 0.25, len * 0.1, 2);
    ctx.fill();
    ctx.fillStyle = "#15171a";
    ctx.beginPath();
    ctx.roundRect(-len * 0.1, len * 0.08, len * 0.12, len * 0.3, 2);
    ctx.roundRect(-len * 0.4, len * 0.05, len * 0.1, len * 0.14, 2);
    ctx.fill();
  } else if (id === "grenade") {
    const r = len / 2;
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
    g.addColorStop(0, "#8fbf5a");
    g.addColorStop(1, "#2f5a22");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();
    ctx.fillStyle = "#c9c9c9";
    ctx.beginPath();
    ctx.roundRect(-r * 0.25, -r - r * 0.5, r * 0.5, r * 0.55, 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------------- actors ---------------- */

type ActorAnim = {
  walk?: boolean;
  idle?: boolean;
  attackKind?: "punch" | "slash" | "aim" | "swing" | "throw";
  attackT?: number; // 0..1 progress
  cry?: boolean;
  flash?: number;
  alpha?: number;
  crouch?: boolean;
  spin?: number;
  scale?: number;
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
  let rot = a.spin ?? 0;
  if (a.idle && !a.walk) dy = Math.sin(f.t * 2.9 + x) * VH(f, 0.35);
  if (a.attackKind && a.attackT !== undefined && a.attackT < 1) {
    const bell = Math.sin(a.attackT * Math.PI);
    if (a.attackKind === "aim") {
      dx = -face * bell * f.unit * 0.8;
      rot = -face * bell * 5;
    } else if (a.attackKind === "punch") {
      dx = face * bell * f.unit * 2;
      rot = face * bell * 14;
    } else if (a.attackKind === "swing") {
      dx = face * bell * f.unit * 2.4;
      rot = face * bell * 30;
    } else if (a.attackKind === "throw") {
      dx = -face * bell * f.unit * 1;
      rot = -face * bell * 12;
    } else {
      dx = face * bell * f.unit * 1.6;
      rot = face * bell * 22;
    }
  }
  if (a.cry) rot = Math.sin(f.t * 9) * 7;
  drawSprite(f, sp, cx, base, VH(f, hVh), {
    flip: face === -1,
    rot,
    dx,
    dy,
    flash: a.flash,
    alpha: a.alpha,
    scale: a.scale,
    scaleY: a.crouch ? 0.66 : 1,
  });
}

function drawEnemy(f: Frame, w: World, e: Enemy) {
  if (e.gone || e.x > 900) return;
  const def = HAZARD_BY_ID[e.id];
  const face: 1 | -1 = e.x < w.player.x ? 1 : -1;
  const cx = X(f, e.x);
  const base = groundY(f) - VH(f, e.y);
  const scale = e.isBoss ? 1.22 : 1;
  const H = VH(f, 30) * scale;
  const H_ = H;
  const body = getSprite(def.sprite);

  if (e.exploding) {
    const p = Math.min(1, (w.t - e.explodeAt) / 0.8);
    if (e.torn) {
      drawSprite(f, body, cx - f.unit * 3, base - VH(f, 6), H * 0.6, {
        flip: face === -1,
        rot: e.rot * 0.45 - 18,
        alpha: 1 - p,
        clipBottom: 0.52,
        flash: 0.5,
      });
      drawSprite(f, body, cx + f.unit * 4, base + VH(f, 2), H * 0.53, {
        flip: face === -1,
        rot: e.rot * 0.7 + 22,
        alpha: 1 - p,
        clipTop: 0.48,
        flash: 0.5,
      });
    } else {
      drawSprite(f, body, cx, base, H, {
        flip: face === -1,
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
      drawSprite(f, body, cx - f.unit * 3, base - VH(f, 6), H * 0.6, {
        flip: face === -1,
        rot: e.rot * 0.45 - 18,
        clipBottom: 0.52,
        flash: e.flash,
      });
      drawSprite(f, body, cx + f.unit * 4, base + VH(f, 2), H * 0.53, {
        flip: face === -1,
        rot: e.rot * 0.7 + 22,
        clipTop: 0.48,
        flash: e.flash,
      });
    } else {
      drawSprite(f, body, cx, base, H, {
        flip: face === -1,
        rot: e.rot,
        flash: e.flash,
        alpha: e.down ? 0.92 : 1,
      });
    }
    return;
  }

  const walking = e.chasing && !e.calm && !e.cry;
  const charging = e.isBoss && w.t < e.chargeUntil;
  const windup = e.isBoss && e.windupUntil > 0 && w.t < e.windupUntil;
  drawActor(f, def.sprite, def.steps, e.x, e.y, 30, face, {
    walk: walking,
    idle: !walking,
    cry: e.cry,
    flash: charging ? 0.35 + e.flash : windup ? 0.6 : e.flash,
    scale: windup ? scale * (1 + Math.sin(w.t * 40) * 0.03) : scale,
    spin: charging ? face * 8 : windup ? -face * 6 : 0,
  });
  if (windup) {
    drawTag(f, "!", cx, base - H - 34, {
      bg: "rgba(255,200,40,0.98)",
      fg: "#1b1410",
      size: 16,
      pad: 10,
    });
  }
  if (charging) {
    // Speed lines while a boss charges.
    const { ctx } = f;
    ctx.save();
    ctx.strokeStyle = "rgba(255,230,120,0.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const yy = base - H * (0.25 + i * 0.18);
      ctx.beginPath();
      ctx.moveTo(cx - face * (H_ * 0.3), yy);
      ctx.lineTo(cx - face * (H_ * 0.3 + 30 + i * 8), yy + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  const top = base - H;
  const label = e.isBoss
    ? `JEFE · ${def.name}`
    : e.chasing
      ? `${def.name} · ${def.chaseLabel}`
      : e.calm
        ? `${def.name} · calmado`
        : def.name;
  drawTag(f, label, cx, top - 16, {
    bg: e.isBoss ? "rgba(120,10,40,0.95)" : e.chasing ? "rgba(194,65,59,0.92)" : "rgba(0,0,0,0.72)",
    fg: e.chasing || e.isBoss ? "#fff" : "#ebe4d6",
    size: e.isBoss ? 11 : 10,
  });
  if (e.maxHp > 1 && !e.calm && !e.isBoss) {
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
  if (e.bark && w.t < e.barkUntil) drawBubble(f, e.bark, cx, top - 32, e.isBoss);
}

/* ---------------- solids ---------------- */

function drawSolids(f: Frame, w: World) {
  const ch = chapterOf(w.chapter);
  const { ctx, viewW } = f;
  for (const p of ch.platforms) {
    if (p.x + p.w / 2 < w.camX - 5 || p.x - p.w / 2 > w.camX + viewW + 5) continue;
    const x = X(f, p.x - p.w / 2);
    const wpx = VW(f, p.w);
    const y = groundY(f) - VH(f, p.h);
    const th = Math.max(8, VH(f, 2.2));
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + 3, y + 4, wpx, th);
    const g = ctx.createLinearGradient(0, y, 0, y + th);
    g.addColorStop(0, "#9a6a3a");
    g.addColorStop(1, "#5a3a1c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, wpx, th, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,220,160,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 1.5);
    ctx.lineTo(x + wpx - 2, y + 1.5);
    ctx.stroke();
    // Legs.
    ctx.fillStyle = "#4a2e14";
    ctx.fillRect(x + 4, y + th, 4, groundY(f) - y - th);
    ctx.fillRect(x + wpx - 8, y + th, 4, groundY(f) - y - th);
    ctx.restore();
  }
  for (const c of ch.crates) {
    if (c.x + c.w / 2 < w.camX - 5 || c.x - c.w / 2 > w.camX + viewW + 5) continue;
    const x = X(f, c.x - c.w / 2);
    const wpx = VW(f, c.w);
    const hpx = VH(f, c.h);
    const y = groundY(f) - hpx;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(x + 4, y + 5, wpx, hpx);
    const g = ctx.createLinearGradient(x, y, x + wpx, y + hpx);
    g.addColorStop(0, "#b8834a");
    g.addColorStop(1, "#7a4f26");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, wpx, hpx);
    ctx.strokeStyle = "rgba(60,30,10,0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, wpx - 2, hpx - 2);
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + wpx - 2, y + hpx - 2);
    ctx.moveTo(x + wpx - 2, y + 2);
    ctx.lineTo(x + 2, y + hpx - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,230,180,0.25)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (hpx * i) / 3);
      ctx.lineTo(x + wpx, y + (hpx * i) / 3);
      ctx.stroke();
    }
    ctx.restore();
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
  const viewW = viewWidthFor(W, H);
  const unit = W / viewW;
  const portrait = H > W * 1.1;
  const unitY = Math.min(unit * 0.5625, H / 100);
  const f: Frame = {
    ctx,
    W,
    H,
    cam: w.camX,
    t: w.t,
    unit,
    unitY,
    viewW,
    ground: portrait ? H * 0.66 : H * GROUND,
  };
  const zoneW = 100 * unit;
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  /* shake */
  if (opts.shake && w.t < w.shakeUntil) {
    const k = ((w.shakeUntil - w.t) / 0.35) * w.shakePower;
    ctx.translate((Math.random() - 0.5) * k * 2, (Math.random() - 0.5) * k * 1.4);
  }

  /* backgrounds: only zones overlapping the camera */
  const first = Math.max(0, Math.floor(w.camX / 100));
  const last = Math.min(ch.zones.length - 1, Math.floor((w.camX + viewW) / 100));
  for (let i = first; i <= last; i++) {
    const z = ch.zones[i];
    const sp = getSprite(z.bg);
    const zx = X(f, i * 100);
    if (!sp) {
      ctx.fillStyle = "#101820";
      ctx.fillRect(zx, 0, zoneW + 2, H);
      continue;
    }
    // The painting's floor must sit right under the characters' feet, so the
    // image is anchored to the ground line (its bottom lands 8 "vh" below the
    // feet, like the original 16:9 layout) instead of to the canvas bottom.
    const bgBottom = Math.min(H, f.ground + VH(f, 8));
    const s = Math.max(zoneW / sp.w, bgBottom / sp.h);
    const sw = zoneW / s;
    const sh = bgBottom / s;
    ctx.drawImage(sp.img, (sp.w - sw) / 2, sp.h - sh, sw, sh, zx, 0, zoneW + 2, bgBottom);
    if (bgBottom < H) {
      // Under the floor (where the touch controls live): a stretched, darkened
      // band of the painting's bottom edge so the ground looks continuous.
      const stripH = H - bgBottom;
      const srcBand = Math.max(4, Math.min(sp.h * 0.12, stripH / s));
      ctx.drawImage(
        sp.img,
        (sp.w - sw) / 2,
        sp.h - srcBand,
        sw,
        srcBand,
        zx,
        bgBottom,
        zoneW + 2,
        stripH,
      );
      const g = ctx.createLinearGradient(0, bgBottom, 0, H);
      g.addColorStop(0, "rgba(0,0,0,0.25)");
      g.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = g;
      ctx.fillRect(zx, bgBottom, zoneW + 2, stripH);
    }
  }

  /* props */
  for (const p of ch.props) {
    if (p.x < w.camX - 20 || p.x > w.camX + viewW + 20) continue;
    drawSprite(f, getSprite(p.src), X(f, p.x), Y(f, 10), VH(f, p.h), { flip: p.flip });
  }

  drawSolids(f, w);

  /* grill / exam markers */
  if (ch.grillX) {
    drawSprite(f, getSprite("/sprites/fire.png"), X(f, ch.grillX), Y(f, 16), VH(f, 16), {
      alpha: w.fire ? 1 : 0.45,
    });
    drawTag(f, w.fire ? "¡Asado!" : "El quincho", X(f, ch.grillX), Y(f, 35));
  }
  if (ch.examX) {
    const ready = ["apuntes", "cafe", "cedula", "fuerza", "boss"].every((i) => w.items.includes(i));
    drawTag(f, ready ? "Examen listo" : "El aula", X(f, ch.examX), Y(f, 40), {
      bg: ready ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.72)",
      fg: ready ? "#0b0f14" : "#ebe4d6",
      size: 11,
    });
  }

  /* pickups */
  for (const p of ch.pickups) {
    if (w.items.includes(p.id) || p.x < w.camX - 10 || p.x > w.camX + viewW + 10) continue;
    const bob = Math.sin(w.t * 3.6 + p.x) * VH(f, 0.6);
    const base = groundY(f) - VH(f, (p.y ?? 0) + 8) + bob;
    const src = pickupSprite(p);
    if (src) {
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
      drawSprite(f, getSprite(src), X(f, p.x), base, size, { rot: p.kind === "knife" ? -30 : 0 });
    } else {
      ctx.save();
      ctx.translate(X(f, p.x), base - 14);
      ctx.rotate(-0.5 + Math.sin(w.t * 2 + p.x) * 0.1);
      drawWeaponShape(ctx, p.kind as WeaponId, p.kind === "grenade" ? 22 : 54);
      ctx.restore();
    }
    if (p.kind !== "coin" && p.label) {
      drawTag(f, p.label, X(f, p.x), base + 12, {
        size: 9,
        pad: 5,
        bg: p.kind === "item" ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.6)",
        fg: p.kind === "item" ? "#0b0f14" : "#ebe4d6",
      });
    }
  }

  /* drops from enemies */
  for (const d of w.drops) {
    if (d.x < w.camX - 10 || d.x > w.camX + viewW + 10) continue;
    const age = w.t - d.born;
    const blink = age > 20 && Math.floor(w.t * 6) % 2 === 0;
    if (blink) continue;
    const src =
      d.kind === "coin"
        ? "/sprites/coin.png"
        : d.kind === "ammo"
          ? "/sprites/bullet.png"
          : "/sprites/terere.png";
    drawSprite(f, getSprite(src), X(f, d.x), groundY(f) - VH(f, d.y), d.kind === "heal" ? 30 : 22, {
      rot: d.kind === "ammo" ? 20 : 0,
    });
  }

  /* blood */
  if (opts.gore && w.blood.length) {
    const blob = bloodSprite();
    if (blob) {
      for (const b of w.blood) {
        if (b.x < w.camX - 10 || b.x > w.camX + viewW + 10) continue;
        const age = w.t - b.born;
        ctx.save();
        ctx.globalAlpha = age > 10 ? Math.max(0, 0.9 * (1 - (age - 10) / 4)) : 0.9;
        ctx.translate(X(f, b.x), Y(f, b.y));
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
    if (nx < w.camX - 20 || nx > w.camX + viewW + 20) continue;
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
    const ax = followerX(w, i);
    const punching = w.t < (w.allyHitAt[i] ?? 0) - 1.4;
    drawActor(f, hero.sprite, hero.steps, ax, 0, 26, p.facing, {
      walk: p.walking,
      idle: true,
      attackKind: "punch",
      attackT: punching ? 1 - ((w.allyHitAt[i] ?? 0) - 1.4 - w.t) / 0.3 : 1,
    });
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
    drawSprite(f, getSprite("/sprites/book.png"), X(f, b.x), Y(f, b.y), VH(f, 7), {
      rot: b.rot,
    });
  for (const s of w.slimes)
    drawSprite(f, getSprite("/sprites/slime.png"), X(f, s.x), Y(f, s.y), VH(f, 3.4), {
      rot: (w.t * 900 + s.x * 30) % 360,
    });
  for (const s of w.shots) {
    const size = s.kind === "shotgun" ? 12 : s.kind === "smg" ? 14 : s.kind === "ak" ? 16 : 18;
    drawSprite(f, getSprite("/sprites/bullet.png"), X(f, s.x), Y(f, s.y) + size / 2, size, {
      flip: s.face === 1,
      rot: ((Math.atan2(-s.vy, Math.abs(s.vx)) * 180) / Math.PI) * (s.face === 1 ? 1 : -1),
    });
  }
  for (const g of w.grenades) {
    ctx.save();
    ctx.translate(X(f, g.x), groundY(f) - VH(f, g.y) - 8);
    ctx.rotate(w.t * 9);
    drawWeaponShape(ctx, "grenade", 16);
    ctx.restore();
    const fuse = 1 - Math.min(1, (w.t - g.born) / 1.5);
    ctx.save();
    ctx.fillStyle = Math.floor(w.t * (8 + (1 - fuse) * 20)) % 2 ? "#ff4a3a" : "#ffd27a";
    ctx.beginPath();
    ctx.arc(X(f, g.x), groundY(f) - VH(f, g.y) - 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* gibs */
  if (opts.gore)
    for (const g of w.gibs)
      drawSprite(f, getSprite(GIBS[g.src]), X(f, g.x), Y(f, g.y) + 19, 38, { rot: g.rot });

  /* dash trail */
  const hero = HERO_BY_ID[w.hero];
  for (const tr of w.trail) {
    const a = 1 - (w.t - tr.born) / 0.3;
    drawSprite(f, getSprite(hero.sprite), X(f, tr.x), groundY(f) - VH(f, tr.y), VH(f, 34), {
      flip: tr.face === -1,
      alpha: a * 0.35,
      flash: 0.6,
    });
  }

  /* player */
  const atkDur =
    p.attackKind === "grenade"
      ? 0.24
      : p.attackKind === "bat"
        ? 0.36
        : p.stomping
          ? 0.5
          : ["pistol", "ak", "shotgun", "smg"].includes(p.attackKind)
            ? 0.16
            : 0.28;
  const attackT = p.attackUntil > w.t ? 1 - (p.attackUntil - w.t) / atkDur : 1;
  const invisible = w.t < p.invUntil && w.t >= p.dashUntil && Math.floor(w.t * 18) % 2 === 0;
  const kind: ActorAnim["attackKind"] =
    p.attackKind === "grenade"
      ? "throw"
      : p.attackKind === "bat"
        ? "swing"
        : p.attackKind === "knife"
          ? "slash"
          : p.attackKind === "fist"
            ? "punch"
            : "aim";
  drawActor(f, hero.sprite, hero.steps, p.x, p.y, 34, p.facing, {
    walk: p.walking && attackT >= 1,
    idle: true,
    attackKind: kind,
    attackT,
    alpha: invisible ? 0.45 : 1,
    flash: w.t - p.hurtAt < 0.2 ? 0.8 : w.t < p.dashUntil ? 0.3 : 0,
    crouch: p.crouching,
    spin: p.stomping ? p.facing * 18 : w.t < p.dashUntil ? p.dashDir * 10 : 0,
  });
  /* held weapon */
  if (p.weapon !== "fist" && !p.stomping) {
    const kick = attackT < 1 ? Math.sin(attackT * Math.PI) : 0;
    const hy = groundY(f) - VH(f, p.y + (p.crouching ? 12 : 20));
    const hx = X(f, p.x + p.facing * 3.4);
    if (p.weapon === "pistol" || p.weapon === "knife") {
      const wsp = getSprite(p.weapon === "pistol" ? "/sprites/pistol.png" : "/sprites/knife.png");
      const rot =
        p.weapon === "pistol"
          ? -kick * 18 * p.facing
          : attackT < 1
            ? (-80 + attackT * 150) * p.facing
            : 12 * p.facing;
      drawSprite(
        f,
        wsp,
        hx,
        hy + (p.weapon === "pistol" ? 12 : 8),
        p.weapon === "pistol" ? 38 : 12,
        {
          flip: p.facing === 1,
          rot,
          alpha: invisible ? 0.45 : 1,
        },
      );
    } else {
      ctx.save();
      ctx.globalAlpha = invisible ? 0.45 : 1;
      ctx.translate(hx, hy + 6);
      const swing = p.weapon === "bat" ? (attackT < 1 ? -1.6 + attackT * 2.6 : 0.6) : -kick * 0.3;
      ctx.rotate(p.facing === 1 ? -swing : Math.PI + swing);
      drawWeaponShape(
        ctx,
        p.weapon,
        p.weapon === "bat" ? 62 : p.weapon === "shotgun" ? 64 : p.weapon === "ak" ? 70 : 46,
      );
      ctx.restore();
    }
  }
  if (p.finisher && w.t < p.comboUntil) {
    drawTag(f, "REMATE", X(f, p.x), groundY(f) - VH(f, p.y + 42), {
      bg: "rgba(255,80,60,0.95)",
      fg: "#fff",
      size: 11,
    });
  }

  /* fx */
  for (const e of w.fx) {
    const age = w.t - e.born;
    const cx = X(f, e.x);
    const cy = Y(f, e.y);
    if (e.kind === "pop" || e.kind === "heal") {
      const pr = age / 0.9;
      ctx.save();
      ctx.globalAlpha = 1 - pr;
      ctx.font = `800 ${Math.round(Math.max(12, f.unit * 1.6))}px Figtree, system-ui, sans-serif`;
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
      const tw = VW(f, 30);
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
  if (w.boss.active && w.t - w.boss.introAt < 1.2) {
    ctx.save();
    ctx.globalAlpha = (1 - (w.t - w.boss.introAt) / 1.2) * 0.5;
    ctx.fillStyle = "#7a0a28";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* objective arrow at the screen edge */
  if (opts.objectiveX !== null) {
    const ox = opts.objectiveX;
    const off = ox < w.camX + 4 ? -1 : ox > w.camX + viewW - 4 ? 1 : 0;
    if (off !== 0) {
      const dist = Math.round(Math.abs(ox - p.x));
      const ex = off > 0 ? W - 30 : 30;
      const ey = f.ground - VH(f, 20);
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
