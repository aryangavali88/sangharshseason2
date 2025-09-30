-- Allow "all-rounder" in player_registrations.position
-- Drop existing CHECK constraint (name is usually <table>_<column>_check)
ALTER TABLE public.player_registrations
  DROP CONSTRAINT IF EXISTS player_registrations_position_check;

-- Recreate CHECK constraint including all-rounder
ALTER TABLE public.player_registrations
  ADD CONSTRAINT player_registrations_position_check
  CHECK (position IN ('batsman', 'bowler', 'wicket-keeper', 'all-rounder'));


