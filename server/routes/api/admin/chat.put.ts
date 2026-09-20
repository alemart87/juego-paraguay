import { createError, defineEventHandler, readBody } from "h3";
import { isAdmin } from "../../../utils/admin-auth";
import { LIVE_CHAT_KEY } from "../../../utils/live-chat";

type Action =
  | { action: "toggle"; enabled: boolean }
  | { action: "hide" | "restore"; id: number }
  | { action: "hide_all" };

/** Moderación del superadmin: pausar el chat, ocultar o restaurar mensajes. */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const body = await readBody<Partial<Action>>(event);
  const sql = await (await import("../../../../src/lib/db")).getSql();
  if (body?.action === "toggle") {
    const enabled = Boolean((body as { enabled?: unknown }).enabled);
    await sql.query(
      `INSERT INTO game_settings (key, value, enabled, updated_at) VALUES ($1, '', $2, now())
       ON CONFLICT (key) DO UPDATE SET enabled=EXCLUDED.enabled, updated_at=now()`,
      [LIVE_CHAT_KEY, enabled],
    );
    return { ok: true, enabled };
  }
  if (body?.action === "hide" || body?.action === "restore") {
    const id = Number((body as { id?: unknown }).id);
    if (!Number.isInteger(id) || id <= 0)
      throw createError({ statusCode: 400, statusMessage: "Mensaje inválido" });
    const hidden = body.action === "hide";
    await sql.query("UPDATE live_chat_messages SET hidden=$2 WHERE id=$1", [id, hidden]);
    return { ok: true, id, hidden };
  }
  if (body?.action === "hide_all") {
    await sql.query("UPDATE live_chat_messages SET hidden=true WHERE hidden=false");
    return { ok: true };
  }
  throw createError({ statusCode: 400, statusMessage: "Acción desconocida" });
});
