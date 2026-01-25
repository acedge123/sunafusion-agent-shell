-- Add domain_summary column to repo_map table
ALTER TABLE public.repo_map
ADD COLUMN IF NOT EXISTS domain_summary text;