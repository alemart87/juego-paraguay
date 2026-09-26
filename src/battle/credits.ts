import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { referralLink } from "./credits-config";

/**
 * Saldo de golpes y referidos, del lado del jugador. La identidad es la misma
 * del ranking y la tienda: contacto + benefitToken.
 */
const identity = z.object({
  contactKind: z.enum(["email", "phone"]),
  contact: z.string().trim().min(5).max(160),
  benefitToken: z.string().length(64),
});

async function resolvePlayer(data: z.infer<typeof identity>) {
  const { verifyBenefitToken } = await import("./leaderboard");
  const hash = await verifyBenefitToken(data.contactKind, data.contact, data.benefitToken);
  if (!hash) return null;
  const sql = await (await import("@/lib/db")).getSql();
  const rows = await sql.query<{ id: number }>(
    "SELECT id FROM leaderboard_players WHERE contact_hash = $1 LIMIT 1",
    [hash],
  );
  const id = rows[0]?.id;
  return id ? { sql, playerId: Number(id) } : null;
}

export type Wallet = {
  credits: number;
  code: string;
  link: string;
  friends: number;
  earned: number;
  bonus: number;
};

export const getWallet = createServerFn({ method: "POST" })
  .validator((input: unknown) => identity.parse(input))
  .handler(async ({ data }) => {
    const player = await resolvePlayer(data);
    if (!player) return { ok: false as const, message: "Actualizá tu perfil para ver tu saldo." };
    const { sql, playerId } = player;
    const credits = await import("./credits.server");
    await credits.creditPurchases(sql, { playerId });
    const code = await credits.ensureReferralCode(sql, playerId);
    const siteUrl = process.env.PUBLIC_SITE_URL || "https://www.influencerspy.pro";
    const wallet: Wallet = {
      credits: await credits.balance(sql, playerId),
      code,
      link: referralLink(code, siteUrl),
      ...(await credits.referralSummary(sql, playerId)),
    };
    return { ok: true as const, wallet };
  });

export const spendCredits = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    identity
      .extend({ count: z.number().int().min(1).max(20_000), runId: z.string().min(8).max(64) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const player = await resolvePlayer(data);
    if (!player) return { ok: false as const, message: "Perfil no válido." };
    const { spend } = await import("./credits.server");
    const credits = await spend(player.sql, player.playerId, data.count, `run:${data.runId}`);
    return { ok: true as const, credits };
  });
