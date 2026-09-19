import { createError, defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { SHOP_SKUS } from "../../../../src/battle/shop-catalog";
import { isAdmin } from "../../../utils/admin-auth";

const input = z.object({
  playerId: z.number().int().positive(),
  sku: z.enum(SHOP_SKUS),
  quantity: z.number().int().min(1).max(9999).default(1),
  note: z.string().trim().max(240).optional(),
});

export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: "Iniciá sesión" });
  const parsed = input.safeParse(await readBody(event));
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: "Datos del premio inválidos" });
  const sql = await (await import("../../../../src/lib/db")).getSql();
  const adminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "superadmin";
  const rows = await sql.query<{ id: number; display_name: string }>(
    `WITH player AS (
       SELECT id, display_name FROM leaderboard_players WHERE id = $1
     ), inserted AS (
       INSERT INTO admin_entitlement_grants
         (player_id, game_sku, quantity, note, granted_by)
       SELECT id, $2, $3, NULLIF($4, ''), $5 FROM player
       RETURNING id, player_id
     )
     SELECT inserted.id, player.display_name
       FROM inserted JOIN player ON player.id = inserted.player_id`,
    [
      parsed.data.playerId,
      parsed.data.sku,
      parsed.data.quantity,
      parsed.data.note ?? "",
      adminEmail,
    ],
  );
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: "Usuario no encontrado" });
  return {
    ok: true,
    grantId: rows[0].id,
    player: rows[0].display_name,
    sku: parsed.data.sku,
    quantity: parsed.data.quantity,
  };
});
