import { createFileRoute, notFound } from "@tanstack/react-router";
import { CharacterDirectory, SeoLayout } from "@/seo/SeoLayout";
import { characterBySlug, SITE_URL } from "@/seo/content";

export const Route = createFileRoute("/personajes/$slug")({
  loader: ({ params }) => {
    const character = characterBySlug(params.slug);
    if (!character) throw notFound();
    return character;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const url = `${SITE_URL}/personajes/${loaderData.slug}`;
    const image = `${SITE_URL}${loaderData.portrait}`;
    return {
      meta: [
        { title: `${loaderData.name}: poderes y guía | Influencers Battle` },
        { name: "description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: `${loaderData.name} | Influencers Battle` },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:title", content: `${loaderData.name} | Influencers Battle` },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CharacterPage,
});

function CharacterPage() {
  const character = Route.useLoaderData();
  const fighterIdBySlug: Record<string, string> = {
    "masivo-bro": "masivo",
    onichan: "onichan",
    "anatomic-blogs": "anatomic",
    "la-comadre": "comadre",
    "el-papu": "papu",
    "la-secre": "secre",
    "pablito-pintos": "pablito",
    marito: "marito",
  };
  const fighterId = fighterIdBySlug[character.slug];
  const playUrl = fighterId ? `/?battle=1&fighter=${fighterId}` : "/";
  const structured = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Influencers Battle Paraguay",
    character: {
      "@type": "Person",
      name: character.name,
      description: character.description,
    },
    url: `${SITE_URL}/personajes/${character.slug}`,
  });
  return (
    <SeoLayout>
      <section className="seo-hero" style={{ "--accent": character.color } as React.CSSProperties}>
        <div className="seo-hero-copy">
          <span className="seo-kicker">{character.kicker}</span>
          <h1>{character.name}</h1>
          <p>{character.description}</p>
          <div className="seo-actions">
            <a className="seo-button primary" href={playUrl}>
              Jugar ahora
            </a>
            <a className="seo-button" href="#estrategia">
              Ver estrategia
            </a>
          </div>
        </div>
        <div className="seo-hero-art">
          <img src={character.portrait} alt={character.name} />
        </div>
      </section>
      <section className="seo-content">
        <div className="seo-content-grid">
          <article className="seo-article">
            <span className="seo-kicker">QUIÉN ES</span>
            <h2>{character.name} en el juego</h2>
            {character.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <h3>Cómo se juega</h3>
            <p>{character.playStyle}</p>
            <h3 id="estrategia">Poder principal</h3>
            <p>{character.ability}</p>
            <h3>Consejos de combate</h3>
            <ul>
              {character.tactics.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <p>
              Todo lo narrado en esta ficha pertenece al universo ficticio y satírico de Influencers
              Battle. No describe hechos ni declaraciones reales.
            </p>
          </article>
          <aside
            className="seo-aside"
            style={{ "--accent": character.color } as React.CSSProperties}
          >
            <div className="seo-stat">
              <small>CLASE</small>
              <strong>
                {character.type === "jefe" ? "Jefe de episodio" : "Personaje jugable"}
              </strong>
            </div>
            <div className="seo-stat">
              <small>ESTILO</small>
              <strong>{character.kicker}</strong>
            </div>
            <div className="seo-stat">
              <small>IDEAL PARA</small>
              <strong>
                {character.type === "jefe"
                  ? "Aprender sus patrones"
                  : "Campaña, ranking y desafíos"}
              </strong>
            </div>
            <div className="seo-stat">
              <small>PLATAFORMA</small>
              <strong>Móvil y computadora</strong>
            </div>
          </aside>
        </div>
      </section>
      <CharacterDirectory compact />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structured }} />
    </SeoLayout>
  );
}
