-- Referidos y saldo de golpes (juego del abogado).
-- El saldo es un libro mayor: el balance de un jugador es la suma de sus deltas.
ALTER TABLE leaderboard_players ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12);
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_players_referral_code_idx
  ON leaderboard_players (referral_code) WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT NOT NULL REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  referred_id BIGINT NOT NULL UNIQUE REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  code VARCHAR(12) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referred_id)
);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason VARCHAR(24) NOT NULL
    CHECK (reason IN ('signup_bonus', 'purchase', 'referral', 'spend', 'refund', 'admin')),
  ref_id VARCHAR(96),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reason, ref_id)
);
CREATE INDEX IF NOT EXISTS credit_ledger_player_idx ON credit_ledger (player_id, created_at DESC);
