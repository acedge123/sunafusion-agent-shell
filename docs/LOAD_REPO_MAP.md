# Loading Repo-Map into Supabase

The `repo_map` table was created by the migration, but it needs to be populated with data.

## Quick Load

Run the loader script:

```bash
# Set environment variables (get from Supabase dashboard)
export SUPABASE_URL="https://nljlsqgldgmxlbylqazg.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Load the data
npm run repo-map:load
```

Or use the npm script directly (if env vars are set):

```bash
npm run repo-map:load
```

## What It Does

1. Reads `repo-map/inventory.json`
2. Reads `repo-map/routes-and-functions.md`
3. Reads `repo-map/schemas.md`
4. Reads `repo-map/integration-graph.json`
5. Parses and combines all data
6. Inserts into `repo_map` table in Supabase

## Getting Your Service Role Key

1. Go to Supabase Dashboard → Project Settings → API
2. Copy the "service_role" key (not the anon key)
3. Set it as `SUPABASE_SERVICE_ROLE_KEY` environment variable

## Verify It Worked

```sql
SELECT COUNT(*) FROM repo_map;
-- Should return 54 (or however many repos you have)

SELECT * FROM search_repo_map('webhook');
-- Should return repos with webhooks
```

## Updating the Data

After regenerating the repo-map:

```bash
# 1. Regenerate the map
npm run repo-map:scan

# 2. Reload into Supabase
npm run repo-map:load
```
