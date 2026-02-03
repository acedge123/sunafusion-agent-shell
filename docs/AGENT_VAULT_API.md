# Agent Vault API

Secure API for external AI agents (Codex, OpenClaw, etc.) to access institutional memory, repository metadata, and third-party tool integrations.

## Authentication

All requests require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <AGENT_EDGE_KEY>
```

Requests without valid authentication receive a `401 Unauthorized` response.

## Base URL

```
https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault
```

---

## Health Check

### `GET /health`

Verify the API is operational.

**Response:**
```json
{
  "ok": true,
  "ts": "2025-02-03T12:00:00.000Z"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/health"
```

---

## Repo Map Endpoints

Access repository metadata including tech stack, integrations, database tables, and domain summaries.

### `GET /repo_map/count`

Get the total count of repositories in the map.

**Response:**
```json
{
  "count": 54
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/repo_map/count"
```

---

### `GET /repo_map/get`

Retrieve full metadata for a specific repository.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Repository name (max 200 chars) |

**Response:**
```json
{
  "data": {
    "repo_name": "ccr-app-lovable",
    "origin": "https://github.com/org/ccr-app-lovable",
    "domain_summary": "Central hub for influencer marketing...",
    "tables": ["leads", "campaigns", "chat_messages"],
    "integrations": ["CreatorIQ", "Slack", "Google Drive"],
    "supabase_functions": ["unified-agent", "agent-vault"],
    "stack": ["React", "Vite", "Supabase", "TailwindCSS"],
    "shared_tables": ["profiles", "companies"],
    "metadata": { "owner": "team-marketing" }
  }
}
```

Returns `{ "data": null }` if repository not found.

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/repo_map/get?name=ccr-app-lovable"
```

---

### `GET /repo_map/search`

Full-text search across repository metadata.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (max 200 chars) |
| `limit` | integer | No | 10 | Results limit (1-50) |

**Response:**
```json
{
  "data": [
    {
      "repo_name": "ccr-app-lovable",
      "origin": "https://github.com/...",
      "integrations": ["CreatorIQ", "Slack"],
      "supabase_functions": ["unified-agent"],
      "tables": ["leads", "campaigns"],
      "relevance": 0.85
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/repo_map/search?q=creator+marketing&limit=5"
```

---

## Agent Learnings Endpoints

Store and retrieve institutional knowledge across agents.

### `GET /learnings/search`

Full-text search across agent learnings.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (max 200 chars) |
| `limit` | integer | No | 10 | Results limit (1-50) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "learning": "RLS policies must be enabled on all tables...",
      "category": "security",
      "tags": ["rls", "supabase", "best-practices"],
      "source": "codex",
      "relevance": 0.92
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/search?q=security+rls&limit=10"
```

---

### `POST /learnings`

Insert a new learning into the knowledge base.

**Request Body (Native Format):**
```json
{
  "learning": "Always use SECURITY DEFINER with explicit search_path",
  "category": "security",
  "source": "openclaw",
  "tags": ["supabase", "functions", "security"],
  "confidence": 0.9,
  "metadata": {
    "discovered_in": "ccr-app-lovable",
    "context": "Database function review"
  }
}
```

**Request Body (CGPT/Codex Format):**
The API also accepts this alternative format for compatibility:
```json
{
  "learning": "Always use SECURITY DEFINER with explicit search_path",
  "topic": "security",
  "repo": "ccr-app-lovable",
  "source": "codex",
  "meta": {
    "context": "Database function review"
  }
}
```

**Field Mapping:**
| CGPT Field | Native Field | Notes |
|------------|--------------|-------|
| `topic` | `category` | Falls back to "general" |
| `repo` | `tags[0]` | Becomes first tag |
| `meta` | `metadata` | Passed through |

**Response:**
```json
{
  "data": {
    "id": "uuid-here",
    "learning": "Always use SECURITY DEFINER...",
    "category": "security",
    "source": "openclaw",
    "tags": ["supabase", "functions", "security"],
    "created_at": "2025-02-03T12:00:00.000Z"
  }
}
```

**Validation Rules:**
- `learning` is required, max 8000 chars
- `category`/`topic` max 200 chars
- `source` max 100 chars
- `confidence` must be 0-1 (defaults to 0.5)

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "learning": "Edge functions should always include CORS headers for web access",
    "category": "edge-functions",
    "source": "openclaw",
    "tags": ["supabase", "cors", "best-practices"],
    "confidence": 0.85
  }' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings"
```

---

## Composio Proxy Endpoints

Secure proxy to Composio API for third-party tool integrations. The `COMPOSIO_API_KEY` is stored server-side and never exposed.

### `GET /composio/toolkits`

List available toolkits.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Filter by name |
| `limit` | integer | No | Results limit |

**Response:**
```json
{
  "items": [
    {
      "slug": "github",
      "name": "GitHub",
      "description": "GitHub integration toolkit"
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/toolkits?search=github"
```

---

### `GET /composio/tools`

List available tools with filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `toolkit_slug` | string | No | Filter by toolkit |
| `search` | string | No | Search by name/description |
| `tags` | string | No | Filter by tags |
| `limit` | integer | No | Results limit |

**Response:**
```json
{
  "items": [
    {
      "slug": "GITHUB_CREATE_ISSUE",
      "name": "Create Issue",
      "description": "Create a new GitHub issue",
      "toolkit": "github"
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools?toolkit_slug=github&limit=10"
```

---

### `GET /composio/tools/:slug`

Get detailed information about a specific tool.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Tool identifier (max 100 chars) |

**Response:**
```json
{
  "slug": "GITHUB_CREATE_ISSUE",
  "name": "Create Issue",
  "description": "Create a new GitHub issue",
  "toolkit": "github",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "Issue title" },
      "body": { "type": "string", "description": "Issue body" },
      "repo": { "type": "string", "description": "Repository name" }
    },
    "required": ["title", "repo"]
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools/GITHUB_CREATE_ISSUE"
```

---

### `POST /composio/tools/execute`

Execute a tool action.

**Request Body:**
```json
{
  "toolSlug": "GITHUB_CREATE_ISSUE",
  "input": {
    "title": "Bug: Login not working",
    "body": "Users report login failures",
    "repo": "my-org/my-repo"
  },
  "authConfigId": "optional-auth-config-id"
}
```

**Required Fields:**
- `toolSlug` (string): The tool identifier to execute

**Response:**
The response format varies by tool. Generally:
```json
{
  "success": true,
  "data": {
    "issue_number": 42,
    "url": "https://github.com/my-org/my-repo/issues/42"
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "GITHUB_CREATE_ISSUE",
    "input": {
      "title": "Test Issue",
      "body": "Created via Agent Vault",
      "repo": "my-org/my-repo"
    }
  }' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools/execute"
```

---

## Error Responses

All errors return JSON with an `error` field.

### 400 Bad Request

Validation errors for missing or invalid parameters.

```json
{
  "error": "missing q parameter"
}
```

```json
{
  "error": "learning too long (max 8000 chars)"
}
```

### 401 Unauthorized

Missing or invalid `AGENT_EDGE_KEY`.

```json
{
  "error": "unauthorized"
}
```

### 404 Not Found

Unknown endpoint.

```json
{
  "error": "not_found",
  "path": "/unknown/path"
}
```

### 500 Server Error

Internal errors including configuration issues.

```json
{
  "error": "db_error",
  "detail": "connection refused"
}
```

```json
{
  "error": "composio_not_configured"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. For production use:
- Implement client-side backoff on 5xx errors
- Cache repo_map queries (data changes infrequently)
- Batch learning inserts when possible

---

## Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/repo_map/count` | Total repository count |
| GET | `/repo_map/get?name=<name>` | Get repository by name |
| GET | `/repo_map/search?q=<query>` | Search repositories |
| GET | `/learnings/search?q=<query>` | Search learnings |
| POST | `/learnings` | Insert new learning |
| GET | `/composio/toolkits` | List toolkits |
| GET | `/composio/tools` | List tools |
| GET | `/composio/tools/:slug` | Get tool details |
| POST | `/composio/tools/execute` | Execute tool |
