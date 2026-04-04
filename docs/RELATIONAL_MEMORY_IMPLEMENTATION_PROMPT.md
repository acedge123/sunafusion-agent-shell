# Relational Memory Upgrade Prompt for Lovable

Use this prompt to implement a relational memory upgrade for `sunafusion-agent-shell`.

```text
You are implementing a relational memory upgrade for the `sunafusion-agent-shell` repo.

Goal:
Keep the existing `agent_learnings` system, but evolve it from a flexible learning log into a practical operator-memory system with first-class entities, relationships, and commitments. Do not replace the current learnings model. Extend it cleanly.

Primary outcome:
After this change, the system should support durable, queryable memory for:
- people
- orgs
- projects
- repos
- systems
- tickets
- relationships between those entities
- commitments / follow-ups / promises / open loops
- links from learnings to multiple entities

Constraints:
- Preserve existing `agent_learnings` behavior and APIs as much as possible
- Add a thin relational layer around `agent_learnings`
- Prefer additive migrations over destructive changes
- Maintain Supabase RLS discipline
- Keep the model practical, not overengineered
- Do not introduce a graph database or vector database
- Do not redesign the entire product
- Build this for operator memory, not for a research wiki

Context:
Today `agent_learnings` already supports fields such as:
- learning
- kind
- subject_type
- subject_id
- subject_name
- owner_id
- title
- summary
- tags
- metadata
- visibility
- redaction_level
- domain
- status

This is useful but still too note-centric. We need stronger relational memory so the agent can answer questions like:
- “What do I know about Sarah?”
- “What is open for Acme?”
- “What changed on Project X this week?”
- “Which repos and people are related to Echelon?”
- “What commitments are still outstanding?”
- “What learnings are linked to this person and this project?”

Implement the following.

1. Schema design
Add these new tables in Supabase migrations:

A. `entities`
Purpose:
Canonical table for people, orgs, projects, repos, systems, and tickets.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null`
- `entity_type text not null`
- `external_key text null`
- `name text not null`
- `aliases text[] not null default '{}'`
- `status text not null default 'active'`
- `summary text null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Entity type allowed values:
- `person`
- `org`
- `project`
- `repo`
- `system`
- `ticket`

Status allowed values:
- `active`
- `archived`

Indexes:
- `(owner_id, entity_type, name)`
- `(owner_id, entity_type, external_key)` unique when external_key is not null
- GIN on aliases if useful

B. `learning_entities`
Purpose:
Join table linking one learning to one or more entities.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null`
- `learning_id uuid not null references public.agent_learnings(id) on delete cascade`
- `entity_id uuid not null references public.entities(id) on delete cascade`
- `role text null`
- `confidence real not null default 1.0`
- `created_at timestamptz not null default now()`

Examples of `role`:
- `subject`
- `mentioned_person`
- `mentioned_org`
- `project_context`
- `repo_context`
- `counterparty`

Unique constraint:
- `(learning_id, entity_id, coalesce(role, ''))`

Indexes:
- `(owner_id, learning_id)`
- `(owner_id, entity_id)`

C. `entity_relationships`
Purpose:
Explicit edges between entities.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null`
- `from_entity_id uuid not null references public.entities(id) on delete cascade`
- `relationship_type text not null`
- `to_entity_id uuid not null references public.entities(id) on delete cascade`
- `confidence real not null default 0.8`
- `source_learning_id uuid null references public.agent_learnings(id) on delete set null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relationship type allowed values:
- `works_at`
- `owns`
- `member_of`
- `related_to`
- `depends_on`
- `blocked_by`
- `contact_at`
- `responsible_for`
- `about`
- `mentioned_with`

Unique constraint:
- `(from_entity_id, relationship_type, to_entity_id)`

Indexes:
- `(owner_id, from_entity_id)`
- `(owner_id, to_entity_id)`
- `(owner_id, relationship_type)`

D. `commitments`
Purpose:
Track promises, follow-ups, tasks, and open loops separately from learnings.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null`
- `title text not null`
- `description text null`
- `status text not null default 'open'`
- `priority text not null default 'medium'`
- `due_at timestamptz null`
- `assigned_entity_id uuid null references public.entities(id) on delete set null`
- `counterparty_entity_id uuid null references public.entities(id) on delete set null`
- `project_entity_id uuid null references public.entities(id) on delete set null`
- `source_learning_id uuid null references public.agent_learnings(id) on delete set null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Status allowed values:
- `open`
- `in_progress`
- `done`
- `cancelled`

Priority allowed values:
- `low`
- `medium`
- `high`
- `urgent`

Indexes:
- `(owner_id, status, due_at)`
- `(owner_id, assigned_entity_id)`
- `(owner_id, counterparty_entity_id)`
- `(owner_id, project_entity_id)`

2. RLS
Add proper RLS for all new tables.
Rules:
- owner-scoped access only
- authenticated users can only see rows where `owner_id = auth.uid()`
- service role retains full access
- mirror the best patterns already used in the repo for owner-scoped tables
- do not leave new relational tables publicly readable

3. Triggers
Add `updated_at` triggers for:
- `entities`
- `entity_relationships`
- `commitments`

4. API surface in `agent-vault`
Extend the Supabase Edge Function at `supabase/functions/agent-vault/index.ts`.

Add endpoints for:

A. `POST /entities/upsert`
Behavior:
- upsert an entity by `(owner_id, entity_type, external_key)` when external_key exists
- otherwise attempt a reasonable fallback match by `(owner_id, entity_type, lower(name))`
- return the canonical entity row

Request body:
- `entity_type`
- `name`
- optional `external_key`
- optional `aliases`
- optional `summary`
- optional `status`
- optional `metadata`
- optional `owner_id`

B. `GET /entities/search`
Behavior:
- search entities by owner and optional filters
- support query params:
  - `q`
  - `entity_type`
  - `limit`
  - `offset`

Search against:
- `name`
- `aliases`
- maybe `summary`

C. `POST /learnings/link`
Behavior:
- link an existing learning to one or more entities
- insert rows into `learning_entities`
- avoid duplicates

Request body:
- `learning_id`
- `owner_id`
- `links`: array of `{ entity_id, role?, confidence? }`

D. `POST /relationships`
Behavior:
- create or upsert a relationship between two entities
- optionally attach `source_learning_id`

Request body:
- `owner_id`
- `from_entity_id`
- `relationship_type`
- `to_entity_id`
- optional `confidence`
- optional `source_learning_id`
- optional `metadata`

E. `GET /relationships`
Behavior:
- query relationships by entity
- support:
  - `entity_id`
  - optional `relationship_type`

F. `POST /commitments`
Behavior:
- create a commitment

Request body:
- `owner_id`
- `title`
- optional `description`
- optional `status`
- optional `priority`
- optional `due_at`
- optional `assigned_entity_id`
- optional `counterparty_entity_id`
- optional `project_entity_id`
- optional `source_learning_id`
- optional `metadata`

G. `PATCH /commitments/:id`
Behavior:
- update mutable commitment fields only

H. `GET /commitments`
Behavior:
- list commitments with filters:
  - `status`
  - `assigned_entity_id`
  - `counterparty_entity_id`
  - `project_entity_id`
  - `due_before`
  - `limit`
  - `offset`

5. Preserve and extend `POST /learnings`
Do not break existing learnings writes.

Enhance `POST /learnings` so it can optionally:
- accept `entity_links`
- accept `create_entities`
- accept `create_relationships`
- accept `create_commitments`

If those fields are present:
- create the learning first
- then create any requested entities
- then create link rows
- then create relationships
- then create commitments
- return all created records in the response

This should be implemented carefully so the old behavior still works if only the traditional learning payload is provided.

6. Query helpers / RPCs
Add helpful SQL functions or query helpers where appropriate.

Useful helpers:
- `search_entities(owner_uuid, query_text, limit_count, offset_count)`
- `get_learning_context(learning_uuid)` returning learning + linked entities
- `get_entity_context(entity_uuid)` returning:
  - entity
  - recent linked learnings
  - outgoing/incoming relationships
  - open commitments
- `get_briefing(owner_uuid, entity_uuid)` as a convenience summary source for the agent/UI

These can be SQL functions or implemented in the edge function if simpler.

7. UI support
Add minimal UI support in the existing app where it already shows learnings.

At minimum:
- make linked subject/entity information visible on learning detail pages
- show entity chips/cards where available
- add a basic entity search/list page or section if straightforward
- allow filtering learnings by subject/entity more explicitly
- show open commitments in a lightweight view

Do not overdesign the UI. Functional and clean is enough.

8. Agent-memory conventions
Create or update docs so the agent has explicit rules for what to store where.

Add documentation describing this memory policy:

Store in `agent_learnings`:
- durable observations
- preferences
- decisions
- summaries
- incident notes
- runbook notes
- project knowledge

Create / link `entities` when:
- a named person, org, project, repo, system, or ticket appears and is likely to matter again

Create `entity_relationships` when:
- the relationship is explicit and reasonably durable
- examples:
  - person works at org
  - person owns project
  - repo relates to project
  - system depends on service
  - ticket is about project

Create `commitments` when:
- there is an explicit promise, follow-up, TODO, obligation, or open loop

Do not create hard structured rows for weak guesses.
When uncertain:
- store the learning
- use lower confidence
- avoid creating firm relationships unless supported by the input

9. Documentation deliverables
Create or update docs for:
- schema overview
- endpoint reference
- memory-writing policy for the agent
- example payloads for person, org, project, repo, system, ticket, relationship, and commitment
- how to brief a person/project using the new relational memory

Good doc targets:
- `docs/AGENT_LEARNINGS_SCHEMA.md`
- a new `docs/RELATIONAL_MEMORY_MODEL.md`
- a new `docs/AGENT_MEMORY_POLICY.md`

10. Example behaviors to support
The final system should support flows like:

Example A: person preference
Input:
“Alan prefers a cautious, inspect-first install workflow.”
Expected:
- learning row
- optional entity for Alan if not already present
- learning linked to Alan
- no commitment created

Example B: relationship
Input:
“Sarah from Acme owns the partnership conversation for Project X.”
Expected:
- person entity Sarah
- org entity Acme
- project entity Project X
- relationships:
  - Sarah works_at Acme
  - Sarah owns Project X
- learning linked to all three entities

Example C: commitment
Input:
“Follow up with Sarah next Tuesday about the Acme partnership draft.”
Expected:
- learning row
- commitment row with due date if parseable
- Sarah/Acme entities linked if known
- commitment linked to counterparty/project entities when possible

Example D: repo/project memory
Input:
“TGA-165 relates to Echelon product shell and edge-bot runtime work.”
Expected:
- ticket entity TGA-165
- project entity Echelon product shell
- repo or system entity edge-bot
- appropriate `related_to` relationships
- learning linked to all relevant entities

11. Implementation quality
Requirements:
- clean migrations
- no breaking changes to existing learnings consumers
- additive, backward-compatible API evolution
- readable TypeScript in the edge function
- consistent validation and error handling
- no giant unstructured metadata blobs when first-class columns exist
- sensible defaults
- minimal duplication

12. Deliverables
Produce:
- Supabase migrations
- updated edge function implementation
- any shared validation/constants needed
- minimal UI updates
- docs updates

13. Final summary
At the end, summarize:
- what schema was added
- what endpoints were added or changed
- what old behavior remains compatible
- how the agent should now store relational memory

Please implement this directly in the repo, not just as a proposal.
```
