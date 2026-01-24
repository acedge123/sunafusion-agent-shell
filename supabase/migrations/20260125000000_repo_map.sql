-- Create repo_map table for storing repository mapping data
CREATE TABLE IF NOT EXISTS public.repo_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_name TEXT NOT NULL UNIQUE,
  origin TEXT,
  stack TEXT[],
  integrations TEXT[],
  supabase_functions TEXT[],
  api_routes_pages TEXT[],
  api_routes_app TEXT[],
  tables TEXT[],
  table_owner BOOLEAN DEFAULT false,
  shared_tables TEXT[],
  override JSONB DEFAULT '{}'::jsonb,
  full_text_search TEXT, -- Denormalized text for search
  metadata JSONB DEFAULT '{}'::jsonb, -- Store full JSON for flexibility
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for full text search
CREATE INDEX idx_repo_map_full_text_search ON public.repo_map USING gin(to_tsvector('english', full_text_search));

-- Create index for integrations (array search)
CREATE INDEX idx_repo_map_integrations ON public.repo_map USING gin(integrations);

-- Create index for supabase_functions (array search)
CREATE INDEX idx_repo_map_functions ON public.repo_map USING gin(supabase_functions);

-- Create index for tables (array search)
CREATE INDEX idx_repo_map_tables ON public.repo_map USING gin(tables);

-- Create index for repo_name
CREATE INDEX idx_repo_map_name ON public.repo_map(repo_name);

-- Enable Row Level Security (public read, admin write)
ALTER TABLE public.repo_map ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access to repo_map"
  ON public.repo_map
  FOR SELECT
  TO public
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_repo_map_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_repo_map_updated_at
  BEFORE UPDATE ON public.repo_map
  FOR EACH ROW
  EXECUTE FUNCTION update_repo_map_updated_at();

-- Helper function for text search
CREATE OR REPLACE FUNCTION search_repo_map(query TEXT)
RETURNS TABLE (
  repo_name TEXT,
  origin TEXT,
  integrations TEXT[],
  supabase_functions TEXT[],
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rm.repo_name,
    rm.origin,
    rm.integrations,
    rm.supabase_functions,
    ts_rank(to_tsvector('english', rm.full_text_search), plainto_tsquery('english', query)) as relevance
  FROM public.repo_map rm
  WHERE to_tsvector('english', rm.full_text_search) @@ plainto_tsquery('english', query)
  ORDER BY relevance DESC;
END;
$$ LANGUAGE plpgsql;
