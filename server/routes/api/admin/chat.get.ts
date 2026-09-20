import { createError, defineEventHandler, setHeader } from "h3";
import { isAdmin } from "../../../utils/admin-auth";
import { chatEnabled } from "../../../utils/live-chat";

/** Telemetría del chat para el superadmin: cantidades, ritmo y últimos mensajes. */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  setHeader(event, "cache-control", "no-store");
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const [enabled, summary, days, hours, senders, latest] = await Promise.all([
    chatEnabled(sql),
    sql.query<{
      total: number;
      visible: number;
      hidden: number;
      today: number;
      last_hour: number;
      people: number;
      people_today: number;
      people_live: number;
      avg_length: number;
    }>(
      `SELECT count(*)::int total,
              count(*) FILTER (WHERE hidden=false)::int visible,
              count(*) FILTER (WHERE hidden)::int hidden,
              count(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int today,
              count(*) FILTER (WHERE created_at >= now() - interval '1 hour')::int last_hour,
              count(DISTINCT sender_hash)::int people,
              count(DISTINCT sender_hash) FILTER (WHERE created_at >= date_trunc('day', now()))::int people_today,
              count(DISTINCT sender_hash) FILTER (WHERE created_at >= now() - interval '5 minutes')::int people_live,
              COALESCE(round(avg(length(body))), 0)::int avg_length
         FROM live_chat_messages`,
    ),
    sql.query<{ label: string; messages: number; people: number }>(
      `SELECT to_char(date_trunc('day', created_at), 'DD/MM') label,
              count(*)::int messages, count(DISTINCT sender_hash)::int people
         FROM live_chat_messages WHERE created_at >= now() - interval '7 days'
        GROUP BY date_trunc('day', created_at) ORDER BY date_trunc('day', created_at)`,
    ),
    sql.query<{ label: string; messages: number }>(
      `SELECT to_char(date_trunc('hour', created_at), 'HH24:00') label, count(*)::int messages
         FROM live_chat_messages WHERE created_at >= now() - interval '24 hours'
        GROUP BY date_trunc('hour', created_at) ORDER BY date_trunc('hour', created_at)`,
    ),
    sql.query<{ tag: string; messages: number; last: string }>(
      `SELECT left(sender_hash, 6) tag, count(*)::int messages,
              to_char(max(created_at), 'DD/MM HH24:MI') last
         FROM live_chat_messages GROUP BY sender_hash ORDER BY messages DESC LIMIT 8`,
    ),
    sql.query<{ id: number; body: string; tag: string; hidden: boolean; at: string }>(
      `SELECT id, body, left(sender_hash, 6) tag, hidden,
              to_char(created_at, 'DD/MM HH24:MI') at
         FROM live_chat_messages ORDER BY id DESC LIMIT 60`,
    ),
  ]);
  return {
    ok: true,
    enabled,
    summary: summary[0],
    days,
    hours,
    senders,
    latest: latest.map((row) => ({ ...row, id: Number(row.id) })),
  };
});
