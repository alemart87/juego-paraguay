export type EffectKind = "dove" | "angel" | "spark" | "light";
export type Particle = { id: number; kind: EffectKind; x: number; y: number; drift: number; size: number };

const GLYPH: Record<EffectKind, string> = { dove: "🕊️", angel: "👼", spark: "✨", light: "🌟" };
export function EffectsLayer({ particles }: { particles: Particle[] }) {
  return (
    <div className="jt-effects" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`jt-particle ${p.kind}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        >
          {GLYPH[p.kind]}
        </span>
      ))}
    </div>
  );
}
