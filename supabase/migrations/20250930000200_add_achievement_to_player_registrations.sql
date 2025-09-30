-- Add achievement column to player_registrations
ALTER TABLE public.player_registrations
ADD COLUMN IF NOT EXISTS achievement TEXT;


