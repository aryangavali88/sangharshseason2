-- Create current_auction_player table to sync auction state across all users
CREATE TABLE public.current_auction_player (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  role_number TEXT NOT NULL,
  season1_team TEXT NOT NULL,
  position TEXT NOT NULL,
  class TEXT NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.current_auction_player ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view current auction player" 
ON public.current_auction_player 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create current auction player" 
ON public.current_auction_player 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update current auction player" 
ON public.current_auction_player 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete current auction player" 
ON public.current_auction_player 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_current_auction_player_updated_at
BEFORE UPDATE ON public.current_auction_player
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();