-- Ensure auction_number auto-generates for new rows and sequence is owned by the column
ALTER TABLE public.player_registrations
ALTER COLUMN auction_number SET DEFAULT nextval('public.auction_number_seq');

-- Make the sequence owned by the column so it's dropped automatically if column is dropped
ALTER SEQUENCE public.auction_number_seq OWNED BY public.player_registrations.auction_number;



