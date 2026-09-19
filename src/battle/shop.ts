import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const SHOP_ITEMS = [
  {
    sku: "arsenal",
    name: "Arsenal guaraní",
    icon: "💥",
    description: "Bazuca, granadas y hondita paraguaya para dominar una partida.",
    price: 3.99,
    badge: "MÁS VENDIDO",
    category: "ARMAS",
  },
  {
    sku: "terere",
    name: "Tereré medicinal",
    icon: "🧉",
    description: "Recuperación total y una reserva extra de vida.",
    price: 3.99,
    badge: "SALVAVIDAS",
    category: "SALUD",
  },
  {
    sku: "pombero",
    name: "Ayuda del Pombero",
    icon: "🌿",
    description: "Un guardián espiritual bloquea el próximo golpe decisivo.",
    price: 4.99,
    badge: "MÍSTICO",
    category: "ESPÍRITU",
  },
  {
    sku: "energia",
    name: "Energía desatada",
    icon: "⚡",
    description: "Más energía, súper cargado y daño aumentado durante la partida.",
    price: 3.99,
    badge: "RÁPIDO",
    category: "ENERGÍA",
  },
  {
    sku: "inmunidad",
    name: "Poder político",
    icon: "🛡️",
    description: "Inmunidad temporal para atravesar el caos sin recibir daño.",
    price: 7.99,
    badge: "LEGENDARIO",
    category: "PODER",
  },
  {
    sku: "armadura",
    name: "Armadura de acero",
    icon: "🦾",
    description: "Blindaje pesado: escudo inicial y reducción de daño en combate.",
    price: 5.99,
    badge: "TANQUE",
    category: "ARMADURA",
  },
  {
    sku: "luison",
    name: "Poder del Luizón",
    icon: "🐺",
    description: "Invocá un Luizón aliado que persigue enemigos y protege tu avance.",
    price: 6.99,
    badge: "PROHIBIDO",
    category: "INVOCACIÓN",
  },
  {
    sku: "avance",
    name: "Avance relámpago",
    icon: "🚀",
    description: "Empezá con combo, munición y ventaja para avanzar más rápido.",
    price: 4.99,
    badge: "BOOST",
    category: "PROGRESO",
  },
] as const;

export type ShopSku = (typeof SHOP_ITEMS)[number]["sku"];
const input = z.object({
  sku: z.enum([
    "arsenal",
    "terere",
    "pombero",
    "energia",
    "inmunidad",
    "armadura",
    "luison",
    "avance",
  ]),
});

export const getWhopCheckout = createServerFn({ method: "POST" })
  .validator((value: unknown) => input.parse(value))
  .handler(async ({ data }) => {
    const env: Record<ShopSku, string | undefined> = {
      arsenal: process.env.WHOP_CHECKOUT_ARSENAL,
      terere: process.env.WHOP_CHECKOUT_TERERE,
      pombero: process.env.WHOP_CHECKOUT_POMBERO,
      energia: process.env.WHOP_CHECKOUT_ENERGIA,
      inmunidad: process.env.WHOP_CHECKOUT_INMUNIDAD,
      armadura: process.env.WHOP_CHECKOUT_ARMADURA,
      luison: process.env.WHOP_CHECKOUT_LUISON,
      avance: process.env.WHOP_CHECKOUT_AVANCE,
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
