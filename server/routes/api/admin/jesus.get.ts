import { createError, defineEventHandler, setHeader } from "h3";
import { isAdmin } from "../../../utils/admin-auth";

/** Telemetría de "Jesús te ama": cuántas conversaciones, de qué temas, y qué pasó después. */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  setHeader(event, "cache-control", "no-store");
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const [summary, topics, options, days, donations, whatsapp] = await Promise.all([
    sql.query<{
      total: number;
      today: number;
      week: number;
      people: number;
      wrote: number;
      shared: number;
      support: number;
      avg_lights: number;
    }>(
      `SELECT count(*)::int total,
              count(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int today,
              count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int week,
              count(DISTINCT session_hash)::int people,
              count(*) FILTER (WHERE wrote)::int wrote,
              count(*) FILTER (WHERE shared)::int shared,
              count(*) FILTER (WHERE support)::int support,
              COALESCE(round(avg(lights)), 0)::int avg_lights
         FROM jesus_events`,
    ),
    sql.query<{ topic: string; n: number; people: number }>(
      `SELECT topic, count(*)::int n, count(DISTINCT session_hash)::int people
         FROM jesus_events GROUP BY topic ORDER BY n DESC`,
    ),
    sql.query<{ topic: string; option: string; n: number }>(
      `SELECT topic, option, count(*)::int n
         FROM jesus_events GROUP BY topic, option ORDER BY n DESC LIMIT 12`,
    ),
    sql.query<{ label: string; n: number; people: number }>(
      `SELECT to_char(date_trunc('day', created_at), 'DD/MM') label,
              count(*)::int n, count(DISTINCT session_hash)::int people
         FROM jesus_events WHERE created_at >= now() - interval '14 days'
        GROUP BY date_trunc('day', created_at) ORDER BY date_trunc('day', created_at)`,
    ),
    sql.query<{ n: number; total: string }>(
      `SELECT count(*)::int n, COALESCE(sum(amount), 0)::text total
         FROM whop_purchases WHERE game_sku = 'jesus-aporte' AND status = 'paid'`,
    ),
    sql.query<{ threads: number; today: number; messages: number; nudged: number }>(
      `SELECT (SELECT count(*) FROM jesus_wa_threads)::int threads,
              (SELECT count(*) FROM jesus_wa_messages WHERE role='user'
                 AND created_at >= date_trunc('day', now()))::int today,
              (SELECT count(*) FROM jesus_wa_messages WHERE role='user')::int messages,
              (SELECT count(*) FROM jesus_wa_threads WHERE nudged_at IS NOT NULL)::int nudged`,
    ),
  ]);
  return {
    ok: true,
    summary: summary[0],
    topics,
    options,
    days,
    donations: { count: donations[0]?.n ?? 0, total: Number(donations[0]?.total ?? 0) },
    whatsapp: whatsapp[0],
  };
});
