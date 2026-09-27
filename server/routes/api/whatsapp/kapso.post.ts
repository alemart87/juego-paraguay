import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import {
  markReadTyping,
  parseInbound,
  sendWhatsAppText,
  verifyKapsoSignature,
} from "../../../utils/kapso";
import {
  DEFLECT_REPLY,
  DISCLOSURE,
  FALLBACK_REPLY,
  LIMIT_REPLY,
  NOT_TEXT_REPLY,
  NUDGE_AFTER_USER_MESSAGES,
  OPT_OUT_REPLY,
  askJesus,
  guardReply,
  isOptOut,
  looksLikeJailbreak,
  nudgeText,
  type ChatTurn,
} from "../../../utils/jesus-agent";
import { kapsoStatus, note, payloadShape } from "../../../utils/kapso-status";

/** Tope de mensajes de una persona por día (cuida el costo de OpenAI). */
const DAILY_LIMIT = 40;
/** Cuántos mensajes de contexto recibe el modelo: los últimos 20 de cada lado. */
const CONTEXT_TURNS = 40;

/**
 * Webhook de Kapso: cada WhatsApp entrante al número de "Jesús te ama" se
 * responde con el agente. Firma HMAC obligatoria, idempotente por id de mensaje.
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
  const inbound = parseInbound(payload);
  if (!inbound) {
    note({ lastResult: "sin mensaje reconocible", lastPayloadKeys: payloadShape(payload) });
    return { ok: true, ignored: "no message" };
  }
  note({ lastPayloadKeys: payloadShape(payload) });

  const sql = await (await import("../../../../src/lib/db")).getSql();
  const phone = inbound.from;
  await sql.query(
    `INSERT INTO jesus_wa_threads (phone, contact_name, last_user_at)
     VALUES ($1, $2, now())
     ON CONFLICT (phone) DO UPDATE SET
       contact_name = COALESCE(EXCLUDED.contact_name, jesus_wa_threads.contact_name),
       last_user_at = now()`,
    [phone, inbound.contactName],
  );
  const userText =
    inbound.type === "text" && inbound.text
      ? inbound.text
      : `[mensaje de tipo ${inbound.type} que no puedo leer]`;
  const inserted = await sql.query<{ id: number }>(
    `INSERT INTO jesus_wa_messages (phone, role, content, wa_message_id)
     VALUES ($1, 'user', $2, $3) ON CONFLICT (wa_message_id) DO NOTHING RETURNING id`,
    [phone, userText.slice(0, 4000), inbound.messageId],
  );
  if (!inserted.length) return { ok: true, duplicate: true };
  await sql.query("DELETE FROM jesus_wa_messages WHERE phone = $1 AND created_at < now() - interval '30 days'", [phone]);

  const [thread] = await sql.query<{
    user_messages: number;
    opted_out: boolean;
    nudged_at: string | null;
    contact_name: string | null;
  }>(
    `UPDATE jesus_wa_threads SET user_messages = user_messages + 1 WHERE phone = $1
     RETURNING user_messages, opted_out, nudged_at, contact_name`,
    [phone],
  );

  const reply = async (text: string, meta: Record<string, unknown> = {}) => {
    try {
      await sendWhatsAppText(phone, text);
      await sql.query(
        "INSERT INTO jesus_wa_messages (phone, role, content) VALUES ($1, 'assistant', $2)",
        [phone, text],
      );
      await sql.query(
        "UPDATE jesus_wa_threads SET assistant_messages = assistant_messages + 1 WHERE phone = $1",
        [phone],
      );
    } catch (error) {
      console.error("[kapso] send failed", error);
      status.sendFailures++;
      note({ lastResult: "envío falló", lastError: String(error).slice(0, 300) });
      return { ok: false, sent: false, ...meta };
    }
    status.replied++;
    note({ lastResult: `respondido (${Object.keys(meta).filter((k) => meta[k]).join(",") || "normal"})`, lastError: null });
    return { ok: true, sent: true, ...meta };
  };

  // Baja
  if (isOptOut(userText)) {
    await sql.query("UPDATE jesus_wa_threads SET opted_out = true WHERE phone = $1", [phone]);
    return reply(OPT_OUT_REPLY, { optOut: true });
  }
  if (thread.opted_out) {
    await sql.query("UPDATE jesus_wa_threads SET opted_out = false WHERE phone = $1", [phone]);
  }

  // Tope diario
  const [today] = await sql.query<{ n: number }>(
    `SELECT count(*)::int n FROM jesus_wa_messages
      WHERE phone = $1 AND role = 'user' AND created_at >= now() - interval '1 day'`,
    [phone],
  );
  if (today.n > DAILY_LIMIT) return { ok: true, limited: true };
  if (today.n === DAILY_LIMIT) return reply(LIMIT_REPLY, { limited: true });

  void markReadTyping(inbound.messageId);

  const rows = await sql.query<{ role: "user" | "assistant"; content: string }>(
    `SELECT role, content FROM (
       SELECT role, content, created_at FROM jesus_wa_messages
        WHERE phone = $1 ORDER BY created_at DESC LIMIT $2
     ) recent ORDER BY created_at ASC`,
    [phone, CONTEXT_TURNS],
  );
  const history: ChatTurn[] = rows.map((row) => ({ role: row.role, content: row.content }));

  let text: string;
  let flagged = false;
  if (inbound.type !== "text" || !inbound.text) {
    // Audio, foto o sticker: no gastamos modelo; respuesta fija en su voz.
    text = NOT_TEXT_REPLY;
  } else if (looksLikeJailbreak(userText)) {
    // No gastamos modelo ni le damos la chance: respuesta fija en su voz.
    flagged = true;
    text = DEFLECT_REPLY;
  } else {
    try {
      text = guardReply(await askJesus(history, thread.contact_name));
    } catch (error) {
      console.error("[jesus-agent] failed", error);
      note({ lastError: `agente: ${String(error).slice(0, 300)}` });
      text = FALLBACK_REPLY;
    }
  }
  const firstReply = Number(thread.user_messages) === 1;
  if (firstReply) text = `${text}\n\n${DISCLOSURE}`;

  const nudgedRecently =
    thread.nudged_at && Date.now() - new Date(thread.nudged_at).getTime() < 7 * 86_400_000;
  let nudged = false;
  if (Number(thread.user_messages) >= NUDGE_AFTER_USER_MESSAGES && !nudgedRecently) {
    text = `${text}\n\n${nudgeText()}`;
    nudged = true;
    await sql.query("UPDATE jesus_wa_threads SET nudged_at = now() WHERE phone = $1", [phone]);
  }
  return reply(text, { nudged, firstReply, flagged });
});
