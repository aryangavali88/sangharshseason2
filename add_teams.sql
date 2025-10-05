-- Add the remaining 5 teams to the teams table
-- Based on the provided schema with initial_points defaulting to 20000

-- Insert the 6 teams (this will only insert teams that don't already exist due to unique constraint)
INSERT INTO public.teams (name, initial_points) VALUES 
('Navgekar Stickers', 20000),
('Pathak Panthers', 20000),
('Joshi Warriors', 20000),
('The Aurwadkars', 20000),
('GUPTE GLADIATORS', 20000),
('Brije Blasters', 20000)
ON CONFLICT (name) DO NOTHING;

-- Verify all teams are present
SELECT name, initial_points, created_at FROM public.teams ORDER BY name;

