-- Create agent_memories table for storing durable facts/preferences
-- This is a lightweight "facts" layer separate from chat messages

CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  confidence NUMERIC(3, 2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_agent_memories_user_id ON public.agent_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_tags ON public.agent_memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agent_memories_updated_at ON public.agent_memories(updated_at DESC);

-- RLS policies
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own memories
CREATE POLICY "Users can view their own memories"
  ON public.agent_memories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert their own memories"
  ON public.agent_memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
CREATE POLICY "Users can update their own memories"
  ON public.agent_memories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own memories
CREATE POLICY "Users can delete their own memories"
  ON public.agent_memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_agent_memories_updated_at
  BEFORE UPDATE ON public.agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_memories_updated_at();

COMMENT ON TABLE public.agent_memories IS 'Stores durable facts and preferences for the agent, separate from chat messages. Used for remembering system setup, user preferences, and project context.';
