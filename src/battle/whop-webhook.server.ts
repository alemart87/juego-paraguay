import { getSql } from "../lib/db";

export type WhopWebhookEvent = {
  id: string;
  type: string;
  timestamp?: string;
  data: Record<string, unknown>;
};

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length ? value : null;
}

function decimal(value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : typeof value === "string" && value.length
      ? value
      : null;
}

function paymentDetails(event: WhopWebhookEvent) {
  const data = event.data;
  const payment = event.type.startsWith("payment.") ? data : object(data.payment);
  const metadata = object(payment?.metadata);
  const user = object(payment?.user);
  const plan = object(payment?.plan) ?? object(payment?.current_plan);
  const product = object(payment?.product);
  const planMetadata = object(plan?.metadata);
  const productMetadata = object(product?.metadata);

  return {
    paymentId: text(payment?.id),
    sku:
      text(metadata?.game_sku) ?? text(planMetadata?.game_sku) ?? text(productMetadata?.game_sku),
    userId: text(user?.id),
    email:
      text(payment?.email_address) ??
      text(payment?.customer_email) ??
      text(user?.email) ??
      text(user?.email_address),
    checkoutConfigurationId: text(payment?.checkout_configuration_id),
    amount: decimal(payment?.total) ?? decimal(payment?.subtotal),
    currency: text(payment?.currency),
  };
}

/** Persist and fulfill a verified event. Replays are safe because webhook_id is unique. */
export async function recordWhopWebhook(event: WhopWebhookEvent, webhookId: string) {
  const sql = await getSql();
  const details = paymentDetails(event);
  let purchaserEmailHash: string | null = null;
  if (details.email) {
    const { createHmac } = await import("node:crypto");
    const secret =
      process.env.LEADERBOARD_SECRET?.trim() || process.env.WHOP_WEBHOOK_SECRET?.trim();
    if (!secret && process.env.DATABASE_URL?.trim())
      throw new Error(
        "LEADERBOARD_SECRET or WHOP_WEBHOOK_SECRET is required when DATABASE_URL is configured",
      );
    purchaserEmailHash = createHmac("sha256", secret ?? "influencers-battle-local-preview")
      .update(`email:${details.email.trim().toLowerCase()}`)
      .digest("hex");
  }
  await sql.query(
    `INSERT INTO whop_webhook_events
       (webhook_id, event_type, payment_id, game_sku, occurred_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (webhook_id) DO NOTHING`,
    [webhookId, event.type, details.paymentId, details.sku, event.timestamp ?? null],
  );

  const rows = await sql.query<{ processed_at: string | null }>(
    "SELECT processed_at FROM whop_webhook_events WHERE webhook_id = $1",
    [webhookId],
  );
  if (!rows.length || rows[0].processed_at) return { duplicate: true };

  if (event.type === "payment.succeeded" && details.paymentId && details.sku) {
    await sql.query(
      `INSERT INTO whop_purchases
         (payment_id, whop_user_id, game_sku, checkout_configuration_id, amount, currency,
          status, purchased_at, purchaser_email_hash, player_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'paid', COALESCE($7, now()), $8,
         (SELECT id FROM leaderboard_players
           WHERE purchase_email_hash = $8 OR (contact_kind = 'email' AND contact_hash = $8)
           LIMIT 1))
       ON CONFLICT (payment_id) DO UPDATE SET
         whop_user_id = EXCLUDED.whop_user_id,
         game_sku = EXCLUDED.game_sku,
         checkout_configuration_id = EXCLUDED.checkout_configuration_id,
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         status = 'paid',
         purchased_at = EXCLUDED.purchased_at,
         purchaser_email_hash = COALESCE(EXCLUDED.purchaser_email_hash, whop_purchases.purchaser_email_hash),
         player_id = COALESCE(EXCLUDED.player_id, whop_purchases.player_id),
         updated_at = now()`,
      [
        details.paymentId,
        details.userId,
        details.sku,
        details.checkoutConfigurationId,
        details.amount,
        details.currency,
        event.timestamp ?? null,
        purchaserEmailHash,
      ],
    );
    await sql.query(
      `INSERT INTO player_entitlements (player_id, game_sku, source_payment_id)
       SELECT player_id, game_sku, payment_id FROM whop_purchases
        WHERE payment_id = $1 AND player_id IS NOT NULL AND status = 'paid'
       ON CONFLICT (source_payment_id, game_sku) DO UPDATE SET
         player_id = EXCLUDED.player_id, status = 'active', updated_at = now()`,
      [details.paymentId],
    );
    const { creditPurchases } = await import("./credits.server");
    await creditPurchases(sql, { paymentId: details.paymentId });
  }

  if (event.type === "refund.updated" && details.paymentId && event.data.status === "succeeded") {
    await sql.query(
      `UPDATE whop_purchases
       SET status = 'refunded', refunded_at = COALESCE($2, now()), updated_at = now()
       WHERE payment_id = $1`,
      [details.paymentId, event.timestamp ?? null],
    );
    await sql.query(
      `UPDATE player_entitlements SET status = 'refunded', updated_at = now()
        WHERE source_payment_id = $1`,
      [details.paymentId],
    );
    const { reversePurchase } = await import("./credits.server");
    await reversePurchase(sql, details.paymentId);
  }

  await sql.query("UPDATE whop_webhook_events SET processed_at = now() WHERE webhook_id = $1", [
    webhookId,
  ]);
  return { duplicate: false };
}
