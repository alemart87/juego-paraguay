import { createError, defineEventHandler, readBody } from "h3";
import { isAdmin } from "../../../utils/admin-auth";
import { parseTikTokVideo } from "../../../utils/tiktok";

export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const body = await readBody<{ url?: string; enabled?: boolean }>(event);
  const enabled = Boolean(body?.enabled);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  const parsed = parseTikTokVideo(rawUrl);
  if (enabled && !parsed)
    throw createError({
      statusCode: 400,
      statusMessage: "Pegá el enlace completo del video de TikTok (debe incluir /video/ID).",
    });
  if (rawUrl && !parsed)
    throw createError({ statusCode: 400, statusMessage: "El enlace de TikTok no es válido." });

  const sql = await (await import("../../../../src/lib/db")).getSql();
  await sql.query(
    `INSERT INTO game_settings (key, value, enabled, updated_at)
     VALUES ('weekly_chisme_url', $1, $2, now())
     ON CONFLICT (key) DO UPDATE
       SET value=EXCLUDED.value, enabled=EXCLUDED.enabled, updated_at=now()`,
    [parsed?.url ?? "", enabled && Boolean(parsed)],
  );
  return { ok: true, enabled: enabled && Boolean(parsed), url: parsed?.url ?? "" };
});
