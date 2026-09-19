import { CHAPTERS, HAZARDS, HEROES, pickupSprite, type Chapter } from "./content";

/**
 * Image cache. Sprites ship as very large PNGs (up to 1600px tall) but are drawn
 * at roughly 300px, so each one is downscaled once into a bitmap that is cheap
 * to blit every frame. Backgrounds are kept as-is (they cover the screen).
 */
export type Sprite = { img: CanvasImageSource; w: number; h: number };

const cache = new Map<string, Sprite>();
const pending = new Map<string, Promise<Sprite | null>>();

const FX_SPRITES = [
  "/sprites/pistol.png",
  "/sprites/knife.png",
  "/sprites/bullet.png",
  "/sprites/muzzle.png",
  "/sprites/tracer.png",
  "/sprites/impact.png",
  "/sprites/boom.png",
  "/sprites/slash.png",
  "/sprites/gib1.png",
  "/sprites/gib2.png",
  "/sprites/spray.png",
  "/sprites/slime.png",
  "/sprites/capi.png",
  "/sprites/book.png",
  "/sprites/coin.png",
  "/sprites/terere.png",
  "/sprites/fire.png",
];

function maxHeightFor(src: string) {
  if (src.startsWith("/stages/")) return 1440;
  if (
    src.includes("/sprites/walk/") ||
    /\/sprites\/(rafa|juan|richard|hector|masivo|pablito|marcos|gallaguer|onichan)\.png$/.test(src)
  )
    return 720;
  return 360;
}

/** Sprites exported with an opaque magenta "key" background instead of alpha. */
const KEYED = new Set(["/sprites/slash.png"]);

function keyOutMagenta(g: CanvasRenderingContext2D, w: number, h: number) {
  const im = g.getImageData(0, 0, w, h);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const gr = d[i + 1];
    const b = d[i + 2];
    // How "magenta" the pixel is: high red and blue, low green.
    const k = Math.min(r, b) - gr;
    if (k > 150) d[i + 3] = 0;
    else if (k > 60) d[i + 3] = Math.round(d[i + 3] * (1 - (k - 60) / 90));
  }
  g.putImageData(im, 0, 0);
}

function shrink(img: HTMLImageElement, maxH: number, src: string): Sprite {
  const keyed = KEYED.has(src);
  if ((img.naturalHeight <= maxH && !keyed) || typeof document === "undefined")
    return { img, w: img.naturalWidth, h: img.naturalHeight };
  const s = Math.min(1, maxH / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * s));
  const h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return { img, w: img.naturalWidth, h: img.naturalHeight };
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, w, h);
  if (keyed) keyOutMagenta(g, w, h);
  return { img: c, w, h };
}

export function loadSprite(src: string): Promise<Sprite | null> {
  const hit = cache.get(src);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(src);
  if (inflight) return inflight;
  const p = new Promise<Sprite | null>((resolve) => {
    if (typeof Image === "undefined") return resolve(null);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const sp = shrink(img, maxHeightFor(src), src);
      cache.set(src, sp);
      pending.delete(src);
      resolve(sp);
    };
    img.onerror = () => {
      pending.delete(src);
      resolve(null);
    };
    img.src = src;
  });
  pending.set(src, p);
  return p;
}

export function getSprite(src: string): Sprite | null {
  return cache.get(src) ?? null;
}

export function chapterAssets(ch: Chapter): string[] {
  const set = new Set<string>();
  for (const z of ch.zones) set.add(z.bg);
  for (const p of ch.props) set.add(p.src);
  for (const p of ch.pickups) {
    const src = pickupSprite(p);
    if (src) set.add(src);
  }
  for (const h of HEROES) {
    set.add(h.sprite);
    h.steps.forEach((s) => set.add(s));
  }
  for (const h of HAZARDS) {
    set.add(h.sprite);
    h.steps.forEach((s) => set.add(s));
  }
  FX_SPRITES.forEach((s) => set.add(s));
  return [...set];
}

/**
 * Preload a chapter. `onProgress` gets 0..1. Resolves when every image has
 * either loaded or failed (a missing sprite never blocks play).
 */
export async function preloadChapter(n: 1 | 2 | 3, onProgress?: (p: number) => void) {
  const list = chapterAssets(CHAPTERS[n]);
  let done = 0;
  onProgress?.(0);
  await Promise.all(
    list.map((src) =>
      loadSprite(src).then(() => {
        done++;
        onProgress?.(done / list.length);
      }),
    ),
  );
}

export function isChapterLoaded(n: 1 | 2 | 3) {
  return chapterAssets(CHAPTERS[n]).every((s) => cache.has(s));
}
