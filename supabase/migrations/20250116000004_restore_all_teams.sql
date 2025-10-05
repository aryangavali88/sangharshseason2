-- Restore all 6 teams to the teams table
-- This migration ensures all teams are present with correct initial points

-- First, let's see what teams currently exist
DO $$
DECLARE
    team_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO team_count FROM public.teams;
    RAISE NOTICE 'Current teams count: %', team_count;
    
    -- List current teams
    FOR team IN SELECT name FROM public.teams ORDER BY name
    LOOP
        RAISE NOTICE 'Current team: %', team.name;
    END LOOP;
END $$;

-- Ensure all 6 teams exist with correct names and points
INSERT INTO public.teams (id, name, initial_points, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    team_name, 
    25000, 
    now(), 
    now()
FROM (
    VALUES 
        ('Navgekar Stickers'),
        ('Pathak Panthers'),
        ('Joshi Warriors'),
        ('The Aurwadkars'),
        ('GUPTE GLADIATORS'),
        ('Brije Blasters')
) AS teams(team_name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE LOWER(t.name) = LOWER(teams.team_name)
);

-- Update existing teams to have correct points if they're different
UPDATE public.teams 
SET initial_points = 25000, updated_at = now()
WHERE initial_points != 25000;

-- Normalize team names to match the exact format
UPDATE public.teams 
SET name = CASE 
    WHEN LOWER(name) = 'navgekar stickers' THEN 'Navgekar Stickers'
    WHEN LOWER(name) = 'pathak panthers' THEN 'Pathak Panthers'
    WHEN LOWER(name) = 'joshi warriors' THEN 'Joshi Warriors'
    WHEN LOWER(name) = 'the aurwadkars' THEN 'The Aurwadkars'
    WHEN LOWER(name) = 'gupte gladiators' THEN 'GUPTE GLADIATORS'
    WHEN LOWER(name) = 'brije blasters' THEN 'Brije Blasters'
    ELSE name
END,
updated_at = now()
WHERE LOWER(name) IN (
    'navgekar stickers', 'pathak panthers', 'joshi warriors', 
    'the aurwadkars', 'gupte gladiators', 'brije blasters'
);

-- Verify all teams are present
DO $$
DECLARE
    final_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_count FROM public.teams;
    RAISE NOTICE 'Final teams count: %', final_count;
    
    IF final_count = 6 THEN
        RAISE NOTICE 'SUCCESS: All 6 teams restored successfully!';
    ELSE
        RAISE NOTICE 'WARNING: Expected 6 teams, but found % teams', final_count;
    END IF;
    
    -- List all teams
    RAISE NOTICE 'Teams in database:';
    FOR team IN SELECT name, initial_points FROM public.teams ORDER BY name
    LOOP
        RAISE NOTICE '  - % (Points: %)', team.name, team.initial_points;
    END LOOP;
END $$;

