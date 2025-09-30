-- Create a table for player registrations
CREATE TABLE public.player_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  role_number TEXT NOT NULL,
  photo_url TEXT,
  position TEXT NOT NULL CHECK (position IN ('batsman', 'bowler', 'wicket-keeper')),
  season1_team TEXT NOT NULL CHECK (season1_team IN ('mumbai-mavericks', 'chennai-champions', 'kolkata-knights', 'delhi-dynamos', 'bangalore-blazers', 'rajasthan-royals')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert registrations (public registration)
CREATE POLICY "Anyone can register players" 
ON public.player_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view registrations (for admin purposes)
CREATE POLICY "Anyone can view registrations" 
ON public.player_registrations 
FOR SELECT 
USING (true);

-- Create storage bucket for player photos
INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true);

-- Create policies for photo uploads
CREATE POLICY "Anyone can upload player photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Anyone can view player photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'player-photos');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_player_registrations_updated_at
BEFORE UPDATE ON public.player_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();