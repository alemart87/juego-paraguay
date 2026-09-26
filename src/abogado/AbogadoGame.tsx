import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Download,
  LoaderCircle,
  Lock,
  RefreshCw,
  RotateCcw,
  Share2,
  ShoppingBag,
  Swords,
} from "lucide-react";
import { configureAudio, installMobileAudioUnlock, sfx, unlockAudio } from "@/game/audio";
import { ABOGADO_SHOP_ITEMS, type AbogadoSku } from "@/battle/shop-catalog";
import { AbogadoScene } from "./AbogadoScene";
import type { RunResult, Weapon } from "./engine";
import type { IconKind } from "./render";
import { GameIcon } from "./GameIcon";
import { ShareSheet } from "./ShareSheet";
import { QuickBuy } from "./QuickBuy";
import { PRIZE } from "@/promo/prize";
import { PrizeBanner } from "@/promo/PrizeBanner";
import { getWallet, spendCredits, type Wallet } from "@/battle/credits";
import { REFERRAL_RATE, SIGNUP_BONUS, captureRef, whatsappShare } from "@/battle/credits-config";
import { Copy, Gift, Users } from "lucide-react";
import {
  checkout,
  createProfile,
  isAbogadoSku,
  loadBest,
  loadOwned,
  profile,
  saveBest,
  syncOwned,
  type Best,
} from "./commerce";
import { certificate, downloadBlob, resultCard } from "./share";
import "./abogado.css";

type Screen = "title" | "play" | "result";

const WEAPONS: { id: Weapon; label: string; sku?: AbogadoSku; hint: string }[] = [
  { id: "punos", label: "Puños", hint: "Gratis" },
  { id: "guantes", label: "Guantes", sku: "rivas-guantes", hint: "+50% daño" },
  { id: "mazo", label: "Mazo", sku: "rivas-mazo", hint: "Daño ×3" },
  { id: "hacha", label: "Hacha", sku: "rivas-hacha", hint: "¡PIIIP!" },
  { id: "magnum", label: "Magnum", sku: "rivas-magnum", hint: "¡SPLASH!" },
];

const ICON_FOR: Record<AbogadoSku, IconKind> = {
  "rivas-titulo": "titulo",
  "rivas-mazo": "mazo",
  "rivas-guantes": "guantes",
  "rivas-hacha": "hacha",
  "rivas-magnum": "magnum",
  "rivas-golpes-500": "punos",
  "rivas-golpes-2500": "guantes",
  "rivas-golpes-6000": "mazo",
};
const CREDIT_PACKS = ABOGADO_SHOP_ITEMS.filter((item) => "credits" in item);
const isCreditPack = (sku: AbogadoSku) => CREDIT_PACKS.some((item) => item.sku === sku);

/** Saldo y referidos del perfil guardado (null si no hay perfil). */
async function fetchWallet(): Promise<Wallet | null> {
  const p = profile();
  if (!p?.benefitToken) return null;
  try {
    const r = await getWallet({
      data: { contactKind: p.kind, contact: p.contact, benefitToken: p.benefitToken },
    });
    return r.ok ? r.wallet : null;
  } catch {
    return null;
  }
}

export function AbogadoGame() {
  const [screen, setScreen] = useState<Screen>("title");
  const [weapon, setWeapon] = useState<Weapon>("punos");
  const [owned, setOwned] = useState<AbogadoSku[]>([]);
  const [best, setBest] = useState<Best>({ score: 0, kos: 0, combo: 0 });
  const [run, setRun] = useState<RunResult | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const cardBlob = useRef<Blob | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [runKey, setRunKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [shopOpen, setShopOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [buying, setBuying] = useState<Weapon | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const refreshWallet = () => fetchWallet().then(setWallet);

  useEffect(() => {
    installMobileAudioUnlock();
    setOwned(loadOwned());
    setBest(loadBest());
    void syncOwned().then((r) => r.ok && setOwned(r.skus));
    captureRef(window.location.search);
    void refreshWallet();
    const params = new URLSearchParams(window.location.search);
    const bought = params.get("compra");
    // Superadmin "omitir intros": nivel 06 entra directo a la partida.
    const quickStart = () => {
      setRunKey((k) => k + 1);
      setScreen("play");
    };
    if (params.get("quick") === "1" && !bought) {
      quickStart();
      window.history.replaceState(null, "", window.location.pathname);
    } else if (!bought && !params.has("menu")) {
      fetch("/api/quick-start", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { enabled?: boolean; level?: number } | null) => {
          if (data?.enabled && Number(data.level) === 6) quickStart();
        })
        .catch(() => undefined);
    }
    if (isAbogadoSku(bought)) {
      setNotice("¡Gracias por tu compra! Verificando con Whop…");
      setShopOpen(true);
      let tries = 0;
      const poll = async () => {
        tries++;
        const r = await syncOwned();
        const w = await fetchWallet();
        if (w) setWallet(w);
        const creditsArrived = isCreditPack(bought) && (w?.credits ?? 0) > 0;
        if (r.skus.includes(bought) || creditsArrived) {
          setOwned(r.skus);
          setNotice(
            creditsArrived
              ? `✅ ¡Saldo cargado! Tenés ${w!.credits.toLocaleString("es-PY")} golpes.`
              : "✅ ¡Compra activada! Ya la podés usar.",
          );
          window.history.replaceState(null, "", window.location.pathname);
        } else if (tries < 8) setTimeout(() => void poll(), 4000);
        else
          setNotice(
            "El pago todavía se está procesando. Tocá «Sincronizar» en unos minutos con el mismo correo.",
          );
      };
      void poll();
    }
  }, []);

  useEffect(() => configureAudio(soundOn, 0.85), [soundOn]);

  useEffect(
    () => () => {
      if (cardUrl) URL.revokeObjectURL(cardUrl);
    },
    [cardUrl],
  );

  const ownsWeapon = (id: Weapon) => {
    const sku = WEAPONS.find((w) => w.id === id)?.sku;
    return !sku || owned.includes(sku);
  };

  const start = () => {
    void unlockAudio();
    if (soundOn) sfx("bell");
    setRun(null);
    setRunKey((k) => k + 1);
    setScreen("play");
  };

  const finish = (r: RunResult, shot: HTMLCanvasElement | null) => {
    const prev = loadBest();
    const next: Best = {
      score: Math.max(prev.score, r.score),
      kos: Math.max(prev.kos, r.kos),
      combo: Math.max(prev.combo, r.maxCombo),
    };
    saveBest(next);
    setBest(next);
    setNewBest(r.score > prev.score && r.score > 0);
    setRun(r);
    setScreen("result");
    if (soundOn) sfx(r.kos > 0 ? "win" : "ko");
    const p = profile();
    if (r.creditsUsed > 0 && p?.benefitToken)
      void spendCredits({
        data: {
          contactKind: p.kind,
          contact: p.contact,
          benefitToken: p.benefitToken,
          count: r.creditsUsed,
          runId: r.runId,
        },
      })
        .then((res) => res.ok && setWallet((w) => (w ? { ...w, credits: res.credits } : w)))
        .catch(() => undefined);
    void resultCard(shot, r, profile()?.name).then((blob) => {
      cardBlob.current = blob;
      setCardUrl(URL.createObjectURL(blob));
    });
  };

  const goldTitle = owned.includes("rivas-titulo");
  const ownedWeapons = WEAPONS.filter((w) => ownsWeapon(w.id)).map((w) => w.id);
  const prices = Object.fromEntries(
    WEAPONS.flatMap((w) => {
      const item = ABOGADO_SHOP_ITEMS.find((i) => i.sku === w.sku);
      return item ? [[w.id, item.price]] : [];
    }),
  ) as Partial<Record<Weapon, number>>;

  return (
    <main className={`ab-root ab-screen-${screen}`}>
      {screen === "title" && (
        <>
          <AbogadoScene
            mode="demo"
            weapon={ownsWeapon(weapon) ? weapon : "punos"}
            goldTitle={goldTitle}
            soundOn={soundOn}
          />
          <PrizeBanner
            active={!shopOpen}
            onEnter={() => window.location.assign(PRIZE.rankingUrl)}
          />
          <section className="ab-title-panel">
            <a className="ab-back" href="/">
              <ArrowLeft size={14} /> PY-STAR GAMES
            </a>
            <h1 className="ab-logo">
              <span>HERNÁN RIVAS</span>
              <em>ES ABOGADO</em>
            </h1>
            <p className="ab-tag">
              Seis rounds de 75 segundos. Pegale a full, cortá las demandas, llená el medidor de
              ARMA ESPECIAL para que Kattya y la Sole lo bajen, y cuidado: Bachi y su foto oficial
              lo curan. En el round final, mandalo a la cárcel. Cada arma paga trae 1 golpe gratis
              por partida.
            </p>
            <a className="ab-prize" href={PRIZE.rankingUrl}>
              <span className="ab-prize-badge">🏆</span>
              <span className="ab-prize-copy">
                <small>{PRIZE.kicker} · RANKING NACIONAL</small>
                <b>{PRIZE.headline}</b>
                <small>{PRIZE.sub} Cargá tu usuario y mirá el ranking.</small>
              </span>
              <em>VER RANKING</em>
            </a>
            <div className="ab-weapons" role="radiogroup" aria-label="Elegí tu arma">
              {WEAPONS.map((w) => {
                const has = ownsWeapon(w.id);
                const item = ABOGADO_SHOP_ITEMS.find((i) => i.sku === w.sku);
                return (
                  <button
                    key={w.id}
                    role="radio"
                    aria-checked={weapon === w.id}
                    className={`ab-weapon ${weapon === w.id && has ? "on" : ""} ${has ? "" : "locked"}`}
                    onClick={() => {
                      if (soundOn) sfx("ui");
                      if (has) setWeapon(w.id);
                      else setShopOpen(true);
                    }}
                  >
                    {!has && <i className="ab-free-tag">1 GRATIS</i>}
                    <GameIcon kind={w.id} size={36} />
                    <b>{w.label}</b>
                    <small>
                      {has ? (
                        w.hint
                      ) : (
                        <>
                          <Lock size={10} /> {item?.price.toFixed(2)}
                        </>
                      )}
                    </small>
                  </button>
                );
              })}
            </div>
            <button className="ab-btn ab-btn-primary ab-play" onClick={start}>
              <Swords size={18} /> ¡PEGALE!
            </button>
            <div className="ab-title-meta">
              <span>RÉCORD {best.score.toLocaleString("es-PY")}</span>
              {wallet && (
                <span className="ab-meta-credits">
                  🥊 SALDO {wallet.credits.toLocaleString("es-PY")}
                </span>
              )}
              <button className="ab-link" onClick={() => setShopOpen(true)}>
                <ShoppingBag size={13} /> TIENDA
              </button>
              <button className="ab-link" onClick={() => setSoundOn((s) => !s)}>
                SONIDO {soundOn ? "ON" : "OFF"}
              </button>
            </div>
            <p className="ab-controls">
              Tocá la cara o la panza · mantené apretado para cargar · tocá las demandas que te tira
              <span className="ab-kbd"> · PC: A/D cara, S panza, W/Espacio uppercut</span>
            </p>
            <p className="ab-legal">
              Sátira y parodia humorística con un personaje caricaturizado. Ninguna persona real
              sale lastimada.
            </p>
          </section>
        </>
      )}

      {screen === "play" && (
        <AbogadoScene
          key={runKey}
          mode="play"
          weapon={ownsWeapon(weapon) ? weapon : "punos"}
          goldTitle={goldTitle}
          owned={ownedWeapons}
          prices={prices}
          hold={buying !== null}
          credits={wallet?.credits ?? 0}
          onLockedWeapon={(id) => setBuying(id)}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((s) => !s)}
          onEnd={finish}
        />
      )}

      {screen === "result" && run && (
        <section className="ab-result">
          <header>
            <span className="ab-kicker">
              {run.jailed
                ? "🚔 ¡LO METISTE PRESO!"
                : run.kos > 0
                  ? "¡LO NOQUEASTE!"
                  : "¡SE TERMINÓ EL TIEMPO!"}
            </span>
            <h2>
              {run.score.toLocaleString("es-PY")} <small>PTS</small>
            </h2>
            {newBest && <span className="ab-newbest">★ NUEVO RÉCORD ★</span>}
          </header>
          <button className="ab-btn ab-btn-primary ab-revancha" onClick={start}>
            <RotateCcw size={20} /> REVANCHA
          </button>
          <a className="ab-prize" href={PRIZE.rankingUrl}>
            <span className="ab-prize-badge">🏆</span>
            <span className="ab-prize-copy">
              <small>{PRIZE.kicker}</small>
              <b>{PRIZE.headline}</b>
              <small>{PRIZE.sub} Cargá tu usuario y entrá al ranking.</small>
            </span>
            <em>VER RANKING</em>
          </a>
          <div className="ab-stats">
            <div>
              <b>{run.kos}</b>
              <small>K.O.</small>
            </div>
            <div>
              <b>{run.maxCombo}</b>
              <small>COMBO</small>
            </div>
            <div>
              <b>{run.accuracy}%</b>
              <small>PUNTERÍA</small>
            </div>
            <div>
              <b>{run.swats}</b>
              <small>DEMANDAS</small>
            </div>
            <div>
              <b>{run.specials}</b>
              <small>ESPECIALES</small>
            </div>
            <div>
              <b>{run.powers}</b>
              <small>REFUERZOS</small>
            </div>
            <div>
              <b>
                {run.round}/{run.rounds}
              </b>
              <small>ROUNDS</small>
            </div>
          </div>
          <div className="ab-card-preview">
            {cardUrl ? (
              <img src={cardUrl} alt="Tarjeta con tu puntaje para compartir" />
            ) : (
              <LoaderCircle className="ab-spin" />
            )}
          </div>
          <div className="ab-result-actions">
            <button
              className="ab-btn ab-btn-share"
              disabled={!cardUrl}
              onClick={() => setSharing(true)}
            >
              <Share2 size={16} /> COMPARTIR FOTO
            </button>
            <button
              className="ab-btn"
              disabled={!cardUrl}
              onClick={() =>
                cardBlob.current && downloadBlob(cardBlob.current, "hernan-rivas-es-abogado.png")
              }
            >
              <Download size={16} /> GUARDAR
            </button>
          </div>
          <AbogadoShop
            owned={owned}
            onOwned={setOwned}
            notice={notice}
            best={best}
            wallet={wallet}
            onWallet={refreshWallet}
          />
          <button className="ab-link ab-home" onClick={() => setScreen("title")}>
            <ArrowLeft size={13} /> VOLVER AL INICIO
          </button>
        </section>
      )}

      {buying && screen === "play" && WEAPONS.find((w) => w.id === buying)?.sku && (
        <QuickBuy
          weapon={buying}
          sku={WEAPONS.find((w) => w.id === buying)!.sku!}
          onOwned={setOwned}
          onClose={() => setBuying(null)}
        />
      )}

      {sharing && run && cardBlob.current && (
        <ShareSheet
          blob={cardBlob.current}
          filename="hernan-rivas-es-abogado.png"
          message={`Le metí ${run.score.toLocaleString("es-PY")} puntos y ${run.kos} K.O. a Hernán Rivas 🥊⚖️ ¿Me superás?`}
          title="Compartí tu resultado"
          onClose={() => setSharing(false)}
        />
      )}

      {shopOpen && screen !== "result" && (
        <div className="ab-modal" role="dialog" aria-modal="true" aria-label="Tienda del abogado">
          <div className="ab-modal-body">
            <button
              className="ab-close"
              aria-label="Cerrar tienda"
              onClick={() => setShopOpen(false)}
            >
              ×
            </button>
            <AbogadoShop
              owned={owned}
              onOwned={setOwned}
              notice={notice}
              best={best}
              wallet={wallet}
              onWallet={refreshWallet}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function AbogadoShop({
  owned,
  onOwned,
  notice,
  best,
  wallet,
  onWallet,
}: {
  owned: AbogadoSku[];
  onOwned: (skus: AbogadoSku[]) => void;
  notice: string;
  best: Best;
  wallet: Wallet | null;
  onWallet: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<AbogadoSku | "sync" | "profile" | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<AbogadoSku | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const buy = async (sku: AbogadoSku) => {
    setMessage("");
    const p = profile();
    if (!p?.benefitToken || (p.kind !== "email" && !p.purchaseEmail)) {
      setPending(sku);
      setName(p?.name ?? "");
      return;
    }
    setBusy(sku);
    try {
      const r = await checkout(sku);
      if (!r.ok) setMessage(r.message);
    } catch {
      setMessage("No pudimos abrir Whop. Probá de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    setBusy("profile");
    setMessage("");
    try {
      const r = await createProfile(name, email);
      if (!r.ok) {
        setMessage(r.message);
        return;
      }
      void onWallet();
      const sku = pending;
      setPending(null);
      if (sku === "rivas-golpes-500") return;
      await buy(sku);
    } catch {
      setMessage("Revisá tu nombre (2 a 24 letras) y tu correo.");
    } finally {
      setBusy(null);
    }
  };

  const sync = async () => {
    setBusy("sync");
    const r = await syncOwned();
    onOwned(r.skus);
    await onWallet();
    setMessage(
      r.ok
        ? r.skus.length
          ? `${r.skus.length} compra${r.skus.length === 1 ? "" : "s"} activa${r.skus.length === 1 ? "" : "s"}.`
          : "Tu perfil está conectado. Las compras nuevas aparecen acá."
        : (r.message ?? "Comprá algo primero o usá el mismo correo del pago."),
    );
    setBusy(null);
  };

  const downloadTitle = async () => {
    const p = profile();
    const blob = await certificate(p?.name ?? "", best.score, best.kos);
    downloadBlob(blob, "titulo-abogado-honoris-kausa.png");
  };

  return (
    <section className="ab-shop" aria-label="Tienda">
      <header>
        <span className="ab-kicker">
          <ShoppingBag size={13} /> TIENDA DEL ABOGADO
        </span>
        <h3>Cosas simpáticas para el ring</h3>
      </header>
      {(notice || message) && <p className="ab-notice">{message || notice}</p>}
      {pending ? (
        <form className="ab-profile" onSubmit={(e) => void submitProfile(e)}>
          <p>
            {pending === "rivas-golpes-500" && !profile()?.benefitToken ? (
              <>Creá tu perfil para tener tu link de referido y tu saldo de golpes.</>
            ) : (
              <>
                Para asociar la compra a vos, dejá tu nombre y el{" "}
                <b>mismo correo que vas a usar en Whop</b>.
              </>
            )}
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
            Acepto la <a href="/privacidad">privacidad</a> y la{" "}
            <a href="/politica-de-compras">política de compras</a>.
          </label>
          <div className="ab-row">
            <button type="button" className="ab-btn" onClick={() => setPending(null)}>
              CANCELAR
            </button>
            <button className="ab-btn ab-btn-primary" disabled={!consent || busy === "profile"}>
              {busy === "profile" ? <LoaderCircle className="ab-spin" size={16} /> : null}{" "}
              {pending === "rivas-golpes-500" ? "CREAR PERFIL" : "IR A PAGAR"}
            </button>
          </div>
        </form>
      ) : (
        <>
        <section className="ab-referral" aria-label="Invitá y ganá">
          <header>
            <span className="ab-kicker">
              <Gift size={13} /> INVITÁ Y GANÁ
            </span>
            <h3>Tu link trae {SIGNUP_BONUS} golpes gratis a cada amigo.</h3>
            <p>
              Y cada vez que un amigo tuyo carga saldo, vos recibís el{" "}
              <b>{Math.round(REFERRAL_RATE * 100)}%</b> de esa carga en golpes.
            </p>
          </header>
          {wallet ? (
            <>
              <div className="ab-referral-stats">
                <div>
                  <b>{wallet.credits.toLocaleString("es-PY")}</b>
                  <small>GOLPES DE SALDO</small>
                </div>
                <div>
                  <b>{wallet.friends}</b>
                  <small>AMIGOS TRAÍDOS</small>
                </div>
                <div>
                  <b>{wallet.earned.toLocaleString("es-PY")}</b>
                  <small>GOLPES GANADOS</small>
                </div>
              </div>
              <div className="ab-referral-link">
                <code>{wallet.link}</code>
                <button
                  type="button"
                  className="ab-btn"
                  onClick={() => {
                    void navigator.clipboard?.writeText(wallet.link);
                    setMessage("Link copiado. ¡Mandáselo a tus amigos!");
                  }}
                >
                  <Copy size={14} /> COPIAR
                </button>
                <a
                  className="ab-btn ab-btn-primary"
                  href={whatsappShare(wallet.link)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Users size={14} /> WHATSAPP
                </a>
              </div>
              <small className="ab-referral-code">
                Tu código: <b>{wallet.code}</b>
              </small>
            </>
          ) : (
            <button
              type="button"
              className="ab-btn ab-btn-primary"
              onClick={() => {
                setPending("rivas-golpes-500");
                setName(profile()?.name ?? "");
              }}
            >
              <Gift size={14} /> CREAR MI LINK DE REFERIDO
            </button>
          )}
        </section>
        <section className="ab-packs" aria-label="Saldo de golpes">
          <header>
            <span className="ab-kicker">🥊 SALDO DE GOLPES</span>
            <h3>Cargá golpes y usá cualquier arma paga sin comprarla.</h3>
          </header>
          <div className="ab-packs-grid">
            {CREDIT_PACKS.map((item) => (
              <article key={item.sku} className="ab-pack">
                <b>{item.credits.toLocaleString("es-PY")}</b>
                <small>GOLPES · {item.badge}</small>
                <button
                  className="ab-btn ab-btn-primary"
                  disabled={busy !== null}
                  onClick={() => void buy(item.sku)}
                  aria-label={`Comprar ${item.name} por ${item.price} dólares`}
                >
                  {busy === item.sku ? <LoaderCircle className="ab-spin" size={14} /> : null}
                  USD {item.price.toFixed(2)}
                </button>
              </article>
            ))}
          </div>
        </section>
        <div className="ab-shop-grid">
          {ABOGADO_SHOP_ITEMS.filter((item) => !isCreditPack(item.sku)).map((item) => {
            const has = owned.includes(item.sku);
            return (
              <article key={item.sku} className={`ab-item ${has ? "owned" : ""}`}>
                <GameIcon kind={ICON_FOR[item.sku]} size={64} />
                <div>
                  <small>{item.badge}</small>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  {item.sku !== "rivas-titulo" && !has && (
                    <span className="ab-try">🎁 Probala gratis: 1 golpe por partida</span>
                  )}
                </div>
                {has ? (
                  item.sku === "rivas-titulo" ? (
                    <button className="ab-btn ab-btn-gold" onClick={() => void downloadTitle()}>
                      <Download size={14} /> MI TÍTULO
                    </button>
                  ) : (
                    <span className="ab-owned">✔ TUYO</span>
                  )
                ) : (
                  <button
                    className="ab-btn ab-btn-primary"
                    disabled={busy !== null}
                    onClick={() => void buy(item.sku)}
                    aria-label={`Comprar ${item.name} por ${item.price} dólares`}
                  >
                    {busy === item.sku ? <LoaderCircle className="ab-spin" size={14} /> : null}
                    USD {item.price.toFixed(2)}
                  </button>
                )}
              </article>
            );
          })}
        </div>
        </>
      )}
      <footer className="ab-shop-foot">
        <button className="ab-link" disabled={busy === "sync"} onClick={() => void sync()}>
          <RefreshCw size={12} className={busy === "sync" ? "ab-spin" : ""} /> SINCRONIZAR COMPRAS
        </button>
        <span>Pago seguro en Whop · el título es un souvenir humorístico sin validez legal.</span>
      </footer>
    </section>
  );
}
