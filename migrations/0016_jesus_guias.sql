-- Guías de oración de 30 días (PDF) vendidas desde "Jesús te ama".
-- Un pedido por (token del comprador, guía). El token es el support_token del
-- hilo de WhatsApp o un token que genera la web; el checkout de Whop lleva ese
-- token en sus metadatos y el webhook del pago lo trae de vuelta.
CREATE TABLE IF NOT EXISTS jesus_guide_orders (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL,
  guide VARCHAR(24) NOT NULL,
  phone VARCHAR(32),
  checkout_id VARCHAR(80),
  checkout_url TEXT,
  payment_id VARCHAR(80),
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  amount NUMERIC(10, 2),
  currency VARCHAR(8),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS jesus_guide_orders_token_guide_idx ON jesus_guide_orders (token, guide);
CREATE UNIQUE INDEX IF NOT EXISTS jesus_guide_orders_payment_idx
  ON jesus_guide_orders (payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS jesus_guide_orders_checkout_idx ON jesus_guide_orders (checkout_id);

-- Qué guías se le ofrecieron a cada hilo de WhatsApp y cuándo (en mensajes de la persona).
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS guides_offered TEXT NOT NULL DEFAULT '';
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS guide_offer_count INTEGER NOT NULL DEFAULT 0;
