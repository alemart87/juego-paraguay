import { createFileRoute } from "@tanstack/react-router";
import { BattleGame } from "@/battle/BattleGame";
import { SITE_URL } from "@/seo/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: SITE_URL },
      { name: "twitter:url", content: SITE_URL },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "alternate", hrefLang: "es-PY", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
    ],
  }),
  component: Home,
});

function Home() {
  return <BattleGame />;
}
