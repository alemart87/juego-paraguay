import { createHmac } from "node:crypto";
import { defineEventHandler, readBody, setResponseStatus } from "h3";

/**
 * Registra una conversación de "Jesús te ama" al llegar a la bendición.
 * Solo tema, opción, luces y si escribió algo (nunca el texto ni el nombre).
 */
const SLUG = /^[a-z]{2,24}$/;

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    sessionId?: string;
    topic?: string;
    option?: string;
    lights?: number;
    wrote?: boolean;
  }>(event);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic : "";
  const option = typeof body?.option === "string" ? body.option : "";
  if (!sessionId || sessionId.length > 80 || !SLUG.test(topic) || !SLUG.test(option)) {
    setResponseStatus(event, 400);
    return { ok: false };
  }
  const secret = process.env.LEADERBOARD_SECRET?.trim() || "local-analytics";
  const hash = createHmac("sha256", secret).update(sessionId).digest("hex");
  const lights = Math.max(0, Math.min(10000, Math.floor(Number(body?.lights) || 0)));
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const recent = await sql.query<{ n: number }>(
    `SELECT count(*)::int n FROM jesus_events
      WHERE session_hash=$1 AND created_at >= now() - interval '1 day'`,
    [hash],
  );
  if ((recent[0]?.n ?? 0) >= 40) {
    setResponseStatus(event, 429);
    return { ok: false };
  }
  const rows = await sql.query<{ id: number }>(
    `INSERT INTO jesus_events (session_hash, topic, option, lights, wrote)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [hash, topic, option, lights, Boolean(body?.wrote)],
  );
  return { ok: true, id: Number(rows[0]?.id) };
});
