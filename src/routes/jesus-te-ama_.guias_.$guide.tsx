import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, LoaderCircle, MessageCircle, ShoppingBag } from "lucide-react";
import { findGuide, GUIDE_PRICE_GS, GUIDE_PRICE_USD, type Guide } from "@/jesus/guias/catalog";
import { getGuideStatus, startGuideCheckout } from "@/jesus/guias/checkout";
import { buyerToken } from "@/jesus/guias/token";
import { whatsappLink } from "@/jesus/content";
import { SITE_URL } from "@/seo/content";
import "@/jesus/jesus.css";
import "@/jesus/guias/guias.css";

export const Route = createFileRoute("/jesus-te-ama_/guias_/$guide")({
  loader: ({ params }) => {
    const guide = findGuide(params.guide);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const guide = loaderData?.guide;
    const title = guide ? `${guide.title} · Jesús te ama` : "Guía de oración · Jesús te ama";
    const description = guide?.subtitle ?? "";
    const url = `${SITE_URL}/jesus-te-ama/guias/${guide?.id ?? ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: `${SITE_URL}/jesus/og.jpg` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: `${SITE_URL}/jesus/og.jpg` },
        { name: "theme-color", content: "#1a1008" },
      ],
      links: [
        { rel: "canonical", href: url },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap",
        },
      ],
    };
  },
  component: GuidePage,
  notFoundComponent: () => (
    <main className="jt-root jg-root">
      <div className="jt-panel jg-panel">
        <h1>Esa guía no existe.</h1>
        <a className="jt-btn" href="/jesus-te-ama/guias">
          Ver las guías
        </a>
      </div>
    </main>
  ),
});

type State = "idle" | "paying" | "waiting" | "paid";

function GuidePage() {
  const { guide } = Route.useLoaderData() as { guide: Guide };
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitedLong, setWaitedLong] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = buyerToken(params.get("t"));
    setToken(t);
    const check = async () => {
      const status = await getGuideStatus({ data: { guide: guide.id, token: t } }).catch(() => null);
      if (status?.paid && status.url) {
        setDownloadUrl(status.url);
        setState("paid");
        if (timer.current) clearInterval(timer.current);
        return true;
      }
      return false;
    };
    void check().then((paid) => {
      if (paid || !params.has("gracias")) return;
      // Volvió de Whop: el webhook del pago llega en segundos.
      setState("waiting");
      let tries = 0;
      timer.current = setInterval(() => {
        tries++;
        if (tries > 40) {
          if (timer.current) clearInterval(timer.current);
          setWaitedLong(true);
          return;
        }
        void check();
      }, 3000);
    });
    if (params.has("gracias")) window.history.replaceState(null, "", `${window.location.pathname}?t=${t}`);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [guide.id]);

  const buy = async () => {
    setError(null);
    setState("paying");
    const r = await startGuideCheckout({ data: { guide: guide.id, token } }).catch(() => null);
    if (!r || !r.ok) {
      setError(r && !r.ok ? r.message : "No pudimos conectar con el pago. Probá de nuevo en unos minutos.");
      setState("idle");
      return;
    }
    if (r.paid) {
      setDownloadUrl(r.url);
      setState("paid");
      return;
    }
    window.location.href = r.url;
  };

  return (
    <main className="jt-root jg-root">
      <a className="jt-back" href="/jesus-te-ama/guias">
        <ArrowLeft size={16} /> Todas las guías
      </a>
      <div className="jt-panel jg-panel">
        <img className="jt-figure-small" src={`/jesus/${guide.cover}`} alt="" />
        <span className="jt-kicker">GUÍA DE ORACIÓN · 30 DÍAS</span>
        <h1>{guide.title}</h1>
        <p>{guide.subtitle}</p>

        {state === "paid" && downloadUrl ? (
          <div className="jg-box jg-paid">
            <b>Tu guía ya es tuya. 🤍</b>
            <p>
              Empezá mañana temprano por el día 1 y hacela a rajatabla: el mismo horario cada día,
              sin saltear ninguno. Guardá el PDF en el celular.
            </p>
            <a className="jt-btn jt-btn-gold" href={downloadUrl}>
              <Download size={18} /> Descargar el PDF
            </a>
            <a className="jt-wa" href={whatsappLink("Hola Jesús, ya tengo mi guía de 30 días 🙏")} target="_blank" rel="noreferrer">
              <MessageCircle size={20} /> Contarle a Jesús que empezaste
            </a>
          </div>
        ) : state === "waiting" ? (
          <div className="jg-box">
            <LoaderCircle className="jt-spin" size={22} />
            <b>Confirmando tu pago…</b>
            <p>
              {waitedLong
                ? "Está tardando más de lo normal. Si ya pagaste, volvé a abrir este mismo link en unos minutos: tu guía va a estar acá."
                : "En unos segundos aparece el botón para descargar. No cierres esta página."}
            </p>
          </div>
        ) : (
          <>
            <ul className="jg-list">
              <li>30 días completos, un día a la vez: versículo, palabra de Jesús, oración, alabanza y el paso de hoy.</li>
              {guide.weeks.map((w) => (
                <li key={w}>{w}</li>
              ))}
              <li>Reglas para hacerla a rajatabla, líneas para escribir y una casilla por día.</li>
              <li>PDF de 63 páginas, pensado para leer en el celular.</li>
            </ul>
            <button className="jt-btn jt-btn-gold" disabled={state === "paying" || !token} onClick={() => void buy()}>
              {state === "paying" ? <LoaderCircle className="jt-spin" size={18} /> : <ShoppingBag size={18} />} Comprar por
              USD {GUIDE_PRICE_USD.toFixed(2).replace(".", ",")}
            </button>
            <p className="jt-fine">
              Unos Gs {GUIDE_PRICE_GS.toLocaleString("es-PY")}. Pago seguro en Whop con tarjeta. Descarga inmediata, sin
              suscripción.
            </p>
            {error && <p className="jt-error">{error}</p>}
            <p className="jt-honest">
              Es un camino de oración y disciplina. No promete plazos ni resultados materiales, y no reemplaza a un
              médico, un abogado ni a la ayuda de tu gente.
            </p>
          </>
        )}
      </div>
      <footer className="jt-foot">
        PY-STAR GAMES · <a href="/privacidad">Privacidad</a> · <a href="/politica-de-compras">Compras</a>
      </footer>
    </main>
  );
}
