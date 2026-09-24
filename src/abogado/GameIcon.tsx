import { useEffect, useRef } from "react";
import { drawIcon, type IconKind } from "./render";

/** Crisp vector icon (weapons, title) rendered at 2× for high-DPI screens. */
export function GameIcon({ kind, size = 56 }: { kind: IconKind; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (c) drawIcon(c, kind, size * 2);
  }, [kind, size]);
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      className="ab-icon"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
