-- Jobs table for edge-bot worker (run in Supabase SQL editor or migration).
-- Lovable / Agent Vault: insert a row when e.g. a new email is stored; worker on the Mac claims and processes.

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb default '{}',
  status text not null default 'queued' check (status in ('queued', 'processing', 'done', 'failed')),
  locked_at timestamptz,
  locked_by text,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_claim on public.jobs (status, created_at)
  where status = 'queued';

-- Optional: inbox_messages if you want to store raw emails and create jobs from them.
-- create table if not exists public.inbox_messages (
--   id uuid primary key default gen_random_uuid(),
--   source text not null,
--   payload jsonb not null,
--   job_id uuid references public.jobs(id),
--   created_at timestamptz not null default now()
-- );

-- Atomic claim: one worker gets one job. Call from the Mac worker via supabase.rpc('claim_next_job', { p_worker_id: '...' }).
create or replace function public.claim_next_job(p_worker_id text)
returns setof public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Claim oldest queued job that isn't stuck (locked > 5 min ago or never locked)
  select id into v_id
  from public.jobs
  where status = 'queued'
    and (locked_at is null or locked_at < now() - interval '5 minutes')
  order by created_at asc
  limit 1
  for update skip locked;

  if v_id is null then
    return;
  end if;

  update public.jobs
  set status = 'processing', locked_at = now(), locked_by = p_worker_id, updated_at = now()
  where id = v_id;

  return query select * from public.jobs where id = v_id;
end;
$$;

-- Mark job done or failed (worker calls after processing).
create or replace function public.complete_job(
  p_job_id uuid,
  p_status text,  -- 'done' or 'failed'
  p_last_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.jobs
  set status = p_status, last_error = p_last_error, updated_at = now()
  where id = p_job_id;
end;
$$;

-- RLS: no policy for anon/authenticated so they cannot read/write jobs directly.
-- Service role (Lovable/Edge Function) bypasses RLS and can insert. Worker uses anon key and
-- only calls claim_next_job / complete_job (SECURITY DEFINER does the work inside the DB).
alter table public.jobs enable row level security;

drop policy if exists "Service role can manage jobs" on public.jobs;
-- Do not create a permissive policy: anon then has no direct table access. Service role bypasses RLS.

-- Worker uses SUPABASE_ANON_KEY and only needs to run these two functions (safer than service role on the Mac).
grant execute on function public.claim_next_job(text) to anon;
grant execute on function public.complete_job(uuid, text, text) to anon;

comment on table public.jobs is 'Queue for edge-bot worker; Lovable inserts rows (e.g. email_received), Mac worker claims and processes.';

-- Lovable: when you insert into agent_learnings with category = 'composio_trigger', also insert one row here:
--   insert into public.jobs (type, payload, status) values (
--     'email_received',
--     '{"text": "New Composio trigger (new email). Check latest composio_trigger learnings."}'::jsonb,
--     'queued'
--   );
-- Then the Mac worker will claim it and POST to OpenClaw /hooks/wake (no public URL needed).
