import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MAX_DONATION, MIN_DONATION } from "./content";

/**
 * Aporte voluntario a PY-STAR GAMES desde "Jesús te ama". Monto libre en
 * dólares enteros, con el mínimo que fija la empresa. No entrega nada a
 * cambio y la pantalla lo dice.
 */
/** Planes ya creados en Whop para los montos sugeridos; otros montos se crean al vuelo. */
const DONATION_CHECKOUTS: Record<number, string> = {
  10: "https://whop.com/checkout/plan_mTkSY7mRrmMiV",
  20: "https://whop.com/checkout/plan_1nCWOGRKnKYQw",
  50: "https://whop.com/checkout/plan_FwP4m4K34hObZ",
  100: "https://whop.com/checkout/plan_c9MytnFsdsXQN",
};

export const getDonationCheckout = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ amount: z.number().int().min(MIN_DONATION).max(MAX_DONATION) }).parse(input),
  )
  .handler(async ({ data }) => {
    const pinned = DONATION_CHECKOUTS[data.amount];
    if (pinned) return { ok: true as const, url: pinned };
    try {
      const { getOrCreateDonationCheckout } = await import("@/battle/whop.server");
      const checkout = await getOrCreateDonationCheckout(data.amount);
      return { ok: true as const, url: checkout.url };
    } catch (error) {
      console.error("[whop] donation checkout unavailable", error);
      return {
        ok: false as const,
        message: "No pudimos conectar con Whop. Probá de nuevo en unos minutos.",
      };
    }
  });
