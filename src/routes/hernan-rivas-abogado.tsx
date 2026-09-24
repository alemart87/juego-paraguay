import { createFileRoute } from "@tanstack/react-router";
import { AbogadoGame } from "@/abogado/AbogadoGame";
import { SITE_URL } from "@/seo/content";

const URL = `${SITE_URL}/hernan-rivas-abogado`;
const TITLE = "Hernán Rivas ES ABOGADO · Pegale al abogado";
const DESCRIPTION =
  "Juego arcade: tenés 60 segundos para boxear al abogado más discutido del Paraguay. Combos, K.O., mazo, guantes y capturas para compartir.";
const IMAGE = `${SITE_URL}/abogado/og.png`;

export const Route = createFileRoute("/hernan-rivas-abogado")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMAGE },
      { property: "og:image:secure_url", content: IMAGE },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: "Hernán Rivas ES ABOGADO, juego de boxeo" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
      { name: "twitter:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: AbogadoGame,
});
