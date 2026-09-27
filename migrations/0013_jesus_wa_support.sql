-- Cierra el círculo del aporte por WhatsApp: el link que manda Jesús lleva un
-- token del hilo; al volver de Whop, la web avisa y Jesús agradece por WhatsApp.
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS support_token VARCHAR(64);
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS donated_at TIMESTAMPTZ;
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS thanked_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS jesus_wa_threads_token_idx
  ON jesus_wa_threads (support_token) WHERE support_token IS NOT NULL;
