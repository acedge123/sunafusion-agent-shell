# Repo Map Database

This directory contains the repository mapping data and tools to make it queryable in Supabase.

## Files

- `inventory.json` - Complete repository inventory with metadata
- `inventory.md` - Human-readable inventory
- `routes-and-functions.md` - API routes and Supabase Edge Functions mapping
- `schemas.md` - Database schema ownership mapping
- `integration-graph.md` - Strategic integration relationships
- `integration-graph.json` - Machine-readable graph data
- `overrides.json` - Manual overrides for repo relationships (duplicates, aliases, etc.)

## Loading into Supabase

To make the repo-map queryable in Supabase:

1. **Run the migration** to create the `repo_map` table:
   ```bash
   supabase migration up
   ```

2. **Set environment variables**:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Load the data**:
   ```bash
   node tools/load-repo-map-to-supabase.mjs
   ```

## Querying Examples

Once loaded, you can query the data:

### Find repos with webhooks
```sql
SELECT repo_name, origin, integrations 
FROM repo_map 
WHERE 'webhook' = ANY(integrations);
```

### Find where Meta CAPI is used
```sql
SELECT repo_name, supabase_functions 
FROM repo_map 
WHERE 'meta' = ANY(supabase_functions) 
   OR 'meta' = ANY(integrations)
   OR full_text_search ILIKE '%meta%';
```

### Find functions that talk to CreatorIQ
```sql
SELECT repo_name, supabase_functions 
FROM repo_map 
WHERE 'creatoriq' = ANY(integrations)
   AND array_length(supabase_functions, 1) > 0;
```

### Full text search
```sql
SELECT * FROM search_repo_map('webhook');
SELECT * FROM search_repo_map('creatoriq');
SELECT * FROM search_repo_map('shopify');
```

### Find repos with shared tables
```sql
SELECT repo_name, shared_tables 
FROM repo_map 
WHERE array_length(shared_tables, 1) > 0;
```

### Find repos by stack
```sql
SELECT repo_name, stack, integrations 
FROM repo_map 
WHERE 'supabase' = ANY(stack) 
   AND 'python' = ANY(stack);
```

## Updating the Data

1. **Regenerate the map**:
   ```bash
   node tools/scan-repos.mjs
   ```

2. **Reload into Supabase**:
   ```bash
   node tools/load-repo-map-to-supabase.mjs
   ```

## Schema

The `repo_map` table includes:

- `repo_name` - Repository name (unique)
- `origin` - GitHub origin URL
- `stack` - Tech stack array (node, python, supabase, etc.)
- `integrations` - External integrations array
- `supabase_functions` - Supabase Edge Functions array
- `api_routes_pages` - Next.js Pages Router API routes
- `api_routes_app` - Next.js App Router API routes
- `tables` - Database tables owned/used by this repo
- `table_owner` - Boolean indicating if repo owns tables
- `shared_tables` - Tables shared with other repos
- `override` - Manual override metadata (JSONB)
- `full_text_search` - Denormalized text for search
- `metadata` - Additional metadata (JSONB)
- `generated_at` - When the map was generated

## Indexes

The table has indexes for:
- Full text search (GIN index on `full_text_search`)
- Array searches on `integrations`, `supabase_functions`, `tables`
- `repo_name` for direct lookups
