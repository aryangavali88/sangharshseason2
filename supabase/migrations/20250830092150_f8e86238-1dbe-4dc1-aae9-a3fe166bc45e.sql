-- Create auction_bids table to store all bids and winning bids
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  is_winning_bid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is auction data)
CREATE POLICY "Anyone can view auction bids" 
ON public.auction_bids 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auction bids" 
ON public.auction_bids 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete auction bids" 
ON public.auction_bids 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_auction_bids_updated_at
BEFORE UPDATE ON public.auction_bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();