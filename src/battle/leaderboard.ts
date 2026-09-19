import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FighterId } from "./content";

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

    const [{ createHmac }, { getRequest }, { getSql }] = await Promise.all([
      import("node:crypto"),
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

    const configuredSecret = process.env.LEADERBOARD_SECRET?.trim();
    if (process.env.DATABASE_URL?.trim() && !configuredSecret)
      throw new Error("LEADERBOARD_SECRET is required when DATABASE_URL is configured");
    const contactHash = createHmac("sha256", configuredSecret ?? "influencers-battle-local-preview")
      .update(`${data.contactKind}:${normalized}`)
      .digest("hex");
    const sql = await getSql();
    const players = await sql.query<{ id: number }>(
      `INSERT INTO leaderboard_players (contact_hash, contact_kind, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (contact_hash) DO UPDATE
         SET display_name = EXCLUDED.display_name, updated_at = now()
       RETURNING id`,
      [contactHash, data.contactKind, data.name],
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
      message: "Tu mejor partida ya aparece en el ranking.",
    };
  });
