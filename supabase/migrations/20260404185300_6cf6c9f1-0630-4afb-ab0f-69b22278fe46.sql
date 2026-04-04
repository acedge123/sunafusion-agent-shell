
-- 1. wiki_sources
CREATE TABLE public.wiki_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  source_type text NOT NULL,
  title text,
  source_url text,
  external_id text,
  raw_text text,
  raw_markdown text,
  raw_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ingested_at timestamptz NOT NULL DEFAULT now(),
  source_date timestamptz,
  status text NOT NULL DEFAULT 'raw',
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2. wiki_pages
CREATE TABLE public.wiki_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  slug text NOT NULL,
  page_type text NOT NULL,
  title text NOT NULL,
  summary text,
  body_markdown text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  source_count integer NOT NULL DEFAULT 0,
  updated_from_run_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (owner_id, slug)
);

-- 3. wiki_page_sources
CREATE TABLE public.wiki_page_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  page_id uuid NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.wiki_sources(id) ON DELETE CASCADE,
  role text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX wiki_page_sources_unique_idx ON public.wiki_page_sources (page_id, source_id, COALESCE(role, ''));

-- 4. wiki_runs
CREATE TABLE public.wiki_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  run_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. wiki_artifacts
CREATE TABLE public.wiki_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  artifact_type text NOT NULL,
  title text NOT NULL,
  body_markdown text,
  body_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_run_id uuid REFERENCES public.wiki_runs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- FK for updated_from_run_id
ALTER TABLE public.wiki_pages
  ADD CONSTRAINT wiki_pages_updated_from_run_id_fkey
  FOREIGN KEY (updated_from_run_id) REFERENCES public.wiki_runs(id) ON DELETE SET NULL;

-- updated_at triggers
CREATE TRIGGER wiki_pages_updated_at BEFORE UPDATE ON public.wiki_pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER wiki_runs_updated_at BEFORE UPDATE ON public.wiki_runs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: wiki_sources
ALTER TABLE public.wiki_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner select wiki_sources" ON public.wiki_sources FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner insert wiki_sources" ON public.wiki_sources FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update wiki_sources" ON public.wiki_sources FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete wiki_sources" ON public.wiki_sources FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role wiki_sources" ON public.wiki_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: wiki_pages
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner select wiki_pages" ON public.wiki_pages FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner insert wiki_pages" ON public.wiki_pages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update wiki_pages" ON public.wiki_pages FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete wiki_pages" ON public.wiki_pages FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role wiki_pages" ON public.wiki_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: wiki_page_sources
ALTER TABLE public.wiki_page_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner select wiki_page_sources" ON public.wiki_page_sources FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner insert wiki_page_sources" ON public.wiki_page_sources FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update wiki_page_sources" ON public.wiki_page_sources FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete wiki_page_sources" ON public.wiki_page_sources FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role wiki_page_sources" ON public.wiki_page_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: wiki_runs
ALTER TABLE public.wiki_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner select wiki_runs" ON public.wiki_runs FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner insert wiki_runs" ON public.wiki_runs FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update wiki_runs" ON public.wiki_runs FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete wiki_runs" ON public.wiki_runs FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role wiki_runs" ON public.wiki_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: wiki_artifacts
ALTER TABLE public.wiki_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner select wiki_artifacts" ON public.wiki_artifacts FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner insert wiki_artifacts" ON public.wiki_artifacts FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update wiki_artifacts" ON public.wiki_artifacts FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete wiki_artifacts" ON public.wiki_artifacts FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role wiki_artifacts" ON public.wiki_artifacts FOR ALL TO service_role USING (true) WITH CHECK (true);
