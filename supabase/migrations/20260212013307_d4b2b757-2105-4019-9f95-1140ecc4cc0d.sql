
-- Add subject and ownership columns to agent_learnings
ALTER TABLE public.agent_learnings
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS subject_type text,
  ADD COLUMN IF NOT EXISTS subject_id text,
  ADD COLUMN IF NOT EXISTS subject_name text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS redaction_level text NOT NULL DEFAULT 'sensitive';

-- Composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_agent_learnings_owner_subject
  ON public.agent_learnings (owner_id, kind, subject_type, subject_id);

-- GIN index on tags (if not already present)
CREATE INDEX IF NOT EXISTS idx_agent_learnings_tags_gin
  ON public.agent_learnings USING GIN (tags);

-- Text search index on title + summary
CREATE INDEX IF NOT EXISTS idx_agent_learnings_text_search
  ON public.agent_learnings USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, ''))
  );

-- Add owner-based RLS policies (supplement existing visibility-based ones)
CREATE POLICY "Owner can read own learnings"
  ON public.agent_learnings FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can insert own learnings"
  ON public.agent_learnings FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update own learnings"
  ON public.agent_learnings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete own learnings"
  ON public.agent_learnings FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
