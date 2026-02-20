# Agent Vault API

Secure API for external AI agents (Codex, OpenClaw, etc.) to access institutional memory, repository metadata, contacts, tasks, and third-party tool integrations.

## Authentication

All requests require a Bearer token in the `Authorization` header (except webhook endpoints).

```
Authorization: Bearer <AGENT_EDGE_KEY>
```

## Base URL

```
https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault
```

---

## Health Check

### `GET /health`

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/health"
```

**Response:** `{ "ok": true, "ts": "2025-02-03T12:00:00.000Z" }`

---

## Repo Map Endpoints

### `GET /repo_map/count`
Get total repository count.

### `GET /repo_map/get?name=<name>`
Get repository metadata by name (max 200 chars).

### `GET /repo_map/search?q=<query>&limit=<n>`
Full-text search across repositories. `q` required, `limit` 1-50 (default 10).

---

## Learnings Endpoints

### `GET /learnings/list`

List latest learnings without requiring a search query.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 50 | Results limit (1-200) |
| `since` | ISO 8601 | - | Only return learnings after this timestamp |
| `source` | string | - | Filter by source |
| `kind` | string | - | Filter by kind |
| `domain` | string | - | Filter by domain |

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/list?limit=10&since=2025-02-01T00:00:00Z"
```

### `GET /learnings/search?q=<query>&limit=<n>`

Full-text search across learnings. `q` required, `limit` 1-50 (default 10).

### `GET /learnings/stats`

Aggregate counts grouped by `kind`, `domain`, `source`, `status`. Optional `since` filter.

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/stats"
```

**Response:**
```json
{
  "total": 47,
  "by_kind": { "memory": 12, "chat_query": 8, ... },
  "by_domain": { "edge-bot": 5, "ciq": 3, ... },
  "by_source": { "codex": 15, "chat_ui": 10, ... },
  "by_status": { "draft": 20, "approved": 27 }
}
```

### `GET /learnings/:id`

Get a single learning by UUID. Also available as `GET /learnings/get?id=<uuid>`.

### `POST /learnings`

Insert a new learning. Accepts both native and CGPT/Codex formats.

**Required:** `learning` (string, max 8000 chars)

**Optional:** `category`, `source`, `kind`, `visibility`, `tags`, `confidence`, `metadata`, `title`, `summary`, `domain`, `status`, `owner_id`, `subject_type`, `subject_name`, `details_markdown`, `source_refs`

### `POST /learnings/bulk`

Batch insert up to 50 learnings. Returns partial success with per-item results.

```bash
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "learning": "First insight", "kind": "memory", "tags": ["research"] },
      { "learning": "Second insight", "kind": "memory", "tags": ["research"] }
    ]
  }' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/bulk"
```

**Response:**
```json
{
  "inserted": 2,
  "failed": 0,
  "results": [
    { "index": 0, "id": "uuid-1" },
    { "index": 1, "id": "uuid-2" }
  ]
}
```

### `PATCH /learnings/:id`

Update a learning. Immutable fields (`id`, `created_at`, `source`) are rejected.

```bash
curl -X PATCH \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "approved", "tags": ["verified", "security"] }' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/<uuid>"
```

**Updatable fields:** `title`, `summary`, `learning`, `category`, `kind`, `visibility`, `status`, `tags`, `confidence`, `domain`, `details_markdown`, `metadata`, `subject_type`, `subject_name`, `subject_id`, `source_date`, `source_refs`, `owner_id`, `redaction_level`

### `DELETE /learnings/:id`

Delete a learning. Add `?soft=true` for soft-delete (sets `status = 'rejected'`).

```bash
# Hard delete
curl -X DELETE -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/<uuid>"

# Soft delete
curl -X DELETE -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/<uuid>?soft=true"
```

---

## Contacts Endpoints

People/entity directory for the life & business assistant.

### `GET /contacts/list`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 50 | Results limit (1-200) |
| `role` | string | - | Filter by role (e.g. `family`, `client`, `vendor`) |
| `company` | string | - | Partial match on company name |

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/contacts/list?role=family"
```

### `GET /contacts/search?q=<query>`

Search across name, email, company, and notes. `q` required, `limit` 1-50 (default 20).

### `POST /contacts`

Create a new contact. If `email` is provided, attempts upsert by email.

**Required:** `name` (string, max 500 chars)

**Optional:** `email`, `phone`, `company`, `role`, `notes`, `tags`, `metadata`, `owner_id`

### `PATCH /contacts/:id`

Update a contact by UUID.

### `DELETE /contacts/:id`

Delete a contact by UUID. Returns the deleted record.

---

## Tasks Endpoints

Human-facing task tracking for reminders, follow-ups, and to-dos.

### `GET /tasks/list`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 50 | Results limit (1-200) |
| `status` | string | - | Filter: `todo`, `in_progress`, `done`, `cancelled` |
| `domain` | string | - | Filter: `personal`, `business`, `family` |
| `priority` | string | - | Filter: `low`, `medium`, `high`, `urgent` |

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/tasks/list?status=todo&domain=business"
```

### `POST /tasks`

Create a new task.

**Required:** `title` (string, max 500 chars)

**Optional:** `description`, `status`, `priority`, `due_date`, `domain`, `source`, `owner_id`, `related_learning_id`, `tags`, `metadata`

```bash
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Follow up with Nike contact", "priority": "high", "domain": "business", "due_date": "2025-03-01T09:00:00Z" }' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/tasks"
```

### `PATCH /tasks/:id`

Update a task. Setting `status = "done"` auto-sets `completed_at`. Setting back to `todo` or `in_progress` clears it.

### `DELETE /tasks/:id`

Delete a task by UUID. Returns the deleted record.

---

## Jobs Endpoints

### `GET /jobs/list`

List job history with filtering.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 20 | Results limit (1-100) |
| `status` | string | - | Filter: `queued`, `processing`, `done`, `failed` |
| `since` | ISO 8601 | - | Only jobs created after this timestamp |
| `type` | string | - | Filter by job type |

```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/jobs/list?status=failed&limit=10"
```

### `POST /jobs/next`

Claim next queued job (for worker daemon). Body: `{ "worker_id": "my-worker" }`

### `POST /jobs/ack`

Complete a job. Body: `{ "job_id": "<uuid>", "status": "done"|"failed", "last_error": "optional" }`

---

## Composio Proxy Endpoints

Secure proxy to Composio API. See full Composio docs in original API reference.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/composio/toolkits` | List toolkits |
| GET | `/composio/tools` | List tools |
| GET | `/composio/tools/:slug` | Get tool details |
| POST | `/composio/tools/execute` | Execute a tool |
| POST | `/composio/webhook` | Receive triggers (no auth) |

---

## Chat Submit (User Auth)

### `POST /chat/submit`

Submit a chat message (requires Supabase JWT, not AGENT_EDGE_KEY).

---

## Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/repo_map/count` | Repository count |
| GET | `/repo_map/get?name=` | Get repo by name |
| GET | `/repo_map/search?q=` | Search repos |
| GET | `/learnings/list` | List latest learnings |
| GET | `/learnings/search?q=` | Search learnings |
| GET | `/learnings/stats` | Aggregate stats |
| GET | `/learnings/:id` | Get single learning |
| POST | `/learnings` | Insert learning |
| POST | `/learnings/bulk` | Batch insert learnings |
| PATCH | `/learnings/:id` | Update learning |
| DELETE | `/learnings/:id` | Delete learning |
| GET | `/contacts/list` | List contacts |
| GET | `/contacts/search?q=` | Search contacts |
| POST | `/contacts` | Create/upsert contact |
| PATCH | `/contacts/:id` | Update contact |
| DELETE | `/contacts/:id` | Delete contact |
| GET | `/tasks/list` | List tasks |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/jobs/list` | List jobs |
| POST | `/jobs/next` | Claim next job |
| POST | `/jobs/ack` | Complete job |
| POST | `/chat/submit` | Submit chat (JWT auth) |
| GET | `/composio/toolkits` | List Composio toolkits |
| GET | `/composio/tools` | List Composio tools |
| GET | `/composio/tools/:slug` | Tool details |
| POST | `/composio/tools/execute` | Execute Composio tool |
| POST | `/composio/webhook` | Composio webhook (no auth) |

---

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 400 | Validation error | Missing/invalid parameters |
| 401 | `unauthorized` | Missing/invalid AGENT_EDGE_KEY |
| 404 | `not_found` | Unknown endpoint or missing record |
| 500 | `db_error` | Database operation failed |
| 500 | `server_config_error` | Missing env vars |
