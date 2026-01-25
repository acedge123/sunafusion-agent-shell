-- Add domain_summary column to repo_map table
-- This stores high-level "WHY" and "HOW" summaries for each repository

ALTER TABLE public.repo_map 
ADD COLUMN IF NOT EXISTS domain_summary TEXT;

-- Update full text search to include domain summaries
-- This makes domain summaries searchable via search_repo_map()
CREATE OR REPLACE FUNCTION update_repo_map_full_text_search()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_text_search = 
    COALESCE(NEW.repo_name, '') || ' ' ||
    COALESCE(NEW.origin, '') || ' ' ||
    COALESCE(array_to_string(NEW.stack, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.integrations, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.supabase_functions, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.tables, ' '), '') || ' ' ||
    COALESCE(NEW.domain_summary, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS update_repo_map_full_text_search_trigger ON public.repo_map;
CREATE TRIGGER update_repo_map_full_text_search_trigger
  BEFORE INSERT OR UPDATE ON public.repo_map
  FOR EACH ROW
  EXECUTE FUNCTION update_repo_map_full_text_search();

-- Update existing rows to include domain_summary in full_text_search
UPDATE public.repo_map
SET full_text_search = 
  COALESCE(repo_name, '') || ' ' ||
  COALESCE(origin, '') || ' ' ||
  COALESCE(array_to_string(stack, ' '), '') || ' ' ||
  COALESCE(array_to_string(integrations, ' '), '') || ' ' ||
  COALESCE(array_to_string(supabase_functions, ' '), '') || ' ' ||
  COALESCE(array_to_string(tables, ' '), '') || ' ' ||
  COALESCE(domain_summary, '');

COMMENT ON COLUMN public.repo_map.domain_summary IS 'High-level "WHY" and "HOW" summary of the repository. Includes purpose, primary flows, dependencies, and change impact warnings. Used for meta/exploratory questions.';
