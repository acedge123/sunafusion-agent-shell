# OpenClaw Agent Overview (for Front-End / Lovable)

This document gives **Lovable** and front-end developers a clear picture of what **OpenClaw** is, what the agent can do, and how the SunaFusion front end should interact with it. Use it to design UIs that send work to the agent and surface its capabilities correctly.

---

## 1. What is OpenClaw?

**OpenClaw** is an **edge agent** (the “edge bot”) that runs on the user’s Mac. It is **not** the old “unified agent” or any server-side AI in this repo. The flow is:

- **OpenClaw Gateway** = the brain. It runs locally (`openclaw gateway --port 18789`), holds the conversation, memory, and skills. It does **not** poll the internet. It waits for messages.
- **Agent Vault** (this repo’s Supabase Edge Function) = the bridge. It receives events (e.g. from your front end or Composio), stores them, and enqueues **jobs**.
- **Worker** (runs on the user’s Mac) = the pulse. It polls Agent Vault for jobs, claims one, and **POSTs** it to the Gateway at `POST /hooks/wake`. Only the worker talks to the Gateway; the front end never calls the Gateway directly.

So: **your front end → Agent Vault (learnings + jobs) → worker → OpenClaw Gateway**. No inbound webhooks from the internet to the user’s machine; the worker pulls and pushes locally.

---

## 2. How the front end can trigger the agent

The front end **cannot** call the OpenClaw Gateway directly (it is local-only by design). To get a message to the agent:

1. **Send the user’s message (or intent) to Agent Vault.**  
   Two main options:
   - **POST /learnings** – Store a learning with the message text (and optional category/source/tags). If your backend also inserts a **job** (see below), the worker will pick it up and wake the agent with that context.
   - **Insert a row into the `jobs` table** (via Agent Vault or Supabase) with a payload that includes the text you want the agent to see. The worker claims jobs and POSTs `payload.text` to the Gateway.

2. **Worker** (on the user’s Mac) polls Agent Vault, claims one job, and sends:
   - `POST http://127.0.0.1:18789/hooks/wake`  
   - Body: `{ "text": "<message from job payload>", "mode": "now" }`  
   - Header: `Authorization: Bearer <OPENCLAW_HOOK_TOKEN>`

3. **OpenClaw** wakes, sees the message, and runs the right skills (email, memory, search, GitHub, etc.).

So for a “chat input” in the front end: have the front end (or your backend) call **Agent Vault** to store the message and create a job; the rest is handled by the worker and OpenClaw.

---

## 3. What the OpenClaw agent can do (skills)

The agent has **skills** it can invoke when the user (or a wake message) asks. Below is a concise list so the front end can expose the right actions and expectations.

| Skill | What it does | Good for in the UI |
|-------|----------------|---------------------|
| **secure-gmail** | Read emails, list messages, read by ID, create drafts. No send/delete. Uses Composio. | “Check email”, “Draft reply”, “Show inbox” |
| **openclaw-mem** | Session and durable memory. Writes to `MEMORY.md` and `memory/YYYY-MM-DD.md`. Search via `memory_search` / `memory_get`. | “Remember this”, “What did we decide?”, “Recall …” |
| **brave-search** | Web search and content extraction via Brave Search API. No browser. | “Search the web for …”, “Find docs about …” |
| **firecrawl-skills** | Scrape/crawl pages and sites, site maps, web search. Returns markdown for LLM context. | “Scrape this URL”, “Crawl this site”, “Research …” |
| **github** | GitHub via `gh` CLI: issues, PRs, runs, `gh api`. | “Open a PR”, “Check CI”, “List issues”, “Run gh api …” |
| **supabase** | Supabase: SQL, CRUD, vector search, table management. | “Query the DB”, “Insert/update records”, “Vector search” |
| **cursor-agent** | Cursor IDE / agent integration. | Editor/IDE automation |
| **agent-browser** | Browser automation. | “Open this page”, “Click …” (when enabled) |
| **nano-banana-pro** | Image generation (script-based). | “Generate an image of …” |
| **slack** | Slack integration. | “Send to Slack”, “Read channel” (when configured) |

The front end can offer shortcuts or prompts that map to these (e.g. “Email”, “Memory”, “Search”, “GitHub”, “Database”) so users know what the agent can do.

---

## 4. What the front end can do with Agent Vault (API)

Agent Vault is the **only** server-side API the front end should use to talk to the “agent side” of the system. All of these require **Bearer auth** with `AGENT_EDGE_KEY` (except the Composio webhook).

| Endpoint | Purpose | Front-end use |
|----------|---------|----------------|
| **GET /health** | Check if Agent Vault is up | Health indicator, debug |
| **POST /learnings** | Store a learning (text + category/source/tags) | Save user message, context, or feedback for the agent |
| **GET /learnings/search** | Search learnings by query | Show “what the agent knows” or recent context |
| **GET /repo_map/*** | Repo map count, get, search | If your app uses repo_map for context |
| **POST /composio/webhook** | Composio triggers (e.g. new email) | Usually Composio calls this; not the main UI entry |

To **trigger the agent** from the UI: store the user’s message (and any context) with **POST /learnings**, and ensure a **job** is created (your backend or an Agent Vault extension that inserts into `jobs` when certain learnings are created). The worker then claims the job and wakes OpenClaw with that text.

If you add a dedicated “chat” or “send to agent” endpoint that both stores a learning and enqueues a job, the front end would call that single endpoint.

---

## 5. End-to-end flow (for a “Send to agent” UI)

```
User types in your front end
        ↓
Front end (or your API) → POST Agent Vault /learnings
                          (and optionally enqueue a job with that text)
        ↓
Agent Vault stores in agent_learnings, inserts row in jobs
        ↓
Worker (user’s Mac) polls POST .../agent-vault/jobs/next
        ↓
Worker gets job → POST http://127.0.0.1:18789/hooks/wake
                  { "text": "<message>", "mode": "now" }
        ↓
OpenClaw wakes, runs skills, responds (in the user’s OpenClaw session / channel)
```

The user sees the reply in OpenClaw (e.g. iMessage, CLI, or whatever channel they use), not necessarily in your web UI—unless you build a way to stream or poll agent output back into the app (e.g. via learnings or a separate channel).

---

## 6. Constraints and tips for the front end

- **Do not** assume the front end can call the OpenClaw Gateway URL. The Gateway is on the user’s machine and is not exposed to the internet.
- **Do** use Agent Vault as the single entry point: learnings + jobs. Deploy the latest agent-vault so it has `/jobs/next` and `/jobs/ack` (see **docs/DEPLOY_AGENT_VAULT.md**).
- **Worker must be running** on the user’s Mac for jobs to be delivered. The front end can’t start it; the user runs it (e.g. `node workspace/scripts/jobs-worker.mjs` or via pm2/launchd). You can show a “Make sure the worker is running” note in the UI.
- **Auth:** All Agent Vault endpoints (except Composio webhook) need `Authorization: Bearer <AGENT_EDGE_KEY>`. The front end must get a token from your backend or from a safe client-side config (e.g. env passed at build time for a single-user app).
- **CORS:** Agent Vault has CORS enabled; your front end can call it from the browser if the token is available.

---

## 7. Summary for Lovable

- **OpenClaw** = edge agent on the user’s Mac; it has skills (email, memory, search, GitHub, Supabase, etc.).
- **Trigger path:** Front end → **Agent Vault** (store learning + enqueue job) → **worker** (on Mac) → **OpenClaw** (`/hooks/wake`).
- **Front end should:**  
  - Offer a simple “Send to agent” (or “Chat”) input that POSTs to Agent Vault (learnings + job).  
  - Optionally show what the agent can do (email, memory, search, GitHub, DB) and map buttons/prompts to those.  
  - Not call the Gateway; only Agent Vault.
- **Deploy:** Keep agent-vault up to date so jobs and learnings work (see **docs/DEPLOY_AGENT_VAULT.md**).

This gives Lovable everything needed to build a front end that sends user input to the OpenClaw agent and aligns the UI with the agent’s real capabilities.
