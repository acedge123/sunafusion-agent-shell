-- Jobs table for edge-bot worker (from docs/JOBS_SCHEMA.sql)
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

-- Atomic claim: one worker gets one job
create or replace function public.claim_next_job(p_worker_id text)
returns setof public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
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

-- Mark job done or failed
create or replace function public.complete_job(
  p_job_id uuid,
  p_status text,
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

-- RLS: service role only
alter table public.jobs enable row level security;

create policy "Service role can manage jobs"
  on public.jobs for all
  using (true)
  with check (true);

comment on table public.jobs is 'Queue for edge-bot worker; Lovable inserts rows (e.g. email_received), Mac worker claims and processes.';