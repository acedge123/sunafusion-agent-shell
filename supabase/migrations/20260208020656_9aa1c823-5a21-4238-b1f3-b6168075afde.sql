-- Add kind and visibility columns to agent_learnings
ALTER TABLE public.agent_learnings 
ADD COLUMN IF NOT EXISTS kind text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_agent_learnings_kind ON public.agent_learnings(kind);
CREATE INDEX IF NOT EXISTS idx_agent_learnings_visibility ON public.agent_learnings(visibility);
CREATE INDEX IF NOT EXISTS idx_agent_learnings_created_at ON public.agent_learnings(created_at DESC);

-- Update RLS policies for visibility-based access
-- Drop existing policies first
DROP POLICY IF EXISTS "Public read access to agent_learnings" ON public.agent_learnings;

-- Authenticated users can read family + public visibility learnings
CREATE POLICY "Authenticated read family/public learnings"
  ON public.agent_learnings FOR SELECT TO authenticated
  USING (visibility IN ('public', 'family'));

-- Anon users can only read public visibility learnings
CREATE POLICY "Anon read public learnings"
  ON public.agent_learnings FOR SELECT TO anon
  USING (visibility = 'public');

-- Keep service role full access (already exists, but ensure it's there)
DROP POLICY IF EXISTS "Service role can write agent_learnings" ON public.agent_learnings;
CREATE POLICY "Service role can manage all learnings"
  ON public.agent_learnings FOR ALL
  USING (true)
  WITH CHECK (true);