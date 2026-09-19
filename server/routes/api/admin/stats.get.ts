import { createError, defineEventHandler } from "h3";
import { isAdmin } from "../../../utils/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const [summary, levels, heroes, dailyRows, leaders] = await Promise.all([
    sql.query<{
      players: number;
      active_players: number;
      visits: number;
      plays: number;
      wins: number;
      points: number;
      purchases: number;
      revenue: string;
    }>(
      `SELECT
        (SELECT count(*) FROM leaderboard_players)::int players,
        (SELECT count(*) FROM leaderboard_players WHERE games_played > 0)::int active_players,
        (SELECT count(DISTINCT session_hash) FROM game_analytics_events WHERE event_type='page_view')::int visits,
        (SELECT count(*) FROM game_analytics_events WHERE event_type='game_start')::int plays,
        (SELECT count(*) FROM game_analytics_events WHERE event_type='game_win')::int wins,
        (SELECT COALESCE(sum(total_score),0) FROM leaderboard_players)::bigint points,
        (SELECT count(*) FROM whop_purchases WHERE status='paid')::int purchases,
        (SELECT COALESCE(sum(amount),0) FROM whop_purchases WHERE status='paid')::text revenue`,
    ),
    sql.query<{ level: number; plays: number }>(
      `SELECT level, count(*)::int plays FROM game_analytics_events WHERE event_type='game_start' AND level IS NOT NULL GROUP BY level ORDER BY plays DESC`,
    ),
    sql.query<{ hero: string; plays: number }>(
      `SELECT hero, count(*)::int plays FROM game_analytics_events WHERE event_type='game_start' AND hero IS NOT NULL GROUP BY hero ORDER BY plays DESC LIMIT 8`,
    ),
    sql.query<{ label: string; visits: number; plays: number }>(
      `SELECT to_char(date_trunc('day',created_at),'DD/MM') AS label, count(DISTINCT session_hash) FILTER (WHERE event_type='page_view')::int AS visits, count(*) FILTER (WHERE event_type='game_start')::int AS plays FROM game_analytics_events WHERE created_at >= now()-interval '7 days' GROUP BY date_trunc('day',created_at) ORDER BY date_trunc('day',created_at)`,
    ),
    sql.query<{ name: string; score: number; games: number }>(
      `SELECT display_name name,total_score score,games_played games FROM leaderboard_players ORDER BY total_score DESC LIMIT 10`,
    ),
  ]);
  return {
    ok: true,
    summary: summary[0],
    levels,
    heroes,
    days: dailyRows.map((row) => ({ day: row.label, visits: row.visits, plays: row.plays })),
    leaders,
  };
});
