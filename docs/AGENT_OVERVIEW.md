# Agent Overview - Operator Manual

**Generated:** 2026-01-24  
**Purpose:** Concrete reference for how the agent works, what it does, and what's broken.

---

## 1. What the Agent Is

### Entrypoints

**Frontend (React/TypeScript):**
- `src/pages/Chat.tsx` - Main chat UI component
- `src/services/api/messageService.ts` - Message sending service
- Entry: User types message → `sendMessage()` → Supabase Edge Function

**Supabase Edge Function (TypeScript/Deno):**
- `supabase/functions/unified-agent/index.ts` - Unified agent endpoint
- Handles: Web search, Google Drive, Slack, CreatorIQ queries
- Returns: Synthesized AI response with source results

**Backend API (Python/FastAPI):**
- `backend/api.py` - Main FastAPI app (lifespan, CORS, routing)
- `backend/agent/api.py` - Agent-specific endpoints
  - `/thread/{thread_id}/agent/start` - Start agent run
  - `/agent-run/{agent_run_id}/stop` - Stop agent run
  - `/agent/initiate` - Initiate agent with files
  - `/thread/{thread_id}/stream` - Stream agent responses

**Main Runtime:**
- `backend/agent/run.py` - `run_agent()` function
  - Iterates up to `max_iterations` (default 150)
  - Manages tool execution loop
  - Handles billing checks per iteration
  - Stops when assistant message detected

---

## 2. Request Flow

### Flow A: Unified Agent (Edge Function)
```
UI (Chat.tsx)
  → messageService.ts::sendMessage()
  → supabase.functions.invoke('unified-agent')
  → supabase/functions/unified-agent/index.ts
    → Queries: Web (Tavily), Google Drive, Slack, CreatorIQ
    → agent/aiSynthesis.ts::synthesizeWithAI()
    → OpenAI API (gpt-4o-mini)
    → Returns synthesized response + source results
  → messageResponseProcessor.ts::processAgentResponse()
  → UI displays response
```

**Files:**
- `src/services/api/messageService.ts:12-125`
- `supabase/functions/unified-agent/index.ts:19-640`
- `supabase/functions/unified-agent/agent/aiSynthesis.ts:3-86`

### Flow B: Development Agent (Backend)
```
UI
  → POST /thread/{thread_id}/agent/start
  → backend/agent/api.py::start_agent()
  → Creates agent_run record
  → Runs run_agent_background() (async task)
  → backend/agent/run.py::run_agent()
    → ThreadManager::run_thread()
    → LLM API call (via services/llm.py)
    → Tool execution (via ThreadManager)
    → Streams responses back
  → Updates messages table
  → UI receives streamed updates
```

**Files:**
- `backend/agent/api.py:419-509`
- `backend/agent/run.py:26-483`
- `backend/agentpress/thread_manager.py:200-433`

---

## 3. Memory / Storage

### Database Tables

**Core Tables (backend/supabase/migrations/20250416133920_agentpress_schema.sql):**

1. **`projects`**
   - Columns: `project_id`, `name`, `description`, `account_id`, `sandbox` (JSONB), `is_public`, `created_at`, `updated_at`
   - Purpose: Container for agent work sessions
   - RLS: Account-based access, public projects readable by all

2. **`threads`**
   - Columns: `thread_id`, `account_id`, `project_id`, `is_public`, `created_at`, `updated_at`
   - Purpose: Conversation threads within projects
   - RLS: Inherits from project access + account membership

3. **`messages`**
   - Columns: `message_id`, `thread_id`, `type`, `is_llm_message`, `content` (JSONB), `metadata` (JSONB), `created_at`, `updated_at`
   - Purpose: All messages (user, assistant, tool calls, browser_state)
   - Types: `user`, `assistant`, `tool`, `tool_call`, `browser_state`, `summary`
   - Retention: **No explicit retention policy** - messages persist indefinitely
   - Indexes: `thread_id`, `created_at`

4. **`agent_runs`**
   - Columns: `id`, `thread_id`, `status`, `started_at`, `completed_at`, `responses` (JSONB - **marked as "TO BE REMOVED, NOT USED"**), `error`, `created_at`, `updated_at`
   - Purpose: Track agent execution sessions
   - Status values: `running`, `completed`, `stopped`, `error`
   - Retention: **No explicit retention policy**

**State Tables:**

5. **`creator_iq_state`** (supabase/migrations/20250504235959_creator_iq_state.sql)
   - Columns: `id`, `key` (unique), `user_id`, `data` (JSONB), `query_context`, `expires_at`, `created_at`, `updated_at`
   - Purpose: Store CreatorIQ query state (campaigns, publishers, lists)
   - Retention: Has `cleanup_expired_creator_iq_state()` function but **no automatic schedule**
   - RLS: User-scoped

6. **`google_drive_access`** (supabase/migrations/20250423000000_add_unique_constraint_to_google_drive_access.sql)
   - Purpose: Store Google Drive OAuth tokens
   - RLS: User-scoped

**Memory Location:**
- **Primary:** PostgreSQL (Supabase) - `messages` table
- **Context Summarization:** `messages` table with `type='summary'` (see `backend/agentpress/context_manager.py`)
- **In-Memory:** `active_agent_runs` dict in `backend/agent/api.py:30` (ephemeral)
- **Redis:** Used for distributed locking (`active_run:{instance_id}:{agent_run_id}`) with TTL

**Retention:**
- **No automatic cleanup** - all data persists
- Context manager creates summaries when token threshold exceeded (120k tokens default)
- Summary messages stored as `type='summary'` in messages table

---

## 4. Tools / Actions

### Sandbox Tools (backend/agent/tools/)
1. **`sb_shell_tool.py`** - Execute shell commands in sandbox
2. **`sb_files_tool.py`** - Read/write/list files in sandbox
3. **`sb_browser_tool.py`** - Control browser, take screenshots, navigate
4. **`sb_deploy_tool.py`** - Deploy static sites to Cloudflare Pages
5. **`sb_expose_tool.py`** - Expose sandbox ports to public internet

### Data Provider Tools
6. **`data_providers_tool.py`** - Wrapper for RapidAPI data providers
   - Providers: CreatorIQ, GoogleDrive, LinkedIn, Twitter, YahooFinance, Zillow, ActiveJobs
   - Requires: `RAPID_API_KEY` env var

7. **`web_search_tool.py`** - Web search via Tavily API
   - Requires: `TAVILY_API_KEY` env var

8. **`message_tool.py`** - Send messages to user (via prompt, not tool call)

### Edge Function Tools (supabase/functions/unified-agent/)
- **Web Search:** Tavily API integration
- **Google Drive:** File search and analysis
- **Slack:** Message search
- **CreatorIQ:** Campaign/publisher/list queries

**Tool Registration:**
- `backend/agent/run.py:61-75` - Tools registered per agent run
- `backend/agentpress/tool_registry.py` - Central tool registry

---

## 5. Auth Model

### Authentication

**JWT-Based (Supabase):**
- Token extracted from `Authorization: Bearer <token>` header
- User ID from JWT `sub` claim
- **Security Issue:** `backend/utils/auth_utils.py:38` - JWT decoded with `verify_signature=False`
  - Relies on RLS for security, not JWT verification
  - This is intentional but should be documented

**Functions:**
- `backend/utils/auth_utils.py::get_current_user_id()` - Required auth
- `backend/utils/auth_utils.py::get_optional_user_id()` - Optional auth
- `backend/utils/auth_utils.py::get_user_id_from_stream_auth()` - For EventSource streams

### Authorization (RLS)

**Service Role:**
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` - bypasses RLS
- Used for: Agent operations, sandbox management

**Authenticated Users:**
- RLS policies on all tables check `basejump.has_role_on_account(account_id)`
- Public projects: `is_public=true` allows read access to anon users

**RLS Policies:**
- `projects`: Account membership required (except public read)
- `threads`: Account membership or project access
- `messages`: Inherits from thread access
- `agent_runs`: Inherits from thread access
- `creator_iq_state`: User-scoped (`auth.uid() = user_id`)
- `google_drive_access`: User-scoped

**Files:**
- `backend/supabase/migrations/20250416133920_agentpress_schema.sql:97-379`
- `backend/utils/auth_utils.py:8-177`

---

## 6. Environment Variables

### Required

**Supabase:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend operations)

**LLM Provider (at least one):**
- `ANTHROPIC_API_KEY` - For Claude models
- `OPENAI_API_KEY` - For OpenAI models
- `OPENROUTER_API_KEY` - For OpenRouter (multi-provider)
- `OPENROUTER_API_BASE` - Defaults to `https://openrouter.ai/api/v1`

**AWS (optional, for Bedrock):**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION_NAME`

### Optional

**Redis:**
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password
- `REDIS_SSL` - Enable SSL (default: True)

**Sandbox:**
- `DAYTONA_API_KEY` - Daytona sandbox API key
- `DAYTONA_SERVER_URL` - Daytona server URL
- `DAYTONA_TARGET` - Daytona target

**Tools:**
- `TAVILY_API_KEY` - For web search tool
- `RAPID_API_KEY` - For data providers tool
- `CREATOR_IQ_API_KEY` - For CreatorIQ integration
- `CLOUDFLARE_API_TOKEN` - For deploy tool

**OpenRouter (optional):**
- `OR_SITE_URL` - Site URL for OpenRouter
- `OR_APP_NAME` - App name for OpenRouter

**Files:**
- `backend/services/supabase.py:33-44`
- `backend/services/llm.py:40-66`
- `backend/services/redis.py:73-76`
- `backend/agent/tools/web_search_tool.py:20`
- `backend/agent/tools/data_providers/RapidDataProviderBase.py:48`

---

## 7. Known Broken Pieces / TODOs

### Critical Issues

1. **JWT Signature Not Verified** (`backend/utils/auth_utils.py:38`)
   - JWT decoded with `verify_signature=False`
   - Security relies entirely on RLS
   - **Risk:** If RLS is misconfigured, invalid tokens could be accepted
   - **Status:** Intentional design, but should be documented/audited

2. **No Data Retention Policy**
   - `messages` table grows indefinitely
   - `agent_runs` table grows indefinitely
   - `creator_iq_state` has cleanup function but **no scheduled job**
   - **Risk:** Database bloat over time

3. **Deprecated Column** (`backend/supabase/migrations/20250416133920_agentpress_schema.sql:43`)
   - `agent_runs.responses` JSONB column marked as "TO BE REMOVED, NOT USED"
   - Still exists in schema

### TODOs

1. **Resource Cleanup** (`backend/agent/api.py:1193`)
   ```python
   # Todo: Clean up resources if needed (project, thread, sandbox)
   ```
   - In `initiate_agent_with_files()` error handler
   - Should clean up created resources on failure

2. **Context Manager Token Threshold** (`backend/agentpress/context_manager.py:17`)
   - Hardcoded `DEFAULT_TOKEN_THRESHOLD = 120000`
   - Should be configurable per model

3. **Billing Check Frequency** (`backend/agent/run.py:86`)
   - Billing checked on every iteration
   - Could be optimized to check less frequently

### Potential Issues

1. **Redis Connection Failures**
   - `backend/services/redis.py` has retry logic but agent continues without Redis
   - May cause issues with distributed locking across instances

2. **Sandbox Creation Locking**
   - `backend/agent/api.py:259-417` has complex locking logic
   - May have race conditions if multiple requests for same project

3. **Browser State Screenshot Handling**
   - `backend/agent/run.py:106-134` - Screenshot parsing can fail silently
   - Error logged but execution continues

4. **No Rate Limiting on Agent Starts**
   - `backend/api.py:28-29` has IP tracker but commented out
   - Could allow DoS via rapid agent starts

---

## File Reference Quick Links

**Entrypoints:**
- `backend/api.py` - Main FastAPI app
- `backend/agent/api.py` - Agent endpoints
- `backend/agent/run.py` - Agent runtime
- `supabase/functions/unified-agent/index.ts` - Edge function

**Core Services:**
- `backend/services/llm.py` - LLM API calls
- `backend/services/supabase.py` - Database connection
- `backend/services/redis.py` - Redis connection
- `backend/agentpress/thread_manager.py` - Thread/conversation management

**Auth:**
- `backend/utils/auth_utils.py` - JWT extraction and verification
- `backend/supabase/migrations/20250416133920_agentpress_schema.sql` - RLS policies

**Tools:**
- `backend/agent/tools/` - All tool implementations
- `backend/agentpress/tool_registry.py` - Tool registration

**Frontend:**
- `src/pages/Chat.tsx` - Main UI
- `src/services/api/messageService.ts` - Message handling
