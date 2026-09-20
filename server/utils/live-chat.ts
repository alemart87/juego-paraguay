import { createHmac } from "node:crypto";

export const LIVE_CHAT_KEY = "live_chat";
export const MAX_MESSAGE_LENGTH = 240;
export const PAGE_SIZE = 60;
/** Segundos mínimos entre mensajes de la misma sesión anónima. */
export const COOLDOWN_SECONDS = 3;
/** Tope de mensajes por sesión en 10 minutos. */
export const BURST_LIMIT = 40;

/** Mismo HMAC que game_analytics_events: la sesión nunca se guarda en claro. */
export const hashSender = (sessionId: string) =>
  createHmac("sha256", process.env.LEADERBOARD_SECRET?.trim() || "local-analytics")
    .update(sessionId)
    .digest("hex");

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** Normaliza el texto: sin links, sin caracteres de control, espacios colapsados. */
export function cleanMessage(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(CONTROL_CHARS, "")
    .replace(URL_PATTERN, "[link]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

export type ChatRow = { id: number; body: string; sender_hash: string; created_at: string };
export const toPublic = (row: ChatRow, me: string) => ({
  id: Number(row.id),
  body: row.body,
  at: row.created_at,
  tag: row.sender_hash.slice(0, 6),
  mine: row.sender_hash === me,
});

type Sql = { query: <T>(query: string, params?: unknown[]) => Promise<T[]> };
export async function chatEnabled(sql: Sql) {
  const rows = await sql.query<{ enabled: boolean }>(
    "SELECT enabled FROM game_settings WHERE key=$1 LIMIT 1",
    [LIVE_CHAT_KEY],
  );
  return rows.length ? Boolean(rows[0].enabled) : true;
}
