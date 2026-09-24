import {
  activeWeapon,
  baseHeadY,
  layout,
  paperState,
  WEAPON_STATS,
  type Mood,
  type Weapon,
  type World,
} from "./engine";
import { drawText, textWidth, wrapText } from "./font";

/**
 * Procedural pixel art. Everything is drawn with integer fillRects on a low-res
 * canvas (the scene upscales it with nearest-neighbour), so the character, the
 * hits and the text are all genuine chunky pixels.
 */

type Ctx = CanvasRenderingContext2D;

export const PAL = {
  k: "#120c10",
  skin: "#f1c3a0",
  skinSh: "#d49a78",
  skinDeep: "#a86f55",
  stubble: "rgba(92,58,48,0.32)",
  hair: "#21160f",
  hairHi: "#4d3627",
  brow: "#1d130d",
  pupil: "#2b1a12",
  mouth: "#5a1515",
  teeth: "#fff7e6",
  tongue: "#e0606a",
  bruise: "#6f3f8f",
  suit: "#1c2436",
  suitSh: "#121827",
  suitHi: "#33405e",
  shirt: "#f3f3ef",
  shirtSh: "#c9ccd4",
  tie: "#d3222e",
  tieSh: "#8d1119",
  paper: "#f1e9d2",
  paperSh: "#cbbd97",
  red: "#d52b1e",
  blue: "#0038a8",
  gold: "#f2b72b",
  goldSh: "#a8740f",
};

function rect(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function ell(c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col;
  const r = Math.ceil(ry);
  for (let y = -r; y <= r; y++) {
    const k = 1 - (y * y) / (ry * ry);
    if (k < 0) continue;
    const hw = Math.round(rx * Math.sqrt(k));
    c.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1);
  }
}

function line(c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, t = 1) {
  c.fillStyle = col;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  const o = Math.floor(t / 2);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    c.fillRect(x - o, y - o, t, t);
  }
}

function canvas(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  return { el, c };
}

/** Deterministic 0..1 noise so ambient sparkles don't flicker randomly per frame. */
function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

// ───────────────────────────── Head ─────────────────────────────

export type Face = {
  mood: Mood;
  blink: boolean;
  talk: boolean;
  damage: number;
  t: number;
};

const HW = 48;
const HH = 60;

function brow(c: Ctx, x: number, y: number, tilt: number, flip: boolean) {
  for (let i = 0; i < 6; i++) {
    const col = flip ? x + 5 - i : x + i;
    const yy = Math.round(y + tilt * i);
    rect(c, col, yy, 1, 2, PAL.brow);
  }
}

export function drawHead(c: Ctx, face: Face) {
  c.clearRect(0, 0, HW, HH);
  const ox = 24;
  const oy = 30;
  const X = (x: number) => ox + x;
  const Y = (y: number) => oy + y;
  const d = face.damage;
  const m = face.mood;

  // Ears
  ell(c, X(-11), Y(1), 2.5, 3.6, PAL.k);
  ell(c, X(11), Y(1), 2.5, 3.6, PAL.k);
  ell(c, X(-11), Y(1), 1.5, 2.6, PAL.skinSh);
  ell(c, X(11), Y(1), 1.5, 2.6, PAL.skinSh);
  // Skull + square jaw
  ell(c, X(0), Y(-2), 11, 13, PAL.k);
  ell(c, X(0), Y(6), 10, 8, PAL.k);
  ell(c, X(0), Y(-2), 10, 12, PAL.skin);
  ell(c, X(0), Y(6), 9, 7, PAL.skin);
  // Shade the right side of the face (light from the left)
  c.save();
  c.beginPath();
  c.rect(X(5), Y(-15), 8, 32);
  c.clip();
  ell(c, X(0), Y(-2), 10, 12, PAL.skinSh);
  ell(c, X(0), Y(6), 9, 7, PAL.skinSh);
  c.restore();
  // Five o'clock shadow
  c.fillStyle = PAL.stubble;
  for (let y = 4; y <= 13; y++)
    for (let x = -8; x <= 8; x++) {
      const inJaw = (x / 9) ** 2 + ((y - 6) / 7) ** 2 < 1;
      const mouthZone = y >= 6 && y <= 10 && Math.abs(x) <= 4;
      if (inJaw && !mouthZone && ((x + y) & 1) === 0) c.fillRect(X(x), Y(y), 1, 1);
    }
  // Slicked-back hair with a side part
  ell(c, X(0), Y(-9), 11.5, 7, PAL.k);
  ell(c, X(-1), Y(-12), 10, 4.6, PAL.k);
  ell(c, X(0), Y(-9), 10.5, 6, PAL.hair);
  ell(c, X(-1), Y(-12), 9, 3.6, PAL.hair);
  ell(c, X(0.5), Y(-3.5), 8.5, 4.4, PAL.skin);
  rect(c, X(5), Y(-6), 4, 5, PAL.skinSh);
  rect(c, X(-10), Y(-6), 2, 6, PAL.hair);
  rect(c, X(9), Y(-6), 2, 6, PAL.hair);
  rect(c, X(-6), Y(-14), 9, 1, PAL.hairHi);
  rect(c, X(-8), Y(-12), 5, 1, PAL.hairHi);
  rect(c, X(0), Y(-12), 7, 1, PAL.hairHi);
  rect(c, X(-9), Y(-10), 3, 1, PAL.hairHi);
  rect(c, X(4), Y(-10), 4, 1, PAL.hairHi);
  rect(c, X(-5), Y(-13), 1, 4, "#0b0705");

  // Forehead bump grows with punishment
  if (d > 0.42) {
    const r = 2 + Math.min(2, (d - 0.42) * 6);
    ell(c, X(4), Y(-8), r + 1, r, PAL.k);
    ell(c, X(4), Y(-8), r, r - 0.8, "#f6a58c");
    rect(c, X(3), Y(-9), 1, 1, "#fff");
  }
  // Rosy cheeks
  if (d > 0.12) {
    c.fillStyle = "rgba(225,70,70,0.55)";
    c.fillRect(X(-9), Y(3), 3, 2);
    c.fillRect(X(6), Y(3), 3, 2);
  }
  // Black eyes
  if (d > 0.28) ell(c, X(-5), Y(-1), 4, 2.6, PAL.bruise);
  if (d > 0.85) ell(c, X(5), Y(-1), 4, 2.6, PAL.bruise);

  // Brows
  const hurtish = m === "hurt" || m === "ko" || m === "dizzy";
  if (m === "block") {
    brow(c, X(-8), Y(-5), 0.3, false);
    brow(c, X(3), Y(-5), 0.3, true);
  } else if (hurtish) {
    brow(c, X(-8), Y(-4), -0.3, false);
    brow(c, X(3), Y(-4), -0.3, true);
  } else if (m === "taunt") {
    brow(c, X(-8), Y(-6), 0, false);
    brow(c, X(3), Y(-7), 0, false);
  } else {
    brow(c, X(-8), Y(-5), 0, false);
    brow(c, X(3), Y(-6), -0.15, true);
  }

  // Eyes
  if (m === "ko") {
    for (const ex of [-6, 4]) {
      line(c, X(ex), Y(-3), X(ex + 3), Y(0), PAL.k);
      line(c, X(ex + 3), Y(-3), X(ex), Y(0), PAL.k);
    }
  } else if (m === "dizzy") {
    const spin = Math.floor(face.t * 10) % 4;
    for (const ex of [-7, 3]) {
      rect(c, X(ex), Y(-3), 4, 4, "#fff");
      rect(c, X(ex), Y(-3), 4, 1, PAL.k);
      rect(c, X(ex), Y(0), 4, 1, PAL.k);
      rect(c, X(ex), Y(-3), 1, 4, PAL.k);
      rect(c, X(ex + 3), Y(-3), 1, 4, PAL.k);
      const sp = [
        [1, 1],
        [2, 1],
        [2, 2],
        [1, 2],
      ][spin];
      rect(c, X(ex + sp[0]), Y(-3 + sp[1]), 1, 1, PAL.k);
    }
  } else if (m === "hurt") {
    line(c, X(-7), Y(-3), X(-4), Y(-1), PAL.k);
    line(c, X(-7), Y(1), X(-4), Y(-1), PAL.k);
    line(c, X(6), Y(-3), X(3), Y(-1), PAL.k);
    line(c, X(6), Y(1), X(3), Y(-1), PAL.k);
  } else if (face.blink) {
    rect(c, X(-7), Y(-1), 4, 1, PAL.k);
    rect(c, X(3), Y(-1), 4, 1, PAL.k);
  } else {
    const wide = m === "block" || m === "throw";
    const h = wide ? 3 : 2;
    const py = m === "block" ? -3 : -2;
    rect(c, X(-7), Y(-2), 4, h, "#fff");
    rect(c, X(3), Y(-2), 4, h, "#fff");
    rect(c, X(-5), Y(py + (wide ? 0 : 0)), 2, 2, PAL.pupil);
    rect(c, X(3), Y(py), 2, 2, PAL.pupil);
    rect(c, X(-7), Y(-3), 4, 1, PAL.k);
    rect(c, X(3), Y(-3), 4, 1, PAL.k);
    if (d > 0.9) {
      rect(c, X(-7), Y(-2), 4, 1, PAL.bruise);
      rect(c, X(3), Y(-2), 4, 1, PAL.bruise);
    }
  }

  // Nose
  rect(c, X(0), Y(0), 1, 4, PAL.skinSh);
  rect(c, X(1), Y(1), 1, 3, PAL.skinDeep);
  rect(c, X(-1), Y(4), 1, 1, PAL.skinDeep);
  rect(c, X(2), Y(4), 1, 1, PAL.skinDeep);
  if (d > 0.58) {
    // Band-aid across the nose
    rect(c, X(-3), Y(1), 7, 2, "#e8c08c");
    rect(c, X(-1), Y(1), 3, 2, "#f3dbb6");
    rect(c, X(-3), Y(1), 1, 1, "#c79b66");
    rect(c, X(3), Y(2), 1, 1, "#c79b66");
  }

  // Mouth
  const gap = d > 0.7;
  if (m === "hurt" || m === "ko") {
    ell(c, X(0.5), Y(8.5), 3.5, 2.6, PAL.mouth);
    rect(c, X(-2), Y(6), 5, 1, PAL.teeth);
    if (gap) rect(c, X(0), Y(6), 1, 1, PAL.mouth);
    rect(c, X(-1), Y(10), 3, 1, PAL.tongue);
  } else if (m === "dizzy") {
    rect(c, X(-3), Y(8), 2, 1, PAL.mouth);
    rect(c, X(-1), Y(7), 2, 1, PAL.mouth);
    rect(c, X(1), Y(8), 3, 1, PAL.mouth);
    rect(c, X(1), Y(9), 3, 3, PAL.tongue);
  } else if (m === "block" || m === "throw") {
    rect(c, X(-1), Y(7), 3, 2, PAL.mouth);
  } else if (face.talk) {
    rect(c, X(-3), Y(6), 7, 4, PAL.mouth);
    rect(c, X(-2), Y(6), 5, 1, PAL.teeth);
    if (gap) rect(c, X(0), Y(6), 1, 1, PAL.mouth);
    rect(c, X(-1), Y(9), 3, 1, PAL.tongue);
  } else {
    // Smug smirk
    rect(c, X(-3), Y(8), 6, 1, PAL.mouth);
    rect(c, X(3), Y(7), 1, 1, PAL.mouth);
    rect(c, X(-2), Y(9), 4, 1, d > 0.5 ? "#d9796f" : PAL.skinSh);
  }
}

// ───────────────────────────── Props ─────────────────────────────

export type Art = {
  head: { el: HTMLCanvasElement; c: Ctx };
  fist: HTMLCanvasElement;
  glove: HTMLCanvasElement;
  mazo: HTMLCanvasElement;
  mazoGold: HTMLCanvasElement;
  paper: HTMLCanvasElement;
};

function sleeve(c: Ctx, x: number, y: number, w: number, h: number) {
  rect(c, x - 1, y, w + 2, h, PAL.k);
  for (let i = 0; i < w; i += 2) rect(c, x + i, y + 1, 2, h - 1, (i / 2) % 2 ? "#f5f5f5" : PAL.red);
}

function makeFist() {
  const { el, c } = canvas(28, 38);
  sleeve(c, 7, 22, 14, 16);
  ell(c, 14, 12, 12, 11, PAL.k);
  ell(c, 14, 12, 11, 10, "#e7b089");
  ell(c, 12, 9, 7, 5, "#f3c9a4");
  for (let k = 0; k < 4; k++) {
    ell(c, 6 + k * 5.3, 4, 2.6, 2, PAL.k);
    ell(c, 6 + k * 5.3, 4, 1.8, 1.4, "#f7d2b0");
    if (k) rect(c, 3 + k * 5.3, 5, 1, 5, "#c4875f");
  }
  rect(c, 4, 13, 15, 4, "#d69a72");
  rect(c, 4, 17, 15, 1, PAL.k);
  rect(c, 5, 13, 12, 1, "#f3c9a4");
  rect(c, 22, 8, 2, 10, "#c4875f");
  return el;
}

function makeGlove() {
  const { el, c } = canvas(32, 40);
  sleeve(c, 9, 28, 14, 12);
  rect(c, 6, 22, 20, 8, PAL.k);
  rect(c, 7, 23, 18, 6, "#f4f4f4");
  for (let i = 0; i < 4; i++) rect(c, 9 + i * 4, 24, 2, 1, "#bbb");
  ell(c, 16, 12, 14, 12, PAL.k);
  ell(c, 16, 12, 13, 11, "#e0262f");
  c.save();
  c.beginPath();
  c.rect(20, 0, 14, 30);
  c.clip();
  ell(c, 16, 12, 13, 11, "#9e1219");
  c.restore();
  ell(c, 11, 7, 6, 3.5, "#ff6b6b");
  rect(c, 9, 5, 3, 1, "#ffd0d0");
  line(c, 4, 15, 14, 18, "#9e1219");
  rect(c, 12, 14, 7, 1, "#ffffff");
  drawText(c, "PY", 11, 15, { color: "#ffe066" });
  return el;
}

function makeMazo(gold: boolean) {
  const { el, c } = canvas(34, 20);
  const wood = gold ? PAL.gold : "#a0622d";
  const dark = gold ? PAL.goldSh : "#6d3f1a";
  const light = gold ? "#ffe38a" : "#d08a4a";
  rect(c, 0, 1, 34, 18, PAL.k);
  rect(c, 1, 2, 32, 16, wood);
  rect(c, 1, 13, 32, 5, dark);
  rect(c, 3, 3, 26, 2, light);
  for (const x of [4, 26]) {
    rect(c, x, 1, 4, 18, PAL.k);
    rect(c, x + 1, 2, 2, 16, gold ? "#fff2c4" : "#b8c0cc");
  }
  rect(c, 14, 7, 6, 5, dark);
  return el;
}

function makePaper() {
  const { el, c } = canvas(16, 20);
  rect(c, 0, 0, 16, 20, PAL.k);
  rect(c, 1, 1, 14, 18, "#fbfaf4");
  rect(c, 1, 1, 14, 3, PAL.red);
  for (let y = 6; y < 17; y += 2) rect(c, 3, y, y === 16 ? 6 : 10, 1, "#9aa3b5");
  ell(c, 11, 15, 2.2, 2.2, PAL.red);
  return el;
}

export function buildArt(): Art {
  return {
    head: canvas(HW, HH),
    fist: makeFist(),
    glove: makeGlove(),
    mazo: makeMazo(false),
    mazoGold: makeMazo(true),
    paper: makePaper(),
  };
}

// ───────────────────────────── Scene ─────────────────────────────

function drawWallDiploma(c: Ctx, x: number, y: number, gold: boolean) {
  const w = 46;
  const h = 32;
  rect(c, x - 1, y - 1, w + 2, h + 2, PAL.k);
  rect(c, x, y, w, h, gold ? PAL.gold : "#6b4423");
  rect(c, x + 1, y + 1, w - 2, 1, gold ? "#ffe38a" : "#8e5c31");
  rect(c, x + 3, y + 3, w - 6, h - 6, PAL.paper);
  rect(c, x + 3, y + h - 5, w - 6, 2, PAL.paperSh);
  drawText(c, "TITULO", x + w / 2, y + 6, { color: "#3a2a1a", align: "center" });
  rect(c, x + 8, y + 14, w - 16, 1, "#9b8a6a");
  rect(c, x + 8, y + 17, w - 20, 1, "#9b8a6a");
  ell(c, x + w - 11, y + h - 9, 3, 3, PAL.red);
  rect(c, x + w - 13, y + h - 6, 2, 3, PAL.red);
  rect(c, x + w - 10, y + h - 6, 2, 3, PAL.red);
  if (gold) {
    rect(c, x + 4, y + h + 3, w - 8, 7, PAL.k);
    rect(c, x + 5, y + h + 4, w - 10, 5, PAL.goldSh);
  }
}

function drawFlag(c: Ctx, x: number, y: number, t: number) {
  rect(c, x, y, 2, 70, "#8c7a5b");
  rect(c, x - 1, y - 2, 4, 3, PAL.gold);
  for (let i = 0; i < 24; i++) {
    const wave = Math.round(Math.sin(t * 3 + i * 0.35) * 1.5);
    const fx = x + 2 + i;
    rect(c, fx, y + 2 + wave, 1, 5, PAL.red);
    rect(c, fx, y + 7 + wave, 1, 5, "#ffffff");
    rect(c, fx, y + 12 + wave, 1, 5, PAL.blue);
  }
  rect(c, x + 12, y + 8 + Math.round(Math.sin(t * 3 + 10 * 0.35) * 1.5), 2, 2, PAL.gold);
}

function drawBackground(w: World, c: Ctx, cx: number, headY: number) {
  const { W, H, t } = w;
  // Back wall bands
  const bands = ["#171226", "#1d1630", "#231a3a", "#2a1f44"];
  const bh = Math.ceil(H / bands.length);
  bands.forEach((col, i) => rect(c, 0, i * bh, W, bh, col));
  // Wood panelling
  for (let x = (cx % 22) - 22; x < W; x += 22) rect(c, x, 0, 1, H, "rgba(0,0,0,0.25)");
  // Spotlight cones
  c.fillStyle = "rgba(255,236,190,0.06)";
  for (const s of [-1, 1]) {
    const sway = Math.sin(t * 0.7 + s) * 14;
    for (let y = 0; y < H; y += 2) {
      const half = 6 + y * 0.35;
      c.fillRect(Math.round(cx + s * 30 + sway * (y / H) - half), y, Math.round(half * 2), 2);
    }
  }
  // Paparazzi flashes
  for (let i = 0; i < 3; i++) {
    const slot = Math.floor(t * 2.3 + i * 17.3);
    if (hash(slot) > 0.72) {
      const fx = Math.round(hash(slot + 1.3) * W);
      const fy = Math.round(hash(slot + 2.7) * H * 0.35);
      const life = (t * 2.3 + i * 17.3) % 1;
      if (life < 0.25) {
        rect(c, fx - 3, fy, 7, 1, "#fff");
        rect(c, fx, fy - 3, 1, 7, "#fff");
        rect(c, fx - 1, fy - 1, 3, 3, "#fffbe0");
      }
    }
  }
  // Props on the wall
  const roomAbove = headY - 18 > 44;
  const dipX = roomAbove ? cx - 23 : cx + 30;
  const dipY = roomAbove ? Math.max(6, headY - 60) : Math.max(4, headY - 36);
  drawWallDiploma(c, dipX, dipY, w.goldTitle);
  if (w.goldTitle)
    drawText(c, "H.KAUSA", dipX + 23, dipY + 35, { color: "#ffe38a", align: "center" });
  drawFlag(c, Math.max(4, cx - (roomAbove ? 44 : 74)), Math.max(4, headY - 44), t);
  // Ropes in Paraguayan colours
  const ropes = [PAL.red, "#f3f3f3", PAL.blue];
  ropes.forEach((col, i) => {
    const y = headY + 30 + i * 14;
    rect(c, 0, y, W, 3, PAL.k);
    rect(c, 0, y + 1, W, 1, col);
  });
  if (W > 150)
    for (const px of [6, W - 10]) {
      rect(c, px, headY + 22, 5, H, PAL.k);
      rect(c, px + 1, headY + 22, 3, H, "#b0b6c4");
    }
}

function drawArm(
  c: Ctx,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  hx: number,
  hy: number,
  open: boolean,
) {
  line(c, sx, sy, ex, ey, PAL.k, 9);
  line(c, ex, ey, hx, hy, PAL.k, 9);
  line(c, sx, sy, ex, ey, PAL.suit, 7);
  line(c, ex, ey, hx, hy, PAL.suit, 7);
  line(c, sx - 2, sy, ex - 2, ey, PAL.suitHi, 1);
  rect(c, hx - 3, hy - 3, 7, 3, PAL.shirt);
  if (open) {
    rect(c, hx - 4, hy - 13, 9, 11, PAL.k);
    rect(c, hx - 3, hy - 12, 7, 9, PAL.skin);
    for (let i = 0; i < 3; i++) rect(c, hx - 2 + i * 2, hy - 12, 1, 5, PAL.skinSh);
    rect(c, hx + 4, hy - 8, 2, 4, PAL.skin);
  } else {
    ell(c, hx, hy + 2, 4, 4, PAL.k);
    ell(c, hx, hy + 2, 3, 3, PAL.skin);
  }
}

function drawRolledDiploma(c: Ctx, x: number, y: number) {
  line(c, x - 4, y + 10, x + 5, y - 12, PAL.k, 6);
  line(c, x - 4, y + 10, x + 5, y - 12, PAL.paper, 4);
  line(c, x - 3, y + 9, x + 5, y - 11, PAL.paperSh, 1);
  rect(c, x - 1, y - 2, 4, 3, PAL.red);
}

function drawBody(w: World, c: Ctx, cx: number, neckY: number, pose: Mood) {
  const { H, t } = w;
  const top = neckY;
  const sq = w.squash.v;
  // Neck
  rect(c, cx - 5, top - 3, 11, 7, PAL.k);
  rect(c, cx - 4, top - 3, 9, 7, PAL.skinSh);
  // Torso (trapezoid with rounded shoulders)
  for (let y = top + 2; y < H + 2; y++) {
    const k = y - top;
    const half = Math.round(Math.min(34, k < 9 ? 20 + k * 1.6 : 33 + k * 0.03) + sq * 0.3);
    rect(c, cx - half - 1, y, half * 2 + 3, 1, PAL.k);
    rect(c, cx - half, y, half * 2 + 1, 1, PAL.suit);
    rect(c, cx + Math.round(half * 0.55), y, Math.round(half * 0.45), 1, PAL.suitSh);
  }
  // Shirt V
  for (let k = 0; k < 26; k++) {
    const half = Math.max(0, Math.round(7 - k * 0.27));
    if (half) rect(c, cx - half, top + 2 + k, half * 2 + 1, 1, PAL.shirt);
  }
  rect(c, cx - 7, top + 2, 3, 3, PAL.shirtSh);
  rect(c, cx + 5, top + 2, 3, 3, PAL.shirtSh);
  // Lapels
  line(c, cx - 8, top + 3, cx - 1, top + 28, PAL.suitHi, 2);
  line(c, cx + 8, top + 3, cx + 1, top + 28, PAL.suitSh, 2);
  line(c, cx - 11, top + 10, cx - 7, top + 13, PAL.suitHi, 1);
  // Tie — flaps up when he gets hit in the gut
  const flap = Math.max(0, Math.min(10, sq * 1.2 + w.bodyDip.vel * 0.02));
  rect(c, cx - 3, top + 2, 7, 5, PAL.k);
  rect(c, cx - 2, top + 3, 5, 3, PAL.tie);
  for (let k = 0; k < 24; k++) {
    const half = Math.round(1 + k * 0.08);
    const y = top + 7 + k - (flap * k) / 30;
    const sway = Math.round(Math.sin(t * 2 + k * 0.2) * (flap > 1 ? 1 : 0));
    rect(c, cx - half - 1 + sway, y, half * 2 + 3, 1, PAL.k);
    rect(c, cx - half + sway, y, half * 2 + 1, 1, k % 7 === 3 ? PAL.tieSh : PAL.tie);
  }
  // Lapel pin
  rect(c, cx + 13, top + 11, 3, 3, PAL.k);
  rect(c, cx + 14, top + 12, 1, 1, "#ffffff");
  // Buttons
  rect(c, cx, top + 36, 1, 1, "#0a0d15");
  rect(c, cx, top + 44, 1, 1, "#0a0d15");

  const shL = { x: cx - 30, y: top + 9 };
  const shR = { x: cx + 30, y: top + 9 };
  const bob = Math.round(Math.sin(t * 2) * 1);
  if (pose === "taunt") {
    // The famous oath: right hand up, palm open
    drawArm(c, shL.x, shL.y, cx - 44, top + 6, cx - 42, top - 16 + bob, true);
    drawArm(c, shR.x, shR.y, cx + 36, top + 30, cx + 30, top + 44, false);
    drawRolledDiploma(c, cx + 30, top + 42);
  } else if (pose === "hurt" || pose === "dodge") {
    drawArm(c, shL.x, shL.y, cx - 46, top + 14, cx - 52, top + 2, false);
    drawArm(c, shR.x, shR.y, cx + 46, top + 14, cx + 52, top + 4, false);
  } else if (pose === "ko" || pose === "getup") {
    drawArm(c, shL.x, shL.y, cx - 42, top - 6, cx - 46, top - 20, true);
    drawArm(c, shR.x, shR.y, cx + 42, top - 6, cx + 46, top - 20, true);
  } else if (pose === "dizzy") {
    const s = Math.round(Math.sin(t * 6) * 4);
    drawArm(c, shL.x, shL.y, cx - 38 + s, top + 30, cx - 34 + s, top + 46, false);
    drawArm(c, shR.x, shR.y, cx + 38 + s, top + 30, cx + 34 + s, top + 46, false);
  } else if (pose === "throw") {
    drawArm(c, shL.x, shL.y, cx - 44, top + 2, cx - 30, top - 10, false);
    drawArm(c, shR.x, shR.y, cx + 36, top + 30, cx + 30, top + 44, false);
  } else if (pose === "block") {
    drawArm(c, shL.x, shL.y, cx - 24, top + 16, cx - 16, top - 12, false);
    drawArm(c, shR.x, shR.y, cx + 24, top + 16, cx + 16, top - 12, false);
  } else {
    drawArm(c, shL.x, shL.y, cx - 38, top + 28 + bob, cx - 34, top + 44 + bob, false);
    drawArm(c, shR.x, shR.y, cx + 38, top + 28 - bob, cx + 32, top + 44 - bob, false);
    drawRolledDiploma(c, cx - 34, top + 42 + bob);
  }
}

function drawShieldDiploma(c: Ctx, x: number, y: number, torn: number) {
  const w = 38;
  const h = 22;
  rect(c, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, PAL.k);
  rect(c, x - w / 2, y - h / 2, w, h, PAL.paper);
  rect(c, x - w / 2, y + h / 2 - 3, w, 3, PAL.paperSh);
  drawText(c, "TITULO", x, y - 7, { color: "#3a2a1a", align: "center" });
  rect(c, x - 13, y + 1, 26, 1, "#9b8a6a");
  rect(c, x - 13, y + 4, 18, 1, "#9b8a6a");
  ell(c, x + 12, y + 5, 3, 3, PAL.red);
  if (torn > 0) {
    line(c, x - 6, y - h / 2, x - 2, y, PAL.k);
    line(c, x - 2, y, x - 5, y + h / 2, PAL.k);
  }
}

function drawStars(c: Ctx, x: number, y: number, t: number) {
  for (let i = 0; i < 4; i++) {
    const a = t * 4 + (i * Math.PI) / 2;
    const sx = x + Math.cos(a) * 16;
    const sy = y + Math.sin(a) * 4;
    rect(c, sx - 1, sy, 3, 1, "#ffe066");
    rect(c, sx, sy - 1, 1, 3, "#ffe066");
  }
}

function drawBubble(w: World, c: Ctx, text: string, headCx: number, headCy: number) {
  const maxW = Math.min(96, w.W - 12);
  const lines = wrapText(text.toUpperCase(), maxW - 8);
  const bw = Math.max(...lines.map((l) => textWidth(l))) + 8;
  const bh = lines.length * 8 + 5;
  const above = headCy - 18 - bh - 5 > 1;
  let bx = above ? headCx - bw / 2 : headCx + 16;
  let by = above ? headCy - 18 - bh - 5 : headCy - 30;
  bx = Math.max(2, Math.min(w.W - bw - 2, bx));
  by = Math.max(2, by);
  rect(c, bx - 1, by - 1, bw + 2, bh + 2, PAL.k);
  rect(c, bx, by, bw, bh, "#ffffff");
  rect(c, bx, by + bh - 2, bw, 2, "#dde3ee");
  const tx = Math.max(bx + 3, Math.min(bx + bw - 6, headCx - 2));
  if (above) {
    rect(c, tx, by + bh, 4, 2, "#ffffff");
    rect(c, tx + 1, by + bh + 2, 2, 2, "#ffffff");
    rect(c, tx - 1, by + bh, 1, 3, PAL.k);
    rect(c, tx + 4, by + bh, 1, 3, PAL.k);
  }
  lines.forEach((l, i) =>
    drawText(c, l, bx + bw / 2, by + 3 + i * 8, { color: "#1a1116", align: "center" }),
  );
}

function drawBurst(c: Ctx, x: number, y: number, text: string, color: string, k: number) {
  const r = (text ? 8 : 5) + (1 - k) * 5;
  c.fillStyle = color;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const len = i % 2 ? r * 0.55 : r;
    line(c, x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, color, 2);
  }
  ell(c, x, y, r * 0.55, r * 0.45, "#ffffff");
  if (text) drawText(c, text, x, y - 2, { color: "#d3222e", align: "center", outline: "#1a1116" });
}

function drawParticles(w: World, c: Ctx) {
  for (const p of w.particles) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (p.kind === "star") {
      rect(c, x - 1, y, 3, 1, p.color);
      rect(c, x, y - 1, 1, 3, p.color);
    } else if (p.kind === "tooth") {
      rect(c, x - 1, y - 1, 3, 3, PAL.k);
      rect(c, x, y, 2, 2, p.color);
    } else if (p.kind === "paper") {
      rect(c, x, y, 2, (Math.floor(p.life * 20) % 2) + 1, p.color);
    } else if (p.kind === "sweat") {
      rect(c, x, y, 1, 2, p.color);
      rect(c, x, y - 1, 1, 1, "#ffffff");
    } else rect(c, x, y, p.size, p.size, p.color);
  }
}

function drawRotated(
  c: Ctx,
  img: HTMLCanvasElement,
  x: number,
  y: number,
  rot: number,
  sx: number,
  sy: number,
  ax = img.width / 2,
  ay = img.height / 2,
  flip = false,
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (rot) c.rotate(rot);
  c.scale(flip ? -sx : sx, sy);
  c.drawImage(img, -ax, -ay);
  c.restore();
}

const easeOut = (k: number) => 1 - (1 - k) ** 3;

function drawHands(w: World, c: Ctx, art: Art) {
  const { W, H, t } = w;
  const weapon: Weapon = activeWeapon(w);
  const sued = w.suedUntil > t;
  if (weapon === "mazo") {
    const grip = { x: W * 0.74, y: H + 8 };
    const L = Math.min(H * 0.72, 96);
    const f = [...w.fists].reverse().find((fi) => fi.weapon === "mazo");
    let ang = -1.72 + Math.sin(t * 2) * 0.04;
    let len = L;
    if (f) {
      const e = t - f.t0;
      const target = Math.atan2(f.ty - grip.y, f.tx - grip.x);
      const dist = Math.hypot(f.tx - grip.x, f.ty - grip.y);
      if (e < f.travel) {
        const k = e / f.travel;
        const wind = k < 0.3 ? k / 0.3 : 1;
        const swing = k < 0.3 ? 0 : easeOut((k - 0.3) / 0.7);
        ang = -1.72 - 0.35 * wind * (1 - swing) + (target + 1.72) * swing;
        len = L + (dist - L) * swing;
      } else {
        const back = Math.min(1, (e - f.travel) / 0.16);
        ang = target + (-1.72 - target) * back;
        len = dist + (L - dist) * back;
      }
    }
    if (w.charging) ang -= 0.4 * Math.min(1, (t - w.charging.start) / 0.45);
    const hx = grip.x + Math.cos(ang) * len;
    const hy = grip.y + Math.sin(ang) * len;
    line(c, grip.x, grip.y, hx, hy, PAL.k, 5);
    line(c, grip.x, grip.y, hx, hy, "#7a4a22", 3);
    const golden = w.bonusMazoUntil > t;
    const scale = 1 + (1 - Math.min(1, len / L)) * 0.2;
    drawRotated(c, golden ? art.mazoGold : art.mazo, hx, hy, ang + Math.PI / 2, scale, scale);
    drawRotated(c, art.fist, grip.x - 6, H - 10, -0.3, 1.2, 1.2);
    return;
  }
  const img = weapon === "guantes" ? art.glove : art.fist;
  for (const side of [-1, 1] as const) {
    const rest = {
      x: W / 2 + side * Math.min(W * 0.32, 60),
      y: H - 8 + Math.sin(t * 3 + side) * 2,
    };
    const f = [...w.fists].reverse().find((fi) => fi.side === side);
    let x = rest.x;
    let y = rest.y + (sued ? 16 : 0);
    let s = 1.35;
    if (f) {
      const e = t - f.t0;
      const out = e < f.travel ? easeOut(e / f.travel) : 1;
      const back = e > f.travel ? Math.min(1, (e - f.travel) / 0.14) : 0;
      const k = out * (1 - back);
      x = rest.x + (f.tx - rest.x) * k;
      y = rest.y + (f.ty + 10 - rest.y) * k;
      s = 1.35 - 0.45 * k;
    }
    if (w.charging?.side === side) {
      const ck = Math.min(1, (t - w.charging.start) / WEAPON_STATS[weapon].charge);
      y += 8 * ck;
      x += Math.round(Math.sin(t * 60) * ck * 1.5);
      if (ck >= 1) {
        const glow = Math.floor(t * 12) % 2 ? "#ffe066" : "#ff9d2e";
        rect(c, x - 16, y - 20, 32, 1, glow);
        rect(c, x - 16, y - 20, 1, 20, glow);
        rect(c, x + 15, y - 20, 1, 20, glow);
      }
    }
    drawRotated(c, img, x, y, side * -0.12, s, s, img.width / 2, 8, side === 1);
  }
}

export function drawScene(w: World, c: Ctx, art: Art) {
  const { W, H, t } = w;
  c.imageSmoothingEnabled = false;
  c.save();
  if (w.shake > 0) {
    c.translate(
      Math.round((Math.random() - 0.5) * w.shake),
      Math.round((Math.random() - 0.5) * w.shake),
    );
  }
  const L = layout(w);
  drawBackground(w, c, Math.round(W / 2), baseHeadY(w));

  const pose = w.mood;
  drawBody(w, c, L.cx, L.neckY, pose);

  // Head: drawn to its own canvas so we can squash/rotate it as one sprite
  const talk = Boolean(w.speech) && Math.floor(t * 9) % 2 === 0;
  drawHead(art.head.c, {
    mood: pose === "getup" ? "hurt" : pose,
    blink: w.blinkAt < t && t < w.blinkAt + 0.12,
    talk,
    damage: w.damage,
    t,
  });
  const sq = w.squash.v * 0.035;
  drawRotated(
    c,
    art.head.el,
    L.headCx,
    L.headCy,
    w.headR.v * 0.06 + (pose === "ko" ? L.fall * 0.5 : 0),
    1 - sq * 0.8,
    1 + sq,
    24,
    30,
  );
  if (pose === "block") drawShieldDiploma(c, L.cx, L.headCy - 1, w.damage > 0.5 ? 1 : 0);
  if (pose === "dizzy" || pose === "getup") drawStars(c, L.headCx, L.headCy - 17, t);
  if (pose === "ko" && t - w.koAt > 0.6) {
    const n = Math.min(3, Math.floor((t - w.koAt - 0.6) / 0.45) + 1);
    drawText(c, `${n}...`, W / 2, H * 0.42, {
      scale: 2,
      color: "#ffffff",
      align: "center",
      outline: PAL.k,
    });
  }

  drawParticles(w, c);
  for (const b of w.bursts) drawBurst(c, b.x, b.y, b.text, b.color, b.life / 0.36);

  // Flying lawsuits
  for (const p of w.papers) {
    if (t < p.t0) continue;
    const s = paperState(w, p);
    drawRotated(c, art.paper, s.x, s.y, Math.sin(s.rot) * 0.5, s.scale, s.scale);
    if (s.k > 0.35 && Math.floor(t * 8) % 2 === 0)
      drawText(c, "¡TOCÁ!", s.x, s.y - s.half - 8, {
        color: "#ffe066",
        align: "center",
        outline: PAL.k,
      });
  }

  if (w.speech && pose !== "ko") drawBubble(w, c, w.speech.text, L.headCx, L.headCy);

  drawHands(w, c, art);

  for (const tx of w.texts) {
    const a = Math.min(1, tx.life / (tx.max * 0.35));
    if (a < 0.2 && Math.floor(t * 20) % 2) continue;
    const fit = Math.max(1, Math.floor((W - 6) / Math.max(1, textWidth(tx.text))));
    drawText(c, tx.text, tx.x, tx.y, {
      scale: Math.min(tx.scale, fit),
      color: tx.color,
      align: "center",
      outline: PAL.k,
    });
  }

  if (w.suedUntil > t) {
    const k = 1 - (w.suedUntil - t) / 1.2;
    c.fillStyle = "rgba(20,0,0,0.35)";
    c.fillRect(0, 0, W, H);
    const s = k < 0.12 ? 3 - k * 12 : 2;
    c.save();
    c.translate(Math.round(W / 2), Math.round(H * 0.45));
    c.rotate(-0.16);
    const label = "¡DEMANDADO!";
    const tw = textWidth(label, s) + 12;
    rect(c, -tw / 2 - 2, -12, tw + 4, 24, "#d3222e");
    rect(c, -tw / 2, -10, tw, 20, "#fbfaf4");
    drawText(c, label, 0, -5 * s + 5 - s, { scale: s, color: "#d3222e", align: "center" });
    c.restore();
  }

  c.restore();
  // Vignette (outside the shake so edges stay put)
  c.fillStyle = "rgba(0,0,0,0.28)";
  c.fillRect(0, 0, W, 2);
  c.fillRect(0, H - 2, W, 2);
  c.fillRect(0, 0, 2, H);
  c.fillRect(W - 2, 0, 2, H);
  if (w.flash > 0) {
    c.fillStyle = `rgba(255,255,255,${w.flash * 0.7})`;
    c.fillRect(0, 0, W, H);
  }
}

/** Small standalone pixel icons for the shop and weapon picker. */
export function drawIcon(c: Ctx, kind: "titulo" | "mazo" | "guantes" | "punos", size: number) {
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, size, size);
  const art = buildArt();
  if (kind === "titulo") {
    drawWallDiploma(c, (size - 46) / 2, (size - 44) / 2, true);
    drawText(c, "H.KAUSA", size / 2, (size - 44) / 2 + 35, { color: "#ffe38a", align: "center" });
  } else if (kind === "mazo") {
    const cx = size / 2;
    line(c, cx + 10, size - 4, cx - 4, size / 2 - 4, PAL.k, 5);
    line(c, cx + 10, size - 4, cx - 4, size / 2 - 4, "#7a4a22", 3);
    drawRotated(c, art.mazo, cx - 6, size / 2 - 8, -0.6, 1, 1);
  } else {
    const img = kind === "guantes" ? art.glove : art.fist;
    drawRotated(c, img, size / 2, size / 2 + 2, 0, 1, 1);
  }
}
