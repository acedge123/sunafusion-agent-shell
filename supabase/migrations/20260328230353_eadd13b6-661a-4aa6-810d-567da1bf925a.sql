
-- Create storage bucket for agent files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('agent-files', 'agent-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Create metadata table for agent files
CREATE TABLE IF NOT EXISTS public.agent_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_path text,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  tags text[],
  description text,
  source text DEFAULT 'agent',
  owner_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.agent_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own files" ON public.agent_files
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owner can insert own files" ON public.agent_files
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can delete own files" ON public.agent_files
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Service role can manage all files" ON public.agent_files
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Storage RLS: service role can do anything (agent uploads via service role)
CREATE POLICY "Service role full access to agent-files" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'agent-files') WITH CHECK (bucket_id = 'agent-files');

CREATE POLICY "Authenticated users can read own agent-files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'agent-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Updated_at trigger
CREATE TRIGGER update_agent_files_updated_at
  BEFORE UPDATE ON public.agent_files
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
