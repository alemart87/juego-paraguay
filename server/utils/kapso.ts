import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cliente de Kapso (proxy del WhatsApp Cloud API).
 * Docs: https://docs.kapso.ai/docs/whatsapp/receive-messages
 *       https://docs.kapso.ai/docs/platform/webhooks/advanced (buffering)
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
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Kapso ${response.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

const messagesPath = (phoneNumberId: string) => `/meta/whatsapp/${GRAPH}/${phoneNumberId}/messages`;

/** Manda un texto por WhatsApp. `to` en formato internacional sin "+" o con él. */
export function sendWhatsAppText(to: string, body: string, phoneNumberId = kapsoPhoneNumberId()) {
  return post(messagesPath(phoneNumberId), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body, preview_url: true },
  });
}

/** Reacciona con un emoji a un mensaje de la persona (el "me gusta" de WhatsApp). */
export function sendReaction(
  to: string,
  messageId: string,
  emoji: string,
  phoneNumberId = kapsoPhoneNumberId(),
) {
  return post(messagesPath(phoneNumberId), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "reaction",
    reaction: { message_id: messageId, emoji },
  });
}

/**
 * Marca como leído (tildes azules) y muestra "escribiendo…". WhatsApp lo
 * mantiene hasta 25 s o hasta que llega la respuesta; hay que renovarlo si
 * pensamos más tiempo.
 */
export function markReadTyping(messageId: string, phoneNumberId = kapsoPhoneNumberId()) {
  return post(messagesPath(phoneNumberId), {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
    typing_indicator: { type: "text" },
  }).catch(() => undefined);
}

/** Baja un adjunto (audio o imagen). Intenta sin credenciales y, si falla, con la API key. */
export async function downloadMedia(url: string, maxBytes = 8 * 1024 * 1024) {
  const attempt = async (withKey: boolean) => {
    const response = await fetch(url, {
      headers: withKey ? { "X-API-Key": kapsoApiKey() } : {},
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`media ${response.status}`);
    const length = Number(response.headers.get("content-length") || 0);
    if (length > maxBytes) throw new Error("media too large");
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error("media too large");
    return { buffer, contentType: response.headers.get("content-type") || "" };
  };
  try {
    return await attempt(false);
  } catch {
    return attempt(true);
  }
}

export type InboundMessage = {
  messageId: string;
  from: string;
  type: string;
  /** Texto escrito (o el contenido que arma Kapso cuando no hay texto). */
  text: string;
  caption: string;
  /** Transcripción de un audio si Kapso la trae. */
  transcript: string;
  mediaUrl: string | null;
  mimeType: string | null;
  /** Si la persona reaccionó a un mensaje nuestro. */
  reaction: { messageId: string; emoji: string } | null;
  contactName: string | null;
  phoneNumberId: string | null;
  timestamp: number;
};

const obj = (value: unknown) =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Extrae un mensaje entrante del payload v2 de Kapso (whatsapp.message.received). */
export function parseInbound(payload: unknown): InboundMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const message = obj(root.message ?? obj(root.data).message);
  if (!Object.keys(message).length) return null;
  const conversation = obj(root.conversation);
  const kapso = obj(message.kapso);
  const from = str(message.from) || str(conversation.phone_number);
  const messageId = str(message.id);
  if (!from || !messageId) return null;
  const type = str(message.type) || "unknown";
  const media = obj(message[type]);
  const mediaData = obj(kapso.media_data);
  const reaction = obj(message.reaction);
  const transcript =
    str(obj(message.transcript).text) || str(obj(kapso.transcript).text) || str(kapso.transcript);
  const caption = str(media.caption) || str(obj(kapso.message_type_data).caption);
  return {
    messageId,
    from: from.replace(/[^\d+]/g, ""),
    type,
    text: (type === "text" ? str(obj(message.text).body) : "").trim(),
    caption: caption.trim(),
    transcript: transcript.trim(),
    mediaUrl: str(kapso.media_url) || str(mediaData.url) || null,
    mimeType: str(media.mime_type) || str(mediaData.content_type) || null,
    reaction:
      type === "reaction" && str(reaction.message_id)
        ? { messageId: str(reaction.message_id), emoji: str(reaction.emoji) }
        : null,
    contactName: str(conversation.contact_name) || null,
    phoneNumberId: str(root.phone_number_id) || str(conversation.phone_number_id) || null,
    timestamp: Number(message.timestamp) || 0,
  };
}

/**
 * Una entrega del webhook puede traer un mensaje o, con buffering, un lote
 * `{ batch: true, data: [...] }` con la ráfaga de una conversación.
 */
export function parseDelivery(payload: unknown, batchHeader = false): InboundMessage[] {
  const root = obj(payload);
  const items =
    batchHeader || root.batch === true || Array.isArray(root.data)
      ? Array.isArray(root.data)
        ? root.data
        : []
      : [payload];
  return items
    .map((item) => parseInbound(item))
    .filter((item): item is InboundMessage => item !== null)
    .sort((a, b) => a.timestamp - b.timestamp);
}
