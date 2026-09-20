import { createHmac } from "node:crypto";
import { defineEventHandler, readBody, setResponseStatus } from "h3";

const types = new Set(["page_view", "game_start", "game_win", "game_loss", "premium_trial"]);
const heroes = new Set([
  "masivo",
  "onichan",
  "anatomic",
  "comadre",
  "papu",
  "secre",
  "pablito",
  "marito",
  "rose",
]);
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    sessionId?: string;
    event?: string;
    level?: number;
    hero?: string;
  }>(event);
  if (!body?.sessionId || body.sessionId.length > 80 || !body.event || !types.has(body.event)) {
    setResponseStatus(event, 400);
    return { ok: false };
  }
  const secret = process.env.LEADERBOARD_SECRET?.trim() || "local-analytics";
  const hash = createHmac("sha256", secret).update(body.sessionId).digest("hex");
  const level =
    Number.isInteger(body.level) && Number(body.level) >= 1 && Number(body.level) <= 5
      ? body.level
      : null;
  const hero = body.hero && heroes.has(body.hero) ? body.hero : null;
  const sql = await (await import("../../../src/lib/db")).getSql();
  await sql.query(
    `INSERT INTO game_analytics_events (session_hash,event_type,level,hero) VALUES ($1,$2,$3,$4)`,
    [hash, body.event, level, hero],
  );
  return { ok: true };
});
