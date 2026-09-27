-- Conversaciones por WhatsApp de "Jesús te ama" (agente de IA vía Kapso).
-- El teléfono hace falta para responder y mantener el hilo; los mensajes se
-- podan a los 30 días.
CREATE TABLE IF NOT EXISTS jesus_wa_threads (
  phone VARCHAR(32) PRIMARY KEY,
  contact_name VARCHAR(80),
  user_messages INTEGER NOT NULL DEFAULT 0,
  assistant_messages INTEGER NOT NULL DEFAULT 0,
  opted_out BOOLEAN NOT NULL DEFAULT false,
  nudged_at TIMESTAMPTZ,
  last_user_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jesus_wa_messages (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(32) NOT NULL REFERENCES jesus_wa_threads(phone) ON DELETE CASCADE,
  role VARCHAR(12) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  wa_message_id VARCHAR(160) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jesus_wa_messages_phone_idx ON jesus_wa_messages (phone, created_at DESC);
