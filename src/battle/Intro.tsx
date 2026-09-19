import { useEffect, useRef, type CSSProperties } from "react";
import { BOSSES } from "./content";
import { BrandLogo } from "./BrandLogo";

const stars = [
  { name: "PABLITO PINTOS", image: "/battle/pablito.webp", color: "#ff3190" },
  { name: "MARITO", image: "/battle/marito.webp", color: "#f6e75a" },
];

export function Intro({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const timer = window.setTimeout(() => done.current(), 4200);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="game-intro intro-pro" aria-label="Introducción de Influencers Battle">
      <div className="intro-pro-noise" />
      <div className="intro-pro-brand">
        <BrandLogo animated />
        <span>PY-STAR GAMES PRESENTA</span>
      </div>
      <div className="intro-pro-title">
        <span>LA BATALLA POR EL FEED</span>
        <strong>INFLUENCERS</strong>
        <b>BATTLE</b>
        <i>PARAGUAY · SIN FILTRO</i>
      </div>
      <div className="intro-pro-bosses" aria-hidden="true">
        {Object.values(BOSSES).map((item, index) => (
          <figure
            key={item.name}
            style={{ "--i": index, "--boss-color": item.color } as CSSProperties}
          >
            <img src={item.portrait} alt="" />
            <figcaption>
              <small>JEFE 0{index + 1}</small>
              <strong>{item.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="intro-pro-premium" aria-hidden="true">
        {stars.map((star, index) => (
          <figure key={star.name} style={{ "--i": index, "--star": star.color } as CSSProperties}>
            <img src={star.image} alt="" />
            <figcaption>
              <small>PREMIUM</small>
              <strong>{star.name}</strong>
            </figcaption>
          </figure>
        ))}
        <div>
          <BrandLogo />
          <strong>
            INFLUENCERS
            <br />
            <em>BATTLE</em>
          </strong>
        </div>
      </div>
      <button onClick={onDone}>Saltar intro</button>
    </section>
  );
}
