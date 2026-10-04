import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { GUIDES, GUIDE_PRICE_GS, GUIDE_PRICE_USD } from "@/jesus/guias/catalog";
import { SITE_URL } from "@/seo/content";
import "@/jesus/jesus.css";
import "@/jesus/guias/guias.css";

const URL = `${SITE_URL}/jesus-te-ama/guias`;
const TITLE = "Guías de oración de 30 días · Jesús te ama";
const DESCRIPTION =
  "Cuatro caminos de 30 días para orar por tu economía, el amor, tus hijos o tu trabajo: versículo, palabra de Jesús, oración, alabanza y un paso concreto cada día. PDF para el celular.";
const IMAGE = `${SITE_URL}/jesus/og.jpg`;

export const Route = createFileRoute("/jesus-te-ama_/guias")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMAGE },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
      { name: "theme-color", content: "#1a1008" },
    ],
    links: [
      { rel: "canonical", href: URL },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap",
      },
    ],
  }),
  component: GuidesCatalog,
});

function GuidesCatalog() {
  return (
    <main className="jt-root jg-root">
      <a className="jt-back" href="/jesus-te-ama">
        <ArrowLeft size={16} /> Jesús te ama
      </a>
      <div className="jt-panel jg-panel">
        <span className="jt-kicker">GUÍAS DE ORACIÓN · 30 DÍAS</span>
        <h1>Un mes para orar a rajatabla.</h1>
        <p>
          Cada guía trae treinta días completos: un versículo, una palabra de Jesús, una oración para
          decir en voz alta, una alabanza y un paso concreto. Un día a la vez, a la misma hora.
        </p>
        <div className="jg-grid">
          {GUIDES.map((g) => (
            <Link key={g.id} to="/jesus-te-ama/guias/$guide" params={{ guide: g.id }} className="jg-card">
              <img src={`/jesus/${g.cover}`} alt="" />
              <span className="jg-card-body">
                <b>{g.title}</b>
                <span>{g.subtitle}</span>
                <em>
                  USD {GUIDE_PRICE_USD.toFixed(2).replace(".", ",")} · Gs {GUIDE_PRICE_GS.toLocaleString("es-PY")}
                </em>
              </span>
            </Link>
          ))}
        </div>
        <p className="jt-fine">
          <BookOpen size={14} /> PDF para guardar en el celular. Pago seguro en Whop. Es un camino de
          oración y disciplina: no promete resultados materiales.
        </p>
      </div>
    </main>
  );
}
