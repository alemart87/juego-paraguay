import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cliente mínimo de Kapso (proxy del WhatsApp Cloud API).
 * Docs: https://docs.kapso.ai/docs/whatsapp/receive-messages
 */
const BASE = (process.env.KAPSO_API_BASE_URL?.trim() || "https://api.kapso.ai").replace(/\/$/, "");

const GRAPH = process.env.META_GRAPH_VERSION?.trim() || "v24.0";

export const kapsoApiKey = () => process.env.KAPSO_API_KEY?.trim() || "";
/** Número de Jesús te ama en Kapso (id del phone number de Meta). */
export const kapsoPhoneNumberId = () =>
  process.env.KAPSO_PHONE_NUMBER_ID?.trim() || "1121668997686035";

/**
 * Secreto del webhook. Si no hay uno explícito se deriva de la API key, así
 * el registro (hecho desde acá) y la verificación (en producción) coinciden
 * sin una variable de entorno extra.
 */
export function kapsoWebhookSecret() {
  const explicit = process.env.KAPSO_WEBHOOK_SECRET?.trim();
  if (explicit) return explicit;
  const key = kapsoApiKey();
  if (!key) return "";
  return createHmac("sha256", key).update("kapso-webhook-secret-v1").digest("hex");
}

export function verifyKapsoSignature(rawBody: string, signature: string | undefined) {
  const secret = kapsoWebhookSecret();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function post(path: string, body: unknown) {
  const key = kapsoApiKey();
  if (!key) throw new Error("KAPSO_API_KEY is missing");
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-API-Key": key },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Kapso ${response.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/** Manda un texto por WhatsApp. `to` en formato internacional sin "+" o con él. */
export function sendWhatsAppText(to: string, body: string, phoneNumberId = kapsoPhoneNumberId()) {
  return post(`/meta/whatsapp/${GRAPH}/${phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body, preview_url: true },
  });
}

/** Marca como leído y muestra "escribiendo…" mientras pensamos la respuesta. */
export function markReadTyping(messageId: string, phoneNumberId = kapsoPhoneNumberId()) {
  return post(`/meta/whatsapp/${GRAPH}/${phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
    typing_indicator: { type: "text" },
  }).catch(() => undefined);
}

export type InboundText = {
  messageId: string;
  from: string;
  text: string;
  type: string;
  contactName: string | null;
  phoneNumberId: string | null;
};

/** Extrae un mensaje entrante del payload v2 de Kapso (whatsapp.message.received). */
export function parseInbound(payload: unknown): InboundText | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const message = (root.message ?? (root.data as Record<string, unknown> | undefined)?.message) as
    | Record<string, unknown>
    | undefined;
  if (!message || typeof message !== "object") return null;
  const conversation = (root.conversation ?? {}) as Record<string, unknown>;
  const kapso = (message.kapso ?? {}) as Record<string, unknown>;
  const from =
    (typeof message.from === "string" && message.from) ||
    (typeof conversation.phone_number === "string" && conversation.phone_number) ||
    "";
  const messageId = typeof message.id === "string" ? message.id : "";
  if (!from || !messageId) return null;
  const type = typeof message.type === "string" ? message.type : "unknown";
  const textObject = (message.text ?? {}) as Record<string, unknown>;
  const text =
    (typeof textObject.body === "string" && textObject.body) ||
    (typeof kapso.content === "string" && kapso.content) ||
    "";
  return {
    messageId,
    from: from.replace(/[^\d+]/g, ""),
    text: text.trim(),
    type,
    contactName: typeof conversation.contact_name === "string" ? conversation.contact_name : null,
    phoneNumberId:
      typeof root.phone_number_id === "string"
        ? root.phone_number_id
        : typeof conversation.phone_number_id === "string"
          ? conversation.phone_number_id
          : null,
  };
}
