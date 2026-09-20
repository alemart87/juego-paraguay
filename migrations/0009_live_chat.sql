-- Chat público anónimo "Chismes en vivo". No guarda identidad: solo un HMAC de la
-- sesión anónima del navegador (misma semilla que game_analytics_events) para
-- limitar el ritmo de envío y contar personas distintas.
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  body VARCHAR(240) NOT NULL,
  sender_hash VARCHAR(64) NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_chat_messages_created_idx ON live_chat_messages (id DESC);
CREATE INDEX IF NOT EXISTS live_chat_messages_sender_idx ON live_chat_messages (sender_hash, created_at DESC);

INSERT INTO game_settings (key, value, enabled)
VALUES ('live_chat', '', true)
ON CONFLICT (key) DO NOTHING;
