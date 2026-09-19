ALTER TABLE leaderboard_players
  ADD COLUMN IF NOT EXISTS purchase_email_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_players_purchase_email_idx
  ON leaderboard_players (purchase_email_hash)
  WHERE purchase_email_hash IS NOT NULL;

ALTER TABLE whop_purchases
  ADD COLUMN IF NOT EXISTS purchaser_email_hash TEXT,
  ADD COLUMN IF NOT EXISTS player_id BIGINT REFERENCES leaderboard_players(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS whop_purchases_email_idx
  ON whop_purchases (purchaser_email_hash, purchased_at DESC);

CREATE TABLE IF NOT EXISTS player_entitlements (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  game_sku VARCHAR(32) NOT NULL,
  source_payment_id TEXT NOT NULL REFERENCES whop_purchases(payment_id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_payment_id, game_sku)
);

CREATE INDEX IF NOT EXISTS player_entitlements_player_idx
  ON player_entitlements (player_id, status, granted_at DESC);
