import { defineEventHandler, setHeader } from "h3";
import { QUICK_START_KEY, parseQuickStart } from "../../utils/quick-start";

/** Público: el juego lo consulta al abrir para saltar intros e ir directo a jugar. */
export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  try {
    const sql = await (await import("../../../src/lib/db")).getSql();
    const rows = await sql.query<{ value: string; enabled: boolean }>(
      "SELECT value, enabled FROM game_settings WHERE key=$1 LIMIT 1",
      [QUICK_START_KEY],
    );
    const parsed = parseQuickStart(rows[0]?.value ?? "");
    return {
      ok: true,
      enabled: Boolean(rows[0]?.enabled && parsed),
      level: parsed?.level ?? 1,
      fighter: parsed?.fighter ?? "",
    };
  } catch {
    return { ok: true, enabled: false, level: 1, fighter: "" };
  }
});
