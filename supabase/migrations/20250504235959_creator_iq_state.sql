
-- Create table for storing Creator IQ state information
CREATE TABLE IF NOT EXISTS public.creator_iq_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  query_context TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS creator_iq_state_user_id_idx ON public.creator_iq_state(user_id);
CREATE INDEX IF NOT EXISTS creator_iq_state_expires_at_idx ON public.creator_iq_state(expires_at);

-- Add RLS policies to secure the table
ALTER TABLE public.creator_iq_state ENABLE ROW LEVEL SECURITY;

-- Users can only read their own state
CREATE POLICY "Users can read their own Creator IQ state" 
  ON public.creator_iq_state 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own state
CREATE POLICY "Users can insert their own Creator IQ state" 
  ON public.creator_iq_state 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own state
CREATE POLICY "Users can update their own Creator IQ state" 
  ON public.creator_iq_state 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only delete their own state
CREATE POLICY "Users can delete their own Creator IQ state" 
  ON public.creator_iq_state 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_creator_iq_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_iq_state_updated_at
  BEFORE UPDATE ON public.creator_iq_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creator_iq_state_updated_at();

-- Add function to clean up expired state
CREATE OR REPLACE FUNCTION public.cleanup_expired_creator_iq_state()
RETURNS void AS $$
BEGIN
  DELETE FROM public.creator_iq_state
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- This function can be called periodically via a cron job or similar
