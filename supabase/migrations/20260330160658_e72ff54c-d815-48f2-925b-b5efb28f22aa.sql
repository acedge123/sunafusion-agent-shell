
-- Migrate kind values to new taxonomy and add surface tags

-- 1. Map old kinds to new taxonomy
-- research_summary → research
UPDATE public.agent_learnings SET kind = 'research' WHERE kind = 'research_summary';

-- memory → reference
UPDATE public.agent_learnings SET kind = 'reference' WHERE kind = 'memory';

-- general → reference
UPDATE public.agent_learnings SET kind = 'reference' WHERE kind = 'general';

-- decision stays as decision

-- email_summary → reference, add surface:email tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:email')
WHERE kind = 'email_summary';

-- github_push_summary → reference, add surface:github tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:github')
WHERE kind = 'github_push_summary';

-- code_change → reference, add surface:github tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:github')
WHERE kind = 'code_change';

-- composio_trigger → reference, add surface:composio tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:composio')
WHERE kind = 'composio_trigger';

-- image_generation → reference, add surface:imagen tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:imagen')
WHERE kind = 'image_generation';

-- db_query_result → reference, add surface:db tag
UPDATE public.agent_learnings 
SET kind = 'reference', 
    tags = array_append(COALESCE(tags, '{}'), 'surface:db')
WHERE kind = 'db_query_result';

-- chat_query and chat_response stay as-is (internal, not shown in main tabs)
