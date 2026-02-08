

# Plan: Repurpose UI for OpenClaw Edge Bot + Learnings Feed

## Overview

Transform the SunaFusion UI into a streamlined interface that:
1. **Chat input** sends jobs to OpenClaw (via agent-vault)
2. **Learnings Feed** displays agent outputs (research, decisions, memory, email triggers, etc.)
3. Uses `kind` + `visibility` for filtering and access control
4. Removes unused features (Drive integration, Imagen, Lead Admin, etc.)

---

## Architecture Alignment with OpenClaw

Based on `docs/OPENCLAW_AGENT_OVERVIEW.md`, the Edge Bot has these skills that inform what kinds of outputs we'll display:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClaw Edge Bot Skills                      │
├──────────────────┬──────────────────────────────────────────────┤
│ secure-gmail     │ Read emails, drafts → kind: email_summary    │
│ openclaw-mem     │ Session/durable memory → kind: memory        │
│ brave-search     │ Web search → kind: research_summary          │
│ firecrawl        │ Scrape/crawl → kind: research_summary        │
│ github           │ Issues, PRs, CI → kind: github_push_summary  │
│ supabase         │ SQL, CRUD → kind: db_query_result            │
│ cursor-agent     │ IDE automation → kind: code_change           │
│ nano-banana-pro  │ Image gen → kind: image_generation           │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema Extension

### 1.1 Add `kind` and `visibility` columns

Add two new columns to `agent_learnings`:

| Column | Type | Default | Values |
|--------|------|---------|--------|
| `kind` | text | `'general'` | `general`, `composio_trigger`, `chat_response`, `research_summary`, `github_push_summary`, `email_summary`, `memory`, `decision`, `code_change`, `image_generation` |
| `visibility` | text | `'private'` | `private`, `family`, `public` |

SQL Migration:
```sql
ALTER TABLE public.agent_learnings 
ADD COLUMN IF NOT EXISTS kind text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private';

CREATE INDEX IF NOT EXISTS idx_agent_learnings_kind ON public.agent_learnings(kind);
CREATE INDEX IF NOT EXISTS idx_agent_learnings_visibility ON public.agent_learnings(visibility);
CREATE INDEX IF NOT EXISTS idx_agent_learnings_created_at ON public.agent_learnings(created_at DESC);
```

### 1.2 Update RLS policies

Keep existing service-role write access, add visibility-based read:

```sql
-- Authenticated users can read family + public
CREATE POLICY "Authenticated read family/public learnings"
  ON public.agent_learnings FOR SELECT TO authenticated
  USING (visibility IN ('public', 'family'));

-- Anon users can only read public
CREATE POLICY "Anon read public learnings"
  ON public.agent_learnings FOR SELECT TO anon
  USING (visibility = 'public');
```

---

## Phase 2: Backend Updates (agent-vault)

### 2.1 Update POST /learnings to accept `kind` and `visibility`

Extend the existing endpoint to support the new fields when inserting:

```typescript
const payload = {
  learning: String(body.learning ?? "").trim(),
  category: String(body.category || body.topic || "general").trim(),
  source: String(body.source || "agent").trim(),
  kind: String(body.kind || "general").trim(),           // NEW
  visibility: String(body.visibility || "private").trim(), // NEW
  tags: ...,
  confidence: ...,
  metadata: ...,
};
```

### 2.2 Add GET /learnings/feed endpoint

For the Learnings Feed UI:

```typescript
// GET /learnings/feed?kind=&visibility=&limit=&offset=&search=
if (req.method === "GET" && pathname.endsWith("/learnings/feed")) {
  const kind = url.searchParams.get("kind");
  const visibility = url.searchParams.get("visibility");
  const search = url.searchParams.get("search");
  const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
  const offset = clampInt(url.searchParams.get("offset"), 0, 0, 10000);

  let query = supabase
    .from("agent_learnings")
    .select("id,learning,category,kind,visibility,source,tags,confidence,created_at,metadata")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (kind) query = query.eq("kind", kind);
  if (visibility) query = query.eq("visibility", visibility);

  const { data, error } = await query;
  // Return response with count
}
```

### 2.3 Add GET /learnings/:id endpoint

For detail view:

```typescript
// GET /learnings/{uuid}
if (req.method === "GET" && pathname.match(/\/learnings\/[a-f0-9-]{36}$/)) {
  const id = pathname.split("/").pop();
  const { data, error } = await supabase
    .from("agent_learnings")
    .select("*")
    .eq("id", id)
    .single();
  // Return full learning
}
```

### 2.4 Add POST /chat/submit endpoint

Create a job for the OpenClaw worker when user sends a chat message:

```typescript
// POST /chat/submit
if (req.method === "POST" && pathname.endsWith("/chat/submit")) {
  const body = await req.json();
  const message = String(body.message || "").trim();
  
  if (!message) return json(400, { error: "missing message" });

  // 1. Store the user message as a learning
  const { data: learning } = await supabase
    .from("agent_learnings")
    .insert({
      learning: `User query: ${message}`,
      category: "chat_query",
      source: "chat_ui",
      kind: "chat_query",
      visibility: "private",
    })
    .select("id")
    .single();

  // 2. Create job for worker
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      type: "chat_query",
      payload: {
        text: message,
        source: "chat_ui",
        learning_id: learning?.id,
        timestamp: new Date().toISOString(),
      },
      status: "queued",
    })
    .select("id,type,status,created_at")
    .single();

  return json(200, { job, learning_id: learning?.id });
}
```

---

## Phase 3: Frontend Changes

### 3.1 Simplify Index Page

Remove all features except Chat and Learnings:

```typescript
// src/pages/Index.tsx
const features = [
  {
    title: "Edge Bot Chat",
    description: "Send messages to your OpenClaw agent - it can search, email, code, and more",
    icon: Bot,
    href: "/chat",
    badge: "Edge Bot",
    skills: ["Email", "Memory", "Search", "GitHub", "Database"]
  },
  {
    title: "Learnings Feed",
    description: "See what your agent has discovered, decided, and remembered",
    icon: Brain,
    href: "/learnings",
    badge: "Live"
  },
];
```

### 3.2 New Learnings Page

Create `src/pages/Learnings.tsx`:

Features:
- **Tab filters**: All | Research | Decisions | Memory | Email | GitHub | Composio
- **Search bar**: Full-text search using existing RPC
- **Card grid**: Shows learning snippet, kind badge, timestamp, source
- **Pagination**: Load more button or infinite scroll
- **Click-to-detail**: Opens slide-over or modal with full content + metadata
- **Realtime**: Subscribe to new learnings for live updates

Kind-to-Tab mapping:
| Tab | Kinds |
|-----|-------|
| All | * |
| Research | research_summary |
| Decisions | decision |
| Memory | memory |
| Email | email_summary, composio_trigger (GMAIL) |
| GitHub | github_push_summary, code_change |
| Composio | composio_trigger |

### 3.3 Learnings Components

Create these components:

| Component | Purpose |
|-----------|---------|
| `src/components/learnings/LearningCard.tsx` | Card with snippet, badges, timestamp |
| `src/components/learnings/LearningDetail.tsx` | Full content, metadata, provenance |
| `src/components/learnings/LearningFilters.tsx` | Tab bar + search |
| `src/components/learnings/useLearnings.ts` | Hook for fetching/filtering/pagination |
| `src/components/learnings/useLearningsRealtime.ts` | Realtime subscription hook |

### 3.4 Update Chat Page

Modify `src/pages/Chat.tsx`:

1. Remove Heavy Mode toggle (not needed - Edge Bot replaces it)
2. Update welcome message to describe Edge Bot capabilities
3. Change send handler to call `POST /chat/submit` via agent-vault
4. Show "Message sent to Edge Bot" confirmation
5. Optionally poll/subscribe for `kind=chat_response` learnings

```typescript
const WELCOME_MESSAGE = `Hello! I'm connected to your Edge Bot (OpenClaw). I can:
• Check your email and draft replies
• Search the web and scrape pages
• Manage GitHub issues and PRs
• Query your database
• Remember things for later

What would you like me to do?`;
```

### 3.5 Update Navigation

Simplify `src/components/Navigation.tsx`:

```typescript
const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/learnings', label: 'Learnings', icon: Brain },
];
```

### 3.6 Update App Router

```typescript
// src/App.tsx
<Route path="/learnings" element={<Learnings />} />
<Route path="/learnings/:id" element={<LearningDetail />} />
// Remove: /drive, /imagen, /lead-admin, /lead-dashboard, /lead-form, /agent
```

---

## Phase 4: Realtime Updates

### 4.1 Subscribe to new learnings

In the Learnings page:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('learnings-feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'agent_learnings',
    }, (payload) => {
      // Prepend new learning to feed (if matches current filter)
      if (!kindFilter || payload.new.kind === kindFilter) {
        setLearnings(prev => [payload.new, ...prev]);
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [kindFilter]);
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| **Migration** | Create | Add `kind` + `visibility` columns |
| `supabase/functions/agent-vault/index.ts` | Modify | Add `/learnings/feed`, `/learnings/:id`, `/chat/submit`, update POST /learnings |
| `src/pages/Index.tsx` | Modify | Simplify to 2 features |
| `src/pages/Learnings.tsx` | Create | New feed page |
| `src/pages/LearningDetail.tsx` | Create | Detail page/modal |
| `src/components/learnings/LearningCard.tsx` | Create | Card component |
| `src/components/learnings/LearningFilters.tsx` | Create | Filter tabs |
| `src/components/learnings/useLearnings.ts` | Create | Data hook |
| `src/pages/Chat.tsx` | Modify | Update for job-based flow |
| `src/components/Navigation.tsx` | Modify | Simplify nav |
| `src/App.tsx` | Modify | Update routes |

---

## Implementation Order

1. **Database migration** - Add `kind` and `visibility` columns, update RLS
2. **agent-vault updates** - New endpoints + update existing POST /learnings
3. **useLearnings hook** - Fetch/filter/paginate logic
4. **Learnings page + components** - Feed UI
5. **Chat page refactor** - Job-based submission
6. **Index + Navigation cleanup** - Hide unused features
7. **Realtime subscription** - Live updates
8. **Test end-to-end** - Send chat → verify job created → worker claims → agent writes learning → UI shows it

---

## Data Flow Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Full Data Flow                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Chat UI]                                                               │
│      │ POST /chat/submit                                                │
│      ▼                                                                   │
│  [agent-vault]                                                          │
│      │ INSERT → agent_learnings (kind=chat_query)                       │
│      │ INSERT → jobs (status=queued, type=chat_query)                   │
│      ▼                                                                   │
│  [jobs table]                                                           │
│      ▲                                                                   │
│      │ Worker polls POST /jobs/next                                     │
│      │                                                                   │
│  [Mac Worker]                                                           │
│      │ POST http://127.0.0.1:18789/hooks/wake                           │
│      ▼                                                                   │
│  [OpenClaw Edge Bot]                                                    │
│      │ Runs skills (email, search, github, etc.)                        │
│      │ Writes results back to agent_learnings                           │
│      ▼                                                                   │
│  [agent-vault POST /learnings]                                          │
│      │ INSERT → agent_learnings (kind=chat_response, research_summary)  │
│      ▼                                                                   │
│  [Supabase Realtime]                                                    │
│      │ postgres_changes event                                           │
│      ▼                                                                   │
│  [Learnings Feed UI]                                                    │
│      │ New card appears at top of feed                                  │
│      ▼                                                                   │
│  [User sees result!]                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

This keeps the database simple (extending `agent_learnings` vs. creating new tables), aligns with OpenClaw's skill set, and provides a clean way to surface agent outputs in the UI.

