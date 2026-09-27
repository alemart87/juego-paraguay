-- Pedido de apoyo por cantidad de mensajes: guarda cuántos mensajes llevaba la
-- persona la última vez que se le pidió (0 = nunca). Primero en el 7, luego cada 20.
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS nudged_count INTEGER NOT NULL DEFAULT 0;
UPDATE jesus_wa_threads SET nudged_count = user_messages WHERE nudged_at IS NOT NULL AND nudged_count = 0;
