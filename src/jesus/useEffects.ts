import { useEffect, useState } from "react";
import type { EffectKind, Particle } from "./Effects";

let nextId = 1;

/**
 * Capa de partículas sobre la escena: palomas, ángeles y destellos que suben
 * y se desvanecen. `burst` agrega un grupo desde un punto (en % del área).
 */
export function useEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const burst = (x: number, y: number, kinds: EffectKind[] = ["dove", "spark", "spark"]) => {
    const fresh = kinds.map((kind) => ({
      id: nextId++,
      kind,
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 10,
      drift: (Math.random() - 0.5) * 120,
      size: kind === "spark" ? 16 + Math.random() * 12 : 28 + Math.random() * 16,
    }));
    setParticles((current) => [...current, ...fresh].slice(-60));
  };
  useEffect(() => {
    if (!particles.length) return;
    const timer = window.setTimeout(
      () => setParticles((current) => current.slice(Math.min(current.length, 6))),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [particles]);
  return { particles, burst };
}

