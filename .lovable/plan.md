

## Plan: Create `agent-vault` Edge Function for External Agent Access

### Overview
Create a secure edge function that allows external AI agents (Codex, OpenClaw) to:
- **Read** from `repo_map` (search and get by name)
- **Read** from `agent_learnings` (search)
- **Write** to `agent_learnings` (insert new learnings)

### Critical Issues with CGPT's Code

The proposed code has several schema mismatches that would cause runtime errors:

| CGPT's Code | Actual Schema | Fix |
|-------------|---------------|-----|
| `repo_map.repo` | `repo_map.repo_name` | Rename |
| `repo_map.path` | Does not exist | Remove |
| `repo_map.title`, `summary` | `domain_summary`, `full_text_search` | Rename |
| `agent_learnings.repo` | Does not exist | Map to `category` or `tags` |
| `agent_learnings.topic` | Does not exist | Map to `category` |

### Corrected API Design

**Endpoints:**

```text
GET  /health                      → Health check
GET  /repo_map/get?name=<name>    → Get single repo by name
GET  /repo_map/search?q=<query>   → Full-text search (uses existing DB function)
GET  /repo_map/count              → Count all repos
GET  /learnings/search?q=<query>  → Search learnings (uses existing DB function)
POST /learnings                   → Insert new learning
```

**Authentication:** Bearer token via `AGENT_EDGE_KEY` secret

### Implementation Steps

#### Step 1: Add Required Secret
Add `AGENT_EDGE_KEY` as a new Supabase Edge Function secret. This is the shared secret that Codex/OpenClaw will use.

#### Step 2: Create Edge Function

Create `supabase/functions/agent-vault/index.ts` with corrected schema:

```typescript
// Key corrections from CGPT's code:

// For repo_map - use actual columns:
.from("repo_map")
.select("repo_name,origin,domain_summary,tables,integrations,supabase_functions")
.eq("repo_name", name)  // Not "repo"

// For search - leverage existing DB functions:
await supabase.rpc("search_repo_map", { query: q })
await supabase.rpc("search_agent_learnings", { query: q, limit_count: limit })

// For agent_learnings insert - use actual columns:
const payload = {
  learning: body.learning,           // Required - the actual learning text
  category: body.category || body.topic || "general",  // Support CGPT's "topic"
  source: body.source || "agent",    // e.g., "codex", "openclaw"
  tags: body.tags || (body.repo ? [body.repo] : null), // Support CGPT's "repo" as tag
  confidence: body.confidence || 0.5,
  metadata: body.meta || {}
};
```

#### Step 3: Update Config

Add to `supabase/config.toml`:
```toml
[functions.agent-vault]
verify_jwt = false
```

### Security Design

1. **Bearer Token Auth**: Validates `AGENT_EDGE_KEY` secret on every request
2. **Service Role Isolation**: Service role key stays server-side only
3. **Input Validation**: Length limits, type checking on all inputs
4. **Insert-Only Writes**: No UPDATE/DELETE on learnings (read-append model)
5. **Rate Limiting Note**: Consider adding rate limiting via Supabase or external proxy

### Technical Details

**Full corrected code structure:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth check with AGENT_EDGE_KEY
  const expectedKey = Deno.env.get("AGENT_EDGE_KEY");
  const authHeader = req.headers.get("authorization") || "";
  const providedKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  
  if (!providedKey || providedKey !== expectedKey) {
    return json(401, { error: "unauthorized" });
  }

  // Create service role client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");

  // Route handling with corrected schema...
});
```

### Files to Create/Modify

1. **Create**: `supabase/functions/agent-vault/index.ts`
2. **Modify**: `supabase/config.toml` (add function config)
3. **Secret**: Add `AGENT_EDGE_KEY` via Supabase dashboard

### Testing Commands (for Codex/OpenClaw)

```bash
# Health check
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/health"

# Search repos
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/repo_map/search?q=rls"

# Get specific repo
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/repo_map/get?name=sunafusion"

# Search learnings
curl -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings/search?q=security"

# Insert learning
curl -X POST \
  -H "Authorization: Bearer $AGENT_EDGE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"learning":"Always set search_path in DB functions","category":"security","source":"codex","tags":["rls","postgres"],"confidence":0.9}' \
  "https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/learnings"
```

