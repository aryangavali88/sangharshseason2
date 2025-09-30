-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  initial_points BIGINT NOT NULL DEFAULT 20000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for teams access (public viewing)
CREATE POLICY "Anyone can view teams" 
ON public.teams 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update teams" 
ON public.teams 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Insert the 6 teams with 20000 points each
INSERT INTO public.teams (name, initial_points) VALUES 
('Mumbai Titans', 20000),
('Delhi Dynamos', 20000),
('Chennai Champions', 20000),
('Kolkata Knights', 20000),
('Bangalore Blazers', 20000),
('Hyderabad Hawks', 20000);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();