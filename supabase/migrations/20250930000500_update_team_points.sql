-- Update initial points for all teams to 25000
UPDATE public.teams
SET initial_points = 25000,
    updated_at = now();


