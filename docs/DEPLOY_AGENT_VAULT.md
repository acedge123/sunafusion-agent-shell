# Deploy agent-vault (Supabase Edge Function)

Deploy or update the **agent-vault** Edge Function so the live version includes the jobs API (`/jobs/next`, `/jobs/ack`) and learnings endpoints. The worker (OpenClaw edge bot) needs these to claim jobs and wake the agent.

## Deploy command

From this repo root:

```bash
cd /path/to/sunafusion-agent-shell
supabase functions deploy agent-vault
```

(Use your actual path to the repo; e.g. on this machine: `OpenClaw_Github/sunafusion-agent-shell`.)

## Before deploying

1. **Supabase CLI** must be installed and linked to your project (`supabase link` if not already).
2. **Secrets** must be set for the function. In Supabase Dashboard: **Edge Functions** → **agent-vault** → **Secrets**. Or via CLI: `supabase secrets set KEY=value`.

   | Secret | Purpose |
   |--------|---------|
   | `SUPABASE_URL` | Project URL (e.g. `https://<project-ref>.supabase.co`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key for DB/RPCs |
   | `AGENT_EDGE_KEY` | Bearer secret for jobs/learnings (same as in the worker’s `~/.openclaw/.env`) |
   | `COMPOSIO_API_KEY` | Optional; for Composio webhook/proxy |

## After deploy

- **Health:** `GET https://<project>.supabase.co/functions/v1/agent-vault/health` with `Authorization: Bearer <AGENT_EDGE_KEY>` → **200**.
- **Jobs:** Worker calls `POST …/functions/v1/agent-vault/jobs/next` → **204** (no job) or **200** (job claimed). If you get **404**, the old version was still deployed; redeploy and retry.

## Reference

- Function code: `supabase/functions/agent-vault/index.ts`
- Jobs migration: `supabase/migrations/20260204014818_*.sql` (ensure this is applied in Supabase so the `jobs` table and RPCs exist)
