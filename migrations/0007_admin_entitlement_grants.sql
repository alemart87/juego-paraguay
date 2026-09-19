CREATE TABLE IF NOT EXISTS admin_entitlement_grants (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  game_sku VARCHAR(32) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 9999),
  note VARCHAR(240),
  granted_by VARCHAR(160) NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_entitlement_grants_player_idx
  ON admin_entitlement_grants (player_id, granted_at DESC);

CREATE INDEX IF NOT EXISTS admin_entitlement_grants_sku_idx
  ON admin_entitlement_grants (game_sku, granted_at DESC);
