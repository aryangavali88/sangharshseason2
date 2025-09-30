-- Make season1_team optional in player_registrations
ALTER TABLE public.player_registrations
ALTER COLUMN season1_team DROP NOT NULL;


