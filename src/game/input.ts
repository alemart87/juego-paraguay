import type { Input } from "./world";

/**
 * One action layer over keyboard, touch pads, swipe and gamepad. Gameplay only
 * ever reads `pollInput()` once per frame; devices just write raw state here.
 */

export type Action = "jump" | "attack" | "interact" | "swap" | "pause";

const held = new Set<string>();
let injected: string[] | null = null;
const pressed = new Set<Action>();
let gamepadSeen = false;
const padPrev: boolean[] = [];

export const pads = { left: false, right: false, attack: false };
/** Drag-to-move on the left half of the screen: -1 / 0 / 1. */
export const swipe = { dir: 0 };

const GAME_KEYS = new Set([
  "Space",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "KeyJ",
  "KeyK",
  "KeyX",
  "KeyF",
  "KeyE",
  "KeyQ",
  "Tab",
  "Enter",
]);

const KEY_ACTION: Record<string, Action> = {
  KeyW: "jump",
  ArrowUp: "jump",
  Space: "jump",
  KeyJ: "attack",
  KeyK: "attack",
  KeyX: "attack",
  KeyF: "attack",
  ControlLeft: "attack",
  ControlRight: "attack",
  KeyE: "interact",
  Enter: "interact",
  KeyQ: "swap",
  Tab: "swap",
  Escape: "pause",
  KeyP: "pause",
};

export function bindKeys() {
  const down = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    held.add(e.code);
    const a = KEY_ACTION[e.code];
    if (a) pressed.add(a);
  };
  const up = (e: KeyboardEvent) => {
    held.delete(e.code);
  };
  const clear = () => {
    held.clear();
    pads.left = pads.right = pads.attack = false;
    swipe.dir = 0;
  };
  window.addEventListener("keydown", down, { passive: false });
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

export function isDown(code: string) {
  return injected ? injected.includes(code) : held.has(code);
}

export function axis() {
  let v = 0;
  if (isDown("KeyA") || isDown("ArrowLeft")) v -= 1;
  if (isDown("KeyD") || isDown("ArrowRight")) v += 1;
  return v;
}

/** Used by the automated controls self-test. */
export function setKeys(codes: string[]) {
  injected = codes.length ? codes : null;
}

export function press(a: Action) {
  pressed.add(a);
}

export function setPad(dir: "left" | "right", on: boolean) {
  pads[dir] = on;
  if (on) pads[dir === "left" ? "right" : "left"] = false;
}

export function hasGamepad() {
  return gamepadSeen;
}

function readGamepad(out: { moveX: number; attackHeld: boolean }) {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return;
  let gp: Gamepad | null = null;
  try {
    for (const g of navigator.getGamepads()) if (g) gp = g;
  } catch {
    return;
  }
  if (!gp) return;
  gamepadSeen = true;
  const ax = gp.axes[0] ?? 0;
  if (Math.abs(ax) > 0.25) out.moveX += ax;
  const b = (i: number) => !!gp!.buttons[i]?.pressed;
  if (b(14)) out.moveX -= 1;
  if (b(15)) out.moveX += 1;
  const edge = (i: number, a: Action) => {
    const now = b(i);
    if (now && !padPrev[i]) pressed.add(a);
    padPrev[i] = now;
  };
  edge(0, "jump");
  edge(2, "attack");
  edge(7, "attack");
  edge(1, "interact");
  edge(3, "interact");
  edge(4, "swap");
  edge(5, "swap");
  edge(9, "pause");
  if (b(2) || b(7)) out.attackHeld = true;
}

/** Returns which actions were pressed this frame and clears them. */
export function pollInput(): Input & { pause: boolean } {
  const raw = { moveX: axis(), attackHeld: false };
  if (pads.left) raw.moveX -= 1;
  if (pads.right) raw.moveX += 1;
  raw.moveX += swipe.dir;
  readGamepad(raw);
  const attackHeld =
    raw.attackHeld ||
    pads.attack ||
    isDown("KeyJ") ||
    isDown("KeyK") ||
    isDown("KeyX") ||
    isDown("KeyF") ||
    isDown("ControlLeft");
  const out = {
    moveX: Math.max(-1, Math.min(1, raw.moveX)),
    jump: pressed.has("jump"),
    attack: pressed.has("attack"),
    attackHeld,
    interact: pressed.has("interact"),
    swap: pressed.has("swap"),
    pause: pressed.has("pause"),
  };
  pressed.clear();
  return out;
}

/** Drop any queued edge actions (used when a menu opens). */
export function flushInput() {
  pressed.clear();
}

export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
}
