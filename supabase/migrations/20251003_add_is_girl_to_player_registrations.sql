-- Add is_girl boolean to player_registrations with default false
ALTER TABLE public.player_registrations
ADD COLUMN IF NOT EXISTS is_girl boolean NOT NULL DEFAULT false;

-- Backfill existing rows to false (explicit)
UPDATE public.player_registrations
SET is_girl = false
WHERE is_girl IS NULL;


