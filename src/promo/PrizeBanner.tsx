import { useEffect, useRef, useState } from "react";
import { Trophy, X } from "lucide-react";
import { PRIZE } from "./prize";
import "./prize.css";

/**
 * Aviso del bono: aparece a los pocos segundos de entrar, con el premio bien
 * grande y una sola línea. Se queda hasta que la persona lo toque o lo cierre.
 * Sale una vez por carga de página.
 */
export function PrizeBanner({
  active = true,
  delayMs = 3000,
  onEnter,
}: {
  /** Solo cuenta el tiempo mientras esto es true (portada visible, sin diálogos). */
  active?: boolean;
  delayMs?: number;
  onEnter: () => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    if (!active || shown.current) return;
    const timer = window.setTimeout(() => {
      shown.current = true;
      setOpen(true);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);
  if (!open) return null;
  return (
    <div className="prize-banner" role="dialog" aria-modal="true" aria-label={PRIZE.headline}>
      <button
        type="button"
        className="prize-banner-scrim"
        aria-label="Cerrar aviso"
        onClick={() => setOpen(false)}
      />
      <div className="prize-banner-card">
        <button
          type="button"
          className="prize-banner-close"
          aria-label="Cerrar"
          onClick={() => setOpen(false)}
        >
          <X size={22} />
        </button>
        <span className="prize-banner-trophy">
          <Trophy size={42} />
        </span>
        <small>{PRIZE.kicker}</small>
        <strong>
          GANÁ
          <em>{PRIZE.amount}</em>
        </strong>
        <p>Jugá, cargá tu usuario y entrá al ranking.</p>
        <button
          type="button"
          className="prize-banner-cta"
          onClick={() => {
            setOpen(false);
            onEnter();
          }}
        >
          PARTICIPAR
        </button>
      </div>
    </div>
  );
}
