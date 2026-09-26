-- Telemetría anónima de "Jesús te ama": qué tema y opción eligió cada
-- conversación, cuántas luces encendió y qué hizo después. No guarda nombre,
-- contacto ni el texto del pedido; la sesión es un HMAC como en game_analytics_events.
CREATE TABLE IF NOT EXISTS jesus_events (
  id BIGSERIAL PRIMARY KEY,
  session_hash VARCHAR(64) NOT NULL,
  topic VARCHAR(24) NOT NULL,
  option VARCHAR(24) NOT NULL,
  lights INTEGER NOT NULL DEFAULT 0 CHECK (lights BETWEEN 0 AND 10000),
  wrote BOOLEAN NOT NULL DEFAULT false,
  shared BOOLEAN NOT NULL DEFAULT false,
  support BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jesus_events_created_idx ON jesus_events (created_at DESC);
CREATE INDEX IF NOT EXISTS jesus_events_topic_idx ON jesus_events (topic, option);
CREATE INDEX IF NOT EXISTS jesus_events_session_idx ON jesus_events (session_hash, created_at DESC);
