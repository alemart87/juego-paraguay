import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Influencers Battle · Paraguay";
const SITE_URL = "https://www.influencerspy.pro";
const OG_IMAGE = `${SITE_URL}/og.jpg`;
const DESCRIPTION =
  "Elegí tu influencer, dominá cuatro escenarios paraguayos y enfrentá jefes imposibles en una batalla arcade creada para móvil.";
const GA_MEASUREMENT_ID = "G-2DYRW5P77W";
const GA_INLINE = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`;
const STRUCTURED_DATA = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PY-STAR GAMES",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/py-star-games-256.webp`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Influencers Battle Paraguay",
    alternateName: "Influencers Battle",
    url: SITE_URL,
    inLanguage: "es-PY",
    publisher: { "@type": "Organization", name: "PY-STAR GAMES" },
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Influencers Battle Paraguay",
    description: DESCRIPTION,
    url: SITE_URL,
    image: OG_IMAGE,
    applicationCategory: "Game",
    operatingSystem: "Web, Android, iOS, Windows, macOS",
    gamePlatform: ["Mobile web", "Desktop web"],
    genre: ["Acción", "Arcade", "Sátira"],
    inLanguage: "es-PY",
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: "PY-STAR GAMES" },
    publisher: { "@type": "Organization", name: "PY-STAR GAMES" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: SITE_URL,
    },
  },
]);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0f14" },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "juego paraguayo, influencers paraguay, juego móvil, batalla de influencers, arcade paraguay, PY-STAR GAMES",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "googlebot", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_PY" },
      { property: "og:site_name", content: "PY-STAR GAMES" },
      { property: "og:title", content: "Influencers Battle · La batalla por el feed" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:secure_url", content: OG_IMAGE },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Influencers Battle Paraguay — héroes y jefes" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Influencers Battle · Paraguay" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&display=swap",
      },
    ],
    // Google tag (gtag.js) — rendered in <head> by <HeadContent />.
    scripts: [
      { src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`, async: true },
      { children: GA_INLINE },
    ],
  }),
  component: () => (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
