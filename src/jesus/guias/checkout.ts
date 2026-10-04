import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GUIDE_IDS, type GuideId } from "./catalog";

/**
 * Compra y descarga de las guías de 30 días desde la web. El `token` identifica
 * al comprador (viene de WhatsApp por el link de Jesús, o lo genera la web).
 */
const input = z.object({
  guide: z.enum(GUIDE_IDS as [GuideId, ...GuideId[]]),
  token: z.string().regex(/^[a-f0-9]{24,64}$/),
});

export const startGuideCheckout = createServerFn({ method: "POST" })
  .validator((raw: unknown) => input.parse(raw))
  .handler(async ({ data }) => {
    try {
      const { getOrCreateGuideCheckout, guideDownloadUrl } = await import("../../../server/utils/jesus-guias");
      const sql = await (await import("@/lib/db")).getSql();
      const checkout = await getOrCreateGuideCheckout(sql, data.token, data.guide, null);
      return checkout.paid
        ? { ok: true as const, paid: true as const, url: guideDownloadUrl(data.guide, data.token) }
        : { ok: true as const, paid: false as const, url: checkout.url };
    } catch (error) {
      console.error("[guias] checkout unavailable", error);
      return { ok: false as const, message: "No pudimos conectar con el pago. Probá de nuevo en unos minutos." };
    }
  });

export const getGuideStatus = createServerFn({ method: "POST" })
  .validator((raw: unknown) => input.parse(raw))
  .handler(async ({ data }) => {
    const { getOrder, guideDownloadUrl } = await import("../../../server/utils/jesus-guias");
    const sql = await (await import("@/lib/db")).getSql();
    const order = await getOrder(sql, data.token, data.guide);
    const paid = order?.status === "paid";
    return { paid, url: paid ? guideDownloadUrl(data.guide, data.token) : null };
  });
