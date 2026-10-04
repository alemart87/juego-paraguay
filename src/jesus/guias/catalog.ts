import raw from "./catalog.json";

export type GuideId = "dinero" | "amor" | "hijos" | "trabajo";

export type Guide = {
  id: GuideId;
  sku: string;
  title: string;
  short: string;
  subtitle: string;
  pitch: string;
  keywords: string[];
  cover: string;
  weeks: string[];
  closing: string;
  plan_title: string;
};

export const GUIDE_PRICE_USD: number = raw.price_usd;
export const GUIDE_PRICE_GS: number = raw.price_gs;
export const GUIDES = raw.guides as Guide[];
export const GUIDE_IDS = GUIDES.map((g) => g.id);

export function findGuide(id: string | null | undefined): Guide | null {
  return GUIDES.find((g) => g.id === id) ?? null;
}

export const priceLabel = () =>
  `USD ${GUIDE_PRICE_USD.toFixed(2).replace(".", ",")} (unos Gs ${GUIDE_PRICE_GS.toLocaleString("es-PY")})`;

/** Nombre del archivo PDF (mismo en assets/guias y en el envío por WhatsApp). */
export const guideFileName = (id: GuideId) => `jesus-te-ama-30-dias-${id}.pdf`;
