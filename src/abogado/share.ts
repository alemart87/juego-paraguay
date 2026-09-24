import type { RunResult } from "./engine";
import { drawText, textWidth, wrapText } from "./font";
import { PAL } from "./render";

export const GAME_TITLE = "Hernán Rivas ES ABOGADO";
export const GAME_PATH = "/hernan-rivas-abogado";
export const SHARE_HOST = "influencerspy.pro/hernan-rivas-abogado";

const WEAPON_LABEL: Record<RunResult["weapon"], string> = {
  punos: "A PUÑO LIMPIO",
  guantes: "CON GUANTES PRO",
  mazo: "CON EL MAZO",
};

function surface(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  return { el, c };
}

function toBlob(el: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    el.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"),
  );
}

function fitScale(text: string, maxWidth: number, max: number) {
  let s = max;
  while (s > 1 && textWidth(text, s) > maxWidth) s--;
  return s;
}

/** Upscales the live low-res frame and stamps a branded footer on it. */
export async function captureFrame(src: HTMLCanvasElement, score: number) {
  const k = Math.max(1, Math.ceil(1080 / src.width));
  const W = src.width * k;
  const band = Math.round(W * 0.16);
  const { el, c } = surface(W, src.height * k + band);
  c.drawImage(src, 0, 0, src.width * k, src.height * k);
  const y = src.height * k;
  c.fillStyle = PAL.k;
  c.fillRect(0, y, W, band);
  c.fillStyle = PAL.red;
  c.fillRect(0, y, W, Math.round(band * 0.06));
  const s1 = fitScale(GAME_TITLE, W * 0.9, Math.round(band / 16));
  drawText(c, GAME_TITLE, W / 2, y + band * 0.18, { scale: s1, color: "#ffffff", align: "center" });
  const line2 = `${score.toLocaleString("es-PY")} PTS · ${SHARE_HOST}`;
  const s2 = fitScale(line2, W * 0.9, Math.round(band / 26));
  drawText(c, line2, W / 2, y + band * 0.62, { scale: s2, color: "#ffe066", align: "center" });
  return toBlob(el);
}

/** 1080×1920 story card for WhatsApp / TikTok / Instagram. */
export async function resultCard(shot: HTMLCanvasElement | null, r: RunResult, name?: string) {
  const W = 1080;
  const H = 1920;
  const { el, c } = surface(W, H);
  // Striped Paraguayan backdrop
  const stripe = H / 3;
  [PAL.red, "#f3f3f3", PAL.blue].forEach((col, i) => {
    c.fillStyle = col;
    c.fillRect(0, i * stripe, W, stripe);
  });
  c.fillStyle = "rgba(10,6,14,0.82)";
  c.fillRect(0, 0, W, H);

  drawText(c, "PY-STAR GAMES PRESENTA", W / 2, 90, { scale: 5, color: "#ffe066", align: "center" });
  drawText(c, "HERNÁN RIVAS", W / 2, 170, {
    scale: 14,
    color: "#ffffff",
    align: "center",
    shadow: PAL.red,
  });
  drawText(c, "ES ABOGADO", W / 2, 270, {
    scale: 12,
    color: "#ffe066",
    align: "center",
    shadow: PAL.red,
  });

  // Action shot
  const frameY = 400;
  const frameW = 960;
  const frameH = 820;
  c.fillStyle = "#ffffff";
  c.fillRect((W - frameW) / 2 - 12, frameY - 12, frameW + 24, frameH + 24);
  c.fillStyle = PAL.k;
  c.fillRect((W - frameW) / 2, frameY, frameW, frameH);
  if (shot) {
    const k = Math.max(frameW / shot.width, frameH / shot.height);
    const dw = shot.width * k;
    const dh = shot.height * k;
    c.save();
    c.beginPath();
    c.rect((W - frameW) / 2, frameY, frameW, frameH);
    c.clip();
    c.drawImage(shot, (W - dw) / 2, frameY + (frameH - dh) / 2, dw, dh);
    c.restore();
  }

  const scoreText = r.score.toLocaleString("es-PY");
  drawText(c, "PUNTOS", W / 2, 1280, { scale: 5, color: "#9fb3ff", align: "center" });
  drawText(c, scoreText, W / 2, 1330, {
    scale: fitScale(scoreText, 980, 18),
    color: "#ffffff",
    align: "center",
    shadow: PAL.red,
  });
  const stats = [
    [`${r.kos}`, "K.O."],
    [`${r.maxCombo}`, "COMBO"],
    [`${r.accuracy}%`, "PUNTERÍA"],
  ];
  stats.forEach(([v, l], i) => {
    const x = 180 + i * 360;
    drawText(c, v, x, 1480, { scale: 9, color: "#ffe066", align: "center" });
    drawText(c, l, x, 1560, { scale: 4, color: "#ffffff", align: "center" });
  });
  const who = name
    ? `${name} LE PEGÓ ${WEAPON_LABEL[r.weapon]}`
    : `LE PEGUÉ ${WEAPON_LABEL[r.weapon]}`;
  drawText(c, who, W / 2, 1650, {
    scale: fitScale(who, 980, 5),
    color: "#ffffff",
    align: "center",
  });
  drawText(c, "¿ME SUPERÁS?", W / 2, 1730, { scale: 7, color: "#7ee0ff", align: "center" });
  drawText(c, SHARE_HOST, W / 2, 1830, { scale: 4, color: "#9aa3b5", align: "center" });
  return toBlob(el);
}

/** Parody certificate unlocked by the "Título" purchase. Clearly a joke. */
export async function certificate(name: string, best: number, kos: number) {
  const W = 1600;
  const H = 1130;
  const { el, c } = surface(W, H);
  c.fillStyle = PAL.goldSh;
  c.fillRect(0, 0, W, H);
  c.fillStyle = PAL.gold;
  c.fillRect(24, 24, W - 48, H - 48);
  c.fillStyle = PAL.k;
  c.fillRect(48, 48, W - 96, H - 96);
  c.fillStyle = "#f6efd9";
  c.fillRect(56, 56, W - 112, H - 112);
  // Pixel corner ornaments
  c.fillStyle = PAL.red;
  for (const [x, y] of [
    [80, 80],
    [W - 128, 80],
    [80, H - 128],
    [W - 128, H - 128],
  ]) {
    c.fillRect(x, y, 48, 12);
    c.fillRect(x, y, 12, 48);
    c.fillRect(x + 36, y + 36, 12, 12);
  }
  const ink = "#2a1d12";
  drawText(c, "REPÚBLICA DEL RING", W / 2, 110, { scale: 5, color: ink, align: "center" });
  drawText(c, "FACULTAD DE CIENCIAS DEL PUÑETAZO", W / 2, 170, {
    scale: 4,
    color: "#6d5436",
    align: "center",
  });
  drawText(c, "TÍTULO DE", W / 2, 260, { scale: 8, color: ink, align: "center" });
  drawText(c, "ABOGADO", W / 2, 330, { scale: 16, color: PAL.red, align: "center", shadow: ink });
  drawText(c, "HONORIS KAUSA", W / 2, 470, { scale: 8, color: PAL.goldSh, align: "center" });
  drawText(c, "POR CUANTO", W / 2, 580, { scale: 4, color: "#6d5436", align: "center" });
  const who = name.trim().toUpperCase() || "UN CAMPEÓN ANÓNIMO";
  drawText(c, who, W / 2, 630, { scale: fitScale(who, 1300, 10), color: ink, align: "center" });
  const body = `HA ACREDITADO ${best.toLocaleString("es-PY")} PUNTOS Y ${kos} K.O. CONTRA EL ABOGADO MÁS DISCUTIDO DEL PARAGUAY, SIN FALTAR A NINGUNA CLASE.`;
  wrapText(body, 1300, 4).forEach((l, i) =>
    drawText(c, l, W / 2, 740 + i * 44, { scale: 4, color: "#4b3a28", align: "center" }),
  );
  // Seal
  c.fillStyle = PAL.red;
  for (let y = -60; y <= 60; y += 6) {
    const hw = Math.round(Math.sqrt(3600 - y * y) / 6) * 6;
    c.fillRect(W - 300 - hw, 930 + y, hw * 2, 6);
  }
  drawText(c, "PY", W - 300, 912, { scale: 7, color: "#ffe066", align: "center" });
  c.fillStyle = ink;
  c.fillRect(220, 990, 420, 6);
  drawText(c, "EL RECTOR DEL RING", 430, 1010, { scale: 3, color: "#6d5436", align: "center" });
  drawText(c, "DOCUMENTO HUMORÍSTICO · SIN VALIDEZ LEGAL · PY-STAR GAMES", W / 2, H - 96, {
    scale: 3,
    color: "#8a7456",
    align: "center",
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

/** Native share sheet with the image when supported, otherwise download it. */
export async function shareBlob(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: "image/png" });
  const url = `https://www.${SHARE_HOST}`;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: `${text} ${url}`, title: GAME_TITLE });
      return "shared" as const;
    } catch (error) {
      if ((error as Error).name === "AbortError") return "cancelled" as const;
    }
  }
  downloadBlob(blob, filename);
  return "downloaded" as const;
}
