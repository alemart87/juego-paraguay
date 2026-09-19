import { defineEventHandler, setResponseStatus } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const { getSql, dbSource } = await import("../../src/lib/db");
    const sql = await getSql();
    await sql.query("SELECT 1 AS ok");
    return { ok: true, service: "influencers-battle", database: dbSource };
  } catch {
    setResponseStatus(event, 503);
    return { ok: false, service: "influencers-battle", database: "unavailable" };
  }
});
