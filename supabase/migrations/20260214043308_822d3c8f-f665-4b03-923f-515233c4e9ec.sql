
-- Add new columns for expanded learning storage
ALTER TABLE public.agent_learnings
  ADD COLUMN IF NOT EXISTS domain text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS source_refs text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS details_markdown text DEFAULT NULL;

-- Index on domain + status for filtering
CREATE INDEX IF NOT EXISTS idx_agent_learnings_domain ON public.agent_learnings (domain);
CREATE INDEX IF NOT EXISTS idx_agent_learnings_status ON public.agent_learnings (status);
