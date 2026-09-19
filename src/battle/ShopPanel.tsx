import { useState } from "react";
import { ExternalLink, LoaderCircle, LockKeyhole, ShoppingBag } from "lucide-react";
import { SHOP_ITEMS, getWhopCheckout, type ShopSku } from "./shop";

export function ShopPanel() {
  const [busy, setBusy] = useState<ShopSku | null>(null);
  const [message, setMessage] = useState("");
  const checkout = async (sku: ShopSku) => {
    setBusy(sku);
    setMessage("");
    try {
      const result = await getWhopCheckout({ data: { sku } });
      if (result.ok) window.open(result.url, "_blank", "noopener,noreferrer");
      else setMessage(result.message);
    } catch {
      setMessage("No pudimos abrir Whop. Probá de nuevo más tarde.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="shop-panel">
      <div className="shop-heading">
        <span className="eyebrow">
          <ShoppingBag size={15} /> TIENDA PY-STAR
        </span>
        <h2>Potenciá la próxima batalla.</h2>
        <p>Artículos opcionales. El precio y la confirmación final siempre aparecen en Whop.</p>
      </div>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <article key={item.sku} className="shop-item">
            <b aria-hidden="true">{item.icon}</b>
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <button
              className="secondary"
              disabled={busy !== null}
              onClick={() => void checkout(item.sku)}
            >
              {busy === item.sku ? <LoaderCircle className="spin" /> : <ExternalLink />} Ver en Whop
            </button>
          </article>
        ))}
      </div>
      {message && (
        <p className="notice">
          <LockKeyhole size={16} /> {message}
        </p>
      )}
      <small>
        Las compras quedan desactivadas hasta cargar los cinco enlaces de checkout en Render.
      </small>
    </div>
  );
}
