# Agent Vault Expansion — Changelog

**Date:** 2026-02-20

## Summary

The Agent Vault edge function (`supabase/functions/agent-vault/index.ts`) was expanded from a learnings + jobs + Composio proxy API into a full life/business assistant backend. Two new database tables were added and 15 new endpoints were implemented.

---

## New Database Tables

### `agent_contacts`

A dedicated people/entity directory replacing scattered person-type learnings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto-generated |
| `owner_id` | uuid | Nullable, for user/family scoping |
| `name` | text | Required |
| `email` | text | Optional, used for upsert |
| `phone` | text | Optional |
| `company` | text | Optional |
| `role` | text | e.g. `client`, `family`, `vendor` |
| `notes` | text | Free-form notes |
| `tags` | text[] | Filterable tags |
| `metadata` | jsonb | Arbitrary structured data |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

**RLS:** Owner-scoped CRUD for authenticated users + service role bypass.  
**Indexes:** `owner_id`, `email` (where not null).

### `agent_tasks`

Human-facing task tracking, distinct from the machine-to-machine `jobs` table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto-generated |
| `owner_id` | uuid | Nullable |
| `title` | text | Required |
| `description` | text | Optional |
| `status` | text | `todo` (default), `in_progress`, `done`, `cancelled` |
| `priority` | text | `low`, `medium` (default), `high`, `urgent` |
| `due_date` | timestamptz | Optional |
| `completed_at` | timestamptz | Auto-set when status → `done` |
| `domain` | text | e.g. `personal`, `business`, `family` |
| `tags` | text[] | Filterable tags |
| `source` | text | Which agent created it (default `agent`) |
| `related_learning_id` | uuid | FK to `agent_learnings`, ON DELETE SET NULL |
| `metadata` | jsonb | Arbitrary structured data |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

**RLS:** Owner-scoped CRUD for authenticated users + service role bypass.  
**Indexes:** `status`, `(owner_id, status)`, `due_date` (where not null).

---

## New Endpoints

### Learnings Enhancements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/learnings/stats` | Aggregate counts by kind, domain, source, status. Optional `since` filter. |
| `POST` | `/learnings/bulk` | Batch insert up to 50 learnings. Returns per-item success/error. Body: `{ "items": [...] }` |
| `PATCH` | `/learnings/:id` | Update a learning. Immutable fields (`id`, `created_at`, `source`) are rejected with a warning. |
| `DELETE` | `/learnings/:id` | Hard delete. Add `?soft=true` to soft-delete (sets `status = 'rejected'`). |

### Contacts CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contacts/list` | List contacts. Filters: `role`, `company` (partial match). Default limit 50. |
| `GET` | `/contacts/search?q=` | Search across name, email, company, notes. |
| `POST` | `/contacts` | Create contact. Upserts by email if provided. Required: `name`. |
| `PATCH` | `/contacts/:id` | Update contact fields. |
| `DELETE` | `/contacts/:id` | Delete contact. Returns deleted record. |

### Tasks CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks/list` | List tasks. Filters: `status`, `domain`, `priority`. Default limit 50. |
| `POST` | `/tasks` | Create task. Required: `title`. Auto-defaults: `status=todo`, `priority=medium`. |
| `PATCH` | `/tasks/:id` | Update task. Setting `status=done` auto-sets `completed_at`; reverting clears it. |
| `DELETE` | `/tasks/:id` | Delete task. Returns deleted record. |

### Jobs Enhancement

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs/list` | List job history. Filters: `status`, `type`, `since`. Default limit 20. |

---

## Pre-Existing Endpoints (Unchanged)

| Method | Endpoint |
|--------|----------|
| `GET` | `/health` |
| `GET` | `/repo_map/count` |
| `GET` | `/repo_map/get?name=` |
| `GET` | `/repo_map/search?q=` |
| `GET` | `/learnings/list` |
| `GET` | `/learnings/search?q=` |
| `GET` | `/learnings/feed` |
| `GET` | `/learnings/get?id=` |
| `GET` | `/learnings/:id` |
| `POST` | `/learnings` |
| `POST` | `/jobs/next` |
| `POST` | `/jobs/ack` |
| `POST` | `/chat/submit` (JWT auth) |
| `GET` | `/composio/toolkits` |
| `GET` | `/composio/tools` |
| `GET` | `/composio/tools/:slug` |
| `POST` | `/composio/tools/execute` |
| `POST` | `/composio/webhook` (no auth) |

---

## Security Notes

- All new endpoints use the existing `AGENT_EDGE_KEY` bearer token auth gate.
- No new secrets were required.
- Both new tables use restrictive RLS: owner-scoped for authenticated users, full access for service role only.
- The `service_role` `USING (true)` policies on `agent_contacts`, `agent_tasks`, `jobs`, and `agent_learnings` are intentional — agents authenticate via `AGENT_EDGE_KEY` and the edge function uses the service role client.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/agent-vault/index.ts` | Added 15 new endpoint handlers |
| `docs/AGENT_VAULT_API.md` | Full rewrite with all 29 endpoints documented |
| `supabase/migrations/` | New migration: `agent_contacts` + `agent_tasks` tables, RLS, triggers, indexes |
