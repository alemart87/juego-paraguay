ALTER TABLE leaderboard_players ADD COLUMN IF NOT EXISTS total_score BIGINT NOT NULL DEFAULT 0;
ALTER TABLE leaderboard_players ADD COLUMN IF NOT EXISTS games_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leaderboard_players ADD COLUMN IF NOT EXISTS wins INTEGER NOT NULL DEFAULT 0;

UPDATE leaderboard_players p
   SET total_score = s.score,
       games_played = CASE WHEN s.score > 0 THEN 1 ELSE 0 END,
       wins = CASE WHEN s.score > 0 THEN 1 ELSE 0 END
  FROM leaderboard_scores s
 WHERE s.player_id = p.id AND p.games_played = 0;

CREATE TABLE IF NOT EXISTS leaderboard_score_events (
  id BIGSERIAL PRIMARY KEY,
  run_id VARCHAR(64) NOT NULL UNIQUE,
  player_id BIGINT NOT NULL REFERENCES leaderboard_players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000000),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 4),
  hero VARCHAR(16) NOT NULL,
  time_seconds INTEGER NOT NULL CHECK (time_seconds BETWEEN 1 AND 3600),
  combo INTEGER NOT NULL CHECK (combo BETWEEN 0 AND 999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leaderboard_score_events_player_idx
  ON leaderboard_score_events (player_id, created_at DESC);

CREATE TABLE IF NOT EXISTS game_analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_hash VARCHAR(64) NOT NULL,
  event_type VARCHAR(32) NOT NULL CHECK (event_type IN ('page_view','game_start','game_win','game_loss','premium_trial')),
  level SMALLINT CHECK (level BETWEEN 1 AND 4),
  hero VARCHAR(16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_analytics_events_type_date_idx
  ON game_analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS game_analytics_events_session_idx
  ON game_analytics_events (session_hash, created_at DESC);
