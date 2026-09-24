import type { RunResult } from "./engine";
import { FONT, FONT_UI, roundRect, text, wrap } from "./render";

export const GAME_TITLE = "Hernán Rivas ES ABOGADO";
export const GAME_PATH = "/hernan-rivas-abogado";
export const SHARE_HOST = "influencerspy.pro/hernan-rivas-abogado";
/** Static landing page with this game's own social card (the app shell's OG tags are site-wide). */
export const SHARE_URL = "https://www.influencerspy.pro/abogado/jugar.html";

const RED = "#d52b1e";
const BLUE = "#0038a8";
const YELLOW = "#ffd23f";
const INK = "#1a0f24";

const WEAPON_LABEL: Record<RunResult["weapon"], string> = {
  punos: "A PUÑO LIMPIO",
  guantes: "CON GUANTES PRO",
  mazo: "CON EL MAZO",
  hacha: "CON EL HACHA INFLABLE",
  magnum: "CON LA MAGNUM DE TERERÉ",
};

function surface(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d")!;
  c.imageSmoothingQuality = "high";
  return { el, c };
}

function toBlob(el: HTMLCanvasElement, type = "image/png") {
  return new Promise<Blob>((resolve, reject) =>
    el.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), type, 0.92),
  );
}

function fit(c: CanvasRenderingContext2D, str: string, maxWidth: number, size: number) {
  c.font = `italic 900 ${size}px ${FONT}`;
  const w = c.measureText(str).width;
  return w > maxWidth ? (size * maxWidth) / w : size;
}

function rays(c: CanvasRenderingContext2D, x: number, y: number, R: number, alpha: number) {
  const cols = [
    `rgba(213,43,30,${alpha})`,
    `rgba(255,255,255,${alpha * 0.4})`,
    `rgba(0,56,168,${alpha})`,
  ];
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2;
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, R, a0, a0 + Math.PI / 12);
    c.closePath();
    c.fillStyle = cols[i % 3];
    c.fill();
  }
}

/** Live frame + branded footer band. */
export async function captureFrame(src: HTMLCanvasElement, score: number) {
  const W = src.width;
  const band = Math.round(W * 0.16);
  const { el, c } = surface(W, src.height + band);
  c.drawImage(src, 0, 0);
  const y = src.height;
  const g = c.createLinearGradient(0, y, W, y + band);
  g.addColorStop(0, RED);
  g.addColorStop(1, "#7a0f5c");
  c.fillStyle = g;
  c.fillRect(0, y, W, band);
  text(
    c,
    GAME_TITLE.toUpperCase(),
    W / 2,
    y + band * 0.36,
    fit(c, GAME_TITLE.toUpperCase(), W * 0.92, band * 0.36),
    {
      color: "#fff",
      stroke: INK,
    },
  );
  const line2 = `${score.toLocaleString("es-PY")} PTS · ${SHARE_HOST}`;
  text(c, line2, W / 2, y + band * 0.74, fit(c, line2, W * 0.9, band * 0.2), { color: YELLOW });
  return toBlob(el);
}

/** 1080×1920 story card for WhatsApp / TikTok / Instagram. */
export async function resultCard(shot: HTMLCanvasElement | null, r: RunResult, name?: string) {
  const W = 1080;
  const H = 1920;
  const { el, c } = surface(W, H);
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#2a0d52");
  bg.addColorStop(0.55, "#6a1270");
  bg.addColorStop(1, "#12072b");
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  rays(c, W / 2, 780, 1600, 0.22);

  text(c, "PY-STAR GAMES PRESENTA", W / 2, 90, 44, { color: YELLOW, italic: false, weight: 800 });
  text(c, "HERNÁN RIVAS", W / 2, 190, 150, { color: "#fff", stroke: INK, lineWidth: 18 });
  c.save();
  c.translate(W / 2, 320);
  c.rotate(-0.04);
  c.fillStyle = RED;
  roundRect(c, -300, -62, 600, 124, 18);
  c.fill();
  text(c, "ES ABOGADO", 0, 4, 104, { color: YELLOW, stroke: INK, lineWidth: 12 });
  c.restore();

  const fy = 420;
  const fw = W - 140;
  const fh = 800;
  c.save();
  c.translate(W / 2, fy + fh / 2);
  c.rotate(0.015);
  c.fillStyle = "#fff";
  roundRect(c, -fw / 2 - 16, -fh / 2 - 16, fw + 32, fh + 32, 28);
  c.fill();
  c.beginPath();
  roundRect(c, -fw / 2, -fh / 2, fw, fh, 18);
  c.clip();
  c.fillStyle = INK;
  c.fillRect(-fw / 2, -fh / 2, fw, fh);
  if (shot) {
    const k = Math.max(fw / shot.width, fh / shot.height);
    c.drawImage(
      shot,
      (-shot.width * k) / 2,
      (-shot.height * k) / 2,
      shot.width * k,
      shot.height * k,
    );
  }
  c.restore();

  const scoreText = r.score.toLocaleString("es-PY");
  text(c, "PUNTOS", W / 2, 1300, 48, { color: "#b9c6ff", italic: false, weight: 800 });
  text(c, scoreText, W / 2, 1400, fit(c, scoreText, 960, 190), {
    color: "#fff",
    stroke: INK,
    lineWidth: 20,
  });
  const stats = [
    [`${r.kos}`, "K.O."],
    [`${r.maxCombo}`, "COMBO"],
    [`${r.accuracy}%`, "PUNTERÍA"],
  ];
  stats.forEach(([v, l], i) => {
    const x = 200 + i * 340;
    c.fillStyle = "rgba(255,255,255,0.1)";
    roundRect(c, x - 140, 1510, 280, 170, 24);
    c.fill();
    text(c, v, x, 1575, 96, { color: YELLOW, stroke: INK, lineWidth: 10 });
    text(c, l, x, 1648, 36, { color: "#fff", italic: false, weight: 800 });
  });
  const who = name
    ? `${name.toUpperCase()} LE PEGÓ ${WEAPON_LABEL[r.weapon]}`
    : `LE PEGUÉ ${WEAPON_LABEL[r.weapon]}`;
  text(c, who, W / 2, 1735, fit(c, who, 960, 52), { color: "#fff" });
  text(c, "¿ME SUPERÁS?", W / 2, 1805, 70, { color: "#7ee0ff", stroke: INK, lineWidth: 8 });
  text(c, SHARE_HOST, W / 2, 1878, 34, {
    color: "#c9c2dc",
    italic: false,
    weight: 700,
    font: FONT_UI,
  });
  return toBlob(el);
}

/** Parody certificate unlocked by the "Título" purchase. Clearly a joke. */
export async function certificate(name: string, best: number, kos: number) {
  const W = 1600;
  const H = 1130;
  const { el, c } = surface(W, H);
  const frame = c.createLinearGradient(0, 0, W, H);
  frame.addColorStop(0, "#ffe07a");
  frame.addColorStop(0.5, "#c8901a");
  frame.addColorStop(1, "#ffe07a");
  c.fillStyle = frame;
  c.fillRect(0, 0, W, H);
  const paper = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
  paper.addColorStop(0, "#fffaf0");
  paper.addColorStop(1, "#efdfb8");
  c.fillStyle = paper;
  roundRect(c, 40, 40, W - 80, H - 80, 18);
  c.fill();
  c.strokeStyle = RED;
  c.lineWidth = 6;
  roundRect(c, 70, 70, W - 140, H - 140, 12);
  c.stroke();
  c.strokeStyle = BLUE;
  c.lineWidth = 3;
  roundRect(c, 84, 84, W - 168, H - 168, 10);
  c.stroke();

  const ink = "#2a1d12";
  text(c, "REPÚBLICA DEL RING", W / 2, 150, 54, { color: ink, italic: false, weight: 800 });
  text(c, "FACULTAD DE CIENCIAS DEL PUÑETAZO", W / 2, 210, 36, {
    color: "#6d5436",
    italic: false,
    weight: 700,
  });
  text(c, "TÍTULO DE", W / 2, 300, 70, { color: ink, italic: false });
  text(c, "ABOGADO", W / 2, 400, 170, { color: RED, stroke: ink, lineWidth: 6 });
  text(c, "HONORIS KAUSA", W / 2, 520, 72, { color: "#a8740f", italic: false });
  text(c, "POR CUANTO", W / 2, 610, 34, { color: "#6d5436", italic: false, weight: 700 });
  const who = name.trim().toUpperCase() || "UN CAMPEÓN ANÓNIMO";
  text(c, who, W / 2, 680, fit(c, who, 1250, 100), { color: ink });
  c.font = `600 36px ${FONT_UI}`;
  const body = `ha acreditado ${best.toLocaleString("es-PY")} puntos y ${kos} K.O. contra el abogado más discutido del Paraguay, sin faltar a ninguna clase.`;
  wrap(c, body, 1200).forEach((l, i) =>
    text(c, l, W / 2, 780 + i * 48, 36, {
      color: "#4b3a28",
      font: FONT_UI,
      italic: false,
      weight: 600,
    }),
  );
  // Wax seal
  const sx = W - 300;
  const sy = 930;
  const seal = c.createRadialGradient(sx - 20, sy - 20, 10, sx, sy, 80);
  seal.addColorStop(0, "#ff6b5e");
  seal.addColorStop(1, "#8c140c");
  c.fillStyle = seal;
  c.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 ? 70 : 80;
    c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
  text(c, "PY", sx, sy + 4, 64, { color: YELLOW, stroke: "#5a0a05", lineWidth: 6 });
  c.fillStyle = ink;
  c.fillRect(220, 990, 420, 4);
  text(c, "EL RECTOR DEL RING", 430, 1022, 28, { color: "#6d5436", italic: false, weight: 700 });
  text(c, "Documento humorístico · sin validez legal · PY-STAR GAMES", W / 2, H - 70, 24, {
    color: "#8a7456",
    font: FONT_UI,
    italic: false,
    weight: 600,
  });
  return toBlob(el);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
