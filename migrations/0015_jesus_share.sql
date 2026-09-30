-- Invitación a compartir el número de Jesús: mensajes de la persona la última
-- vez que se la invitó (0 = nunca), igual que nudged_count para el aporte.
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS shared_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE jesus_wa_threads ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;
