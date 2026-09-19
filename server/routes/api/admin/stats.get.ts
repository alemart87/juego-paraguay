import { createError, defineEventHandler } from "h3";
import { isAdmin } from "../../../utils/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const [summary, levels, heroes, dailyRows, leaders, players, grants] = await Promise.all([
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
    sql.query<{
      id: number;
      name: string;
      contact_kind: string;
      score: number;
      games: number;
      benefits: string[];
    }>(
      `SELECT p.id, p.display_name name, p.contact_kind,
              p.total_score score, p.games_played games,
              COALESCE(array_agg(DISTINCT benefits.game_sku)
                FILTER (WHERE benefits.game_sku IS NOT NULL), ARRAY[]::varchar[]) benefits
         FROM leaderboard_players p
         LEFT JOIN (
           SELECT player_id, game_sku FROM player_entitlements WHERE status='active'
           UNION ALL
           SELECT player_id, game_sku FROM admin_entitlement_grants
         ) benefits ON benefits.player_id = p.id
        GROUP BY p.id
        ORDER BY p.updated_at DESC
        LIMIT 250`,
    ),
    sql.query<{
      id: number;
      player: string;
      sku: string;
      quantity: number;
      note: string | null;
      granted_at: string;
    }>(
      `SELECT g.id, p.display_name player, g.game_sku sku, g.quantity,
              g.note, to_char(g.granted_at, 'DD/MM/YYYY HH24:MI') granted_at
         FROM admin_entitlement_grants g
         JOIN leaderboard_players p ON p.id = g.player_id
        ORDER BY g.granted_at DESC
        LIMIT 40`,
    ),
  ]);
  return {
    ok: true,
    summary: summary[0],
    levels,
    heroes,
    days: dailyRows.map((row) => ({ day: row.label, visits: row.visits, plays: row.plays })),
    leaders,
    players,
    grants,
  };
});
