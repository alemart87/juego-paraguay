import { defineEventHandler, setHeader } from "h3";
import { parseTikTokVideo } from "../../utils/tiktok";

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  try {
    const sql = await (await import("../../../src/lib/db")).getSql();
    const rows = await sql.query<{ value: string; enabled: boolean }>(
      "SELECT value, enabled FROM game_settings WHERE key='weekly_chisme_url' LIMIT 1",
    );
    const parsed = parseTikTokVideo(rows[0]?.value ?? "");
    return {
      ok: true,
      enabled: Boolean(rows[0]?.enabled && parsed),
      url: parsed?.url ?? "",
      videoId: parsed?.videoId ?? "",
      embedUrl: parsed?.embedUrl ?? "",
    };
  } catch {
    return { ok: true, enabled: false, url: "", videoId: "", embedUrl: "" };
  }
});
