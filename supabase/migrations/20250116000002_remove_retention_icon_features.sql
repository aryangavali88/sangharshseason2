-- Complete cleanup migration to remove retention and icon features
-- This migration removes all retention/icon related columns and constraints

-- Drop foreign key constraints if they exist
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_icon_player_id_fkey;
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_retained_player_id_fkey;

-- Drop columns if they exist (these might have been added manually)
ALTER TABLE public.teams DROP COLUMN IF EXISTS icon_player_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS retained_player_id;

-- Clean up any other potential retention/icon related columns
ALTER TABLE public.teams DROP COLUMN IF EXISTS icon_url;
ALTER TABLE public.teams DROP COLUMN IF EXISTS retained_player_name;
ALTER TABLE public.teams DROP COLUMN IF EXISTS icon_player_name;

-- Verify the teams table structure is clean
-- The teams table should only have: id, name, initial_points, created_at, updated_at
DO $$
BEGIN
    RAISE NOTICE 'Teams table cleanup completed. Current columns:';
    FOR col IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %', col.column_name;
    END LOOP;
END $$;
