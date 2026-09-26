import { ABOGADO_SHOP_ITEMS } from "./shop-catalog";
import { REFERRAL_RATE, SIGNUP_BONUS } from "./credits-config";

/**
 * Libro mayor del saldo de golpes y vínculos de referidos. Solo servidor:
 * lo usan el webhook de Whop y las funciones de registro/compra.
 */
type Sql = { query: <T>(query: string, params?: unknown[]) => Promise<T[]> };

export function creditsForSku(sku: string): number {
  const item = ABOGADO_SHOP_ITEMS.find((entry) => entry.sku === sku);
  return item && "credits" in item ? item.credits : 0;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function randomCode(length = 6) {
  const { randomInt } = await import("node:crypto");
  let code = "";
  for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

/** Código de referido del jugador; se crea la primera vez que hace falta. */
export async function ensureReferralCode(sql: Sql, playerId: number): Promise<string> {
  const rows = await sql.query<{ referral_code: string | null }>(
    "SELECT referral_code FROM leaderboard_players WHERE id = $1",
    [playerId],
  );
  const existing = rows[0]?.referral_code;
  if (existing) return existing;
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = await randomCode();
    const updated = await sql.query<{ referral_code: string }>(
      `UPDATE leaderboard_players SET referral_code = $2
        WHERE id = $1 AND referral_code IS NULL
          AND NOT EXISTS (SELECT 1 FROM leaderboard_players WHERE referral_code = $2)
        RETURNING referral_code`,
      [playerId, code],
    );
    if (updated[0]?.referral_code) return updated[0].referral_code;
    const again = await sql.query<{ referral_code: string | null }>(
      "SELECT referral_code FROM leaderboard_players WHERE id = $1",
      [playerId],
    );
    if (again[0]?.referral_code) return again[0].referral_code;
  }
  throw new Error("No se pudo generar el código de referido");
}

export async function balance(sql: Sql, playerId: number): Promise<number> {
  const rows = await sql.query<{ total: number }>(
    "SELECT COALESCE(SUM(delta), 0)::int AS total FROM credit_ledger WHERE player_id = $1",
    [playerId],
  );
  return Number(rows[0]?.total ?? 0);
}

/**
 * Vincula a un jugador nuevo con quien lo trajo y le acredita el bono de bienvenida.
 * Falla en silencio si el código no existe o es el propio.
 */
export async function linkReferral(sql: Sql, referredId: number, code: string) {
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(clean)) return false;
  const referrers = await sql.query<{ id: number }>(
    "SELECT id FROM leaderboard_players WHERE referral_code = $1 LIMIT 1",
    [clean],
  );
  const referrerId = referrers[0]?.id;
  if (!referrerId || Number(referrerId) === Number(referredId)) return false;
  const inserted = await sql.query<{ id: number }>(
    `INSERT INTO referrals (referrer_id, referred_id, code) VALUES ($1, $2, $3)
     ON CONFLICT (referred_id) DO NOTHING RETURNING id`,
    [referrerId, referredId, clean],
  );
  if (!inserted.length) return false;
  await sql.query(
    `INSERT INTO credit_ledger (player_id, delta, reason, ref_id)
     VALUES ($1, $2, 'signup_bonus', $3) ON CONFLICT (reason, ref_id) DO NOTHING`,
    [referredId, SIGNUP_BONUS, `player:${referredId}`],
  );
  return true;
}

/**
 * Acredita los packs de golpes pagados que todavía no entraron al libro mayor,
 * y la comisión del referente. Idempotente: se puede llamar en cada webhook y
 * cada vez que un jugador enlaza su correo de compra.
 */
export async function creditPurchases(
  sql: Sql,
  filter: { playerId?: number; paymentId?: string } = {},
) {
  const rows = await sql.query<{ payment_id: string; game_sku: string; player_id: number }>(
    `SELECT p.payment_id, p.game_sku, p.player_id
       FROM whop_purchases p
      WHERE p.status = 'paid' AND p.player_id IS NOT NULL
        AND ($1::bigint IS NULL OR p.player_id = $1)
        AND ($2::text IS NULL OR p.payment_id = $2)
        AND NOT EXISTS (
          SELECT 1 FROM credit_ledger l WHERE l.reason = 'purchase' AND l.ref_id = p.payment_id
        )`,
    [filter.playerId ?? null, filter.paymentId ?? null],
  );
  let credited = 0;
  for (const row of rows) {
    const credits = creditsForSku(row.game_sku);
    if (!credits) continue;
    const buyer = Number(row.player_id);
    const inserted = await sql.query<{ id: number }>(
      `INSERT INTO credit_ledger (player_id, delta, reason, ref_id)
       VALUES ($1, $2, 'purchase', $3) ON CONFLICT (reason, ref_id) DO NOTHING RETURNING id`,
      [buyer, credits, row.payment_id],
    );
    if (!inserted.length) continue;
    credited++;
    const referral = await sql.query<{ referrer_id: number }>(
      "SELECT referrer_id FROM referrals WHERE referred_id = $1",
      [buyer],
    );
    const referrerId = referral[0]?.referrer_id;
    const commission = Math.floor(credits * REFERRAL_RATE);
    if (referrerId && commission > 0)
      await sql.query(
        `INSERT INTO credit_ledger (player_id, delta, reason, ref_id)
         VALUES ($1, $2, 'referral', $3) ON CONFLICT (reason, ref_id) DO NOTHING`,
        [referrerId, commission, row.payment_id],
      );
  }
  return credited;
}

/** Un reembolso en Whop revierte el saldo del comprador y la comisión del referente. */
export async function reversePurchase(sql: Sql, paymentId: string) {
  const rows = await sql.query<{ player_id: number; delta: number; reason: string }>(
    `SELECT player_id, delta, reason FROM credit_ledger
      WHERE ref_id = $1 AND reason IN ('purchase', 'referral')`,
    [paymentId],
  );
  for (const row of rows)
    await sql.query(
      `INSERT INTO credit_ledger (player_id, delta, reason, ref_id)
       VALUES ($1, $2, 'refund', $3) ON CONFLICT (reason, ref_id) DO NOTHING`,
      [row.player_id, -Number(row.delta), `${paymentId}:${row.reason}`],
    );
}

/** Descuenta los golpes usados en una partida (nunca más que el saldo). */
export async function spend(sql: Sql, playerId: number, count: number, runId: string) {
  const current = await balance(sql, playerId);
  const amount = Math.min(Math.max(0, Math.floor(count)), current);
  if (amount > 0)
    await sql.query(
      `INSERT INTO credit_ledger (player_id, delta, reason, ref_id)
       VALUES ($1, $2, 'spend', $3) ON CONFLICT (reason, ref_id) DO NOTHING`,
      [playerId, -amount, runId],
    );
  return balance(sql, playerId);
}

export async function referralSummary(sql: Sql, playerId: number) {
  const rows = await sql.query<{ friends: number; earned: number; bonus: number }>(
    `SELECT (SELECT count(*) FROM referrals WHERE referrer_id = $1)::int AS friends,
            (SELECT COALESCE(SUM(delta), 0) FROM credit_ledger
              WHERE player_id = $1 AND reason = 'referral')::int AS earned,
            (SELECT COALESCE(SUM(delta), 0) FROM credit_ledger
              WHERE player_id = $1 AND reason = 'signup_bonus')::int AS bonus`,
    [playerId],
  );
  return {
    friends: Number(rows[0]?.friends ?? 0),
    earned: Number(rows[0]?.earned ?? 0),
    bonus: Number(rows[0]?.bonus ?? 0),
  };
}
