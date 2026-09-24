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

/**
 * Photo-puppet renderer: the real photo is cut into head / body / oath-arm
 * layers that are animated independently (spring knock-back, jaw flap,
 * blinking, squash) with cartoon decals and bright vector effects on top.
 * Everything is drawn in the engine's logical units; the scene sets the
 * device-pixel transform, so it stays sharp on any screen.
 */

type Ctx = CanvasRenderingContext2D;
type Pt = { x: number; y: number };

/** Source-photo coordinates (px in the original 497×456 picture). */
export const PHOTO = {
  k: 0.4,
  hc: { x: 322, y: 140 },
  head: { src: "/abogado/rivas/head.png", x: 268, y: 72, w: 122, h: 128 },
  body: { src: "/abogado/rivas/body.png", x: 236, y: 176, w: 244, h: 280 },
  arm: { src: "/abogado/rivas/arm.png", x: 0, y: 180, w: 278, h: 120 },
  neck: { x: 325, y: 194 },
  shoulder: { x: 262, y: 228 },
  eyeL: { x: 296, y: 139 },
  eyeR: { x: 322, y: 135 },
  mouth: { x: 301, y: 167 },
  cheek: { x: 330, y: 158 },
  forehead: { x: 332, y: 100 },
  nose: { x: 297, y: 152 },
};

const JAW: [number, number][] = [
  [276, 163],
  [300, 163],
  [318, 166],
  [336, 173],
  [352, 184],
  [364, 200],
  [276, 200],
];

export const FONT = '"Barlow Condensed", "Arial Narrow", Impact, sans-serif';
export const FONT_UI = '"Figtree", system-ui, sans-serif';

export type Art = {
  head: HTMLImageElement;
  body: HTMLImageElement;
  arm: HTMLImageElement;
  headTint: HTMLCanvasElement;
  skin: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

let artPromise: Promise<Art> | null = null;

export function loadArt(): Promise<Art> {
  artPromise ??= (async () => {
    const [head, body, arm] = await Promise.all([
      loadImage(PHOTO.head.src),
      loadImage(PHOTO.body.src),
      loadImage(PHOTO.arm.src),
      document.fonts?.load(`italic 900 20px ${FONT}`).catch(() => undefined),
    ]);
    // Red "ouch" flash: the head silhouette filled red, drawn over it on hits.
    const headTint = document.createElement("canvas");
    headTint.width = head.naturalWidth;
    headTint.height = head.naturalHeight;
    const tc = headTint.getContext("2d")!;
    tc.drawImage(head, 0, 0);
    tc.globalCompositeOperation = "source-atop";
    tc.fillStyle = "#ff2a2a";
    tc.fillRect(0, 0, headTint.width, headTint.height);
    // Sample his real skin tone for eyelids.
    let skin = "#d9a58c";
    try {
      const probe = document.createElement("canvas");
      probe.width = head.naturalWidth;
      probe.height = head.naturalHeight;
      const pc = probe.getContext("2d")!;
      pc.drawImage(head, 0, 0);
      const sx = (310 - PHOTO.head.x) * 2;
      const sy = (146 - PHOTO.head.y) * 2;
      const d = pc.getImageData(sx, sy, 4, 4).data;
      skin = `rgb(${d[0]},${d[1]},${d[2]})`;
    } catch {
      /* keep default */
    }
    return { head, body, arm, headTint, skin };
  })();
  return artPromise;
}

// ───────────────────────── helpers ─────────────────────────

export function text(
  c: Ctx,
  str: string,
  x: number,
  y: number,
  size: number,
  opts: {
    color?: string;
    stroke?: string;
    align?: CanvasTextAlign;
    font?: string;
    italic?: boolean;
    weight?: number;
    lineWidth?: number;
  } = {},
) {
  c.font = `${opts.italic === false ? "" : "italic "}${opts.weight ?? 900} ${size}px ${opts.font ?? FONT}`;
  c.textAlign = opts.align ?? "center";
  c.textBaseline = "middle";
  c.lineJoin = "round";
  if (opts.stroke) {
    c.strokeStyle = opts.stroke;
    c.lineWidth = opts.lineWidth ?? size * 0.22;
    c.strokeText(str, x, y);
  }
  c.fillStyle = opts.color ?? "#fff";
  c.fillText(str, x, y);
}

export function wrap(c: Ctx, str: string, maxWidth: number) {
  const words = str.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && c.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function star(c: Ctx, x: number, y: number, r: number, spikes = 5, inner = 0.45) {
  c.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

const easeOut = (k: number) => 1 - (1 - k) ** 3;

// ───────────────────────── background ─────────────────────────

function drawDiplomaSign(c: Ctx, x: number, y: number, w: number, gold: boolean, t: number) {
  const h = w * 0.68;
  c.save();
  c.translate(x, y);
  c.rotate(Math.sin(t * 0.8) * 0.03 - 0.04);
  const frame = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  frame.addColorStop(0, gold ? "#ffe07a" : "#8a5a2b");
  frame.addColorStop(1, gold ? "#b8820f" : "#4b2d12");
  c.fillStyle = frame;
  roundRect(c, -w / 2, -h / 2, w, h, w * 0.05);
  c.fill();
  c.fillStyle = "#fbf3dc";
  roundRect(c, -w / 2 + w * 0.07, -h / 2 + w * 0.07, w * 0.86, h - w * 0.14, w * 0.02);
  c.fill();
  text(c, "TÍTULO", 0, -h * 0.18, w * 0.2, { color: "#3a2a1a", italic: false });
  c.fillStyle = "#b9a680";
  c.fillRect(-w * 0.3, h * 0.02, w * 0.6, w * 0.02);
  c.fillRect(-w * 0.3, h * 0.12, w * 0.42, w * 0.02);
  c.save();
  c.translate(w * 0.16, h * 0.2);
  c.rotate(-0.25);
  c.strokeStyle = "#d52b1e";
  c.lineWidth = w * 0.025;
  roundRect(c, -w * 0.26, -w * 0.07, w * 0.52, w * 0.14, w * 0.02);
  c.stroke();
  text(c, "¿ABOGADO?", 0, 0, w * 0.1, { color: "#d52b1e" });
  c.restore();
  if (gold)
    text(c, "HONORIS KAUSA", 0, h / 2 + w * 0.09, w * 0.1, { color: "#ffe07a", stroke: "#3b2400" });
  c.restore();
}

function drawBackground(w: World, c: Ctx, cx: number, headY: number) {
  const { W, H, t } = w;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a0d52");
  g.addColorStop(0.5, "#5b1269");
  g.addColorStop(1, "#12072b");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // Rotating sunburst in Paraguayan colours
  c.save();
  c.translate(cx + 12, headY);
  c.rotate(t * 0.12);
  const R = Math.hypot(W, H);
  const rays = 18;
  const cols = ["rgba(213,43,30,0.28)", "rgba(255,255,255,0.10)", "rgba(0,56,168,0.30)"];
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / rays;
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, R, a0, a1);
    c.closePath();
    c.fillStyle = cols[i % 3];
    c.fill();
  }
  c.restore();
  const glow = c.createRadialGradient(cx + 12, headY, 4, cx + 12, headY, Math.max(W, H) * 0.6);
  glow.addColorStop(0, "rgba(255,210,120,0.55)");
  glow.addColorStop(0.35, "rgba(255,90,160,0.18)");
  glow.addColorStop(1, "rgba(10,4,30,0.0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);

  // Bokeh stage lights
  for (let i = 0; i < 14; i++) {
    const bx = hash(i + 1) * W;
    const by = hash(i + 7) * H * 0.45;
    const r = 2 + hash(i + 3) * 5;
    const a = 0.12 + 0.12 * Math.sin(t * (1 + hash(i) * 2) + i);
    c.fillStyle =
      i % 3 === 0
        ? `rgba(255,215,90,${a})`
        : i % 3 === 1
          ? `rgba(120,200,255,${a})`
          : `rgba(255,120,200,${a})`;
    c.beginPath();
    c.arc(bx, by, r, 0, Math.PI * 2);
    c.fill();
  }
  // Paparazzi flashes
  for (let i = 0; i < 3; i++) {
    const phase = t * 1.7 + i * 13.1;
    const slot = Math.floor(phase);
    if (hash(slot) > 0.65 && phase % 1 < 0.18) {
      const fx = hash(slot + 1.3) * W;
      const fy = hash(slot + 2.7) * H * 0.4;
      const fg = c.createRadialGradient(fx, fy, 0, fx, fy, 16);
      fg.addColorStop(0, "rgba(255,255,255,0.95)");
      fg.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = fg;
      c.fillRect(fx - 16, fy - 16, 32, 32);
      c.fillStyle = "#fff";
      star(c, fx, fy, 5, 4, 0.2);
      c.fill();
    }
  }

  // Diploma on the wall
  const roomAbove = headY - 30 > 40;
  if (roomAbove)
    drawDiplomaSign(c, Math.min(W - 26, cx + 44), Math.max(20, headY - 60), 44, w.goldTitle, t);
  else drawDiplomaSign(c, Math.min(W - 32, cx + 78), headY - 6, 46, w.goldTitle, t);

  // Ring ropes (red / white / blue) with a gentle sag
  const ropeCols = ["#e8332a", "#f5f5f5", "#1f5fd6"];
  ropeCols.forEach((col, i) => {
    const y = headY + 34 + i * 15;
    const sag = 4 + Math.sin(t * 1.3 + i) * 0.8;
    const rope = (dy: number) => {
      c.beginPath();
      c.moveTo(-5, y + dy);
      c.quadraticCurveTo(W / 2, y + sag + dy, W + 5, y + dy);
      c.stroke();
    };
    c.lineCap = "round";
    c.strokeStyle = "rgba(0,0,0,0.45)";
    c.lineWidth = 4;
    rope(1);
    c.strokeStyle = col;
    c.lineWidth = 3;
    rope(0);
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 0.8;
    rope(-0.8);
  });
}

// ───────────────────────── character ─────────────────────────

function armAngle(w: World, mood: Mood) {
  const t = w.t;
  switch (mood) {
    case "taunt":
      switch (w.gesture) {
        case 1: // fist pump
          return 0.95 + Math.abs(Math.sin(t * 9)) * 0.35;
        case 2: // wagging "callate"
          return 0.12 + Math.sin(t * 14) * 0.22;
        case 3: // arm straight up
          return 1.45 + Math.sin(t * 5) * 0.08;
        default: // friendly wave
          return 0.42 + Math.sin(t * 10) * 0.18;
      }
    case "block":
      return 1.25;
    case "throw":
      return 0.75;
    case "hurt":
      return -0.25 + Math.sin(t * 40) * 0.12;
    case "dodge":
      return 0.2;
    case "dizzy":
      return -0.7 + Math.sin(t * 4) * 0.18;
    case "ko":
      return 1.35 + Math.sin(t * 20) * 0.05;
    case "getup":
      return 0.5;
    default:
      return Math.sin(t * 1.6) * 0.05;
  }
}

function jawOpen(w: World, mood: Mood) {
  if (mood === "hurt" || mood === "ko") return 5;
  if (mood === "dizzy") return 3 + Math.sin(w.t * 5);
  if (w.speech) return Math.max(0, Math.sin(w.t * 24)) * 4.5;
  return 0;
}

function eyeCover(c: Ctx, art: Art, e: Pt, rx: number, ry: number) {
  c.fillStyle = art.skin;
  c.beginPath();
  c.ellipse(e.x, e.y, rx, ry, -0.12, 0, Math.PI * 2);
  c.fill();
}

function drawFaceFx(w: World, c: Ctx, art: Art, mood: Mood) {
  const d = w.damage;
  const { eyeL, eyeR, cheek, forehead, nose } = PHOTO;
  const t = w.t;

  if (d > 0.1) {
    const r = c.createRadialGradient(cheek.x, cheek.y, 1, cheek.x, cheek.y, 18);
    r.addColorStop(0, `rgba(235,40,40,${Math.min(0.55, d * 0.8)})`);
    r.addColorStop(1, "rgba(235,40,40,0)");
    c.fillStyle = r;
    c.fillRect(cheek.x - 18, cheek.y - 18, 36, 36);
  }
  const bruise = (e: Pt, a: number) => {
    const r = c.createRadialGradient(e.x, e.y, 1, e.x, e.y, 12);
    r.addColorStop(0, `rgba(70,20,110,${a})`);
    r.addColorStop(0.6, `rgba(110,40,150,${a * 0.6})`);
    r.addColorStop(1, "rgba(110,40,150,0)");
    c.fillStyle = r;
    c.fillRect(e.x - 12, e.y - 12, 24, 24);
  };
  if (d > 0.25) bruise(eyeR, Math.min(0.85, (d - 0.25) * 2.4));
  if (d > 0.7) bruise(eyeL, Math.min(0.85, (d - 0.7) * 3));

  const blink = w.blinkAt < t && t < w.blinkAt + 0.12;
  if (mood === "ko") {
    for (const e of [eyeL, eyeR]) {
      eyeCover(c, art, e, 7, 5);
      c.strokeStyle = "#140a0a";
      c.lineWidth = 2.4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(e.x - 5, e.y - 4);
      c.lineTo(e.x + 5, e.y + 4);
      c.moveTo(e.x + 5, e.y - 4);
      c.lineTo(e.x - 5, e.y + 4);
      c.stroke();
    }
  } else if (mood === "dizzy") {
    for (const [i, e] of [eyeL, eyeR].entries()) {
      const r = i ? 7.5 : 6;
      c.fillStyle = "#fff";
      c.strokeStyle = "#140a0a";
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(e.x, e.y, r, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.3) {
        const rr = (a / (Math.PI * 5)) * r * 0.9;
        const ang = a + t * 9 * (i ? 1 : -1);
        c.lineTo(e.x + Math.cos(ang) * rr, e.y + Math.sin(ang) * rr);
      }
      c.stroke();
    }
  } else if (mood === "hurt") {
    for (const [i, e] of [eyeL, eyeR].entries()) {
      eyeCover(c, art, e, 6.5, 4.2);
      const dir = i ? -1 : 1;
      c.strokeStyle = "#140a0a";
      c.lineWidth = 2;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(e.x - 5 * dir, e.y - 3.5);
      c.lineTo(e.x + 4 * dir, e.y);
      c.lineTo(e.x - 5 * dir, e.y + 3.5);
      c.stroke();
    }
    c.fillStyle = "rgba(140,210,255,0.9)";
    for (let i = 0; i < 2; i++) {
      const k = (t * 3 + i * 0.5) % 1;
      c.beginPath();
      c.arc(eyeR.x + 10 + k * 14, eyeR.y + k * 10 - k * k * 6, 1.6, 0, Math.PI * 2);
      c.fill();
    }
  } else if (blink) {
    for (const [i, e] of [eyeL, eyeR].entries()) {
      eyeCover(c, art, e, i ? 6.5 : 5.2, 3.6);
      c.strokeStyle = "rgba(40,20,15,0.8)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(e.x - (i ? 6 : 5), e.y + 0.5);
      c.quadraticCurveTo(e.x, e.y + 2.2, e.x + (i ? 6 : 5), e.y + 0.5);
      c.stroke();
    }
  }

  if (w.wet > 0.05) {
    // Soaked: shiny wet hair and drops running down his face
    const a = Math.min(1, w.wet * 1.4);
    c.strokeStyle = `rgba(220,245,255,${0.7 * a})`;
    c.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(300 + i * 11, 84 + (i % 2) * 3);
      c.quadraticCurveTo(306 + i * 11, 80, 312 + i * 11, 86);
      c.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const x = 292 + ((i * 37) % 64);
      const y = 100 + ((t * 38 + i * 29) % 88);
      c.fillStyle = `rgba(150,225,255,${0.85 * a})`;
      c.beginPath();
      c.moveTo(x, y - 4);
      c.quadraticCurveTo(x + 3, y + 1, x, y + 3);
      c.quadraticCurveTo(x - 3, y + 1, x, y - 4);
      c.fill();
    }
  }
  if (d > 0.4) {
    const r = 4 + Math.min(6, (d - 0.4) * 14) + Math.sin(t * 6) * 0.3;
    const g = c.createRadialGradient(
      forehead.x - r * 0.3,
      forehead.y - r * 0.3,
      0.5,
      forehead.x,
      forehead.y,
      r,
    );
    g.addColorStop(0, "#ffd6cf");
    g.addColorStop(0.5, "#f08b86");
    g.addColorStop(1, "#c8504f");
    c.fillStyle = g;
    c.beginPath();
    c.arc(forehead.x, forehead.y, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.8)";
    c.beginPath();
    c.arc(forehead.x - r * 0.35, forehead.y - r * 0.35, r * 0.22, 0, Math.PI * 2);
    c.fill();
  }
  if (d > 0.55) {
    c.save();
    c.translate(nose.x + 14, nose.y + 2);
    c.rotate(-0.55);
    c.fillStyle = "#f2c48f";
    roundRect(c, -13, -4, 26, 8, 4);
    c.fill();
    c.fillStyle = "#fbe2c2";
    roundRect(c, -5, -4, 10, 8, 2);
    c.fill();
    c.fillStyle = "#c99562";
    for (const dx of [-9, -7, 7, 9]) {
      c.beginPath();
      c.arc(dx, 0, 0.7, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
}

function drawHead(w: World, c: Ctx, art: Art, mood: Mood) {
  const H = PHOTO.head;
  const jaw = jawOpen(w, mood);
  c.drawImage(art.head, H.x, H.y, H.w, H.h);
  if (jaw > 0.4) {
    // Mouth interior shows between the upper face and the dropped jaw
    const m = PHOTO.mouth;
    c.fillStyle = "#3b0b10";
    c.beginPath();
    c.ellipse(m.x + 3, m.y + jaw * 0.45, 10, 1.2 + jaw * 0.75, 0.08, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff8ee";
    c.fillRect(m.x - 4, m.y - 1, 13, 1.8);
    c.fillStyle = "#e0606a";
    c.beginPath();
    c.ellipse(m.x + 3, m.y + jaw * 0.8, 6, 1.2 + jaw * 0.3, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.translate(0, jaw);
    c.beginPath();
    JAW.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.clip();
    c.drawImage(art.head, H.x, H.y, H.w, H.h);
    c.restore();
  }
  drawFaceFx(w, c, art, mood);
  const since = w.t - w.lastHitAt;
  if (since < 0.14) {
    c.globalAlpha = 0.5 * (1 - since / 0.14);
    c.drawImage(art.headTint, H.x, H.y, H.w, H.h);
    c.globalAlpha = 1;
  }
}

function drawShield(c: Ctx, t: number) {
  c.save();
  c.translate(306, 146);
  c.rotate(-0.08 + Math.sin(t * 8) * 0.02);
  c.fillStyle = "rgba(0,0,0,0.3)";
  roundRect(c, -52, -32, 108, 70, 6);
  c.fill();
  c.fillStyle = "#fbf3dc";
  c.strokeStyle = "#7a5520";
  c.lineWidth = 3;
  roundRect(c, -56, -36, 108, 70, 6);
  c.fill();
  c.stroke();
  text(c, "TÍTULO", -2, -14, 20, { color: "#3a2a1a", italic: false });
  c.fillStyle = "#b9a680";
  c.fillRect(-34, 2, 64, 2.5);
  c.fillRect(-34, 10, 44, 2.5);
  c.fillStyle = "#d52b1e";
  c.beginPath();
  c.arc(34, 18, 8, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawCharacter(w: World, c: Ctx, art: Art) {
  const L = layout(w);
  const mood = w.mood;
  const { k, hc, neck, shoulder, body, arm } = PHOTO;
  const t = w.t;
  const breathe = Math.sin(t * 2.3) * 0.012;
  const sq = w.squash.v;

  const talking = mood === "taunt";
  const bounce = talking ? -Math.abs(Math.sin(t * 6)) * 2.2 : 0;
  const sway = Math.sin(t * 1.1) * 0.025 + (talking ? Math.sin(t * 6) * 0.03 : 0);
  const shrug = talking && w.gesture === 2 ? Math.abs(Math.sin(t * 7)) * 0.03 : 0;
  // Idle head life: slow nod and tilt on top of the hit springs.
  const nod = Math.sin(t * 2.6) * 1.6 + (talking ? Math.sin(t * 12) * 1.4 : 0);
  const tilt = Math.sin(t * 1.3) * 0.05 + (talking ? Math.sin(t * 5) * 0.06 : 0);

  c.save();
  c.translate(L.cx, L.headY + 70 + bounce);
  c.rotate(sway);
  c.translate(0, -70);
  if (L.fall) c.rotate(-L.fall * 0.32);
  c.scale(k * (1 + sq * 0.012), k * (1 + breathe + shrug - sq * 0.012));
  c.translate(-hc.x, -hc.y);

  // Oath arm (behind the torso), pivoting at the shoulder
  c.save();
  c.translate(shoulder.x, shoulder.y);
  c.rotate(armAngle(w, mood));
  c.translate(-shoulder.x, -shoulder.y);
  c.drawImage(art.arm, arm.x, arm.y, arm.w, arm.h);
  c.restore();

  // Neck that stretches between the collar and the (moving) head
  const hx = w.headX.v / k;
  const hy = w.headY.v / k + nod;
  const neckGrad = c.createLinearGradient(300, 0, 350, 0);
  neckGrad.addColorStop(0, "#c98f74");
  neckGrad.addColorStop(1, "#9c6450");
  c.fillStyle = neckGrad;
  c.beginPath();
  c.moveTo(302, 196);
  c.lineTo(348, 196);
  c.lineTo(348 + hx, 168 + hy);
  c.lineTo(302 + hx, 168 + hy);
  c.closePath();
  c.fill();

  c.drawImage(art.body, body.x, body.y, body.w, body.h);

  // Head on a spring, pivoting at the neck
  c.save();
  c.translate(hx, hy);
  c.translate(neck.x, neck.y);
  c.rotate(w.headR.v * 0.07 + tilt + (mood === "ko" ? L.fall * 0.35 : 0));
  const sqH = w.squash.v * 0.03;
  c.scale(1 + sqH * 0.7, 1 - sqH);
  c.transform(1, 0, Math.max(-0.35, Math.min(0.35, w.headX.vel * 0.0006)), 1, 0, 0);
  c.translate(-neck.x, -neck.y);
  drawHead(w, c, art, mood === "getup" ? "hurt" : mood);
  if (mood === "block") drawShield(c, t);
  c.restore();

  c.restore();
}

function drawStars(c: Ctx, x: number, y: number, t: number) {
  for (let i = 0; i < 5; i++) {
    const a = t * 4 + (i * Math.PI * 2) / 5;
    const sx = x + Math.cos(a) * 20;
    const sy = y + Math.sin(a) * 5;
    c.fillStyle = i % 2 ? "#ffe066" : "#ffffff";
    c.strokeStyle = "#7a3b00";
    c.lineWidth = 0.6;
    star(c, sx, sy, 3.2);
    c.fill();
    c.stroke();
  }
}

// ───────────────────────── player hands ─────────────────────────

function sleeve(c: Ctx, w: number) {
  c.save();
  c.beginPath();
  c.rect(-w / 2, 8, w, 60);
  c.clip();
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 ? "#ffffff" : "#d52b1e";
    c.fillRect(-w / 2 + (i * w) / 6, 8, w / 6 + 0.2, 60);
  }
  c.restore();
  c.strokeStyle = "#2a1210";
  c.lineWidth = 1.2;
  c.strokeRect(-w / 2, 8, w, 60);
  c.fillStyle = "#0038a8";
  c.fillRect(-w / 2 - 0.5, 7, w + 1, 3);
}

function drawFist(c: Ctx) {
  sleeve(c, 18);
  const g = c.createLinearGradient(-14, -14, 12, 10);
  g.addColorStop(0, "#ffd9b8");
  g.addColorStop(1, "#d48f68");
  c.fillStyle = g;
  c.strokeStyle = "#3a1a10";
  c.lineWidth = 1.3;
  roundRect(c, -14, -12, 28, 22, 8);
  c.fill();
  c.stroke();
  for (let i = 0; i < 4; i++) {
    const kx = -10.5 + i * 7;
    c.fillStyle = "#ffe2c8";
    c.beginPath();
    c.ellipse(kx, -11, 3.6, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  c.fillStyle = "#e3a47c";
  roundRect(c, -13, -1, 20, 7, 3.5);
  c.fill();
  c.stroke();
}

function drawGlove(c: Ctx, mirrored = false) {
  sleeve(c, 18);
  c.fillStyle = "#ffffff";
  c.strokeStyle = "#2a1210";
  c.lineWidth = 1.3;
  roundRect(c, -11, 3, 22, 9, 3);
  c.fill();
  c.stroke();
  const g = c.createRadialGradient(-5, -9, 2, 0, -3, 20);
  g.addColorStop(0, "#ff8a8a");
  g.addColorStop(0.45, "#e0262f");
  g.addColorStop(1, "#8c0f16");
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, -5, 16, 14, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.7)";
  c.beginPath();
  c.ellipse(-6, -12, 5, 2.4, -0.4, 0, Math.PI * 2);
  c.fill();
  c.save();
  if (mirrored) c.scale(-1, 1);
  text(c, "PY", mirrored ? -2 : 2, -3, 8, { color: "#ffe066", stroke: "#6d0a10", lineWidth: 1.4 });
  c.restore();
}

function drawMazoHead(c: Ctx, golden: boolean) {
  const g = c.createLinearGradient(0, -10, 0, 10);
  g.addColorStop(0, golden ? "#fff0a8" : "#d58c4d");
  g.addColorStop(0.5, golden ? "#f2b72b" : "#a0622d");
  g.addColorStop(1, golden ? "#9a6a08" : "#5e3413");
  c.fillStyle = g;
  c.strokeStyle = "#2a1208";
  c.lineWidth = 1.4;
  roundRect(c, -20, -10, 40, 20, 4);
  c.fill();
  c.stroke();
  for (const x of [-16, 12]) {
    c.fillStyle = golden ? "#fff6d0" : "#c4ccd8";
    c.fillRect(x, -10, 4, 20);
    c.strokeRect(x, -10, 4, 20);
  }
  if (golden) {
    c.fillStyle = "rgba(255,255,255,0.8)";
    star(c, -4, -3, 3, 4, 0.3);
    c.fill();
  }
}

function drawAxeHead(c: Ctx) {
  // Inflatable toy axe: glossy red blade, yellow cap, white seams.
  const g = c.createLinearGradient(0, -14, 26, 14);
  g.addColorStop(0, "#ff8a8a");
  g.addColorStop(0.5, "#ff2e4d");
  g.addColorStop(1, "#b0102a");
  c.fillStyle = g;
  c.strokeStyle = "#2a0810";
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(0, -9);
  c.quadraticCurveTo(10, -16, 26, -15);
  c.quadraticCurveTo(20, 0, 26, 15);
  c.quadraticCurveTo(10, 16, 0, 9);
  c.closePath();
  c.fill();
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.8)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(6, -10);
  c.quadraticCurveTo(16, -12, 22, -11);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.55)";
  c.beginPath();
  c.ellipse(12, -6, 5, 2, -0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffd23f";
  c.strokeStyle = "#2a0810";
  roundRect(c, -5, -11, 9, 22, 3);
  c.fill();
  c.stroke();
}

function drawHandle(
  c: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  kind: "mazo" | "hacha",
) {
  c.lineCap = "round";
  c.strokeStyle = "#2a1208";
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();
  c.strokeStyle = kind === "hacha" ? "#ffd23f" : "#8a5428";
  c.lineWidth = 4;
  c.stroke();
  if (kind === "hacha") {
    c.strokeStyle = "#1f5fd6";
    c.setLineDash([3, 5]);
    c.stroke();
    c.setLineDash([]);
  }
}

function drawSwing(w: World, c: Ctx, kind: "mazo" | "hacha") {
  const { W, H, t } = w;
  const dir = kind === "mazo" ? 1 : -1;
  const grip = { x: W * (dir > 0 ? 0.74 : 0.26), y: H + 8 };
  const Lr = Math.min(H * 0.72, 96);
  const idle = (dir > 0 ? -1.72 : -Math.PI + 1.72) + Math.sin(t * 2) * 0.04;
  const f = [...w.fists].reverse().find((fi) => fi.weapon === kind);
  let ang = idle;
  let len = Lr;
  if (f) {
    const e = t - f.t0;
    const target = Math.atan2(f.ty - grip.y, f.tx - grip.x);
    const dist = Math.hypot(f.tx - grip.x, f.ty - grip.y);
    if (e < f.travel) {
      const kk = e / f.travel;
      const wind = kk < 0.3 ? kk / 0.3 : 1;
      const swing = kk < 0.3 ? 0 : easeOut((kk - 0.3) / 0.7);
      ang = idle - 0.35 * dir * wind * (1 - swing) + (target - idle) * swing;
      len = Lr + (dist - Lr) * swing;
    } else {
      const back = Math.min(1, (e - f.travel) / 0.16);
      ang = target + (idle - target) * back;
      len = dist + (Lr - dist) * back;
    }
  }
  if (w.charging) ang -= 0.4 * dir * Math.min(1, (t - w.charging.start) / 0.45);
  const hx = grip.x + Math.cos(ang) * len;
  const hy = grip.y + Math.sin(ang) * len;
  drawHandle(c, grip.x, grip.y, hx, hy, kind);
  c.save();
  c.translate(hx, hy);
  c.rotate(ang + Math.PI / 2);
  if (kind === "mazo") drawMazoHead(c, w.bonusMazoUntil > t);
  else {
    if (dir < 0) c.scale(-1, 1);
    drawAxeHead(c);
  }
  c.restore();
  c.save();
  c.translate(grip.x - 6 * dir, H - 8);
  c.rotate(-0.3 * dir);
  c.scale(dir > 0 ? 1.2 : -1.2, 1.2);
  drawFist(c);
  c.restore();
}

function drawMagnum(c: Ctx, level: number) {
  // Oversized neon water gun with a tank full of terere (local +x = forward).
  c.strokeStyle = "#1a0f24";
  c.lineWidth = 1.3;
  c.fillStyle = "#1fbf5b";
  roundRect(c, 22, -3.5, 14, 7, 2.5);
  c.fill();
  c.stroke();
  c.fillStyle = "#ffd23f";
  roundRect(c, 34, -4.5, 4, 9, 1.5);
  c.fill();
  c.stroke();
  const body = c.createLinearGradient(0, -8, 0, 8);
  body.addColorStop(0, "#ffb347");
  body.addColorStop(1, "#ff6a00");
  c.fillStyle = body;
  roundRect(c, -10, -7, 34, 14, 5);
  c.fill();
  c.stroke();
  c.fillStyle = "#ff6a00";
  c.save();
  c.translate(-4, 5);
  c.rotate(0.35);
  roundRect(c, -4, 0, 9, 18, 3);
  c.fill();
  c.stroke();
  c.restore();
  c.fillStyle = "rgba(210,255,230,0.55)";
  roundRect(c, -6, -19, 22, 12, 4);
  c.fill();
  c.stroke();
  c.save();
  roundRect(c, -6, -19, 22, 12, 4);
  c.clip();
  c.fillStyle = "#58c46b";
  c.fillRect(-6, -19 + 12 * (1 - level), 22, 12);
  c.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.arc(-2 + i * 5, -10 - (i % 2) * 3, 1, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  text(c, "TERERÉ", 7, 0.5, 5, { color: "#fff", stroke: "#7a2a00", lineWidth: 1 });
}

function drawGun(w: World, c: Ctx) {
  const { W, H, t } = w;
  const base = { x: W * 0.72, y: H - 12 };
  const L = layout(w);
  const f = [...w.fists].reverse().find((fi) => fi.weapon === "magnum");
  const tx = f ? f.tx : L.headCx;
  const ty = f ? f.ty : L.headCy + 10;
  const aim = Math.atan2(ty - base.y, tx - base.x);
  const e = f ? t - f.t0 : 9;
  const recoil = e < 0.12 ? Math.sin((e / 0.12) * Math.PI) * 6 : 0;
  const bob = Math.sin(t * 3) * 1.5;
  const gx = base.x - Math.cos(aim) * recoil;
  const gy = base.y - Math.sin(aim) * recoil + bob;
  const mx = gx + Math.cos(aim) * 38 * 1.3;
  const my = gy + Math.sin(aim) * 38 * 1.3;
  if (f && e < f.travel + 0.08) {
    const k = Math.min(1, e / f.travel);
    const ex = mx + (tx - mx) * k;
    const ey = my + (ty - my) * k;
    const nx = -(ey - my);
    const ny = ex - mx;
    const nl = Math.hypot(nx, ny) || 1;
    const wob = Math.sin(t * 50) * 3;
    c.lineCap = "round";
    const layers: [string, number][] = [
      ["rgba(40,160,120,0.55)", 6],
      ["rgba(150,240,210,0.9)", 3.5],
      ["rgba(255,255,255,0.9)", 1.2],
    ];
    for (const [col, lw] of layers) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(mx, my);
      c.quadraticCurveTo((mx + ex) / 2 + (nx / nl) * wob, (my + ey) / 2 + (ny / nl) * wob, ex, ey);
      c.stroke();
    }
    c.fillStyle = "rgba(200,255,240,0.9)";
    c.beginPath();
    c.arc(mx, my, 3 + (1 - k) * 3, 0, Math.PI * 2);
    c.fill();
  }
  c.save();
  c.translate(gx, gy);
  c.rotate(aim);
  c.scale(1.3, 1.3);
  drawMagnum(c, 0.4 + 0.5 * Math.abs(Math.sin(t * 0.3)));
  c.restore();
  c.save();
  c.translate(gx + 2, gy + 16);
  c.rotate(-0.2);
  c.scale(-1.15, 1.15);
  drawFist(c);
  c.restore();
}

function drawHands(w: World, c: Ctx) {
  const { W, H, t } = w;
  // Keep showing a weapon while its strike animates (e.g. the one-shot free try).
  const recent = [...w.fists].reverse().find((fi) => t - fi.t0 < fi.travel + 0.3);
  const weapon: Weapon = recent?.weapon ?? activeWeapon(w);
  const sued = w.suedUntil > t;
  if (weapon === "mazo" || weapon === "hacha") {
    drawSwing(w, c, weapon);
    return;
  }
  const sides: (-1 | 1)[] = weapon === "magnum" ? [-1] : [-1, 1];
  if (weapon === "magnum") drawGun(w, c);
  for (const side of sides) {
    const rest = {
      x: W / 2 + side * Math.min(W * 0.32, 60),
      y: H - 6 + Math.sin(t * 3 + side) * 2,
    };
    const f = [...w.fists].reverse().find((fi) => fi.side === side && fi.weapon === weapon);
    let x = rest.x;
    let y = rest.y + (sued ? 16 : 0);
    let s = 1.35;
    let moving = false;
    if (f) {
      const e = t - f.t0;
      const out = e < f.travel ? easeOut(e / f.travel) : 1;
      const back = e > f.travel ? Math.min(1, (e - f.travel) / 0.14) : 0;
      const kk = out * (1 - back);
      s = 1.35 - 0.8 * kk;
      x = rest.x + (f.tx - rest.x) * kk;
      y = rest.y + (f.ty + 14 * s - rest.y) * kk;
      moving = e < f.travel;
    }
    if (moving) {
      c.strokeStyle = "rgba(255,255,255,0.6)";
      c.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(x + i * 6, y + 14);
        c.lineTo(x + i * 6 + (rest.x - x) * 0.3, y + 14 + (rest.y - y) * 0.3);
        c.stroke();
      }
    }
    let glow = 0;
    if (w.charging?.side === side) {
      const ck = Math.min(1, (t - w.charging.start) / WEAPON_STATS[weapon].charge);
      y += 8 * ck;
      x += Math.sin(t * 60) * ck * 1.5;
      glow = ck;
    }
    c.save();
    c.translate(x, y);
    c.rotate(side * -0.12);
    c.scale(side === 1 ? -s : s, s);
    if (glow >= 1) {
      const gg = c.createRadialGradient(0, -4, 2, 0, -4, 26);
      gg.addColorStop(0, "rgba(255,230,80,0.9)");
      gg.addColorStop(1, "rgba(255,120,0,0)");
      c.fillStyle = gg;
      c.beginPath();
      c.arc(0, -4, 26, 0, Math.PI * 2);
      c.fill();
    }
    if (weapon === "guantes") drawGlove(c, side === 1);
    else drawFist(c);
    c.restore();
  }
}

// ───────────────────────── effects ─────────────────────────

function drawBubble(w: World, c: Ctx, str: string, hx: number, hy: number) {
  const size = 7;
  c.font = `800 ${size}px ${FONT_UI}`;
  const maxW = Math.min(90, w.W - 16);
  const lines = wrap(c, str, maxW);
  const bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 10;
  const bh = lines.length * (size + 2) + 7;
  let bx = hx - bw / 2 - 18;
  let by = hy - 38 - bh;
  if (by < 4) {
    by = hy - bh / 2 - 10;
    bx = hx + 26;
  }
  bx = Math.max(4, Math.min(w.W - bw - 4, bx));
  by = Math.max(4, by);
  const speech = w.speech!;
  const pop = Math.max(0.6, Math.min(1, (speech.until - w.t) * 8));
  c.save();
  c.translate(bx + bw / 2, by + bh);
  c.scale(pop, pop);
  c.translate(-(bx + bw / 2), -(by + bh));
  c.fillStyle = "#fff";
  c.strokeStyle = "#1a0f24";
  c.lineWidth = 1.2;
  roundRect(c, bx, by, bw, bh, 5);
  c.fill();
  c.stroke();
  const tx = Math.max(bx + 8, Math.min(bx + bw - 8, hx - 6));
  c.beginPath();
  c.moveTo(tx - 4, by + bh - 0.6);
  c.lineTo(tx + 3, by + bh + 7);
  c.lineTo(tx + 5, by + bh - 0.6);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(tx - 4, by + bh);
  c.lineTo(tx + 3, by + bh + 7);
  c.lineTo(tx + 5, by + bh);
  c.stroke();
  lines.forEach((l, i) =>
    text(c, l, bx + bw / 2, by + 4 + size / 2 + i * (size + 2), size, {
      color: "#1a0f24",
      font: FONT_UI,
      italic: false,
      weight: 800,
    }),
  );
  c.restore();
}

function drawBurst(c: Ctx, x: number, y: number, str: string, color: string, k: number) {
  const r = (str ? 13 : 8) * (0.7 + (1 - k) * 0.6);
  c.save();
  c.translate(x, y);
  c.rotate((1 - k) * 0.4);
  c.fillStyle = color;
  c.strokeStyle = "#d3222e";
  c.lineWidth = 1.4;
  star(c, 0, 0, r, 11, 0.55);
  c.fill();
  c.stroke();
  c.fillStyle = "#fff";
  star(c, 0, 0, r * 0.55, 11, 0.6);
  c.fill();
  if (str) text(c, str, 0, 0.5, r * 0.7, { color: "#d3222e", stroke: "#1a0f24", lineWidth: 1.6 });
  c.restore();
}

function drawParticles(w: World, c: Ctx) {
  for (const p of w.particles) {
    c.globalAlpha = Math.min(1, p.life / (p.max * 0.4));
    if (p.kind === "confetti") {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.life * 8);
      c.fillStyle = p.color;
      c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      c.restore();
    } else if (p.kind === "star") {
      c.fillStyle = p.color;
      star(c, p.x, p.y, 2.2);
      c.fill();
    } else if (p.kind === "tooth") {
      c.fillStyle = "#fffbe8";
      c.strokeStyle = "#6b4a2a";
      c.lineWidth = 0.5;
      roundRect(c, p.x - 1.5, p.y - 2, 3, 4, 1);
      c.fill();
      c.stroke();
    } else if (p.kind === "paper") {
      c.fillStyle = p.color;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.life * 10);
      c.fillRect(-1.5, -1, 3, 2);
      c.restore();
    } else if (p.kind === "water") {
      c.fillStyle = "rgba(160,235,255,0.9)";
      c.beginPath();
      c.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.9)";
      c.fillRect(p.x - 0.4, p.y - 0.6, 0.6, 0.6);
    } else if (p.kind === "sweat") {
      c.fillStyle = "rgba(150,215,255,0.95)";
      c.beginPath();
      c.moveTo(p.x, p.y - 2);
      c.quadraticCurveTo(p.x + 1.4, p.y + 0.5, p.x, p.y + 1.3);
      c.quadraticCurveTo(p.x - 1.4, p.y + 0.5, p.x, p.y - 2);
      c.fill();
    } else {
      c.fillStyle = p.color;
      c.fillRect(p.x, p.y, p.size, p.size);
    }
  }
  c.globalAlpha = 1;
}

function drawPaper(c: Ctx, x: number, y: number, s: number, rot: number) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  c.fillStyle = "rgba(0,0,0,0.3)";
  c.fillRect(-6, -7, 14, 18);
  c.fillStyle = "#fffdf6";
  c.strokeStyle = "#2a1a24";
  c.lineWidth = 0.6;
  c.fillRect(-7, -9, 14, 18);
  c.strokeRect(-7, -9, 14, 18);
  c.fillStyle = "#d52b1e";
  c.fillRect(-7, -9, 14, 4);
  text(c, "DEMANDA", 0, -7, 2.6, { color: "#fff", italic: false });
  c.fillStyle = "#9aa3b5";
  for (let i = 0; i < 5; i++) c.fillRect(-5, -2 + i * 2, i === 4 ? 6 : 10, 0.7);
  c.fillStyle = "#d52b1e";
  c.beginPath();
  c.arc(4, 6, 2, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

export function drawScene(w: World, c: Ctx, art: Art | null) {
  const { W, H, t } = w;
  c.save();
  if (w.shake > 0) c.translate((Math.random() - 0.5) * w.shake, (Math.random() - 0.5) * w.shake);
  const L = layout(w);
  drawBackground(w, c, L.cx - w.lean.v, baseHeadY(w));

  if (art) drawCharacter(w, c, art);
  else text(c, "Cargando al abogado…", W / 2, H / 2, 8, { color: "#fff" });

  if (w.mood === "dizzy" || w.mood === "getup") drawStars(c, L.headCx + 4, L.headCy - 24, t);
  if (w.mood === "ko" && t - w.koAt > 0.6) {
    const n = Math.min(3, Math.floor((t - w.koAt - 0.6) / 0.45) + 1);
    text(c, `${n}…`, W / 2, H * 0.45, 22, { color: "#fff", stroke: "#1a0f24" });
  }

  drawParticles(w, c);
  for (const b of w.bursts) drawBurst(c, b.x, b.y, b.text, b.color, b.life / 0.36);

  for (const p of w.papers) {
    if (t < p.t0) continue;
    const s = paperState(w, p);
    drawPaper(c, s.x, s.y, s.scale, Math.sin(s.rot) * 0.5);
    if (s.k > 0.3 && Math.floor(t * 8) % 2 === 0)
      text(c, "¡TOCALA!", s.x, s.y - s.half - 5, 7, { color: "#ffe066", stroke: "#1a0f24" });
  }

  if (w.speech && w.mood !== "ko") drawBubble(w, c, w.speech.text, L.headCx, L.headCy);

  drawHands(w, c);

  for (const tx of w.texts) {
    const a = Math.min(1, tx.life / (tx.max * 0.35));
    const age = tx.max - tx.life;
    const pop = age < 0.12 ? 0.6 + (age / 0.12) * 0.6 : 1;
    let size = 4 + tx.scale * 4.5;
    c.font = `italic 900 ${size}px ${FONT}`;
    const width = c.measureText(tx.text).width;
    if (width > W - 8) size *= (W - 8) / width;
    c.globalAlpha = a;
    c.save();
    c.translate(tx.x, tx.y);
    c.scale(pop, pop);
    text(c, tx.text, 0, 0, size, { color: tx.color, stroke: "#1a0f24" });
    c.restore();
    c.globalAlpha = 1;
  }

  if (w.suedUntil > t) {
    const k = 1 - (w.suedUntil - t) / 1.2;
    c.fillStyle = "rgba(60,0,10,0.35)";
    c.fillRect(0, 0, W, H);
    const s = k < 0.12 ? 1.6 - k * 5 : 1;
    c.save();
    c.translate(W / 2, H * 0.45);
    c.rotate(-0.16);
    c.scale(s, s);
    const size = Math.min(16, W / 7);
    c.font = `italic 900 ${size}px ${FONT}`;
    const tw = c.measureText("¡DEMANDADO!").width + 14;
    c.fillStyle = "#fffdf6";
    c.strokeStyle = "#d3222e";
    c.lineWidth = 3;
    roundRect(c, -tw / 2, -size * 0.8, tw, size * 1.6, 4);
    c.fill();
    c.stroke();
    text(c, "¡DEMANDADO!", 0, 1, size, { color: "#d3222e" });
    c.restore();
  }
  c.restore();

  const v = c.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.35,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.75,
  );
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(5,0,15,0.55)");
  c.fillStyle = v;
  c.fillRect(0, 0, W, H);
  if (w.flash > 0) {
    c.fillStyle = `rgba(255,255,255,${w.flash * 0.7})`;
    c.fillRect(0, 0, W, H);
  }
}

/** Vector icons for the shop and weapon picker (drawn at `size` canvas px). */
export type IconKind = "titulo" | "mazo" | "guantes" | "punos" | "hacha" | "magnum";

export function drawIcon(c: Ctx, kind: IconKind, size: number) {
  c.clearRect(0, 0, size, size);
  c.save();
  const u = size / 64;
  c.scale(u, u);
  if (kind === "titulo") {
    drawDiplomaSign(c, 32, 28, 52, true, 0);
  } else if (kind === "hacha") {
    c.translate(28, 34);
    c.rotate(0.6);
    drawHandle(c, 0, -6, 0, 28, "hacha");
    c.translate(0, -12);
    c.rotate(-Math.PI / 2);
    c.scale(1.1, 1.1);
    drawAxeHead(c);
  } else if (kind === "magnum") {
    c.translate(12, 38);
    c.rotate(-0.25);
    c.scale(1.05, 1.05);
    drawMagnum(c, 0.7);
  } else if (kind === "mazo") {
    c.translate(32, 32);
    c.rotate(-0.7);
    c.lineCap = "round";
    c.strokeStyle = "#2a1208";
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(0, -4);
    c.lineTo(0, 28);
    c.stroke();
    c.strokeStyle = "#8a5428";
    c.lineWidth = 5;
    c.stroke();
    c.translate(0, -12);
    drawMazoHead(c, false);
  } else {
    c.translate(32, 30);
    c.scale(1.3, 1.3);
    if (kind === "guantes") drawGlove(c);
    else drawFist(c);
  }
  c.restore();
}
