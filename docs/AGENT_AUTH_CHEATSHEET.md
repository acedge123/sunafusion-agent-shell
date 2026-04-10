# Agent Authentication Cheatsheet

> **TL;DR** — Never use raw Supabase keys to write to vault or wiki tables.
> Always go through the edge-function HTTP APIs using `AGENT_EDGE_KEY`.

---

## Environment Variables the Agent Needs

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `AGENT_VAULT_URL` | `https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault` | Base URL for all vault/memory API calls |
| `AGENT_WIKI_URL` | `https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/wiki-engine` | Base URL for all wiki API calls |
| `AGENT_EDGE_KEY` | *(secret — stored in password manager)* | Bearer token for authenticating to both APIs |

The agent does **NOT** need `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`.
Those are used internally by the edge functions themselves, not by callers.

---

## How to Authenticate

Every request to vault or wiki must include:

```
Authorization: Bearer $AGENT_EDGE_KEY
```

Plus, because the agent is not a logged-in user, it must pass the owner explicitly:

```json
{ "owner_id": "<user-uuid>" }
```

The edge functions resolve `owner_id` from either:
1. A valid Supabase JWT (`sub` claim) — used by the frontend.
2. The `AGENT_EDGE_KEY` + explicit `owner_id` in the body — used by agents/workers.

---

## Correct: Writing a Learning

```bash
curl -X POST "$AGENT_VAULT_URL/learnings" \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf",
    "learning": "Example fact",
    "category": "note",
    "source": "agent"
  }'
```

## Correct: Creating a Wiki Source

```bash
curl -X POST "$AGENT_WIKI_URL/sources" \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf",
    "source_type": "note",
    "title": "My source",
    "raw_text": "Content here"
  }'
```

## Wrong: Using Supabase Client Directly

```python
# ❌ WRONG — bypasses edge function auth, blocked by RLS
from supabase import create_client
client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
client.table("agent_learnings").insert({...})

# ❌ WRONG — anon key has no write access
client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
client.table("wiki_sources").insert({...})
```

The only correct path is: **HTTP request → edge function → service-role insert (server-side)**.

---

## API Surface Summary

| API | Base URL Variable | Key Endpoints |
|-----|-------------------|---------------|
| **Vault** | `AGENT_VAULT_URL` | `POST /learnings`, `GET /learnings/list`, `GET /learnings/search`, `POST /entities`, `POST /relationships`, `POST /commitments`, `GET /health` |
| **Wiki** | `AGENT_WIKI_URL` | `POST /sources`, `POST /sources/batch`, `POST /compile/topic`, `POST /answer`, `GET /health` |

All endpoints accept `Authorization: Bearer $AGENT_EDGE_KEY` and require `owner_id` in the request body when not using a JWT.

---

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Using `SUPABASE_SERVICE_ROLE_KEY` as Bearer token | Edge functions check `AGENT_EDGE_KEY`, not service role | Use `AGENT_EDGE_KEY` |
| Calling Supabase REST API directly | RLS blocks writes; wrong auth path | Call the edge function URL instead |
| Omitting `owner_id` when using edge key | Function can't scope data without a JWT or explicit owner | Always include `owner_id` |
| Using `SUPABASE_URL` as the API base | That's the project root, not the function path | Use `AGENT_VAULT_URL` or `AGENT_WIKI_URL` |

---

*Last updated: 2026-04-10*
