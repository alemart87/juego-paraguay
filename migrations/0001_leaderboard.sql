CREATE TABLE leaderboard_players (
  id BIGSERIAL PRIMARY KEY,
  contact_hash TEXT NOT NULL UNIQUE,
  contact_kind TEXT NOT NULL CHECK (contact_kind IN ('email', 'phone')),
  display_name VARCHAR(24) NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE leaderboard_scores (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL UNIQUE REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000000),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
  hero VARCHAR(16) NOT NULL,
  time_seconds INTEGER NOT NULL CHECK (time_seconds BETWEEN 1 AND 3600),
  combo INTEGER NOT NULL CHECK (combo BETWEEN 0 AND 999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leaderboard_scores_rank_idx
  ON leaderboard_scores (score DESC, time_seconds ASC, updated_at ASC);
