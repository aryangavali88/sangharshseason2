-- Add RLS policy for PREVIOUS YEAR STATS table since it has RLS enabled but no policies
-- This is public data that should be viewable by everyone
CREATE POLICY "Anyone can view previous year stats" 
ON public."PREVIOUS YEAR STATS" 
FOR SELECT 
USING (true);