import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Gift,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { getPlayerBenefits } from "./leaderboard";
import type { RewardWallet } from "./rewards";
import { SCORE_REWARDS, rewardStock } from "./rewards";
import { SHOP_ITEMS, getWhopCheckout, type ShopSku } from "./shop";

type StoredProfile = {
  kind?: "email" | "phone";
  contact?: string;
  purchaseEmail?: string;
  benefitToken?: string;
};

export function ShopPanel({
  inBattle = false,
  rewards,
  ownedSkus,
  usedOwnedSkus,
  onUse,
  onBenefitsSynced,
}: {
  inBattle?: boolean;
  rewards: RewardWallet;
  ownedSkus: ShopSku[];
  usedOwnedSkus: ShopSku[];
  onUse?: (sku: ShopSku, source: "reward" | "owned") => void;
  onBenefitsSynced: (skus: ShopSku[]) => void;
}) {
  const [busy, setBusy] = useState<ShopSku | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const storedProfile = () => {
    try {
      return JSON.parse(
        localStorage.getItem("influencers-battle-profile-v1") || "null",
      ) as StoredProfile | null;
    } catch {
      return null;
    }
  };

  const syncBenefits = async (quiet = false) => {
    const profile = storedProfile();
    if (!profile?.contact || !profile.benefitToken || !profile.kind) {
      if (!quiet) setMessage("Creá o actualizá tu perfil en el ranking para vincular tus compras.");
      return;
    }
    setSyncing(true);
    if (!quiet) setMessage("");
    try {
      const response = await getPlayerBenefits({
        data: {
          contactKind: profile.kind,
          contact: profile.contact,
          benefitToken: profile.benefitToken,
        },
      });
      if (!response.ok) setMessage(response.message);
      else {
        onBenefitsSynced(response.skus);
        if (!quiet)
          setMessage(
            response.skus.length
              ? `${response.skus.length} beneficio${response.skus.length === 1 ? "" : "s"} sincronizado${response.skus.length === 1 ? "" : "s"}.`
              : "Tu perfil está conectado. Las compras nuevas aparecerán acá.",
          );
      }
    } catch {
      if (!quiet) setMessage("No pudimos sincronizar tus beneficios. Probá otra vez.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void syncBenefits(true);
    // Sync once whenever the shop opens. The callback is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkout = async (sku: ShopSku) => {
    setBusy(sku);
    setMessage("");
    const purchaseTab = inBattle ? window.open("about:blank", "_blank") : null;
    try {
      const result = await getWhopCheckout({ data: { sku } });
      if (result.ok) {
        const url = new URL(result.url);
        const profile = storedProfile();
        const email = profile?.kind === "email" ? profile.contact : profile?.purchaseEmail;
        if (email) url.searchParams.set("email", email.trim().toLowerCase());
        if (purchaseTab) purchaseTab.location.replace(url.toString());
        else window.location.assign(url.toString());
      } else {
        purchaseTab?.close();
        setMessage(result.message);
      }
    } catch {
      purchaseTab?.close();
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
          <h2>{inBattle ? "Usalo ahora." : "Subí de nivel."}</h2>
          <p>
            {inBattle
              ? "Activá una prueba o un beneficio comprado. La batalla queda pausada mientras elegís."
              : "Comprá una vez, vinculá tu perfil y activá la ventaja dentro de cada batalla."}
          </p>
        </div>
        <div className="shop-strip" aria-label="Estado del inventario">
          <span>{rewardStock(rewards)} PRUEBAS GRATIS</span>
          <span>{ownedSkus.length} BENEFICIOS</span>
          <button className="shop-sync" disabled={syncing} onClick={() => void syncBenefits()}>
            <RefreshCw className={syncing ? "spin" : ""} />
            {syncing ? "SINCRONIZANDO" : "SINCRONIZAR"}
          </button>
        </div>
      </header>

      <div className="shop-reward-track">
        <span>
          <Gift /> PROBÁ ANTES DE COMPRAR
        </span>
        <p>
          En cada episodio recibís Tereré a los {SCORE_REWARDS[0].score} puntos, Energía a los{" "}
          {SCORE_REWARDS[1].score.toLocaleString("es-PY")} y Arsenal a los{" "}
          {SCORE_REWARDS[2].score.toLocaleString("es-PY")}.
        </p>
      </div>

      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => {
          const free = rewards.stock[item.sku] ?? 0;
          const owned = ownedSkus.includes(item.sku);
          const used = usedOwnedSkus.includes(item.sku);
          const canUse = inBattle && (free > 0 || (owned && !used));
          return (
            <article key={item.sku} className={`shop-item ${canUse ? "ready" : ""}`}>
              <div className="shop-item-top">
                <img src={item.image} alt={`Arte de ${item.name}`} loading="lazy" />
                <span className="shop-badge">
                  {free > 0 ? `${free} GRATIS` : owned ? (used ? "USADO" : "COMPRADO") : item.badge}
                </span>
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
                <div className="shop-item-actions">
                  {canUse && (
                    <button
                      className="shop-use"
                      onClick={() => onUse?.(item.sku, free > 0 ? "reward" : "owned")}
                    >
                      <Zap /> {free > 0 ? `Usar gratis · ${free}` : "Activar"}
                    </button>
                  )}
                  {inBattle && owned && used && (
                    <span className="shop-used">
                      <Check /> Usado en esta batalla
                    </span>
                  )}
                  {!owned && (
                    <button
                      className="shop-buy"
                      disabled={busy !== null}
                      onClick={() => void checkout(item.sku)}
                      aria-label={`Comprar ${item.name} por ${item.price.toFixed(2)} dólares`}
                    >
                      {busy === item.sku ? <LoaderCircle className="spin" /> : <ArrowUpRight />}
                      {busy === item.sku ? "Conectando" : free > 0 ? "Comprar más" : "Comprar"}
                    </button>
                  )}
                </div>
              </footer>
            </article>
          );
        })}
      </div>
      {message && (
        <p className="shop-notice" role="status" aria-live="polite">
          <LockKeyhole size={16} /> {message}
        </p>
      )}
      <p className="shop-trust">
        <LockKeyhole size={14} /> El pago se completa en Whop. Volvé al juego y tocá Sincronizar; el
        beneficio queda ligado al perfil que usó el mismo correo.
      </p>
    </div>
  );
}
