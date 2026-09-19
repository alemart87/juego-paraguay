import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Gamepad2, ShieldCheck, ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/battle/BrandLogo";
import { CHARACTERS } from "./content";
import "./seo.css";

export function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="seo-site">
      <header className="seo-nav">
        <Link to="/" className="seo-brand" aria-label="Influencers Battle, inicio">
          <BrandLogo />
          <span>
            <b>INFLUENCERS BATTLE</b>
            <small>UN JUEGO DE PY-STAR GAMES</small>
          </span>
        </Link>
        <nav aria-label="Información del juego">
          <Link to="/personajes">Personajes</Link>
          <Link to="/como-jugar">Cómo jugar</Link>
          <Link to="/politica-de-compras">
            <ShoppingBag /> Compras
          </Link>
          <Link to="/" className="seo-play">
            <Gamepad2 /> Jugar
          </Link>
        </nav>
      </header>
      {children}
      <footer className="seo-footer">
        <div>
          <BrandLogo />
          <p>Influencers Battle es una ficción satírica paraguaya para mayores de 18 años.</p>
        </div>
        <nav>
          <Link to="/personajes">Personajes</Link>
          <Link to="/como-jugar">Cómo jugar</Link>
          <Link to="/privacidad">
            <ShieldCheck /> Privacidad
          </Link>
          <Link to="/politica-de-compras">Política de compras</Link>
        </nav>
        <small>© 2026 PY-STAR GAMES · Paraguay</small>
      </footer>
    </main>
  );
}

export function CharacterDirectory({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "seo-directory compact" : "seo-directory"}>
      <div className="seo-section-title">
        <span>ELENCO COMPLETO</span>
        <h2>Conocé a los combatientes y jefes.</h2>
      </div>
      <div className="seo-character-grid">
        {CHARACTERS.map((entry, index) => (
          <Link
            key={entry.slug}
            to="/personajes/$slug"
            params={{ slug: entry.slug }}
            className="seo-character-card"
            style={{ "--accent": entry.color } as React.CSSProperties}
          >
            <span>
              {String(index + 1).padStart(2, "0")} · {entry.type}
            </span>
            <img src={entry.portrait} alt={entry.name} loading="lazy" />
            <div>
              <h3>{entry.name}</h3>
              <p>{entry.kicker}</p>
            </div>
            <ArrowRight />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BackToGame() {
  return (
    <Link to="/" className="seo-back">
      <ArrowLeft /> Volver al juego
    </Link>
  );
}
