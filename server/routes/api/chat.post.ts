import { createError, defineEventHandler, readBody } from "h3";
import {
  BURST_LIMIT,
  COOLDOWN_SECONDS,
  chatEnabled,
  cleanMessage,
  hashSender,
  toPublic,
  type ChatRow,
} from "../../utils/live-chat";

/** Enviar un chisme. Sin login: solo la sesión anónima del navegador (hasheada). */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ sessionId?: string; body?: string }>(event);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 80)
    throw createError({ statusCode: 400, statusMessage: "Sesión inválida" });
  const text = cleanMessage(body?.body);
  if (text.length < 2)
    throw createError({ statusCode: 400, statusMessage: "Escribí algo antes de enviar." });
  const sender = hashSender(sessionId);
  const sql = await (await import("../../../src/lib/db")).getSql();
  if (!(await chatEnabled(sql)))
    throw createError({ statusCode: 403, statusMessage: "El chat está pausado por ahora." });
  const [recent] = await sql.query<{ last: number; burst: number }>(
    `SELECT count(*) FILTER (WHERE created_at >= now() - make_interval(secs => $2))::int last,
            count(*) FILTER (WHERE created_at >= now() - interval '10 minutes')::int burst
       FROM live_chat_messages WHERE sender_hash=$1`,
    [sender, COOLDOWN_SECONDS],
  );
  if (recent.last > 0)
    throw createError({ statusCode: 429, statusMessage: "Esperá un toque entre mensajes." });
  if (recent.burst >= BURST_LIMIT)
    throw createError({
      statusCode: 429,
      statusMessage: "Muchos chismes seguidos. Volvé en unos minutos.",
    });
  const [row] = await sql.query<ChatRow>(
    `INSERT INTO live_chat_messages (body, sender_hash) VALUES ($1, $2)
     RETURNING id, body, sender_hash, created_at`,
    [text, sender],
  );
  return { ok: true, message: toPublic(row, sender) };
});
