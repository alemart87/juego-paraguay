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
        <h2>Equipate. Rompé el feed.</h2>
        <p>Power-ups de pago único desde USD 3,99. Whop procesa el pago de forma segura.</p>
        <div className="shop-strip">
          <span>8 POWER-UPS</span>
          <span>PAGO ÚNICO</span>
          <span>ENTREGA SEGURA</span>
        </div>
      </div>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <article key={item.sku} className="shop-item">
            <div className="shop-item-top">
              <img src={item.image} alt="" loading="lazy" />
              <span>{item.badge}</span>
            </div>
            <div className="shop-item-copy">
              <small>{item.category}</small>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <strong className="shop-price">
              <small>USD</small> {item.price.toFixed(2).replace(".", ",")}
            </strong>
            <button
              className="secondary"
              disabled={busy !== null}
              onClick={() => void checkout(item.sku)}
            >
              {busy === item.sku ? <LoaderCircle className="spin" /> : <ExternalLink />} Comprar
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
        El cobro se confirma en Whop. El servidor crea y reutiliza cada checkout mediante su API.
      </small>
    </div>
  );
}
