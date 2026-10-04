import { createError, defineEventHandler, getQuery, getRouterParam, setResponseHeader } from "h3";
import { findGuide, getOrder, isGuideToken, readGuidePdf } from "../../../utils/jesus-guias";
import { guideFileName } from "../../../../src/jesus/guias/catalog";

/**
 * Descarga del PDF de una guía: solo con un pedido pagado para ese token.
 * El mismo link lo usa WhatsApp para adjuntar el documento.
 */
export default defineEventHandler(async (event) => {
  const guide = findGuide(getRouterParam(event, "guide") ?? "");
  const token = String(getQuery(event).t ?? "").trim();
  if (!guide || !isGuideToken(token)) throw createError({ statusCode: 404, statusMessage: "No encontrado" });
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const order = await getOrder(sql, token, guide.id);
  if (!order || order.status !== "paid")
    throw createError({ statusCode: 402, statusMessage: "Esta guía todavía no está pagada" });
  let pdf: Buffer;
  try {
    pdf = await readGuidePdf(guide.id);
  } catch {
    throw createError({ statusCode: 503, statusMessage: "La guía se está preparando; probá en unos minutos" });
  }
  await sql.query("UPDATE jesus_guide_orders SET downloads = downloads + 1, updated_at = now() WHERE id = $1", [order.id]);
  setResponseHeader(event, "content-type", "application/pdf");
  setResponseHeader(event, "content-disposition", `attachment; filename="${guideFileName(guide.id)}"`);
  setResponseHeader(event, "cache-control", "private, no-store");
  setResponseHeader(event, "x-content-type-options", "nosniff");
  return pdf;
});
