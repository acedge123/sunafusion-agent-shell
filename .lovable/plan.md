

# Plan: Integrate Jobs Queue into Agent-Vault for Edge Bot

## Overview

Modify the `agent-vault` edge function to insert a row into the `jobs` table whenever a Composio trigger is received. This allows the Edge bot worker daemon (running on the Mac) to poll for and process new events without requiring an open webhook port.

## Architecture

```text
┌─────────────┐      ┌──────────────────┐      ┌────────────────┐      ┌──────────────┐
│  Composio   │─────▶│   agent-vault    │─────▶│  jobs table    │◀─────│  Mac Worker  │
│  (webhook)  │      │  (edge function) │      │  (Supabase)    │      │  (daemon)    │
└─────────────┘      └──────────────────┘      └────────────────┘      └──────────────┘
                              │                                               │
                              ▼                                               ▼
                     ┌──────────────────┐                           ┌──────────────┐
                     │ agent_learnings  │                           │   OpenClaw   │
                     │ (audit/history)  │                           │   Gateway    │
                     └──────────────────┘                           └──────────────┘
```

## Implementation Steps

### Step 1: Create the Jobs Table (Database Migration)

Run the SQL from `docs/JOBS_SCHEMA.sql` in Supabase SQL editor:
- Creates `jobs` table with status tracking
- Creates `claim_next_job` function for atomic job claiming
- Creates `complete_job` function for marking completion
- Enables RLS with service role access

### Step 2: Modify agent-vault Edge Function

Update `supabase/functions/agent-vault/index.ts` to insert a job after storing the Composio trigger:

**Location**: Inside the `/composio/webhook` handler, after the successful insert into `agent_learnings`

**Code to add**:
```typescript
// After inserting into agent_learnings, also insert a job for the worker
const { error: jobError } = await supabaseClient
  .from('jobs')
  .insert({
    type: triggerName || 'composio_trigger',
    payload: {
      text: `New Composio trigger (${triggerName}). Check latest composio_trigger learnings.`,
      learning_id: data.id,
      trigger_name: triggerName,
      timestamp: new Date().toISOString(),
    },
    status: 'queued',
  });

if (jobError) {
  console.error('[agent-vault] Failed to insert job:', jobError);
  // Non-fatal - the learning is still stored
}
```

### Step 3: Update TypeScript Types

Add the `jobs` table type to `src/integrations/supabase/types.ts` so the Supabase client recognizes it.

## Technical Details

### Jobs Table Schema (from docs)
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| type | text | Job type (e.g., `GMAIL_NEW_GMAIL_MESSAGE`) |
| payload | jsonb | Job data including learning reference |
| status | text | `queued`, `processing`, `done`, `failed` |
| locked_at | timestamptz | When worker claimed it |
| locked_by | text | Worker ID |
| attempts | int | Retry count |
| last_error | text | Error message if failed |

### Worker Flow (handled by Edge bot)
1. Worker calls `claim_next_job('worker-id')` via RPC
2. Supabase atomically returns one job and marks it `processing`
3. Worker POSTs to local OpenClaw gateway `/hooks/wake`
4. Worker calls `complete_job(job_id, 'done')` or `complete_job(job_id, 'failed', error)`

### Security
- RLS enabled on `jobs` table
- Service role key used by both agent-vault and worker
- No public ports required on Mac

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/agent-vault/index.ts` | Add job insertion after Composio trigger storage |
| `src/integrations/supabase/types.ts` | Add Jobs table type definition |
| Database (SQL Editor) | Run `docs/JOBS_SCHEMA.sql` migration |

## Testing

1. Send a test Composio webhook to agent-vault
2. Verify row appears in both `agent_learnings` and `jobs` tables
3. Confirm `jobs.status = 'queued'` and payload contains learning reference

## Dependencies

- User must run `docs/JOBS_SCHEMA.sql` in Supabase SQL editor before deploying
- Edge bot operator must set up the worker daemon (per `docs/WORKER_DAEMON.md`)

