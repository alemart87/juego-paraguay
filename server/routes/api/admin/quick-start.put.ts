import { createError, defineEventHandler, readBody } from "h3";
import { isAdmin } from "../../../utils/admin-auth";
import {
  QUICK_START_KEY,
  isEpisodeId,
  isQuickStartFighter,
  type QuickStart,
} from "../../../utils/quick-start";

/** Superadmin: "Omitir intros y seleccionar juego". */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const body = await readBody<{ level?: unknown; fighter?: unknown; enabled?: unknown }>(event);
  const enabled = Boolean(body?.enabled);
  const level = Number(body?.level);
  if (!isEpisodeId(level))
    throw createError({ statusCode: 400, statusMessage: "Elegí un episodio válido (1 a 5)." });
  const rawFighter = typeof body?.fighter === "string" ? body.fighter.trim() : "";
  if (rawFighter && !isQuickStartFighter(rawFighter))
    throw createError({
      statusCode: 400,
      statusMessage: "Ese personaje no puede ser el predeterminado (elegí uno no premium).",
    });
  const value: QuickStart = { level, fighter: rawFighter as QuickStart["fighter"] };

  const sql = await (await import("../../../../src/lib/db")).getSql();
  await sql.query(
    `INSERT INTO game_settings (key, value, enabled, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (key) DO UPDATE
       SET value=EXCLUDED.value, enabled=EXCLUDED.enabled, updated_at=now()`,
    [QUICK_START_KEY, JSON.stringify(value), enabled],
  );
  return { ok: true, enabled, level: value.level, fighter: value.fighter };
});
