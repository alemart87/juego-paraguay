import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const SHOP_ITEMS = [
  {
    sku: "arsenal",
    name: "Armamento especial",
    icon: "💥",
    description: "Bazuca, granadas y hondita paraguaya para dominar una partida.",
  },
  {
    sku: "terere",
    name: "Tereré medicinal",
    icon: "🧉",
    description: "Recuperación total y una reserva extra de vida.",
  },
  {
    sku: "pombero",
    name: "Ayuda del Pombero",
    icon: "🌿",
    description: "Un guardián espiritual bloquea el próximo golpe decisivo.",
  },
  {
    sku: "energia",
    name: "Energía mística",
    icon: "⚡",
    description: "Empezá la partida con el súper cargado y mayor daño.",
  },
  {
    sku: "inmunidad",
    name: "Poder político",
    icon: "🛡️",
    description: "Inmunidad temporal para atravesar el caos sin recibir daño.",
  },
] as const;

export type ShopSku = (typeof SHOP_ITEMS)[number]["sku"];
const input = z.object({ sku: z.enum(["arsenal", "terere", "pombero", "energia", "inmunidad"]) });

export const getWhopCheckout = createServerFn({ method: "POST" })
  .validator((value: unknown) => input.parse(value))
  .handler(async ({ data }) => {
    const env: Record<ShopSku, string | undefined> = {
      arsenal: process.env.WHOP_CHECKOUT_ARSENAL,
      terere: process.env.WHOP_CHECKOUT_TERERE,
      pombero: process.env.WHOP_CHECKOUT_POMBERO,
      energia: process.env.WHOP_CHECKOUT_ENERGIA,
      inmunidad: process.env.WHOP_CHECKOUT_INMUNIDAD,
    };
    const url = env[data.sku]?.trim();
    if (!url)
      return {
        ok: false as const,
        message: "Este artículo se habilitará cuando PY-STAR conecte su checkout de Whop.",
      };
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error("protocol");
      return { ok: true as const, url: parsed.toString() };
    } catch {
      return { ok: false as const, message: "El enlace de Whop configurado no es válido." };
    }
  });
