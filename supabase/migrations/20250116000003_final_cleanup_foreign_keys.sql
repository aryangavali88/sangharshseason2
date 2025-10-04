-- Final cleanup migration to ensure player_registrations can be deleted
-- This migration removes any remaining foreign key constraints that might prevent deletion

-- Drop any remaining foreign key constraints that reference player_registrations
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find all foreign key constraints that reference player_registrations table
    FOR constraint_record IN
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'player_registrations'
    LOOP
        -- Drop the foreign key constraint
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
        
        RAISE NOTICE 'Dropped foreign key constraint % from table %', 
                     constraint_record.constraint_name, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- Verify that no foreign key constraints reference player_registrations
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'player_registrations';
    
    IF constraint_count = 0 THEN
        RAISE NOTICE 'SUCCESS: No foreign key constraints reference player_registrations table';
        RAISE NOTICE 'You can now safely delete rows from player_registrations table';
    ELSE
        RAISE NOTICE 'WARNING: % foreign key constraints still reference player_registrations', constraint_count;
    END IF;
END $$;
