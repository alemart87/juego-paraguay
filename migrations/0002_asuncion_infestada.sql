ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_level_check;
ALTER TABLE leaderboard_scores
  ADD CONSTRAINT leaderboard_scores_level_check CHECK (level BETWEEN 1 AND 4);
