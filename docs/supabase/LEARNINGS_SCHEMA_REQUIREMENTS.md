# Supabase learnings schema requirements (Sunafusion)

Goal: make “agent learnings” durable, queryable, and safe to store both **project/runbook knowledge** and **people-specific learnings**.

This doc is intended for Lovable to generate the Supabase migration + RLS changes.

## Context / Problems this solves

- We want to store more than code: recurring problems, runbooks, integration quirks, and “how Alan thinks”.
- We also want to store people-specific learnings (Alan/Meg/Emily) and keep them **scoped + secure**.
- Current approach (freeform JSON blobs) becomes hard to query and easy to leak.

## High-level requirements

1) **Single `learnings` table** that can store multiple kinds of learnings
- project
- incident
- runbook
- integration
- decision
- person

2) Learnings must be **queryable**
- by kind
- by subject (person id / repo / service)
- by tags
- by text search (title/summary)

3) Learnings must be **safe**
- store people notes as **sensitive** by default
- enforce RLS so one user/tenant cannot read another tenant’s learnings

4) Support **multiple learnings per day**
- atomic notes are preferred (one per incident / decision / workflow)

## Option A (recommended): one table with subject fields

### Table: `learnings`

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` (trigger)

**Tenant scoping**
- `owner_id uuid not null` (references `auth.users.id`)

**Classification**
- `kind text not null`  
  - e.g. `person | project | runbook | incident | integration | decision`
- `subject_type text not null`  
  - e.g. `person | repo | service | system`
- `subject_id text not null`  
  - e.g. `+13104333101` or `acedge123/api-docs-template` or `openclaw-gateway`
- `subject_name text`  
  - e.g. `Alan` / `api-docs-template`

**Content**
- `title text not null`
- `summary text` (short, human)
- `content jsonb not null default '{}'::jsonb` (machine-readable payload)

**Metadata**
- `tags text[] not null default '{}'`
- `source text` (e.g. `imessage | manual | composio | system`)
- `confidence numeric` (optional)
- `redaction_level text not null default 'sensitive'`  
  - values: `public | internal | sensitive`

### Indexing

- btree: `(owner_id, kind, subject_type, subject_id)`
- gin: `tags`
- text search: generated tsvector on `title || ' ' || coalesce(summary,'')`

### RLS

- Enable RLS on `learnings`.
- Policies:
  - SELECT/INSERT/UPDATE/DELETE where `owner_id = auth.uid()`

### Conventions

- For people: `subject_type='person'`, `subject_id` is **E.164** (e.g. `+13104333101`), `subject_name='Alan'`.
- People learnings should default to `redaction_level='sensitive'`.

## Option B: add a `people` table (first-class people)

If you want to model people more strongly:

### Table: `people`
- `person_id text primary key` (E.164)
- `owner_id uuid not null`
- `name text not null`
- `relationship text` (optional)
- `channels jsonb` (optional)

Then `learnings.person_id text null references people(person_id)`.

Still keep `learnings` flexible for non-person subjects.

## Example payloads (what we plan to store)

### Person learning (Alan)
- kind: `person`
- subject_id: `+13104333101`
- title: `Preferences: tools + reminders`
- content:
  - preferred workflow: inspect → summarize risks → approval → install → first-run isolated
  - reminder delivery: iMessage via scheduled `imsg send`

### Project learning (ACP)
- kind: `project`
- subject_id: `acedge123/api-docs-template`
- title: `ACP mortgage lead flow v1`
- content:
  - field_name schema + choice slugs
  - scoring ranges + axis definitions
  - /api/manage actions + sample requests

## Minimal migration checklist

1) Create `learnings` table (Option A) + indexes
2) Add updated_at trigger
3) Enable RLS + owner_id policies
4) (Optional) Create `people` table + FK

