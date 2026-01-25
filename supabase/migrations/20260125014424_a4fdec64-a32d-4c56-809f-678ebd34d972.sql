-- Create repo_map table for storing repository metadata
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
  full_text_search TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.repo_map ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read repo_map (internal tool data)
CREATE POLICY "Authenticated users can read repo_map"
ON public.repo_map FOR SELECT
TO authenticated
USING (true);

-- Allow anon users to read as well (for the agent which may not have auth)
CREATE POLICY "Anon users can read repo_map"
ON public.repo_map FOR SELECT
TO anon
USING (true);

-- Create index for full text search
CREATE INDEX IF NOT EXISTS idx_repo_map_full_text 
ON public.repo_map USING gin(to_tsvector('english', full_text_search));

-- Create search function
CREATE OR REPLACE FUNCTION search_repo_map(query TEXT)
RETURNS TABLE (
  repo_name TEXT,
  origin TEXT,
  integrations TEXT[],
  supabase_functions TEXT[],
  tables TEXT[],
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rm.repo_name,
    rm.origin,
    rm.integrations,
    rm.supabase_functions,
    rm.tables,
    ts_rank(to_tsvector('english', rm.full_text_search), plainto_tsquery('english', query)) as relevance
  FROM public.repo_map rm
  WHERE to_tsvector('english', rm.full_text_search) @@ plainto_tsquery('english', query)
  ORDER BY relevance DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also add a simple count function for "how many repos" queries
CREATE OR REPLACE FUNCTION count_repo_map()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.repo_map);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;