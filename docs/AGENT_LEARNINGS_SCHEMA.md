# agent_learnings — Schema & Vault API Reference

This document is the **single source of truth** for the Edge Bot (and any other agent) to understand the `agent_learnings` table and how to write to it via agent-vault.

---

## Table: `public.agent_learnings`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `created_at` | timestamptz | NO | `now()` | Auto-set |
| `updated_at` | timestamptz | NO | `now()` | Auto-updated via trigger |
| `learning` | text | NO | — | **Required.** Main content body (max 8000 chars) |
| `category` | text | YES | `'general'` | Freeform grouping (e.g. `composio_trigger`, `chat_query`) |
| `kind` | text | YES | `'general'` | Taxonomy for UI filtering (see valid values below) |
| `visibility` | text | YES | `'private'` | Access tier for RLS |
| `source` | text | YES | `'codex'` | Origin system (e.g. `agent`, `composio_webhook`, `chat_ui`) |
| `tags` | text[] | YES | — | Array of string tags |
| `confidence` | real | YES | `0.5` | 0.0–1.0 |
| `verified` | boolean | YES | `false` | Manual verification flag |
| `metadata` | jsonb | YES | `'{}'` | Arbitrary structured data (raw payloads, user_id, job_id, etc.) |
| `owner_id` | uuid | YES | — | Tenant scoping — references `auth.users.id` |
| `subject_type` | text | YES | — | What the learning is about |
| `subject_id` | text | YES | — | Unique identifier for the subject |
| `subject_name` | text | YES | — | Human-readable name (e.g. `Alan`, `Meg`) |
| `title` | text | YES | — | Short title for display (max 500 chars) |
| `summary` | text | YES | — | Human-readable summary (max 2000 chars) |
| `redaction_level` | text | NO | `'sensitive'` | Access classification |
| `domain` | text | YES | — | Knowledge domain (e.g. `edge-bot`, `ciq`, `ops`, `cost`, `messaging`) |
| `source_date` | date | YES | — | The source day the learning pertains to |
| `status` | text | NO | `'draft'` | Lifecycle: `draft` / `approved` / `rejected` |
| `source_refs` | text[] | YES | — | Array of file paths, commit SHAs, or URLs used as sources |
| `details_markdown` | text | YES | — | Full approved learning in Markdown |

### Valid `kind` values

```
general, composio_trigger, chat_response, chat_query,
research_summary, github_push_summary, email_summary,
memory, decision, code_change, image_generation, db_query_result,
person, project, runbook, incident, integration
```

### Valid `visibility` values

```
private   — only service role can read
family    — authenticated users can read
public    — anyone can read
```

### Valid `redaction_level` values

```
public, internal, sensitive
```

### Valid `subject_type` values

```
person, repo, service, system
```

### Valid `domain` values

```
edge-bot, ciq, ops, cost, messaging
```

(Freeform — new domains can be added without migration.)

### Valid `status` values

```
draft      — newly created, pending review
approved   — reviewed and accepted
rejected   — reviewed and discarded
```

### Indexes

| Index | Columns |
|-------|---------|
| Composite btree | `(owner_id, kind, subject_type, subject_id)` |
| GIN | `tags` |
| GIN text search | `to_tsvector(...)` on title + summary |
| btree | `kind`, `visibility`, `created_at DESC` |
| btree | `domain` |
| btree | `status` |
| Service role (agents) | Full read/write on all rows |
| Authenticated user | SELECT where `visibility IN ('public','family')` OR `owner_id = auth.uid()` |
| Anonymous | SELECT where `visibility = 'public'` only |

---

## Vault API: POST /learnings

**Base URL**: `https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault`

**Endpoint**: `POST /learnings`

**Auth**: Bearer token (`AGENT_EDGE_KEY`) in `Authorization` header.

### Request Body (JSON)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `learning` | string | **YES** | Main content (max 8000 chars) |
| `category` | string | no | Default: `"general"` |
| `kind` | string | no | Must be a valid kind. Default: `"general"` |
| `visibility` | string | no | `private` / `family` / `public`. Default: `"private"` |
| `source` | string | no | Default: `"agent"` |
| `tags` | string[] | no | Array of tags |
| `confidence` | number | no | 0.0–1.0. Default: `0.5` |
| `metadata` | object | no | Arbitrary JSON. Also accepts `meta` as alias |
| `owner_id` | string (uuid) | no | Tenant/user who owns this learning |
| `subject_type` | string | no | Must be valid: `person`, `repo`, `service`, `system` |
| `subject_id` | string | no | E.g. phone `+13104333101`, repo `acedge123/sunafusion` |
| `subject_name` | string | no | Human name: `Alan`, `Meg`, `Emily` |
| `title` | string | no | Short display title (truncated to 500 chars) |
| `summary` | string | no | Human summary (truncated to 2000 chars) |
| `redaction_level` | string | no | `public` / `internal` / `sensitive`. Default: `"sensitive"` |
| `domain` | string | no | Knowledge domain: `edge-bot`, `ciq`, `ops`, `cost`, `messaging` |
| `source_date` | string (YYYY-MM-DD) | no | The source day the learning pertains to |
| `status` | string | no | `draft` / `approved` / `rejected`. Default: `"draft"` |
| `source_refs` | string[] | no | File paths, commit SHAs, or URLs used as source material |
| `details_markdown` | string | no | Full learning content in Markdown (for approved learnings) |

### Example: Person learning

```json
{
  "learning": "Alan prefers inspect → summarize risks → approval → install → first-run isolated workflow for new tools.",
  "kind": "person",
  "subject_type": "person",
  "subject_id": "+13104333101",
  "subject_name": "Alan",
  "title": "Tool installation preferences",
  "summary": "Alan wants a cautious, step-by-step approach to installing new tools with isolated first runs.",
  "visibility": "private",
  "redaction_level": "sensitive",
  "source": "edge_bot",
  "tags": ["preferences", "workflow", "tools"],
  "confidence": 0.9,
  "metadata": {
    "user_id": "some-uuid",
    "observed_at": "2025-06-10T12:00:00Z"
  }
}
```

### Example: Project learning

```json
{
  "learning": "The ACP mortgage lead form uses field_name slugs for scoring with 5 axes: credit, income, property, timeline, engagement.",
  "kind": "project",
  "subject_type": "repo",
  "subject_id": "acedge123/api-docs-template",
  "subject_name": "ACP",
  "title": "Mortgage lead scoring schema",
  "summary": "5-axis scoring system for mortgage leads using field_name slugs.",
  "visibility": "family",
  "redaction_level": "internal",
  "source": "edge_bot",
  "tags": ["acp", "mortgage", "scoring"],
  "confidence": 0.95
}
```

### Example: Email summary

```json
{
  "learning": "Email from john@example.com RE: Q3 budget approval. Approved $50k for infrastructure.",
  "kind": "email_summary",
  "subject_type": "person",
  "subject_name": "Alan",
  "title": "Q3 budget approved",
  "summary": "John approved $50k infrastructure budget for Q3.",
  "visibility": "private",
  "source": "edge_bot",
  "tags": ["email", "budget", "q3"],
  "metadata": {
    "thread_id": "abc123",
    "from": "john@example.com",
    "job_id": "some-job-uuid"
  }
}
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "learning": "...",
    "category": "general",
    "kind": "person",
    "visibility": "private",
    "source": "edge_bot",
    "tags": ["preferences"],
    "created_at": "2025-06-10T...",
    "owner_id": "uuid-or-null",
    "subject_type": "person",
    "subject_id": "+13104333101",
    "subject_name": "Alan",
    "title": "Tool installation preferences",
    "summary": "...",
    "redaction_level": "sensitive"
  }
}
```

### Error Responses

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{ "error": "missing learning field" }` | `learning` is empty |
| 400 | `{ "error": "learning too long (max 8000 chars)" }` | Exceeds limit |
| 401 | `{ "error": "unauthorized" }` | Bad/missing Bearer token |
| 500 | `{ "error": "db_error", "detail": "..." }` | Supabase insert failed |

---

## Vault API: GET /learnings/get

**Endpoint**: `GET /learnings/get?id=<uuid>`

Returns the full learning record including all metadata. Used by Edge Bot to retrieve context (e.g. full email payload from a Composio trigger).

---

## Vault API: GET /learnings/feed

**Endpoint**: `GET /learnings/feed?kind=&visibility=&search=&limit=&offset=`

Returns paginated list of learnings with optional filtering. Used by the Learnings Feed UI.

---

## Conventions

- **People**: `subject_type='person'`, `subject_id` is E.164 phone (e.g. `+13104333101`), `subject_name` is first name.
- **People learnings** default to `redaction_level='sensitive'`, `visibility='private'`.
- **The `metadata` field** stores raw payloads (Composio triggers, email data, job context). Always include `user_id` and/or `job_id` when available.
- **The `content` column does not exist.** Use `learning` for text content and `metadata` (jsonb) for structured data.
