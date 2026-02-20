

# Agent Vault: Robustness & Expansion Plan

## Current State Summary
You already have a solid foundation: learnings CRUD, jobs queue, Composio proxy, chat submit, and repo map. The `agent_learnings` table is well-structured with 47 records across 7 kinds.

---

## Recommended Improvements (Prioritized)

### 1. PATCH /learnings/:id -- Update a Learning
**Why**: Right now, agents can only INSERT learnings. They can't correct mistakes, update status from "draft" to "approved", or append details. This is critical for a living knowledge base.

- Allow updating: `title`, `summary`, `status`, `tags`, `confidence`, `domain`, `details_markdown`, `metadata`, `kind`
- Reject changes to `id`, `created_at`, `source` (immutable audit fields)

### 2. DELETE /learnings/:id -- Remove a Learning
**Why**: Agents and users need to prune stale or incorrect learnings. Without this, the knowledge base grows noisy over time.

- Soft-delete option (set `status = 'rejected'`) or hard delete
- Return the deleted record for confirmation

### 3. GET /learnings/stats -- Aggregate Dashboard
**Why**: Gives agents and the dashboard a quick pulse: "How many learnings by kind? By domain? By source? Last 24h vs all-time?"

- Returns counts grouped by `kind`, `domain`, `source`, `status`
- Optional `since` filter
- Useful for the Knowledge Dashboard page too

### 4. POST /learnings/bulk -- Batch Insert
**Why**: When agents do research runs or email sweeps, they produce 5-20 learnings at once. One-by-one inserts are slow and chatty.

- Accept an array of learning objects (max 50 per call)
- Return array of inserted IDs
- Validate each item, return partial success with errors

### 5. `agent_contacts` Table -- People Directory
**Why**: You're building a life/business assistant. "Who is this person?" comes up constantly. Right now, person info is scattered across `agent_learnings` with `subject_type = 'person'`. A dedicated contacts table gives structure.

**Schema:**
```text
agent_contacts
  id           uuid PK
  owner_id     uuid (nullable, for family scoping)
  name         text NOT NULL
  email        text
  phone        text
  company      text
  role         text (e.g. "client", "family", "vendor")
  notes        text
  tags         text[]
  metadata     jsonb
  created_at   timestamptz
  updated_at   timestamptz
```

**Endpoints:**
- `GET /contacts/list?role=family&limit=50`
- `GET /contacts/search?q=john`
- `POST /contacts` (upsert by email)

### 6. `agent_tasks` Table -- Personal Task Tracking
**Why**: Distinct from `jobs` (which are machine-to-machine work items). Tasks are human-facing: "remind me to call the accountant", "follow up with Nike contact". Agents should be able to create, update, and complete tasks.

**Schema:**
```text
agent_tasks
  id           uuid PK
  owner_id     uuid
  title        text NOT NULL
  description  text
  status       text (todo, in_progress, done, cancelled)
  priority     text (low, medium, high, urgent)
  due_date     timestamptz
  completed_at timestamptz
  domain       text (personal, business, family)
  tags         text[]
  source       text (which agent created it)
  related_learning_id uuid (FK to agent_learnings)
  metadata     jsonb
  created_at   timestamptz
  updated_at   timestamptz
```

**Endpoints:**
- `GET /tasks/list?status=todo&domain=business`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### 7. GET /jobs/list -- Job History & Monitoring
**Why**: Right now you can only claim the next job or ack one. There's no way to see what's been processed, what failed, or what's stuck.

- `GET /jobs/list?status=done&limit=20`
- `GET /jobs/list?status=failed&since=2025-02-01`
- Helps debug worker issues without hitting Supabase dashboard

---

## Technical Details

### Database Migrations Needed
- New table: `agent_contacts` with RLS (owner-scoped + service role bypass)
- New table: `agent_tasks` with RLS (owner-scoped + service role bypass)
- Both tables get `updated_at` triggers reusing existing `handle_updated_at()`

### Edge Function Changes (agent-vault/index.ts)
All new endpoints follow existing patterns:
- Same auth gate (AGENT_EDGE_KEY for agent endpoints)
- Same `json()` helper and `clampInt()` for parameter validation
- Same error handling with structured error responses

### No New Secrets Required
All changes use existing Supabase service role -- no new API keys needed.

### Implementation Order
1. PATCH + DELETE learnings (quick wins, no schema changes)
2. GET /learnings/stats (quick win, no schema changes)
3. POST /learnings/bulk (quick win, no schema changes)
4. GET /jobs/list (quick win, no schema changes)
5. `agent_contacts` table + endpoints (migration + code)
6. `agent_tasks` table + endpoints (migration + code)

