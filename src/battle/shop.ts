import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SHOP_ITEMS, SHOP_SKUS, type ShopSku } from "./shop-catalog";

export { SHOP_ITEMS } from "./shop-catalog";
export type { ShopSku } from "./shop-catalog";

const input = z.object({ sku: z.enum(SHOP_SKUS) });

export const getWhopCheckout = createServerFn({ method: "POST" })
  .validator((value: unknown) => input.parse(value))
  .handler(async ({ data }) => {
    const env: Record<ShopSku, string | undefined> = {
      pablito: process.env.WHOP_CHECKOUT_PABLITO,
      marito: process.env.WHOP_CHECKOUT_MARITO,
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
    if (url) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") throw new Error("protocol");
        return { ok: true as const, url: parsed.toString() };
      } catch {
        return { ok: false as const, message: "El enlace de Whop configurado no es válido." };
      }
    }
    try {
      const item = SHOP_ITEMS.find((entry) => entry.sku === data.sku);
      if (!item) throw new Error("unknown sku");
      const { getOrCreateWhopCheckout } = await import("./whop.server");
      const checkout = await getOrCreateWhopCheckout(item);
      return { ok: true as const, url: checkout.url };
    } catch (error) {
      console.error("[whop] checkout unavailable", error);
      return {
        ok: false as const,
        message: "La tienda no pudo conectarse con Whop. Probá de nuevo en unos minutos.",
      };
    }
  });
