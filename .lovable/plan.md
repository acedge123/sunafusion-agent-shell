

## Plan: Add Composio Proxy Endpoints to agent-vault

### Overview
Extend the existing `agent-vault` edge function to proxy Composio API calls on behalf of OpenClaw. The `COMPOSIO_API_KEY` stays server-side and is never exposed to the client.

### API Design

**New Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/composio/tools` | List available tools (with filtering) |
| GET | `/composio/tools/:slug` | Get a specific tool by slug |
| POST | `/composio/tools/execute` | Execute a tool action |
| GET | `/composio/toolkits` | List available toolkits |

**Authentication:** Same Bearer token (`AGENT_EDGE_KEY`) as existing endpoints

### Implementation Details

**Composio API Configuration:**
```typescript
const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3";
const composioApiKey = Deno.env.get("COMPOSIO_API_KEY");
```

**Request Flow:**
```text
OpenClaw → agent-vault (validates AGENT_EDGE_KEY) → Composio API (uses COMPOSIO_API_KEY)
    ↑                                                           ↓
    └──────────────────── Response ←────────────────────────────┘
```

**Key Security Points:**
1. `COMPOSIO_API_KEY` accessed only via `Deno.env.get()` - never in response
2. All requests validated against `AGENT_EDGE_KEY` first
3. Input sanitization on all forwarded parameters
4. Rate limiting consideration for production

### New Routes

**GET /composio/tools**
```typescript
// Proxy to: GET https://backend.composio.dev/api/v3/tools
// Supported query params: toolkit_slug, search, tags, limit
if (req.method === "GET" && pathname.endsWith("/composio/tools")) {
  const composioKey = Deno.env.get("COMPOSIO_API_KEY");
  if (!composioKey) {
    return json(500, { error: "composio_not_configured" });
  }

  const params = new URLSearchParams();
  if (url.searchParams.get("toolkit_slug")) 
    params.set("toolkit_slug", url.searchParams.get("toolkit_slug")!);
  if (url.searchParams.get("search")) 
    params.set("search", url.searchParams.get("search")!);
  if (url.searchParams.get("limit")) 
    params.set("limit", url.searchParams.get("limit")!);

  const response = await fetch(
    `https://backend.composio.dev/api/v3/tools?${params}`,
    { headers: { "x-api-key": composioKey } }
  );
  
  const data = await response.json();
  return json(response.status, data);
}
```

**GET /composio/tools/:slug**
```typescript
// Proxy to: GET https://backend.composio.dev/api/v3/tools/{slug}
// Extract slug from path: /composio/tools/GITHUB_CREATE_ISSUE
if (req.method === "GET" && pathname.includes("/composio/tools/")) {
  const slug = pathname.split("/composio/tools/")[1];
  // ... validate and forward
}
```

**POST /composio/tools/execute**
```typescript
// Proxy to: POST https://backend.composio.dev/api/v3/tools/execute
// Body: { toolSlug, input, authConfigId, ... }
if (req.method === "POST" && pathname.endsWith("/composio/tools/execute")) {
  const body = await req.json();
  // Validate required fields
  // Forward to Composio with x-api-key header
}
```

### Files to Modify

1. **Modify**: `supabase/functions/agent-vault/index.ts`
   - Add new route handlers for `/composio/*` endpoints
   - Add helper function for Composio API calls
   - Add input validation for forwarded requests

### Error Handling

- Return `500 { error: "composio_not_configured" }` if `COMPOSIO_API_KEY` is missing
- Forward Composio API errors with original status codes
- Log errors for debugging (without exposing API key)

### Testing Commands

```bash
# List tools
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools?search=github"

# Get specific tool
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools/GITHUB_CREATE_ISSUE"

# Execute tool
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"toolSlug":"GITHUB_CREATE_ISSUE","input":{"title":"Test","body":"Hello"}}' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/composio/tools/execute"
```

