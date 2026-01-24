# Canonical Routing & Critical Fixes Checklist

## Goal
Make Edge unified-agent the default chat brain (90% of usage). Backend agentpress becomes "power tools" for heavy jobs only.

---

## Step 1: Implement Canonical Routing Policy

### Frontend Changes
- [ ] Update `src/pages/Chat.tsx` to default to unified-agent
- [ ] Add UI toggle/button for "Run in Sandbox" / "Heavy Task" mode
- [ ] When heavy mode selected → route to backend agentpress API
- [ ] Default behavior → route to `supabase.functions.invoke('unified-agent')`

**Files to modify:**
- `src/pages/Chat.tsx`
- `src/services/api/messageService.ts`

### Backend Changes
- [ ] Add endpoint guard/check: Is this a "heavy" task?
- [ ] Heavy task indicators:
  - User explicitly requests "sandbox", "deploy", "run code", "multi-step"
  - File uploads present
  - Explicit "agent" mode requested
- [ ] Light tasks → return redirect/instruction to use unified-agent
- [ ] Heavy tasks → proceed with agentpress

**Files to modify:**
- `backend/agent/api.py` - Add routing logic
- `backend/api.py` - Add middleware/guard

---

## Step 2: Fix High-Risk Issues

### A) JWT Signature Verification

**Current Issue:** `backend/utils/auth_utils.py:38` uses `verify_signature=False`

**Fix:**
- [ ] Update `get_current_user_id()` to verify signature when JWT present
- [ ] Get JWT secret from Supabase (use `SUPABASE_JWT_SECRET` env var or fetch from Supabase)
- [ ] Rule: If `Authorization` header exists → verify signature (fail closed)
- [ ] If no auth header → allow anon (for public projects)
- [ ] Update `get_optional_user_id()` with same logic
- [ ] Update `get_user_id_from_stream_auth()` with same logic

**Files to modify:**
- `backend/utils/auth_utils.py`
- Add `SUPABASE_JWT_SECRET` to env vars (or fetch from Supabase config)

**Edge Function:**
- [ ] Update `supabase/functions/unified-agent/index.ts` auth handling
- [ ] Verify token with Supabase client (already does this via `supabase.auth.getUser()`)

### B) Retention / Bloat Prevention

**Option 1: Nightly Cleanup Job (Recommended)**
- [ ] Create Supabase Edge Function: `cleanup-old-data`
- [ ] Schedule via pg_cron or external cron:
  - Delete expired `creator_iq_state` (where `expires_at < now()`)
  - Summarize/prune old messages (e.g., messages > 90 days old)
  - Archive old `agent_runs` (status = completed, > 30 days)
- [ ] Add to `supabase/functions/` directory

**Option 2: Project Archive Switch**
- [ ] Add `archived_at` column to `projects` table
- [ ] Add UI toggle to archive project
- [ ] When archived → prune messages, agent_runs for that project
- [ ] Keep summaries only

**Files to create/modify:**
- `supabase/functions/cleanup-old-data/index.ts` (new)
- `supabase/migrations/YYYYMMDD_add_cleanup_function.sql` (new)
- Or: `backend/supabase/migrations/YYYYMMDD_add_archive_column.sql` (if Option 2)

---

## Step 3: Connect Repo-Map to Agent

### Add Repo-Map Search Tool to Unified-Agent

- [ ] Create tool function in `supabase/functions/unified-agent/`
- [ ] Function: `searchRepoMap(query: string)`
- [ ] Implementation:
  ```typescript
  const { data, error } = await supabase.rpc('search_repo_map', { query });
  ```
- [ ] Add to tools array in unified-agent
- [ ] Add heuristic detection:
  - Keywords: "where is", "which repo", "which function", "table", "webhook", "CIQ", "Shopify", "BigCommerce"
  - Pattern matching in query text
- [ ] When detected → call `searchRepoMap()` before AI synthesis
- [ ] Feed results into LLM prompt as context
- [ ] Format response: repo name + function/table + owner + related repos

**Files to modify:**
- `supabase/functions/unified-agent/index.ts`
- `supabase/functions/unified-agent/agent/taskRunner.ts` (or create new tool file)

**Example Integration:**
```typescript
// In unified-agent/index.ts, before AI synthesis:
const repoMapQuery = detectRepoMapQuery(query);
if (repoMapQuery) {
  const { data: repoResults } = await supabase.rpc('search_repo_map', { 
    query: repoMapQuery 
  });
  // Add to context for AI
  context.push({
    source: "repo_map",
    results: repoResults
  });
}
```

---

## Testing Checklist

- [ ] Test default chat → routes to unified-agent
- [ ] Test "run in sandbox" → routes to backend agentpress
- [ ] Test JWT verification with valid token → succeeds
- [ ] Test JWT verification with invalid token → fails
- [ ] Test anon access to public project → succeeds
- [ ] Test repo-map search with "which repo has webhooks" → returns results
- [ ] Test cleanup job runs and deletes expired data
- [ ] Verify no database bloat after cleanup

---

## Priority Order

1. **JWT Verification** (Security - do first)
2. **Repo-Map Integration** (High value, low effort)
3. **Canonical Routing** (Architecture - do after 1 & 2)
4. **Retention Job** (Can be scheduled, less urgent)

---

## Notes

- The `search_repo_map()` SQL function already exists in `supabase/migrations/20260125000000_repo_map.sql`
- Repo-map data is already loaded via `tools/load-repo-map-to-supabase.mjs`
- Edge function already has Supabase client initialized
- Backend auth utils need JWT secret - can get from Supabase project settings or env var
