-- Update the season1_team constraint to use the correct Season 1 team names
-- Drop the existing constraint
ALTER TABLE public.player_registrations DROP CONSTRAINT IF EXISTS player_registrations_season1_team_check;

-- Add the new constraint with correct team names
ALTER TABLE public.player_registrations 
ADD CONSTRAINT player_registrations_season1_team_check 
CHECK (season1_team IN (
  'Navgekar Stickers',
  'Pathak Panthers', 
  'Joshi Warriors',
  'The Aurwadkars',
  'GUPTE GLADIATORS',
  'Brije Blasters'
));
