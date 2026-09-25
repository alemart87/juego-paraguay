import { useState, type FormEvent } from "react";
import { Check, LoaderCircle, Lock, RefreshCw, X } from "lucide-react";
import { ABOGADO_SHOP_ITEMS, type AbogadoSku } from "@/battle/shop-catalog";
import { GameIcon } from "./GameIcon";
import { checkout, createProfile, profile, syncOwned } from "./commerce";
import type { Weapon } from "./engine";

/**
 * In-game purchase for a locked weapon. The match stays paused behind it and
 * Whop opens in a new tab, so the player can pay and come back to keep hitting.
 */
export function QuickBuy({
  weapon,
  sku,
  onOwned,
  onClose,
}: {
  weapon: Weapon;
  sku: AbogadoSku;
  onOwned: (skus: AbogadoSku[]) => void;
  onClose: () => void;
}) {
  const item = ABOGADO_SHOP_ITEMS.find((i) => i.sku === sku)!;
  const [step, setStep] = useState<"offer" | "profile" | "waiting" | "done">("offer");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(profile()?.name ?? "");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const needsProfile = () => {
    const p = profile();
    return !p?.benefitToken || (p.kind !== "email" && !p.purchaseEmail);
  };

  const pay = async () => {
    setMessage("");
    if (needsProfile()) {
      setStep("profile");
      return;
    }
    // Open the tab synchronously (inside the click) so popup blockers allow it.
    const tab = window.open("about:blank", "_blank");
    setBusy(true);
    try {
      const r = await checkout(sku, tab);
      if (!r.ok) {
        tab?.close();
        setMessage(r.message);
      } else setStep("waiting");
    } catch {
      tab?.close();
      setMessage("No pudimos abrir Whop. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await createProfile(name, email);
      if (!r.ok) setMessage(r.message);
      else setStep("offer");
    } catch {
      setMessage("Revisá tu nombre (2 a 24 letras) y tu correo.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setMessage("");
    const r = await syncOwned();
    setBusy(false);
    if (r.skus.includes(sku)) {
      onOwned(r.skus);
      setStep("done");
    } else
      setMessage(
        "Todavía no vemos el pago. Si ya pagaste con el mismo correo, esperá unos segundos y tocá de nuevo.",
      );
  };

  return (
    <div className="ab-qb" role="dialog" aria-modal="true" aria-label={`Comprar ${item.name}`}>
      <div className="ab-qb-card">
        <button className="ab-close" aria-label="Cerrar y seguir jugando" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="ab-qb-hero">
          <GameIcon kind={weapon} size={96} />
          <span className="ab-qb-badge">{item.badge}</span>
        </div>
        <h3>{item.name}</h3>
        <p className="ab-qb-desc">{item.description}</p>

        {step === "offer" && (
          <>
            <p className="ab-qb-lock">
              <Lock size={14} /> Ya usaste tu golpe gratis de esta partida.
            </p>
            <button
              className="ab-btn ab-btn-primary ab-qb-pay"
              disabled={busy}
              onClick={() => void pay()}
            >
              {busy ? <LoaderCircle className="ab-spin" size={20} /> : null}
              COMPRAR · USD {item.price.toFixed(2)}
            </button>
            <p className="ab-qb-note">El juego queda en pausa. Pagás en Whop y volvés acá.</p>
          </>
        )}

        {step === "profile" && (
          <form className="ab-profile" onSubmit={(e) => void submitProfile(e)}>
            <p>
              Dejá tu nombre y el <b>mismo correo que vas a usar en Whop</b> para activarla al
              instante.
            </p>
            <input
              required
              minLength={2}
              maxLength={24}
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nombre"
            />
            <input
              required
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Correo"
            />
            <label className="ab-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Acepto la{" "}
              <a href="/privacidad" target="_blank">
                privacidad
              </a>{" "}
              y la{" "}
              <a href="/politica-de-compras" target="_blank">
                política de compras
              </a>
              .
            </label>
            <button className="ab-btn ab-btn-primary" disabled={!consent || busy}>
              {busy ? <LoaderCircle className="ab-spin" size={16} /> : null} CONTINUAR
            </button>
          </form>
        )}

        {step === "waiting" && (
          <>
            <p className="ab-qb-note">
              Completá el pago en la pestaña de Whop y después tocá acá para activarla.
            </p>
            <button
              className="ab-btn ab-btn-primary ab-qb-pay"
              disabled={busy}
              onClick={() => void verify()}
            >
              {busy ? <LoaderCircle className="ab-spin" size={20} /> : <RefreshCw size={18} />} YA
              PAGUÉ · ACTIVAR
            </button>
            <button className="ab-link" onClick={() => setStep("offer")}>
              Volver a abrir el pago
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <p className="ab-qb-ok">
              <Check size={18} /> ¡Listo! {item.name} ya es tuya.
            </p>
            <button className="ab-btn ab-btn-primary ab-qb-pay" onClick={onClose}>
              ¡A PEGARLE!
            </button>
          </>
        )}

        {message && <p className="ab-notice">{message}</p>}
        {step !== "done" && (
          <button className="ab-link ab-qb-skip" onClick={onClose}>
            Seguir sin comprar
          </button>
        )}
      </div>
    </div>
  );
}
