const held = new Set<string>();
let injected: string[] | null = null;

export const pads = { left: false, right: false, punch: false };

export function bindKeys() {
  const down = (e: KeyboardEvent) => {
    held.add(e.code);
    if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
  };
  const up = (e: KeyboardEvent) => {
    held.delete(e.code);
  };
  const clear = () => held.clear();
  window.addEventListener("keydown", down, { passive: false });
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
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

export function setKeys(codes: string[]) {
  injected = codes.length ? codes : null;
}

export function wantsPunch() {
  return pads.punch || isDown("Space") || isDown("KeyJ") || isDown("KeyK");
}

export function setPad(dir: "left" | "right", on: boolean) {
  pads[dir] = on;
  if (on) pads[dir === "left" ? "right" : "left"] = false;
}
