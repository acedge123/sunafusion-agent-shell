
-- Create a table for Slack access tokens
CREATE TABLE IF NOT EXISTS public.slack_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.slack_access ENABLE ROW LEVEL SECURITY;

-- Create policies for Slack access
CREATE POLICY "Users can view their own Slack tokens"
  ON public.slack_access
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Slack tokens"
  ON public.slack_access
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Slack tokens"
  ON public.slack_access
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Slack tokens"
  ON public.slack_access
  FOR DELETE
  USING (auth.uid() = user_id);
