
# Plan: Add Jobs API Endpoints to agent-vault

## Problem Diagnosis

After reviewing the codebase thoroughly, I found the **root cause** of the 405 errors and worker failures:

The `docs/DEPLOY_AGENT_VAULT.md` states the worker should call:
- `POST /jobs/next` - to claim the next queued job
- `POST /jobs/ack` - to mark a job as done/failed

**However, these endpoints DO NOT EXIST in `supabase/functions/agent-vault/index.ts`.**

The current agent-vault only has:
- `/health`, `/repo_map/*`, `/learnings/*`, `/composio/*`

The database has the RPC functions (`claim_next_job`, `complete_job`) but they are not exposed as HTTP endpoints. The worker is getting 404/405 because the routes simply don't exist.

---

## Architecture Context

```text
[Composio] 
    │ POST webhook
    ▼
[agent-vault /composio/webhook]
    │ Inserts into agent_learnings + jobs (status: queued)
    ▼
[jobs table]
    ▲
    │ Worker polls via POST /jobs/next  ← MISSING ENDPOINT
    │
[Mac Worker (jobs-worker.mjs)]
    │ Claims job, POSTs to local gateway
    ▼
[OpenClaw /hooks/wake]
    │ Wakes agent
    ▼
[Worker calls POST /jobs/ack]  ← MISSING ENDPOINT
```

---

## Solution

Add two new authenticated endpoints to `agent-vault/index.ts`:

### 1. POST /jobs/next

Claims the next queued job for a worker.

**Request:**
```json
{ "worker_id": "openclaw-worker" }
```

**Response:**
- `200` + job data if a job was claimed
- `204` No Content if no jobs available
- `500` on database error

**Implementation:**
- Call the existing `claim_next_job` RPC function
- Return the claimed job or 204 if none

### 2. POST /jobs/ack

Marks a job as done or failed.

**Request:**
```json
{
  "job_id": "uuid",
  "status": "done" | "failed",
  "last_error": "optional error message"
}
```

**Response:**
- `200` + `{ ok: true }` on success
- `400` if missing required fields
- `500` on database error

**Implementation:**
- Call the existing `complete_job` RPC function

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/agent-vault/index.ts` | Add `/jobs/next` and `/jobs/ack` POST endpoints after the auth gate, before the 404 fallback |

---

## Code Changes (Technical Details)

Add after line ~291 (after `/learnings` POST endpoint, before Composio proxy section):

```typescript
// ============================================================
// JOBS API (for worker daemon)
// ============================================================

// ---- POST /jobs/next (claim next queued job) ----
if (req.method === "POST" && pathname.endsWith("/jobs/next")) {
  const body = await req.json().catch(() => ({}));
  const workerId = String(body.worker_id || "unknown-worker").trim();

  if (workerId.length > 100) {
    return json(400, { error: "worker_id too long" });
  }

  const { data, error } = await supabase.rpc("claim_next_job", { 
    p_worker_id: workerId 
  });

  if (error) {
    console.error("[agent-vault] claim_next_job error:", error.message);
    return json(500, { error: "db_error", detail: error.message });
  }

  // RPC returns array; if empty, no job available
  if (!data || data.length === 0) {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  console.log(`[agent-vault] Job claimed: ${data[0].id} by ${workerId}`);
  return json(200, { job: data[0] });
}

// ---- POST /jobs/ack (complete a job) ----
if (req.method === "POST" && pathname.endsWith("/jobs/ack")) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return json(400, { error: "invalid JSON body" });
  }

  const jobId = body.job_id;
  const status = body.status;
  const lastError = body.last_error || null;

  if (!jobId || typeof jobId !== "string") {
    return json(400, { error: "missing or invalid job_id" });
  }
  if (!status || !["done", "failed"].includes(status)) {
    return json(400, { error: "status must be 'done' or 'failed'" });
  }

  const { error } = await supabase.rpc("complete_job", {
    p_job_id: jobId,
    p_status: status,
    p_last_error: lastError,
  });

  if (error) {
    console.error("[agent-vault] complete_job error:", error.message);
    return json(500, { error: "db_error", detail: error.message });
  }

  console.log(`[agent-vault] Job ${jobId} marked as ${status}`);
  return json(200, { ok: true, job_id: jobId, status });
}
```

---

## Testing After Implementation

1. Deploy the updated edge function
2. Test `/jobs/next`:
   ```bash
   curl -X POST https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/jobs/next \
     -H "Authorization: Bearer $AGENT_EDGE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"worker_id": "test-worker"}'
   ```
   Expected: 204 (no jobs) or 200 with job data

3. Test `/jobs/ack`:
   ```bash
   curl -X POST https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/jobs/ack \
     -H "Authorization: Bearer $AGENT_EDGE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"job_id": "uuid-here", "status": "done"}'
   ```
   Expected: 200 with `{ ok: true }`

---

## What This Fixes

Once deployed, the worker flow becomes:
1. Worker polls `POST /jobs/next` with auth header
2. Gets 204 (no work) or 200 (job data)
3. If job received, POSTs to local OpenClaw `/hooks/wake`
4. Calls `POST /jobs/ack` to mark done/failed
5. Repeats

The 404/405 errors will disappear because the endpoints will actually exist.
