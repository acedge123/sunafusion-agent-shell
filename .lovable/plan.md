

## Plan: Fix Database Function Search Path Vulnerabilities

### Problem
The Supabase linter flagged 9 database functions with "Search Path Mutable" vulnerability. This occurs when functions don't explicitly set their `search_path`, making them potentially susceptible to search path injection attacks where a malicious actor could hijack function behavior by manipulating the schema search order.

### Functions to Fix

All 9 functions in the `public` schema need `SET search_path = public` added:

| Function | Purpose |
|----------|---------|
| `update_creator_iq_state_updated_at()` | Trigger: auto-update timestamp |
| `cleanup_expired_creator_iq_state()` | Cleanup: remove expired state |
| `update_agent_learnings_updated_at()` | Trigger: auto-update timestamp |
| `search_repo_map(text)` | Search: full-text repo search |
| `count_repo_map()` | Utility: count repos |
| `search_agent_learnings(text, integer)` | Search: find learnings |
| `update_updated_at_column()` | Trigger: generic timestamp update |
| `handle_new_user()` | Trigger: create profile on signup |
| `handle_updated_at()` | Trigger: generic timestamp update |

### SQL Migration

Execute a single migration that recreates each function with the secure search_path setting:

```sql
-- 1. update_creator_iq_state_updated_at
CREATE OR REPLACE FUNCTION public.update_creator_iq_state_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. cleanup_expired_creator_iq_state
CREATE OR REPLACE FUNCTION public.cleanup_expired_creator_iq_state()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.creator_iq_state
  WHERE expires_at < now();
END;
$function$;

-- 3. update_agent_learnings_updated_at
CREATE OR REPLACE FUNCTION public.update_agent_learnings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. search_repo_map
CREATE OR REPLACE FUNCTION public.search_repo_map(query text)
RETURNS TABLE(repo_name text, origin text, integrations text[], supabase_functions text[], tables text[], relevance real)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 5. count_repo_map
CREATE OR REPLACE FUNCTION public.count_repo_map()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.repo_map);
END;
$function$;

-- 6. search_agent_learnings
CREATE OR REPLACE FUNCTION public.search_agent_learnings(query text, limit_count integer DEFAULT 10)
RETURNS TABLE(id uuid, learning text, category text, tags text[], source text, relevance real)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.learning,
    al.category,
    al.tags,
    al.source,
    ts_rank(to_tsvector('english', al.learning), plainto_tsquery('english', query)) as relevance
  FROM public.agent_learnings al
  WHERE to_tsvector('english', al.learning) @@ plainto_tsquery('english', query)
  ORDER BY relevance DESC, created_at DESC
  LIMIT limit_count;
END;
$function$;

-- 7. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 8. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id);
  RETURN new;
END;
$function$;

-- 9. handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
```

### Implementation Steps

1. **Create migration file** with the SQL above
2. **Run migration** via Supabase dashboard or CLI
3. **Re-run linter** to verify warnings are resolved

### Security Notes

- `SET search_path = public` ensures functions only resolve objects from the `public` schema
- Functions with `SECURITY DEFINER` (search_repo_map, count_repo_map, handle_new_user) are especially important to secure as they run with elevated privileges
- This is a non-breaking change - function behavior remains identical

