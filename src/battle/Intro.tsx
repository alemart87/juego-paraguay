import { useEffect, useRef } from "react";
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
          INFLUENCERS
          <br />
          BATTLE
        </strong>
      </div>
      <div className="intro-frame intro-heroes" aria-hidden="true">
        {FIGHTERS.map((item) => (
          <img key={item.id} src={item.portrait} alt="" />
        ))}
      </div>
      <div className="intro-frame intro-bosses" aria-hidden="true">
        {Object.entries(BOSSES).map(([id, item]) => (
          <figure key={id}>
            <img src={item.portrait} alt="" />
            <b>{item.name}</b>
          </figure>
        ))}
      </div>
      <div className="intro-frame intro-final" aria-hidden="true">
        <img src="/media/characters/cover-v2.webp" alt="" />
        <strong>PELEÁ POR EL FEED.</strong>
      </div>
      <button onClick={onDone}>Saltar intro</button>
    </section>
  );
}
