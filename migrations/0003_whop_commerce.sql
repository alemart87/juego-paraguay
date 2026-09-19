CREATE TABLE whop_webhook_events (
  webhook_id TEXT PRIMARY KEY,
  event_type VARCHAR(80) NOT NULL,
  payment_id TEXT,
  game_sku VARCHAR(32),
  occurred_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX whop_webhook_events_payment_idx
  ON whop_webhook_events (payment_id, received_at DESC);

CREATE TABLE whop_purchases (
  payment_id TEXT PRIMARY KEY,
  whop_user_id TEXT,
  game_sku VARCHAR(32) NOT NULL,
  checkout_configuration_id TEXT,
  amount NUMERIC(12, 2),
  currency VARCHAR(8),
  status VARCHAR(24) NOT NULL CHECK (status IN ('paid', 'refunded')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  refunded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX whop_purchases_user_idx
  ON whop_purchases (whop_user_id, purchased_at DESC);

