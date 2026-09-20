ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_level_check;
ALTER TABLE leaderboard_scores ADD CONSTRAINT leaderboard_scores_level_check CHECK (level BETWEEN 1 AND 5);

ALTER TABLE leaderboard_score_events DROP CONSTRAINT IF EXISTS leaderboard_score_events_level_check;
ALTER TABLE leaderboard_score_events ADD CONSTRAINT leaderboard_score_events_level_check CHECK (level BETWEEN 1 AND 5);

ALTER TABLE game_analytics_events DROP CONSTRAINT IF EXISTS game_analytics_events_level_check;
ALTER TABLE game_analytics_events ADD CONSTRAINT game_analytics_events_level_check CHECK (level BETWEEN 1 AND 5);

CREATE TABLE IF NOT EXISTS game_settings (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO game_settings (key, value, enabled)
VALUES ('weekly_chisme_url', '', false)
ON CONFLICT (key) DO NOTHING;
