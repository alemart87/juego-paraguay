import { createFileRoute } from "@tanstack/react-router";
import { JesusGame } from "@/jesus/JesusGame";
import { SITE_URL } from "@/seo/content";

const URL = `${SITE_URL}/jesus-te-ama`;
const TITLE = "Jesús te ama · Un momento de oración y consuelo";
const DESCRIPTION =
  "Has llegado aquí por algo. Una conversación guiada con Jesús: contale qué te pesa, recibí una palabra de consuelo y una bendición, encendé tu oración y compartí tu luz. Gratis.";
const IMAGE = `${SITE_URL}/jesus/sagrado-corazon.jpg`;

export const Route = createFileRoute("/jesus-te-ama")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMAGE },
      { property: "og:image:secure_url", content: IMAGE },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "Sagrado Corazón de Jesús" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
      { name: "twitter:url", content: URL },
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
  component: JesusGame,
});
