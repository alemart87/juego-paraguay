import { defineEventHandler, getQuery, setHeader } from "h3";
import { PAGE_SIZE, chatEnabled, hashSender, toPublic, type ChatRow } from "../../utils/live-chat";

/**
 * Público y anónimo. Sin `after` devuelve los últimos mensajes; con `after=<id>`
 * solo los nuevos (el juego hace polling cada pocos segundos).
 */
export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  const query = getQuery(event);
  const after = Number(query.after);
  const me = typeof query.session === "string" && query.session ? hashSender(query.session) : "";
  try {
    const sql = await (await import("../../../src/lib/db")).getSql();
    const [enabled, rows, presence] = await Promise.all([
      chatEnabled(sql),
      Number.isInteger(after) && after > 0
        ? sql.query<ChatRow>(
            `SELECT id, body, sender_hash, created_at FROM live_chat_messages
              WHERE hidden=false AND id > $1 ORDER BY id ASC LIMIT $2`,
            [after, PAGE_SIZE],
          )
        : sql.query<ChatRow>(
            `SELECT * FROM (
               SELECT id, body, sender_hash, created_at FROM live_chat_messages
                WHERE hidden=false ORDER BY id DESC LIMIT $1
             ) recent ORDER BY id ASC`,
            [PAGE_SIZE],
          ),
      sql.query<{ people: number; total: number }>(
        `SELECT (SELECT count(DISTINCT sender_hash) FROM live_chat_messages
                  WHERE created_at >= now() - interval '5 minutes')::int people,
                (SELECT count(*) FROM live_chat_messages WHERE hidden=false)::int total`,
      ),
    ]);
    return {
      ok: true,
      enabled,
      messages: rows.map((row) => toPublic(row, me)),
      people: presence[0]?.people ?? 0,
      total: presence[0]?.total ?? 0,
    };
  } catch {
    return { ok: false, enabled: false, messages: [], people: 0, total: 0 };
  }
});
