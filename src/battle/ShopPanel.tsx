import { useState } from "react";
import { ArrowUpRight, LoaderCircle, LockKeyhole, ShoppingBag } from "lucide-react";
import { SHOP_ITEMS, getWhopCheckout, type ShopSku } from "./shop";

export function ShopPanel() {
  const [busy, setBusy] = useState<ShopSku | null>(null);
  const [message, setMessage] = useState("");
  const checkout = async (sku: ShopSku) => {
    setBusy(sku);
    setMessage("");
    try {
      const result = await getWhopCheckout({ data: { sku } });
      if (result.ok) window.location.assign(result.url);
      else setMessage(result.message);
    } catch {
      setMessage("No pudimos abrir Whop. Probá de nuevo más tarde.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="shop-panel">
      <header className="shop-heading">
        <div>
          <span className="eyebrow">
            <ShoppingBag size={15} /> ARSENAL PY-STAR
          </span>
          <h2>Subí de nivel.</h2>
          <p>Elegí tu ventaja para la próxima batalla. Pagás una sola vez en Whop.</p>
        </div>
        <div className="shop-strip" aria-label="Características de la tienda">
          <span>8 ITEMS</span>
          <span>DESDE $3,99</span>
          <span>PAGO SEGURO</span>
        </div>
      </header>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <article key={item.sku} className="shop-item">
            <div className="shop-item-top">
              <img src={item.image} alt={`Arte de ${item.name}`} loading="lazy" />
              <span className="shop-badge">{item.badge}</span>
            </div>
            <div className="shop-item-copy">
              <small>{item.category}</small>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <footer className="shop-item-footer">
              <strong className="shop-price">
                <small>USD</small> {item.price.toFixed(2).replace(".", ",")}
              </strong>
              <button
                className="shop-buy"
                disabled={busy !== null}
                onClick={() => void checkout(item.sku)}
                aria-label={`Comprar ${item.name} por ${item.price.toFixed(2)} dólares`}
              >
                {busy === item.sku ? <LoaderCircle className="spin" /> : <ArrowUpRight />}
                {busy === item.sku ? "Conectando" : "Comprar"}
              </button>
            </footer>
          </article>
        ))}
      </div>
      {message && (
        <p className="shop-notice" role="status" aria-live="polite">
          <LockKeyhole size={16} /> {message}
        </p>
      )}
      <p className="shop-trust">
        <LockKeyhole size={14} /> El pago se completa en Whop. Volvés al juego al terminar.
      </p>
    </div>
  );
}
