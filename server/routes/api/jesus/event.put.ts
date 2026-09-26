import { createHmac } from "node:crypto";
import { defineEventHandler, readBody, setResponseStatus } from "h3";

/** Marca en la conversación si compartió la tarjeta o abrió el aporte. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    sessionId?: string;
    id?: number;
    shared?: boolean;
    support?: boolean;
  }>(event);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const id = Number(body?.id);
  if (!sessionId || sessionId.length > 80 || !Number.isInteger(id) || id <= 0) {
    setResponseStatus(event, 400);
    return { ok: false };
  }
  const secret = process.env.LEADERBOARD_SECRET?.trim() || "local-analytics";
  const hash = createHmac("sha256", secret).update(sessionId).digest("hex");
  const sql = await (await import("../../../../src/lib/db")).getSql();
  await sql.query(
    `UPDATE jesus_events
        SET shared = shared OR $3, support = support OR $4
      WHERE id = $1 AND session_hash = $2`,
    [id, hash, Boolean(body?.shared), Boolean(body?.support)],
  );
  return { ok: true };
});
