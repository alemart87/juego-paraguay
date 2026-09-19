import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FighterId } from "./content";
import { SHOP_SKUS, type ShopSku } from "./shop-catalog";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  level: number;
  hero: FighterId;
  time: number;
  combo: number;
};

export function normalizeContact(kind: "email" | "phone", value: string): string | null {
  if (kind === "email") {
    const normalized = value.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized) && normalized.length <= 160
      ? normalized
      : null;
  }
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `595${digits.slice(1)}` : digits;
  return /^\d{8,15}$/.test(normalized) ? normalized : null;
}

const scoreInput = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(24)
    .regex(/^[\p{L}\p{N} ._'-]+$/u),
  contactKind: z.enum(["email", "phone"]),
  contact: z.string().trim().min(5).max(160),
  consent: z.literal(true),
  score: z.number().int().min(0).max(10_000_000),
  level: z.number().int().min(1).max(4),
  hero: z.enum(["masivo", "onichan", "anatomic", "comadre", "papu", "secre"]),
  time: z.number().int().min(1).max(3600),
  combo: z.number().int().min(0).max(999),
});

const profileInput = scoreInput
  .pick({
    name: true,
    contactKind: true,
    contact: true,
    consent: true,
  })
  .extend({ purchaseEmail: z.string().trim().max(160).optional() });

async function contactHash(kind: "email" | "phone", value: string) {
  const normalized = normalizeContact(kind, value);
  if (!normalized) return null;
  const { createHmac } = await import("node:crypto");
  const configuredSecret = process.env.LEADERBOARD_SECRET?.trim();
  if (process.env.DATABASE_URL?.trim() && !configuredSecret)
    throw new Error("LEADERBOARD_SECRET is required when DATABASE_URL is configured");
  return createHmac("sha256", configuredSecret ?? "influencers-battle-local-preview")
    .update(`${kind}:${normalized}`)
    .digest("hex");
}

async function benefitsToken(hash: string) {
  const { createHmac } = await import("node:crypto");
  const secret = process.env.LEADERBOARD_SECRET?.trim() ?? "influencers-battle-local-preview";
  return createHmac("sha256", secret).update(`benefits:${hash}`).digest("hex");
}

export const getPlayerBenefits = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        contactKind: z.enum(["email", "phone"]),
        contact: z.string().trim().min(5).max(160),
        benefitToken: z.string().length(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const hash = await contactHash(data.contactKind, data.contact);
    if (!hash) return { ok: false as const, message: "El perfil no es válido." };
    const expected = await benefitsToken(hash);
    const { timingSafeEqual } = await import("node:crypto");
    const suppliedBuffer = Buffer.from(data.benefitToken, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    )
      return { ok: false as const, message: "Actualizá tu perfil para sincronizar compras." };
    const sql = await (await import("@/lib/db")).getSql();
    const rows = await sql.query<{ game_sku: string }>(
      `SELECT DISTINCT e.game_sku
         FROM player_entitlements e
         JOIN leaderboard_players p ON p.id = e.player_id
        WHERE p.contact_hash = $1 AND e.status = 'active'`,
      [hash],
    );
    const valid = new Set<string>(SHOP_SKUS);
    return {
      ok: true as const,
      skus: rows.map((row) => row.game_sku).filter((sku): sku is ShopSku => valid.has(sku)),
    };
  });

export const registerLeaderboardPlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) => profileInput.parse(input))
  .handler(async ({ data }) => {
    const normalized = normalizeContact(data.contactKind, data.contact);
    if (!normalized)
      return {
        ok: false as const,
        message:
          data.contactKind === "email"
            ? "Ingresá un correo válido."
            : "Ingresá un número válido con código de país.",
      };
    const hash = await contactHash(data.contactKind, data.contact);
    if (!hash) return { ok: false as const, message: "El contacto no es válido." };
    const purchaseEmail = data.contactKind === "email" ? normalized : data.purchaseEmail;
    const purchaseHash = purchaseEmail ? await contactHash("email", purchaseEmail) : null;
    if (data.purchaseEmail && !purchaseHash)
      return { ok: false as const, message: "Ingresá un correo de compra válido." };
    const sql = await (await import("@/lib/db")).getSql();
    const players = await sql.query<{ id: number }>(
      `INSERT INTO leaderboard_players
         (contact_hash, contact_kind, display_name, purchase_email_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (contact_hash) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         purchase_email_hash = COALESCE(EXCLUDED.purchase_email_hash, leaderboard_players.purchase_email_hash),
         updated_at = now()
       RETURNING id`,
      [hash, data.contactKind, data.name, purchaseHash],
    );
    const playerId = players[0]?.id;
    if (!playerId) throw new Error("No se pudo registrar el perfil");
    if (purchaseHash) {
      await sql.query(
        `UPDATE whop_purchases SET player_id = $1, updated_at = now()
          WHERE purchaser_email_hash = $2 AND player_id IS NULL`,
        [playerId, purchaseHash],
      );
      await sql.query(
        `INSERT INTO player_entitlements (player_id, game_sku, source_payment_id)
         SELECT $1, game_sku, payment_id FROM whop_purchases
          WHERE player_id = $1 AND status = 'paid'
         ON CONFLICT (source_payment_id, game_sku) DO UPDATE SET
           player_id = EXCLUDED.player_id, status = 'active', updated_at = now()`,
        [playerId],
      );
    }
    return {
      ok: true as const,
      name: data.name,
      benefitToken: await benefitsToken(hash),
      message: purchaseHash
        ? "Perfil listo. Usá este mismo correo al pagar en Whop."
        : "Perfil listo. Tu mejor partida quedará ligada a este número.",
    };
  });

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query<{
    name: string;
    score: number;
    level: number;
    hero: FighterId;
    time: number;
    combo: number;
  }>(
    `SELECT p.display_name AS name, s.score, s.level, s.hero,
            s.time_seconds AS time, s.combo
       FROM leaderboard_scores s
       JOIN leaderboard_players p ON p.id = s.player_id
      ORDER BY s.score DESC, s.time_seconds ASC, s.updated_at ASC
      LIMIT 50`,
  );
  return {
    ok: true as const,
    entries: rows.map((row, index) => ({ ...row, rank: index + 1 })),
  };
});

export const submitLeaderboardScore = createServerFn({ method: "POST" })
  .validator((input: unknown) => scoreInput.parse(input))
  .handler(async ({ data }) => {
    const normalized = normalizeContact(data.contactKind, data.contact);
    if (!normalized)
      return {
        ok: false as const,
        message:
          data.contactKind === "email"
            ? "Ingresá un correo válido."
            : "Ingresá un número válido con código de país.",
      };

    const [{ getRequest }, { getSql }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/lib/db"),
    ]);
    const request = getRequest();
    const address =
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request?.headers.get("x-real-ip") ??
      "local";
    const globalRate = globalThis as typeof globalThis & {
      __leaderboardRate?: Map<string, number[]>;
    };
    globalRate.__leaderboardRate ??= new Map();
    const now = Date.now();
    const recent = (globalRate.__leaderboardRate.get(address) ?? []).filter(
      (timestamp) => now - timestamp < 10 * 60_000,
    );
    if (recent.length >= 8)
      return { ok: false as const, message: "Demasiados intentos. Probá de nuevo más tarde." };
    recent.push(now);
    globalRate.__leaderboardRate.set(address, recent);

    const hashedContact = await contactHash(data.contactKind, data.contact);
    if (!hashedContact) return { ok: false as const, message: "El contacto no es válido." };
    const sql = await getSql();
    const players = await sql.query<{ id: number }>(
      `INSERT INTO leaderboard_players (contact_hash, contact_kind, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (contact_hash) DO UPDATE
         SET display_name = EXCLUDED.display_name, updated_at = now()
       RETURNING id`,
      [hashedContact, data.contactKind, data.name],
    );
    const playerId = players[0]?.id;
    if (!playerId) throw new Error("No se pudo registrar el perfil");
    await sql.query(
      `INSERT INTO leaderboard_scores
         (player_id, score, level, hero, time_seconds, combo)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (player_id) DO UPDATE SET
         score = EXCLUDED.score,
         level = EXCLUDED.level,
         hero = EXCLUDED.hero,
         time_seconds = EXCLUDED.time_seconds,
         combo = EXCLUDED.combo,
         updated_at = now()
       WHERE EXCLUDED.score > leaderboard_scores.score
          OR (EXCLUDED.score = leaderboard_scores.score
              AND EXCLUDED.time_seconds < leaderboard_scores.time_seconds)`,
      [playerId, data.score, data.level, data.hero, data.time, data.combo],
    );
    const rankRows = await sql.query<{ rank: number }>(
      `SELECT 1 + count(*)::int AS rank FROM leaderboard_scores WHERE score > $1`,
      [data.score],
    );
    return {
      ok: true as const,
      rank: rankRows[0]?.rank ?? 1,
      name: data.name,
      benefitToken: await benefitsToken(hashedContact),
      message: "Tu mejor partida ya aparece en el ranking.",
    };
  });
