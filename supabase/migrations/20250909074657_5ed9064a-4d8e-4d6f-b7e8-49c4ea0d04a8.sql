-- Add unsold tracking to player_registrations table
ALTER TABLE public.player_registrations 
ADD COLUMN is_unsold boolean DEFAULT false;

-- Add auction round tracking table
CREATE TABLE public.auction_rounds (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    round_type text NOT NULL DEFAULT 'main', -- 'main' or 'unsold'
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on auction_rounds
ALTER TABLE public.auction_rounds ENABLE ROW LEVEL SECURITY;

-- Create policies for auction_rounds
CREATE POLICY "Anyone can view auction rounds" 
ON public.auction_rounds 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auction rounds" 
ON public.auction_rounds 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update auction rounds" 
ON public.auction_rounds 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete auction rounds" 
ON public.auction_rounds 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_auction_rounds_updated_at
BEFORE UPDATE ON public.auction_rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add policy to allow updating player_registrations for unsold status
CREATE POLICY "Anyone can update player unsold status" 
ON public.player_registrations 
FOR UPDATE 
USING (true);