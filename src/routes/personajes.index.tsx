import { createFileRoute } from "@tanstack/react-router";
import { CharacterDirectory, SeoLayout } from "@/seo/SeoLayout";
import { SITE_URL } from "@/seo/content";

const title = "Personajes de Influencers Battle Paraguay";
const description =
  "Conocé a los nueve combatientes y cinco jefes de Influencers Battle: poderes, historias ficticias y consejos para jugar.";

export const Route = createFileRoute("/personajes/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/personajes` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/personajes` }],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  return (
    <SeoLayout>
      <section className="seo-prose-hero">
        <span className="seo-kicker">14 PERSONAJES · 5 EPISODIOS</span>
        <h1>Elegí tu bando.</h1>
        <p>
          Nueve combatientes jugables y cinco jefes convierten lugares reconocibles de Paraguay en
          una campaña arcade rápida, absurda y creada para celulares.
        </p>
      </section>
      <CharacterDirectory />
    </SeoLayout>
  );
}
