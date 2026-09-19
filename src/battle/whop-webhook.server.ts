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

function paymentDetails(event: WhopWebhookEvent) {
  const data = event.data;
  const payment = event.type.startsWith("payment.") ? data : object(data.payment);
  const metadata = object(payment?.metadata);
  const user = object(payment?.user);
  const total = object(payment?.total);

  return {
    paymentId: text(payment?.id),
    sku: text(metadata?.game_sku),
    userId: text(user?.id),
    checkoutConfigurationId: text(payment?.checkout_configuration_id),
    amount: text(total?.amount),
    currency: text(total?.currency) ?? text(payment?.currency),
  };
}

/** Persist and fulfill a verified event. Replays are safe because webhook_id is unique. */
export async function recordWhopWebhook(event: WhopWebhookEvent, webhookId: string) {
  const sql = await getSql();
  const details = paymentDetails(event);
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
         (payment_id, whop_user_id, game_sku, checkout_configuration_id, amount, currency, status, purchased_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'paid', COALESCE($7, now()))
       ON CONFLICT (payment_id) DO UPDATE SET
         whop_user_id = EXCLUDED.whop_user_id,
         game_sku = EXCLUDED.game_sku,
         checkout_configuration_id = EXCLUDED.checkout_configuration_id,
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         status = 'paid',
         purchased_at = EXCLUDED.purchased_at,
         updated_at = now()`,
      [
        details.paymentId,
        details.userId,
        details.sku,
        details.checkoutConfigurationId,
        details.amount,
        details.currency,
        event.timestamp ?? null,
      ],
    );
  }

  if (event.type === "refund.updated" && details.paymentId && event.data.status === "succeeded") {
    await sql.query(
      `UPDATE whop_purchases
       SET status = 'refunded', refunded_at = COALESCE($2, now()), updated_at = now()
       WHERE payment_id = $1`,
      [details.paymentId, event.timestamp ?? null],
    );
  }

  await sql.query(
    "UPDATE whop_webhook_events SET processed_at = now() WHERE webhook_id = $1",
    [webhookId],
  );
  return { duplicate: false };
}

