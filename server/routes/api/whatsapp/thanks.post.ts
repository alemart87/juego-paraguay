import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { sendWhatsAppText } from "../../../utils/kapso";
import { thanksText } from "../../../utils/jesus-agent";

/**
 * La web avisa que alguien que vino de WhatsApp terminó su aporte en Whop.
 * El token viene del link que mandó Jesús; a lo sumo un gracias por hora.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string; amount?: number }>(event);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const amount = Math.floor(Number(body?.amount) || 0);
  if (!/^[a-f0-9]{24,64}$/.test(token) || amount < 1) {
    setResponseStatus(event, 400);
    return { ok: false };
  }
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const rows = await sql.query<{ phone: string; contact_name: string | null; thanked_at: string | null }>(
    "SELECT phone, contact_name, thanked_at FROM jesus_wa_threads WHERE support_token = $1",
    [token],
  );
  const thread = rows[0];
  if (!thread) return { ok: true, ignored: "token" };
  if (thread.thanked_at && Date.now() - new Date(thread.thanked_at).getTime() < 3_600_000)
    return { ok: true, ignored: "recent" };
  await sql.query(
    "UPDATE jesus_wa_threads SET donated_at = now(), thanked_at = now() WHERE phone = $1",
    [thread.phone],
  );
  const text = thanksText(amount, thread.contact_name);
  try {
    await sendWhatsAppText(thread.phone, text);
    await sql.query(
      "INSERT INTO jesus_wa_messages (phone, role, content) VALUES ($1, 'assistant', $2)",
      [thread.phone, text],
    );
    return { ok: true, sent: true };
  } catch (error) {
    // Fuera de la ventana de 24 h de WhatsApp: queda registrado el aporte igual.
    console.error("[kapso] thanks failed", error);
    return { ok: true, sent: false };
  }
});
