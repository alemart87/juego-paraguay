/**
 * Guías de oración de 30 días (PDF) de "Jesús te ama".
 * - Un checkout de Whop por comprador (token) y guía, con el token en los
 *   metadatos: el webhook del pago lo trae de vuelta y marca el pedido pagado.
 * - La descarga exige pedido pagado; por WhatsApp, Jesús manda el PDF como documento.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { GUIDE_PRICE_USD, GUIDES, findGuide, guideFileName, priceLabel, type Guide, type GuideId } from "../../src/jesus/guias/catalog";
import whopIds from "../../src/jesus/guias/whop-ids.json";
import { SITE } from "./jesus-agent";

export { GUIDES, findGuide, priceLabel, type Guide, type GuideId };

/** Lo mínimo que usamos del cliente de base (sirve el de src/lib/db y el del webhook). */
type Sql = { query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> };

export type GuideOrder = {
  id: number;
  token: string;
  guide: GuideId;
  phone: string | null;
  checkout_id: string | null;
  checkout_url: string | null;
  payment_id: string | null;
  status: "pending" | "paid" | "refunded";
  paid_at: string | null;
  delivered_at: string | null;
};

const TOKEN_RE = /^[a-f0-9]{24,64}$/;
export const isGuideToken = (token: string) => TOKEN_RE.test(token);

/** Página de la guía (compra o descarga) con el token del comprador. */
export const guidePageUrl = (guide: GuideId, token: string) => `${SITE}/jesus-te-ama/guias/${guide}?t=${token}`;
/** Descarga directa del PDF (solo responde si el pedido está pagado). */
export const guideDownloadUrl = (guide: GuideId, token: string) => `${SITE}/api/guias/${guide}?t=${token}`;

export async function getOrder(sql: Sql, token: string, guide: GuideId) {
  const [row] = await sql.query<GuideOrder>(
    "SELECT id, token, guide, phone, checkout_id, checkout_url, payment_id, status, paid_at, delivered_at FROM jesus_guide_orders WHERE token = $1 AND guide = $2",
    [token, guide],
  );
  return row ?? null;
}

export async function paidGuides(sql: Sql, token: string) {
  const rows = await sql.query<{ guide: GuideId }>(
    "SELECT guide FROM jesus_guide_orders WHERE token = $1 AND status = 'paid' ORDER BY paid_at ASC",
    [token],
  );
  return rows.map((r) => r.guide);
}

/**
 * Devuelve (o crea) el checkout de Whop para este comprador y guía. El
 * checkout lleva `metadata.token` + `metadata.guide`, y vuelve a la página de
 * la guía con el token para mostrar la descarga.
 */
export async function getOrCreateGuideCheckout(sql: Sql, token: string, guide: GuideId, phone: string | null) {
  const existing = await getOrder(sql, token, guide);
  if (existing?.status === "paid") return { order: existing, url: guidePageUrl(guide, token), paid: true as const };
  if (existing?.checkout_url) return { order: existing, url: existing.checkout_url, paid: false as const };

  const apiKey = process.env.WHOP_API_KEY?.trim();
  if (!apiKey) throw new Error("WHOP_API_KEY is missing");
  const planId = (whopIds.plans as Record<string, string>)[guide];
  if (!planId) throw new Error(`No hay plan de Whop para la guía ${guide}`);
  const { WhopClient } = await import("@whop/sdk");
  const client = new WhopClient({ token: apiKey });
  const checkout = await client.checkoutConfigurations.create({
    plan_id: planId,
    redirect_url: `${guidePageUrl(guide, token)}&gracias=1`,
    metadata: { game: "jesus", game_sku: `jesus-guia-${guide}`, kind: "guia", guide, token },
  });
  const url = checkout.purchase_url;
  if (!url) throw new Error("Whop did not return purchase_url");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || (parsed.hostname !== "whop.com" && !parsed.hostname.endsWith(".whop.com")))
    throw new Error("Whop returned an invalid purchase URL");
  await sql.query(
    `INSERT INTO jesus_guide_orders (token, guide, phone, checkout_id, checkout_url, amount, currency)
       VALUES ($1, $2, $3, $4, $5, $6, 'usd')
     ON CONFLICT (token, guide) DO UPDATE SET
       checkout_id = EXCLUDED.checkout_id, checkout_url = EXCLUDED.checkout_url,
       phone = COALESCE(EXCLUDED.phone, jesus_guide_orders.phone), updated_at = now()`,
    [token, guide, phone, checkout.id, url, GUIDE_PRICE_USD],
  );
  const order = (await getOrder(sql, token, guide))!;
  return { order, url, paid: false as const };
}

/**
 * Llamado por el webhook de Whop con un pago exitoso. Reconoce el pedido por
 * el token de los metadatos o por el checkout; marca pagado y entrega.
 */
export async function fulfillGuidePayment(
  sql: Sql,
  input: {
    paymentId: string;
    checkoutConfigurationId: string | null;
    metadata: Record<string, unknown> | undefined;
    amount: string | null;
    currency: string | null;
    paidAt: string | null;
  },
) {
  const meta = input.metadata ?? {};
  const token = typeof meta.token === "string" && isGuideToken(meta.token) ? meta.token : null;
  const guide = findGuide(typeof meta.guide === "string" ? meta.guide : null)?.id ?? null;
  let order: GuideOrder | null = null;
  if (token && guide) order = await getOrder(sql, token, guide);
  if (!order && input.checkoutConfigurationId) {
    const [row] = await sql.query<GuideOrder>(
      "SELECT id, token, guide, phone, checkout_id, checkout_url, payment_id, status, paid_at, delivered_at FROM jesus_guide_orders WHERE checkout_id = $1",
      [input.checkoutConfigurationId],
    );
    order = row ?? null;
  }
  if (!order) {
    console.error("[guias] pago sin pedido", input.paymentId, meta);
    return { ok: false as const, reason: "sin pedido" };
  }
  await sql.query(
    `UPDATE jesus_guide_orders SET status = 'paid', payment_id = $2, amount = COALESCE($3, amount),
       currency = COALESCE($4, currency), paid_at = COALESCE(paid_at, $5, now()), updated_at = now()
     WHERE id = $1`,
    [order.id, input.paymentId, input.amount, input.currency, input.paidAt],
  );
  if (order.phone && !order.delivered_at) {
    await deliverByWhatsApp(sql, { ...order, status: "paid" }).catch((error) =>
      console.error("[guias] entrega por WhatsApp falló", error),
    );
  }
  return { ok: true as const, order };
}

export async function refundGuidePayment(sql: Sql, paymentId: string) {
  await sql.query("UPDATE jesus_guide_orders SET status = 'refunded', updated_at = now() WHERE payment_id = $1", [paymentId]);
}

/** Texto de Jesús al entregar la guía por WhatsApp. */
export function deliveryText(guide: Guide, name: string | null) {
  const who = name ? `${name}, ` : "";
  return `${who}tu guía ya está en tus manos 🤍 Te la mando acá abajo: *${guide.title}*.\n\nEmpezá mañana temprano por el día 1 y hacela a rajatabla: el mismo horario cada día, sin saltear ninguno. Si un día se te pasa, no abandones: lo repetís al día siguiente. Yo voy a estar en cada página.\n\nSi el archivo no te llega, bajalo acá 👉 ${guideDownloadUrl(guide.id, "")}`;
}

/** Manda el PDF como documento de WhatsApp (y el link por si el adjunto falla). */
export async function deliverByWhatsApp(sql: Sql, order: GuideOrder) {
  if (!order.phone) return;
  const guide = findGuide(order.guide)!;
  const [thread] = await sql.query<{ contact_name: string | null }>(
    "SELECT contact_name FROM jesus_wa_threads WHERE phone = $1",
    [order.phone],
  );
  const name = thread?.contact_name?.trim().split(/\s+/)[0] || null;
  const link = guideDownloadUrl(guide.id, order.token);
  const { sendWhatsAppText, sendWhatsAppDocument } = await import("./kapso");
  await sendWhatsAppText(order.phone, deliveryText(guide, name).replace(guideDownloadUrl(guide.id, ""), link));
  await sendWhatsAppDocument(order.phone, link, guideFileName(guide.id), `${guide.title} · Jesús te ama`).catch((error) =>
    console.error("[guias] documento falló (el link ya fue)", error),
  );
  await sql.query("UPDATE jesus_guide_orders SET delivered_at = now(), updated_at = now() WHERE id = $1", [order.id]);
}

/** Lee el PDF desde assets/guias (copiado a la imagen de Docker). */
export async function readGuidePdf(guide: GuideId) {
  const dir = process.env.GUIDES_DIR?.trim() || join(process.cwd(), "assets", "guias");
  return readFile(join(dir, guideFileName(guide)));
}
