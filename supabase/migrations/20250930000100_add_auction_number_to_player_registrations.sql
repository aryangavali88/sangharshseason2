-- Add auction_number to player_registrations
ALTER TABLE public.player_registrations
ADD COLUMN IF NOT EXISTS auction_number INTEGER;

-- Create a unique sequence for auction numbers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'auction_number_seq'
      AND n.nspname = 'public'
  ) THEN
    CREATE SEQUENCE public.auction_number_seq START WITH 1 INCREMENT BY 1 OWNED BY NONE;
  END IF;
END$$;

-- Backfill auction_number for existing rows that don't have it
WITH to_fill AS (
  SELECT id FROM public.player_registrations WHERE auction_number IS NULL ORDER BY created_at ASC
)
UPDATE public.player_registrations p
SET auction_number = nextval('public.auction_number_seq')
FROM to_fill tf
WHERE p.id = tf.id;

-- Enforce NOT NULL and UNIQUE after backfill
ALTER TABLE public.player_registrations
ALTER COLUMN auction_number SET NOT NULL;

ALTER TABLE public.player_registrations
ADD CONSTRAINT player_registrations_auction_number_key UNIQUE (auction_number);



