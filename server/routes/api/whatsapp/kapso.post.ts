import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import {
  downloadMedia,
  markReadTyping,
  parseDelivery,
  sendReaction,
  sendWhatsAppText,
  verifyKapsoSignature,
  type InboundMessage,
} from "../../../utils/kapso";
import {
  ASK_SUPPORT_REPLY,
  DEFLECT_REPLY,
  DISCLOSURE,
  FALLBACK_REPLY,
  LIMIT_REPLY,
  NUDGE_AFTER_USER_MESSAGES,
  NUDGE_EVERY_DAYS,
  OPT_OUT_REPLY,
  askJesus,
  isOptOut,
  isSupportRequest,
  looksLikeJailbreak,
  nudgeText,
  transcribeAudio,
  typingDelayMs,
  type BurstItem,
  type ChatTurn,
} from "../../../utils/jesus-agent";
import { kapsoStatus, note, payloadShape } from "../../../utils/kapso-status";

/** Tope de mensajes de una persona por día (cuida el costo de OpenAI). */
const DAILY_LIMIT = 60;
/** Mensajes de contexto que recibe el modelo: los últimos 20 de cada lado. */
const CONTEXT_TURNS = 40;
/** Fotos por ráfaga que mira el modelo. */
const MAX_IMAGES = 3;

type Sql = { query: <T>(query: string, params?: unknown[]) => Promise<T[]> };

/** Una cola por persona: una ráfaga nueva espera a que termine la respuesta anterior. */
const queues = (globalThis as typeof globalThis & { __jesusQueues?: Map<string, Promise<void>> })
  .__jesusQueues ?? new Map<string, Promise<void>>();
(globalThis as typeof globalThis & { __jesusQueues?: Map<string, Promise<void>> }).__jesusQueues = queues;

function enqueue(phone: string, job: () => Promise<void>) {
  const previous = queues.get(phone) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(job)
    .catch((error) => {
      console.error("[jesus-wa] burst failed", error);
      note({ lastResult: "ráfaga falló", lastError: String(error).slice(0, 300) });
    })
    .finally(() => {
      if (queues.get(phone) === next) queues.delete(phone);
    });
  queues.set(phone, next);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Webhook de Kapso. Con buffering activo, Kapso junta la ráfaga de cada
 * conversación y la manda en un lote. Respondemos 200 al instante y
 * procesamos en segundo plano, para no chocar con el timeout de 30 s.
 */
export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, "utf8")) ?? "";
  const status = kapsoStatus();
  status.received++;
  const kind = getHeader(event, "x-webhook-event") ?? "";
  note({ lastEvent: kind || "(sin X-Webhook-Event)" });
  if (!verifyKapsoSignature(raw, getHeader(event, "x-webhook-signature"))) {
    status.rejectedSignature++;
    note({
      lastResult: "firma rechazada",
      lastError: process.env.KAPSO_API_KEY?.trim()
        ? "la firma no coincide con el secreto derivado de KAPSO_API_KEY"
        : "KAPSO_API_KEY no está configurada en este servidor",
    });
    setResponseStatus(event, 401);
    return { ok: false, error: "bad signature" };
  }
  status.accepted++;
  if (kind && kind !== "whatsapp.message.received") {
    note({ lastResult: `ignorado: ${kind}` });
    return { ok: true, ignored: kind };
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    setResponseStatus(event, 400);
    return { ok: false, error: "bad json" };
  }
  const messages = parseDelivery(payload, getHeader(event, "x-webhook-batch") === "true");
  note({ lastPayloadKeys: payloadShape(payload) });
  if (!messages.length) {
    note({ lastResult: "sin mensaje reconocible" });
    return { ok: true, ignored: "no message" };
  }
  const byPhone = new Map<string, InboundMessage[]>();
  for (const message of messages) byPhone.set(message.from, [...(byPhone.get(message.from) ?? []), message]);
  for (const [phone, burst] of byPhone) enqueue(phone, () => handleBurst(phone, burst));
  return { ok: true, queued: messages.length, conversations: byPhone.size };
});

/** Convierte un mensaje entrante en texto para el historial y, si es foto, en imagen para el modelo. */
async function toBurstItem(message: InboundMessage, wantImage: boolean): Promise<BurstItem> {
  switch (message.type) {
    case "text":
      return { text: message.text || "(mensaje vacío)" };
    case "audio":
    case "voice": {
      let transcript = message.transcript;
      if (!transcript && message.mediaUrl) {
        try {
          const media = await downloadMedia(message.mediaUrl, 24 * 1024 * 1024);
          transcript = await transcribeAudio(media.buffer, media.contentType || message.mimeType || "audio/ogg");
        } catch (error) {
          console.error("[jesus-wa] audio", error);
        }
      }
      return { text: transcript ? `(audio) ${transcript}` : "(audio que no se pudo escuchar)" };
    }
    case "image": {
      const label = message.caption ? `(foto) ${message.caption}` : "(foto)";
      if (!wantImage || !message.mediaUrl) return { text: label };
      try {
        const media = await downloadMedia(message.mediaUrl, 6 * 1024 * 1024);
        const type = media.contentType.startsWith("image/") ? media.contentType : message.mimeType || "image/jpeg";
        return { text: label, image: `data:${type};base64,${media.buffer.toString("base64")}` };
      } catch (error) {
        console.error("[jesus-wa] image", error);
        return { text: `${label} (no se pudo abrir)` };
      }
    }
    case "sticker":
      return { text: "(sticker)" };
    case "video":
      return { text: message.caption ? `(video) ${message.caption}` : "(video)" };
    case "document":
      return { text: "(documento)" };
    case "location":
      return { text: "(ubicación)" };
    default:
      return { text: `(${message.type})` };
  }
}

async function handleBurst(phone: string, incoming: InboundMessage[]) {
  const status = kapsoStatus();
  const sql = (await (await import("../../../../src/lib/db")).getSql()) as Sql;
  const contactName = incoming.find((m) => m.contactName)?.contactName ?? null;
  await sql.query(
    `INSERT INTO jesus_wa_threads (phone, contact_name, last_user_at)
     VALUES ($1, $2, now())
     ON CONFLICT (phone) DO UPDATE SET
       contact_name = COALESCE(EXCLUDED.contact_name, jesus_wa_threads.contact_name),
       last_user_at = now()`,
    [phone, contactName],
  );

  // Las reacciones de la persona a nuestros mensajes no piden respuesta.
  const reactions = incoming.filter((m) => m.type === "reaction");
  const burstMessages = incoming.filter((m) => m.type !== "reaction");
  for (const r of reactions) {
    await sql.query(
      `INSERT INTO jesus_wa_messages (phone, role, content, wa_message_id)
       VALUES ($1, 'user', $2, $3) ON CONFLICT (wa_message_id) DO NOTHING`,
      [phone, `(reaccionó ${r.reaction?.emoji ?? ""} a un mensaje)`, r.messageId],
    );
  }
  if (!burstMessages.length) {
    note({ lastResult: "reacción recibida" });
    return;
  }

  // "Escribiendo…" enseguida sobre el último mensaje, y renovado mientras pensamos.
  const last = burstMessages[burstMessages.length - 1];
  void markReadTyping(last.messageId);
  const keepTyping = setInterval(() => void markReadTyping(last.messageId), 20_000);

  try {
    // Convertir (transcribir audios, abrir fotos) y guardar solo lo nuevo.
    let imagesLeft = MAX_IMAGES;
    const fresh: { message: InboundMessage; item: BurstItem }[] = [];
    for (const message of burstMessages) {
      const exists = await sql.query<{ id: number }>(
        "SELECT id FROM jesus_wa_messages WHERE wa_message_id = $1",
        [message.messageId],
      );
      if (exists.length) continue;
      const wantImage = message.type === "image" && imagesLeft > 0;
      if (wantImage) imagesLeft--;
      const item = await toBurstItem(message, wantImage);
      const inserted = await sql.query<{ id: number }>(
        `INSERT INTO jesus_wa_messages (phone, role, content, wa_message_id)
         VALUES ($1, 'user', $2, $3) ON CONFLICT (wa_message_id) DO NOTHING RETURNING id`,
        [phone, item.text.slice(0, 4000), message.messageId],
      );
      if (inserted.length) fresh.push({ message, item });
    }
    if (!fresh.length) return;
    await sql.query(
      "DELETE FROM jesus_wa_messages WHERE phone = $1 AND created_at < now() - interval '30 days'",
      [phone],
    );

    const [thread] = await sql.query<{
      user_messages: number;
      opted_out: boolean;
      nudged_at: string | null;
      contact_name: string | null;
      support_token: string | null;
    }>(
      `UPDATE jesus_wa_threads SET user_messages = user_messages + $2 WHERE phone = $1
       RETURNING user_messages, opted_out, nudged_at, contact_name, support_token`,
      [phone, fresh.length],
    );
    const firstReply = Number(thread.user_messages) === fresh.length;

    const supportToken = async () => {
      if (thread.support_token) return thread.support_token;
      const { randomBytes } = await import("node:crypto");
      await sql.query(
        "UPDATE jesus_wa_threads SET support_token = $2 WHERE phone = $1 AND support_token IS NULL",
        [phone, randomBytes(16).toString("hex")],
      );
      const [row] = await sql.query<{ support_token: string }>(
        "SELECT support_token FROM jesus_wa_threads WHERE phone = $1",
        [phone],
      );
      thread.support_token = row.support_token;
      return row.support_token;
    };

    /** Manda una o varias burbujas con "escribiendo…" y pausa humana entre ellas. */
    const send = async (bubbles: string[], meta: string) => {
      for (let i = 0; i < bubbles.length; i++) {
        const text = bubbles[i];
        if (i > 0) {
          void markReadTyping(last.messageId);
          await sleep(typingDelayMs(text));
        }
        try {
          await sendWhatsAppText(phone, text);
        } catch (error) {
          console.error("[kapso] send failed", error);
          status.sendFailures++;
          note({ lastResult: "envío falló", lastError: String(error).slice(0, 300) });
          return;
        }
        await sql.query(
          "INSERT INTO jesus_wa_messages (phone, role, content) VALUES ($1, 'assistant', $2)",
          [phone, text],
        );
        await sql.query(
          "UPDATE jesus_wa_threads SET assistant_messages = assistant_messages + 1 WHERE phone = $1",
          [phone],
        );
      }
      status.replied++;
      note({ lastResult: `respondido (${meta}, ${bubbles.length} burbuja/s, ${fresh.length} mensaje/s)`, lastError: null });
    };

    const texts = fresh.map((f) => f.item.text);
    const plain = fresh.filter((f) => f.message.type === "text").map((f) => f.message.text);

    // Baja
    if (plain.some(isOptOut)) {
      await sql.query("UPDATE jesus_wa_threads SET opted_out = true WHERE phone = $1", [phone]);
      return send([OPT_OUT_REPLY], "baja");
    }
    if (thread.opted_out)
      await sql.query("UPDATE jesus_wa_threads SET opted_out = false WHERE phone = $1", [phone]);

    // "APORTAR": el link al instante, sin pasar por el modelo.
    if (plain.length === fresh.length && plain.every(isSupportRequest)) {
      const token = await supportToken();
      await sql.query("UPDATE jesus_wa_threads SET nudged_at = now() WHERE phone = $1", [phone]);
      return send([ASK_SUPPORT_REPLY(token)], "aporte");
    }

    // Tope diario
    const [today] = await sql.query<{ n: number }>(
      `SELECT count(*)::int n FROM jesus_wa_messages
        WHERE phone = $1 AND role = 'user' AND created_at >= now() - interval '1 day'`,
      [phone],
    );
    if (today.n - fresh.length >= DAILY_LIMIT) return;
    if (today.n >= DAILY_LIMIT) return send([LIMIT_REPLY], "tope");

    // Historial anterior (sin la ráfaga, que va aparte con sus fotos).
    const freshIds = fresh.map((f) => f.message.messageId);
    const rows = await sql.query<{ role: "user" | "assistant"; content: string }>(
      `SELECT role, content FROM (
         SELECT role, content, created_at, id FROM jesus_wa_messages
          WHERE phone = $1 AND (wa_message_id IS NULL OR NOT (wa_message_id = ANY($3::text[])))
          ORDER BY created_at DESC, id DESC LIMIT $2
       ) recent ORDER BY created_at ASC, id ASC`,
      [phone, CONTEXT_TURNS, freshIds],
    );
    const history: ChatTurn[] = rows.map((row) => ({ role: row.role, content: row.content }));

    let bubbles: string[];
    let meta = "normal";
    let reacted: string | null = null;
    if (looksLikeJailbreak(texts.join("\n"))) {
      bubbles = [DEFLECT_REPLY];
      meta = "blindaje";
    } else {
      try {
        const reply = await askJesus(
          history,
          fresh.map((f) => f.item),
          thread.contact_name,
        );
        bubbles = reply.messages;
        if (reply.reaction) {
          reacted = `${reply.reaction.emoji} a [${reply.reaction.index + 1}]`;
          const target = fresh[reply.reaction.index]?.message.messageId;
          if (target)
            await sendReaction(phone, target, reply.reaction.emoji).catch((error) =>
              console.error("[kapso] reaction failed", error),
            );
        }
      } catch (error) {
        console.error("[jesus-agent] failed", error);
        note({ lastError: `agente: ${String(error).slice(0, 300)}` });
        bubbles = [FALLBACK_REPLY];
        meta = "fallback";
      }
    }

    if (firstReply) bubbles[bubbles.length - 1] += `\n\n${DISCLOSURE}`;
    const nudgedRecently =
      thread.nudged_at &&
      Date.now() - new Date(thread.nudged_at).getTime() < NUDGE_EVERY_DAYS * 86_400_000;
    if (Number(thread.user_messages) >= NUDGE_AFTER_USER_MESSAGES && !nudgedRecently) {
      bubbles.push(nudgeText(await supportToken()));
      await sql.query("UPDATE jesus_wa_threads SET nudged_at = now() WHERE phone = $1", [phone]);
      meta += "+aporte";
    }
    note({
      lastGenerated: `${meta} · ${fresh.length} mensaje/s → ${bubbles.length} burbuja/s · reacción ${reacted ?? "no"} · ${new Date().toISOString()}`,
    });
    await send(bubbles, meta);
  } finally {
    clearInterval(keepTyping);
  }
}
