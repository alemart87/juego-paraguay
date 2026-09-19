import { useEffect, useRef, type CSSProperties } from "react";
import { FIGHTERS, BOSSES } from "./content";
import { BrandLogo } from "./BrandLogo";

export function Intro({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const timer = window.setTimeout(() => done.current(), 3000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="game-intro" aria-label="Introducción de Influencers Battle">
      <div className="intro-frame intro-publisher">
        <BrandLogo animated />
        <span>UNA PRODUCCIÓN PARAGUAYA</span>
      </div>
      <div className="intro-frame intro-logo">
        <span>PARAGUAY PRESENTA</span>
        <strong>
          BATALLA DE
          <br /> INFLUENCERS
        </strong>
      </div>
      <div className="intro-frame intro-heroes" aria-hidden="true">
        {FIGHTERS.map((item) => (
          <img key={item.id} src={item.portrait} alt="" />
        ))}
      </div>
      <div className="intro-frame intro-bosses" aria-hidden="true">
        {Object.entries(BOSSES).map(([id, item], index) => (
          <figure
            key={id}
            style={{ "--boss-index": index, "--boss-color": item.color } as CSSProperties}
          >
            <i className="boss-lightning l1" />
            <i className="boss-lightning l2" />
            <img src={item.portrait} alt="" />
            <span>JEFE 0{id}</span>
            <b>{item.name}</b>
            <small>{item.title}</small>
          </figure>
        ))}
      </div>
      <div className="intro-frame intro-final" aria-hidden="true">
        <img src="/media/characters/cover-v2.webp" alt="" />
        <strong>BATALLA DE INFLUENCERS</strong>
      </div>
      <button onClick={onDone}>Saltar intro</button>
    </section>
  );
}
