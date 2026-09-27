import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Heart,
  LoaderCircle,
  Share2,
  Volume2,
  VolumeX,
  MessageCircle,
} from "lucide-react";
import { bell, choir, flute, setMuted, stopChoir, unlock } from "./audio";
import {
  DONATION_PRESETS,
  MAX_DONATION,
  MIN_DONATION,
  TOPICS,
  TOUCH_LINES,
  thanksTier,
  whatsappLink,
  topic as findTopic,
  type Option,
  type Topic,
} from "./content";
import { getDonationCheckout } from "./donate";
import { EffectsLayer } from "./Effects";
import { useEffects } from "./useEffects";
import { lightCard } from "./share";
import { sessionId } from "@/battle/analytics";
import "./jesus.css";

type Step =
  | "intro"
  | "name"
  | "topic"
  | "detail"
  | "request"
  | "prayer"
  | "blessing"
  | "support"
  | "thanks";

/** Lo mínimo para personalizar el "gracias" al volver de Whop. Solo en este dispositivo. */
const SESSION_KEY = "jesus-te-ama-session-v1";
const AMOUNT_KEY = "jesus-te-ama-aporte-v1";
type Session = { name: string; topicId: string; optionId: string };
const readSession = (): Session | null => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") as Session | null;
  } catch {
    return null;
  }
};

export function JesusGame() {
  const [step, setStep] = useState<Step>("intro");
  const [introLine, setIntroLine] = useState(0);
  const [name, setName] = useState("");
  const [current, setCurrent] = useState<Topic | null>(null);
  const [choice, setChoice] = useState<Option | null>(null);
  const [request, setRequest] = useState("");
  const [lights, setLights] = useState(0);
  const [touchLine, setTouchLine] = useState("");
  const [muted, setMutedState] = useState(false);
  const [amount, setAmount] = useState<number>(DONATION_PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [thanksAmount, setThanksAmount] = useState(0);
  const [card, setCard] = useState<{ url: string; blob: Blob } | null>(null);
  const [cardBusy, setCardBusy] = useState(false);
  const { particles, burst } = useEffects();
  const figure = useRef<HTMLButtonElement>(null);
  /** Id de la conversación registrada (solo tema, opción y luces; nunca el texto). */
  const eventId = useRef<number | null>(null);
  const pendingFlags = useRef<{ shared?: boolean; support?: boolean }>({});
  const track = (flags: { shared?: boolean; support?: boolean }) => {
    if (!eventId.current) {
      // Todavía no volvió el id del registro: se manda apenas llegue.
      pendingFlags.current = { ...pendingFlags.current, ...flags };
      return;
    }
    void fetch("/api/jesus/event", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ sessionId: sessionId(), id: eventId.current, ...flags }),
    }).catch(() => undefined);
  };
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Volver de Whop: ?gracias=<monto>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("apoyo")) {
      setStep("support");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (params.has("gracias")) {
      // El monto real lo guardamos antes de ir a Whop; la URL es solo la señal de vuelta.
      let paid = Number(params.get("gracias"));
      try {
        const saved = Number(sessionStorage.getItem(AMOUNT_KEY));
        if (saved >= MIN_DONATION) paid = saved;
        sessionStorage.removeItem(AMOUNT_KEY);
      } catch {
        /* private mode */
      }
      if (!Number.isInteger(paid) || paid < MIN_DONATION) paid = MIN_DONATION;
      const saved = readSession();
      if (saved) {
        setName(saved.name);
        const t = findTopic(saved.topicId);
        setCurrent(t);
        setChoice(t.options.find((o) => o.id === saved.optionId) ?? t.options[0]);
      }
      setThanksAmount(paid);
      setStep("thanks");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Las líneas de apertura avanzan solas; tocar la pantalla las apura.
  useEffect(() => {
    if (step !== "intro") return;
    const timer = window.setTimeout(() => setIntroLine((n) => Math.min(2, n + 1)), 2600);
    return () => window.clearTimeout(timer);
  }, [step, introLine]);

  useEffect(() => {
    if (step === "prayer") choir(30);
    if (step === "blessing") {
      bell();
      choir(18);
    }
    if (step !== "prayer" && step !== "blessing") stopChoir();
  }, [step]);

  useEffect(
    () => () => {
      if (card?.url) URL.revokeObjectURL(card.url);
    },
    [card],
  );

  const go = (next: Step) => {
    unlock();
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pickTopic = (t: Topic) => {
    setCurrent(t);
    setChoice(null);
    go("detail");
  };

  const pickOption = (o: Option) => {
    setChoice(o);
    flute();
    burst(50, 30, ["spark", "spark", "dove"]);
  };

  const touchFigure = (event: React.PointerEvent<HTMLButtonElement>) => {
    unlock();
    const rect = figure.current?.getBoundingClientRect();
    const layer = figure.current?.closest(".jt-scene")?.getBoundingClientRect();
    const x = rect && layer ? ((event.clientX - layer.left) / layer.width) * 100 : 50;
    const y = rect && layer ? ((event.clientY - layer.top) / layer.height) * 100 : 40;
    const kinds =
      lights % 4 === 3
        ? (["angel", "spark", "spark", "light"] as const)
        : (["dove", "spark", "spark"] as const);
    burst(x, y, [...kinds]);
    flute();
    setLights((n) => n + 1);
    setTouchLine(TOUCH_LINES[lights % TOUCH_LINES.length]);
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setTouchLine(""), 1800);
    if (navigator.vibrate) navigator.vibrate(12);
  };

  const toBlessing = () => {
    if (current && choice)
      try {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ name, topicId: current.id, optionId: choice.id } satisfies Session),
        );
      } catch {
        /* private mode */
      }
    burst(50, 35, ["angel", "dove", "dove", "spark", "spark", "light"]);
    go("blessing");
    if (current && choice)
      void fetch("/api/jesus/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId: sessionId(),
          topic: current.id,
          option: choice.id,
          lights,
          wrote: request.trim().length > 0,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { id?: number } | null) => {
          if (!data?.id) return;
          eventId.current = data.id;
          if (Object.keys(pendingFlags.current).length) {
            const flags = pendingFlags.current;
            pendingFlags.current = {};
            track(flags);
          }
        })
        .catch(() => undefined);
  };

  const makeCard = async (thanks?: string) => {
    if (!current || !choice) return null;
    setCardBusy(true);
    try {
      const blob = await lightCard({
        name,
        shareLabel: current.shareLabel,
        verse: choice.verse,
        thanks,
      });
      const url = URL.createObjectURL(blob);
      setCard({ url, blob });
      return blob;
    } catch {
      return null;
    } finally {
      setCardBusy(false);
    }
  };

  const shareCard = async () => {
    track({ shared: true });
    const blob = card?.blob ?? (await makeCard());
    const text = `Hoy pedí por ${current?.shareLabel ?? "mi gente"} 🕊️ Jesús te ama: ${location.origin}/jesus-te-ama`;
    if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], "luz.png")] })) {
      try {
        await navigator.share({ text, files: [new File([blob], "jesus-te-ama.png", { type: "image/png" })] });
        return;
      } catch {
        /* cancelado */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const downloadCard = async () => {
    const blob = card?.blob ?? (await makeCard());
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jesus-te-ama-luz.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const chosenAmount = useMemo(() => {
    const value = custom ? Number(custom) : amount;
    return Number.isInteger(value) ? value : Math.floor(value);
  }, [amount, custom]);
  const amountOk = chosenAmount >= MIN_DONATION && chosenAmount <= MAX_DONATION;

  const donate = async () => {
    if (!amountOk || paying) return;
    setPaying(true);
    setPayError("");
    try {
      const r = await getDonationCheckout({ data: { amount: chosenAmount } });
      if (!r.ok) {
        setPayError(r.message);
        return;
      }
      try {
        sessionStorage.setItem(AMOUNT_KEY, String(chosenAmount));
      } catch {
        /* private mode */
      }
      window.location.assign(r.url);
    } catch {
      setPayError("No pudimos abrir Whop. Probá de nuevo.");
    } finally {
      setPaying(false);
    }
  };

  const toggleMute = () => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  };

  const tier = thanksTier(thanksAmount);
  const passion = step === "intro" || step === "detail";

  return (
    <main className={`jt-root jt-step-${step} ${passion ? "jt-passion" : ""}`}>
      <div className="jt-bg" aria-hidden="true">
        <img className="jt-bg-cruz" src="/jesus/cruz.jpg" alt="" />
        <img className="jt-bg-corona" src="/jesus/corona.jpg" alt="" />
        <i className="jt-rays" />
      </div>
      <header className="jt-top">
        <a className="jt-back" href="/">
          <ArrowLeft size={14} /> PY-STAR GAMES
        </a>
        <button className="jt-icon" onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <section className="jt-scene">
        <EffectsLayer particles={particles} />

        {step === "intro" && (
          <button className="jt-intro" onClick={() => (introLine < 2 ? setIntroLine((n) => n + 1) : go("name"))}>
            <p className={`jt-intro-line ${introLine >= 0 ? "on" : ""}`}>Has llegado aquí por algo.</p>
            <p className={`jt-intro-line ${introLine >= 1 ? "on" : ""}`}>No fue casualidad.</p>
            <p className={`jt-intro-line big ${introLine >= 2 ? "on" : ""}`}>Jesús te ama.</p>
            <span className="jt-hint">{introLine >= 2 ? "Tocá para empezar" : "Tocá para seguir"}</span>
          </button>
        )}
        {step === "intro" && (
          <a
            className={`jt-wa jt-wa-intro ${introLine >= 1 ? "on" : ""}`}
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={20} /> Hablar por WhatsApp
          </a>
        )}

        {step === "name" && (
          <div className="jt-panel">
            <img className="jt-figure-small" src="/jesus/sagrado-corazon.jpg" alt="Sagrado Corazón de Jesús" />
            <h1>Bienvenido. ¿Cómo te llamás?</h1>
            <p>Solo para hablarte por tu nombre. No se guarda en ningún lado, queda en tu teléfono.</p>
            <input
              className="jt-input"
              value={name}
              maxLength={24}
              placeholder="Tu nombre"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go("topic")}
            />
            <button className="jt-btn jt-btn-gold" onClick={() => go("topic")}>
              Seguir <ArrowRight size={18} />
            </button>
            <button className="jt-link" onClick={() => go("topic")}>
              Prefiero no decirlo
            </button>
            <a className="jt-wa" href={whatsappLink()} target="_blank" rel="noreferrer">
              <MessageCircle size={20} /> O hablá por WhatsApp
            </a>
            <small className="jt-fine">
              Del otro lado responde un asistente automático que habla en la voz de Jesús.
            </small>
          </div>
        )}

        {step === "topic" && (
          <div className="jt-panel">
            <h1>{name ? `${name}, ` : ""}¿qué te pesa hoy?</h1>
            <p>Elegí lo que más se parece. No hay respuestas equivocadas.</p>
            <div className="jt-options">
              {TOPICS.map((t) => (
                <button key={t.id} className="jt-option" onClick={() => pickTopic(t)}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "detail" && current && (
          <div className="jt-panel">
            <button className="jt-link jt-link-back" onClick={() => go("topic")}>
              <ArrowLeft size={14} /> Cambiar
            </button>
            <p className="jt-says">{current.intro}</p>
            {!choice ? (
              <>
                <h1>{current.question}</h1>
                <div className="jt-options">
                  {current.options.map((o) => (
                    <button key={o.id} className="jt-option" onClick={() => pickOption(o)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="jt-reply">{choice.reply}</p>
                <blockquote className="jt-verse">
                  “{choice.verse.text}”<cite>{choice.verse.ref}</cite>
                </blockquote>
                <button className="jt-btn jt-btn-gold" onClick={() => go("request")}>
                  Quiero pedirte algo <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        )}

        {step === "request" && (
          <div className="jt-panel">
            <h1>Contame con tus palabras.</h1>
            <p>
              Lo que escribas queda solo en tu teléfono. No se envía a ningún servidor ni lo lee
              nadie.
            </p>
            <textarea
              className="jt-input jt-textarea"
              value={request}
              maxLength={600}
              placeholder="Señor, te pido por…"
              onChange={(e) => setRequest(e.target.value)}
            />
            <button className="jt-btn jt-btn-gold" onClick={() => go("prayer")}>
              Presentar mi pedido <ArrowRight size={18} />
            </button>
            <button className="jt-link" onClick={() => go("prayer")}>
              Prefiero decirlo en silencio
            </button>
          </div>
        )}

        {step === "prayer" && (
          <div className="jt-prayer">
            <p className="jt-says">
              {name ? `${name}, ` : ""}tocá la imagen y encendé tu oración. Cada toque es una luz.
            </p>
            <button
              ref={figure}
              className="jt-figure"
              onPointerDown={touchFigure}
              aria-label="Tocar la imagen para encender la oración"
              style={{ "--glow": Math.min(1, lights / 12) } as CSSProperties}
            >
              <img src="/jesus/sagrado-corazon.jpg" alt="Sagrado Corazón de Jesús" draggable={false} />
              <i className="jt-halo" />
            </button>
            <div className="jt-touch-line" aria-live="polite">
              {touchLine}
            </div>
            <div className="jt-lights">
              {lights === 0 ? "Tocá la imagen" : `${lights} ${lights === 1 ? "luz" : "luces"} encendidas`}
            </div>
            {lights >= 5 && (
              <button className="jt-btn jt-btn-gold jt-fade-in" onClick={toBlessing}>
                Recibir mi bendición <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === "blessing" && current && choice && (
          <div className="jt-panel jt-blessing">
            <i className="jt-candle" aria-hidden="true">
              <b />
            </i>
            <span className="jt-kicker">TU BENDICIÓN</span>
            <p className="jt-bless-text">{current.blessing(name)}</p>
            <blockquote className="jt-verse">
              “{choice.verse.text}”<cite>{choice.verse.ref}</cite>
            </blockquote>
            <p className="jt-note">
              Tu vela queda encendida. Si podés, hoy hacé una llamada, un abrazo o un favor: así se
              siguen las bendiciones.
            </p>
            <div className="jt-row">
              <button className="jt-btn jt-btn-gold" onClick={() => void shareCard()} disabled={cardBusy}>
                {cardBusy ? <LoaderCircle className="jt-spin" size={18} /> : <Share2 size={18} />} Compartir mi
                luz
              </button>
              <button className="jt-btn" onClick={() => void downloadCard()} disabled={cardBusy}>
                <Download size={18} /> Guardar
              </button>
            </div>
            {card && <img className="jt-card-preview" src={card.url} alt="Tarjeta de luz" />}
            <a
              className="jt-wa"
              href={whatsappLink(
                `Hola, vengo de Jesús te ama. Hoy pedí por ${current.shareLabel}.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} /> Seguir hablando por WhatsApp
            </a>
            <button
              className="jt-btn jt-btn-soft"
              onClick={() => {
                track({ support: true });
                go("support");
              }}
            >
              <Heart size={18} /> Apoyar este espacio
            </button>
            <button className="jt-link" onClick={() => { setChoice(null); setCurrent(null); setLights(0); go("topic"); }}>
              Pedir por otra cosa
            </button>
          </div>
        )}

        {step === "support" && (
          <div className="jt-panel jt-support">
            <button className="jt-link jt-link-back" onClick={() => go("blessing")}>
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="jt-kicker">APORTE VOLUNTARIO</span>
            <h1>Sostené este espacio.</h1>
            <p>
              Jesús te ama es gratis y lo va a seguir siendo. Si querés y podés, tu aporte ayuda a
              PY-STAR GAMES a mantenerlo abierto para quien lo necesite.
            </p>
            <p className="jt-honest">
              Tu aporte <b>no cambia nada de tu oración</b> ni compra ningún favor. Si tenés que
              elegir, tu ofrenda va mejor a tu parroquia o a alguien que la necesite.
            </p>
            <div className="jt-amounts">
              {DONATION_PRESETS.map((value) => (
                <button
                  key={value}
                  className={`jt-amount ${!custom && amount === value ? "on" : ""}`}
                  onClick={() => {
                    setAmount(value);
                    setCustom("");
                  }}
                >
                  USD {value}
                </button>
              ))}
            </div>
            <label className="jt-custom">
              Otro monto (mínimo USD {MIN_DONATION})
              <input
                className="jt-input"
                inputMode="numeric"
                placeholder={`${MIN_DONATION}`}
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              />
            </label>
            <button className="jt-btn jt-btn-gold" disabled={!amountOk || paying} onClick={() => void donate()}>
              {paying ? <LoaderCircle className="jt-spin" size={18} /> : <Heart size={18} />} Aportar USD{" "}
              {amountOk ? chosenAmount : MIN_DONATION}
            </button>
            {!amountOk && custom && (
              <p className="jt-error">El aporte va de USD {MIN_DONATION} a USD {MAX_DONATION}.</p>
            )}
            {payError && <p className="jt-error">{payError}</p>}
            <p className="jt-fine">Pago seguro en Whop. Recibo por correo. Sin suscripción.</p>
            <button className="jt-link" onClick={() => go("blessing")}>
              Hoy no puedo, y está bien
            </button>
          </div>
        )}

        {step === "thanks" && (
          <div className="jt-panel jt-thanks">
            <i className="jt-candle big" aria-hidden="true">
              <b />
            </i>
            <span className="jt-kicker">APORTE RECIBIDO · USD {thanksAmount}</span>
            <h1>{tier.title}{name ? `, ${name}` : ""}.</h1>
            <p>{tier.text}</p>
            {current && choice && (
              <>
                <div className="jt-row">
                  <button
                    className="jt-btn jt-btn-gold"
                    onClick={() => void makeCard(thanksAmount >= 50 ? `Gracias, ${name || "amigo"}` : "Gracias por tu luz").then(() => shareCard())}
                    disabled={cardBusy}
                  >
                    {cardBusy ? <LoaderCircle className="jt-spin" size={18} /> : <Share2 size={18} />} Compartir mi
                    tarjeta de luz
                  </button>
                  <button className="jt-btn" onClick={() => void downloadCard()} disabled={cardBusy}>
                    <Download size={18} /> Guardar
                  </button>
                </div>
                {card && <img className="jt-card-preview" src={card.url} alt="Tarjeta de luz" />}
              </>
            )}
            <p className="jt-note">
              Si alguien que conocés está pasando un mal momento, mandale este lugar. Es gratis.
            </p>
            <button className="jt-link" onClick={() => go("topic")}>
              Volver a empezar
            </button>
          </div>
        )}
      </section>

      <footer className="jt-foot">
        <p>
          Este espacio no reemplaza ayuda médica ni profesional. Si es una emergencia, llamá al{" "}
          <b>911</b>. Si sentís que no podés más, hablá hoy con alguien de confianza.
        </p>
        <p>
          Para mejorar este espacio guardamos, de forma anónima, el tema que elegís y cuántas luces
          encendés. Lo que escribís y tu nombre nunca salen de tu teléfono.
        </p>
        <p>
          PY-STAR GAMES · <a href="/privacidad">Privacidad</a> ·{" "}
          <a href="/politica-de-compras">Aportes</a>
        </p>
      </footer>
    </main>
  );
}
