/**
 * 5×5 bitmap font so every word on the pixel canvas is real pixel art (no
 * blurry anti-aliased system text). Accented vowels and Ñ reuse the base glyph
 * with a mark drawn two pixels above it.
 */

type Ctx = CanvasRenderingContext2D;

const G: Record<string, string[]> = {
  A: [".###.", "#...#", "#####", "#...#", "#...#"],
  B: ["####.", "#...#", "####.", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "####.", "#....", "#####"],
  F: ["#####", "#....", "####.", "#....", "#...."],
  G: [".####", "#....", "#.###", "#...#", ".###."],
  H: ["#...#", "#...#", "#####", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "....#", "....#", "#...#", ".###."],
  K: ["#...#", "#..#.", "###..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "####.", "#....", "#...."],
  Q: [".###.", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "####.", "#..#.", "#...#"],
  S: [".####", "#....", ".###.", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", ".#.#.", "..#..", "..#..", "..#.."],
  Z: ["#####", "...#.", "..#..", ".#...", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", ".###."],
  "1": [".##..", "..#..", "..#..", "..#..", ".###."],
  "2": ["####.", "....#", ".###.", "#....", "#####"],
  "3": ["####.", "....#", ".###.", "....#", "####."],
  "4": ["#..#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "####."],
  "6": [".###.", "#....", "####.", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#.."],
  "8": [".###.", "#...#", ".###.", "#...#", ".###."],
  "9": [".###.", "#...#", ".####", "....#", ".###."],
  "!": ["..#..", "..#..", "..#..", ".....", "..#.."],
  "¡": ["..#..", ".....", "..#..", "..#..", "..#.."],
  "?": [".###.", "#...#", "..##.", ".....", "..#.."],
  "¿": ["..#..", ".....", ".##..", "#...#", ".###."],
  ".": [".....", ".....", ".....", ".....", "..#.."],
  ",": [".....", ".....", ".....", "..#..", ".#..."],
  ":": [".....", "..#..", ".....", "..#..", "....."],
  "-": [".....", ".....", ".###.", ".....", "....."],
  "+": [".....", "..#..", ".###.", "..#..", "....."],
  "×": [".....", ".#.#.", "..#..", ".#.#.", "....."],
  "/": ["....#", "...#.", "..#..", ".#...", "#...."],
  "%": ["##..#", "##.#.", "..#..", ".#.##", "#..##"],
  "#": [".#.#.", "#####", ".#.#.", "#####", ".#.#."],
  "'": ["..#..", "..#..", ".....", ".....", "....."],
  '"': [".#.#.", ".#.#.", ".....", ".....", "....."],
  "(": ["...#.", "..#..", "..#..", "..#..", "...#."],
  ")": [".#...", "..#..", "..#..", "..#..", ".#..."],
  "·": [".....", ".....", "..#..", ".....", "....."],
  $: [".####", "#.#..", ".###.", "..#.#", "####."],
  "★": ["..#..", ".###.", "#####", ".###.", ".#.#."],
  "♥": [".#.#.", "#####", "#####", ".###.", "..#.."],
};

const MARKS: Record<string, [string, "acute" | "tilde"]> = {
  Á: ["A", "acute"],
  É: ["E", "acute"],
  Í: ["I", "acute"],
  Ó: ["O", "acute"],
  Ú: ["U", "acute"],
  Ñ: ["N", "tilde"],
  Ü: ["U", "acute"],
};

export const LINE_HEIGHT = 8;

function advance(ch: string) {
  return ch === " " ? 3 : 6;
}

export function textWidth(text: string, scale = 1) {
  let w = 0;
  for (const ch of text.toUpperCase()) w += advance(ch);
  return Math.max(0, w - 1) * scale;
}

function glyph(c: Ctx, ch: string, x: number, y: number, s: number) {
  const mark = MARKS[ch];
  const rows = G[mark ? mark[0] : ch];
  if (!rows) return;
  for (let r = 0; r < 5; r++) {
    const row = rows[r];
    let run = -1;
    for (let col = 0; col <= 5; col++) {
      const on = col < 5 && row[col] === "#";
      if (on && run < 0) run = col;
      if (!on && run >= 0) {
        c.fillRect(x + run * s, y + r * s, (col - run) * s, s);
        run = -1;
      }
    }
  }
  if (mark?.[1] === "acute") {
    c.fillRect(x + 3 * s, y - 2 * s, s, s);
    c.fillRect(x + 2 * s, y - s, s, s);
  } else if (mark?.[1] === "tilde") {
    c.fillRect(x + s, y - 2 * s, 2 * s, s);
    c.fillRect(x + 3 * s, y - 2 * s, s, s);
  }
}

function run(c: Ctx, text: string, x: number, y: number, s: number) {
  let cx = x;
  for (const ch of text) {
    glyph(c, ch, cx, y, s);
    cx += advance(ch) * s;
  }
}

export type TextOpts = {
  scale?: number;
  color?: string;
  align?: "left" | "center" | "right";
  outline?: string;
  shadow?: string;
};

/** Draws pixel text; `y` is the top of the 5-row glyph body. */
export function drawText(c: Ctx, text: string, x: number, y: number, opts: TextOpts = {}) {
  const s = Math.max(1, Math.round(opts.scale ?? 1));
  const str = text.toUpperCase();
  const width = textWidth(str, s);
  let left = opts.align === "center" ? x - width / 2 : opts.align === "right" ? x - width : x;
  left = Math.round(left);
  const top = Math.round(y);
  if (opts.outline) {
    c.fillStyle = opts.outline;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
    ])
      run(c, str, left + dx * s, top + dy * s, s);
  }
  if (opts.shadow) {
    c.fillStyle = opts.shadow;
    run(c, str, left + s, top + s, s);
  }
  c.fillStyle = opts.color ?? "#fff";
  run(c, str, left, top, s);
  return width;
}

/** Greedy word wrap measured in glyph columns. */
export function wrapText(text: string, maxWidth: number, scale = 1) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, scale) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
